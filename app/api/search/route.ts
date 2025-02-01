import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      duration,
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
    // Return the searchId to the client immediately
    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

async function generateGeminiResponses(searchId: string, initialPrompt: string) {
  try {
    // Cumulative Prompt
    const summarizePrompt = `Summarize the following user input into a concise, clear statement of the problem.  Focus on the key symptoms and relevant context:\n\n${initialPrompt}\n\nSummary:`;
    const summarizeResult = await model.generateContent(summarizePrompt);
    const cumulativePrompt = summarizeResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { cumulativePrompt });

    // Potential Conditions
    const conditionsPrompt = `Based on the following summary, list potential medical conditions, ordered from most likely to least likely. Include an explanation of each condition:\n\nSummary: ${cumulativePrompt}\n\nPotential Conditions:`;
    const conditionsResult = await model.generateContent(conditionsPrompt);
    const potentialConditions = conditionsResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { potentialConditions });

    // Medicines
    const medicinesPrompt = `Based on the following summary, list potential over-the-counter or common medicines that *might* help alleviate the symptoms. Include a brief description of each medicine's purpose and potential side effects. **Do not give disclaimer**, if needed you can include medicines that are not over-the-counter:\n\nSummary: ${cumulativePrompt}\n\nPotential Medicines:`;
    const medicinesResult = await model.generateContent(medicinesPrompt);
    const medicines = medicinesResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { medicines });

    // When to Seek Help
    const seekHelpPrompt = `Based on the following summary, provide advice on when to seek immediate medical attention. List specific symptoms or situations that warrant urgent care:\n\nSummary: ${cumulativePrompt}\n\nWhen to Seek Help:`;
    const seekHelpResult = await model.generateContent(seekHelpPrompt);
    const whenToSeekHelp = seekHelpResult.response.text();
    await SymptomSearch.findOneAndUpdate({ searchId }, { whenToSeekHelp });

    // Final Verdict
    const verdictPrompt = `Provide a concise final verdict based on the following summary. Do not include disclaimers:\n\nSummary: ${cumulativePrompt}\n\nFinal Verdict:`;
    const verdictResult = await model.generateContent(verdictPrompt);
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