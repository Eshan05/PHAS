import { notFound } from 'next/navigation';
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';

interface PageProps {
  params: {
    searchId: string;
  };
}

interface Condition {
  name: string,
  description: string
  explanation: string
}

interface Medicine {
  name: string,
  commonUse: string
  sideEffects: string[]
}

interface SeekHelp {
  title: string,
  explanation: string
}

// Helper function to split the numbered list into separate items


export default async function SymptomSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = await params;
  const searchResult = await SymptomSearch.findOne({ searchId });

  if (!searchResult) {
    notFound();
  }

  let conditions: Condition[] = [];
  try {
    conditions = JSON.parse(searchResult.potentialConditions || "[]");
  } catch (e) {
    console.error("Error parsing conditions on frontend:", e);
  }

  let medicines: Medicine[] = [];
  try {
    medicines = JSON.parse(searchResult.medicines || "[]");
  } catch (e) {
    console.error("Error parsing medicines on frontend:", e);
  }

  let seekHelpItems: SeekHelp[] = [];
  try {
    seekHelpItems = JSON.parse(searchResult.whenToSeekHelp || "[]");
  } catch (e) {
    console.error("Error parsing whenToSeekHelp on frontend:", e);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Symptom Search Results</h1>

      {searchResult.cumulativePrompt ? (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Cumulative Prompt:</h2>
            <p>{searchResult.cumulativePrompt}</p>
          </section>

          {/* Potential Conditions Section - List Format */}
          {conditions.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Potential Conditions:</h2>
              <ul>
                {conditions.map((condition, index) => (
                  <li key={index}>
                    <strong>{condition.name}</strong>
                    <p>{condition.description}</p>
                    <p>{condition.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {medicines.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Potential Medicines:</h2>
              <ul>
                {medicines.map((medicine, index) => (
                  <li key={index}>
                    <strong>{medicine.name}</strong>
                    <p>Common Use: {medicine.commonUse}</p>
                    <ul>
                      <li>Side Effects:</li>
                      {medicine.sideEffects.map((sideEffect, sideEffectIndex) => (
                        <li key={sideEffectIndex}>{sideEffect}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {seekHelpItems.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-2">When to Seek Help:</h2>
              <ul>
                {seekHelpItems.map((item, index) => (
                  <li key={index}>
                    <strong>{item.title}</strong>
                    <p>{item.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-2">Final Verdict:</h2>
            <p>{searchResult.finalVerdict}</p>
          </section>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <p className="mt-8 text-sm text-gray-600">
        <strong>Disclaimer:</strong> This information is generated by an AI and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.
      </p>
    </div>
  );
}
