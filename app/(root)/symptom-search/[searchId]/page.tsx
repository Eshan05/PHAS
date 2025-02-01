import { notFound } from 'next/navigation';
import dbConnect from '@/utils/dbConnect';
import SymptomSearch from '@/models/SymptomSearch';

interface PageProps {
  params: {
    searchId: string;
  };
}

// Helper function to split the numbered list into separate items
const parseConditions = (text: string) => {
  const regex = /(\d+\.\s+\*\*[^:]+:\*\*[^(\n]+\n?[^(\d\.)]+)/g;
  const matches = text.match(regex);

  if (!matches) return [];

  return matches.map((condition) => {
    const splitIndex = condition.indexOf('**') + 2;
    const title = condition.slice(0, splitIndex).replace('**', '').trim();
    const description = condition.slice(splitIndex).trim();

    return { title, description };
  });
};

export default async function SymptomSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = await params;
  const searchResult = await SymptomSearch.findOne({ searchId });

  if (!searchResult) {
    notFound();
  }

  const conditions = parseConditions(searchResult.potentialConditions);

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
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Potential Conditions:</h2>
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <h3 className="font-semibold">{condition.title}</h3>
                  <p>{condition.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Potential Medicines:</h2>
            <p>{searchResult.medicines}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">When to Seek Help:</h2>
            <p>{searchResult.whenToSeekHelp}</p>
          </section>

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
