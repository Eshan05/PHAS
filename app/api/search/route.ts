import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
      User Symptoms: ${symptoms}
      Duration (days): ${duration || 'Not specified'}
      Past Related Context: ${pastContext || 'None'}
      Other Information: ${otherInfo || 'None'}

      Provide a detailed analysis of potential causes, recommended next steps, and when to seek immediate medical attention.  Format the response clearly and concisely. Be helpful and informative, but DO NOT provide medical advice. Include a disclaimer that this is not a substitute for professional medical advice.
    `;

    // Call Gemini API in the background
    generateGeminiResponse(searchId, prompt);
    // Return the searchId to the client immediately
    return NextResponse.json({ searchId }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred", error: error }, { status: 500 });
  }
}

// Function to call Gemini and update the database (runs in the background)
async function generateGeminiResponse(searchId: string, prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Update the database record with the Gemini response
    await SymptomSearch.findOneAndUpdate({ searchId }, { geminiResponse: text });
    console.log("Response Stored")

  } catch (error) {
    console.error("Error generating Gemini response:", error);
    // Update the database with an error message if Gemini fails
    await SymptomSearch.findOneAndUpdate(
      { searchId },
      { geminiResponse: "An error occurred while generating the response. Please try again later." }
    );
  }
}