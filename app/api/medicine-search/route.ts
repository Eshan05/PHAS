import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/utils/dbConnect';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { retryWithExponentialBackoff } from '@/lib/utils';
import MedicineSearch from '@/models/Medicine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { searchType, query } = body;

    if (!searchType || !query) {
      return NextResponse.json({ message: "searchType and query are required" }, { status: 400 });
    }

    if (!['disease', 'name', 'sideEffects', 'ingredient', 'similar'].includes(searchType)) {
      return NextResponse.json({ message: "Invalid searchType" }, { status: 400 });
    }
    const searchId = uuidv4();

    const newSearch = new MedicineSearch({
      searchId,
      searchType,
      query,
    });
    await newSearch.save();
    generateMedicineResponse(searchId, searchType, query)

    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

async function generateMedicineResponse(searchId: string, searchType: string, query: string) {
  try {
    let prompt = "";
    let resultKey = 'result'; //? Change

    switch (searchType) {
      case 'disease':
        prompt = `List medicines commonly used to treat ${query}. Return the results as a JSON array of objects.  Each object should have the following structure: 
        \n Medicine = { name, function, commonUses, dosage, administration, sideEffects, additionalinfo }
        \n (String: Medicine name), (String: Function of medicine), (String[]: Common uses), (String: Dosage), (String: Administration), (String[]: Side effects), (String: Any other information)
        Return: Array<Medicine>
        \n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks.  Return ONLY the raw JSON):`;
        break;
      case 'name':
        prompt = `Provide information about the medicine named "${query}". Return as a JSON object as follows: 
        \n Medicine = { name, function, commonUses, dosage, administration, sideEffects, additionalinfo }
        \n (String: Medicine name), (String: Function of medicine), (String[]: Common uses), (String: Dosage), (String: Administration), (String[]: Side effects), (String: Any other information)
        \n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks.  Return ONLY the raw JSON):`;
        break;
      case 'sideEffects':
        prompt = `List medicines that are known to have the following side effect(s): ${query}. Return as a JSON array of objects as follows:
        \n Medicine = { name, function, common uses, dosage, administration, side effects, additionalinfo }
        \n (String: Medicine name), (String: Function of medicine), (String[]: Common uses), (String: Dosage), (String: Administration), (String[]: Side effects), (String: Any other information)
        Return: Array<Medicine>
        \n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks.  Return ONLY the raw JSON):`;
        break;
      case 'ingredient':
        prompt = `Provide information about the medicine ingredient: "${query}". Include details on what types of medicines it is used in, its mechanism of action, and potential side effects. Return as a JSON object with as follows:
        \n Ingredient = { name, uses, mechanism, sideEffects }
        \n (String: Ingredient name), (String: Used in medicines), (String: Mechanism of action), (String[]: Side effects)
        \n\nJSON Output (Don't include any additional text, formatting, or markdown code blocks. Return ONLY the raw JSON):`;
        break;
      case 'similar':
        prompt = `List medicines similar to "${query}". Include a brief explanation of how they are similar and any key differences as well descriptions/function of the medicines themselves. Return as a JSON array of objects as follows:
        \n SimilarMedicine = { name, function, commonUses, similarities, differences }
        \n (String: Medicine name), (String: Function of medicine), (String: Common uses), (String: Similarities), (String: Differences)
        \n Return: Array<SimilarMedicine>
        \n\nJSON Output (Do not include any additional text, formatting, or markdown code blocks.  Return ONLY the raw JSON):`;
        break;
      default:
        throw new Error("Invalid searchType"); // Should never happen
    }

    const geminiResult = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    let result = geminiResult.response.text();

    try {
      result = JSON.stringify(JSON.parse(result));
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      result = searchType === 'ingredient' ? "{}" : "[]";
    }

    await MedicineSearch.findOneAndUpdate({ searchId }, { [resultKey]: result });
    console.log("Medicine response stored")


  } catch (error) {
    console.error("Error generating Gemini responses:", error);
    await MedicineSearch.findOneAndUpdate(
      { searchId },
      {
        result: "An error occurred.",
      }
    );
  }
}
