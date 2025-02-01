import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { retryWithExponentialBackoff } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { symptoms, duration, pastContext, otherInfo } = body;

    // Need to improve on this
    if (!symptoms) {
      return NextResponse.json({ message: "Symptoms are required" }, { status: 400 });
    }

    const searchId = uuidv4();
    // New document but before response
    const newSearch = new SymptomSearch({
      searchId,
      symptoms,
      pastContext,
      otherInfo,
    });

    await newSearch.save();

    //! Need to improve this substantially
    const prompt = `
      User Symptoms Information: ${symptoms}
      Past Related Context: ${pastContext || 'None'}
      Other Information: ${otherInfo || 'None'}
`;
    // Call Gemini API in the background
    generateGeminiResponses(searchId, prompt);
    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

async function generateGeminiResponses(searchId: string, initialPrompt: string) {
  try {
    // Cumulative Prompt
    const summarizePrompt = `Summarize the following user input into a concise, clear statement of the problem. Focus on the key symptoms and relevant context:\n\n${initialPrompt}\n\nSummary:`;
    const summarizeResult = await retryWithExponentialBackoff(() => model.generateContent(summarizePrompt));
    const cumulativePrompt = summarizeResult.response.text();
    const summaryHash = createHash('sha256').update(cumulativePrompt).digest('hex');

    const existingSearch = await SymptomSearch.findOne({ summaryHash });
    if (existingSearch) {
      console.log("Using cached result");
      await SymptomSearch.findOneAndUpdate(
        { searchId },
        {
          cumulativePrompt: existingSearch.cumulativePrompt,
          potentialConditions: existingSearch.potentialConditions,
          medicines: existingSearch.medicines,
          whenToSeekHelp: existingSearch.whenToSeekHelp,
          finalVerdict: existingSearch.finalVerdict,
          summaryHash,
        }
      );
      return; // Exit early
    }

    await SymptomSearch.findOneAndUpdate({ searchId }, { cumulativePrompt, summaryHash });

    // Potential Conditions
    const conditionsPrompt = `Based on the following summary, list potential medical conditions, ordered from most likely to least likely. Return the results as a JSON array of objects. Each object should have the following keys: "name" (String), "description" (string, Description about condition), and "explanation" (String, Explanation on why it is a potential condition). Do not give any disclaimer or notes:\n\nSummary: ${cumulativePrompt}\n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
    const conditionsResult = await retryWithExponentialBackoff(() => model.generateContent(conditionsPrompt));
    let potentialConditions = conditionsResult.response.text();
    try {
      potentialConditions = JSON.stringify(JSON.parse(potentialConditions));
    } catch (parseError) {
      console.error("Error parsing conditions JSON:", parseError);
      potentialConditions = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { potentialConditions });


    // Medicines
    const medicinesPrompt = `Based on the following summary, list potential over-the-counter or common medicines that *might* help alleviate the symptoms in a numbered fashion only (Don't include any introductory text) Return results as JSON array of objects. Each object should have the following keys: "name" (String), "commonUse" (String, what it's commonly used for and basic description of medicine), and "sideEffects" (String[], Array of side effects). **Do not give disclaimers**, if needed you can include medicines that are not over-the-counter:\n\nSummary: ${cumulativePrompt}\n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
    const medicinesResult = await retryWithExponentialBackoff(() => model.generateContent(medicinesPrompt));
    let medicines = medicinesResult.response.text();
    try {
      medicines = JSON.stringify(JSON.parse(medicines));
    } catch (parseError) {
      console.error("Error parsing medicines JSON:", parseError);
      medicines = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { medicines });

    // When to Seek Help
    const seekHelpPrompt = `Based on the following summary, provide advice on when to seek immediate medical attention. List specific symptoms or situations that warrant urgent care. Return the results as a JSON array of objects.  Each object should have the following keys: "title" (String: Concise description), and "explanation" (String: More detailed explanation). Do not give any disclaimer or notes:\n\nSummary: ${cumulativePrompt}\n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks.  Return ONLY the raw JSON):`;
    const seekHelpResult = await retryWithExponentialBackoff(() => model.generateContent(seekHelpPrompt));
    let whenToSeekHelp = seekHelpResult.response.text();
    try {
      whenToSeekHelp = JSON.stringify(JSON.parse(whenToSeekHelp));
    } catch (parseError) {
      console.error("Error parsing whenToSeekHelp JSON:", parseError);
      whenToSeekHelp = "[]";
    }
    await SymptomSearch.findOneAndUpdate({ searchId }, { whenToSeekHelp });

    // Final Verdict
    const verdictPrompt = `Provide a concise final verdict based on the following summary. Do not include disclaimers:\n\nSummary: ${cumulativePrompt}\n\nFinal Verdict:`;
    const verdictResult = await retryWithExponentialBackoff(() => model.generateContent(verdictPrompt));
    const finalVerdict = verdictResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { finalVerdict });
    console.log("Response Stored: ", searchId);
  } catch (error) {
    console.error("Error generating Gemini responses:", error);
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      {
        cumulativePrompt: "An error occurred for cumulative prompt.",
        potentialConditions: "An error occurred for potential conditions.",
        medicines: "An error occurred for medicines.",
        whenToSeekHelp: "An error occurred for when to seek help.",
        finalVerdict: "An error occurred for final verdict.",
      }
    );
  }
}