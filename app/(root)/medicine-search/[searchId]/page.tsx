import { notFound } from 'next/navigation';
import dbConnect from '@/utils/dbConnect';
import MedicineSearch from '@/models/Medicine';

interface PageProps {
  params: {
    searchId: string;
  };
}

export default async function MedicineSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = params;

  const searchResult = await MedicineSearch.findOne({ searchId });

  if (!searchResult) {
    notFound();
  }

  let resultData: any = null;
  try {
    resultData = JSON.parse(searchResult.result || "{}");
  } catch (e) {
    console.error("Error parsing result JSON:", e);
    resultData = {};
  }

  const renderResult = () => {
    switch (searchResult.searchType) {
      case 'disease':
        return (
          <ul>
            {resultData.map((medicine: any, index: number) => (
              <li key={index}>
                <strong>{medicine.name}</strong>
                <p>Function: {medicine.function}</p>
                <p>Common Uses: {medicine.commonUses.join(', ')}</p>
                {medicine.dosageInformation && (
                  <div>
                    <p><strong>Dosage Information:</strong></p>
                    <p>Adults: {medicine.dosageInformation.adults || "N/A"}</p>
                    <p>Children: {medicine.dosageInformation.children || "N/A"}</p>
                    <p>Special Populations: {medicine.dosageInformation.specialPopulations || "N/A"}</p>
                    <p>Dosage Forms: {medicine.dosageInformation.dosageForms || "N/A"}</p>
                    <p>General Notes: {medicine.dosageInformation.generalNotes || "N/A"}</p>
                  </div>
                )}
                <p>Administration: {medicine.administration}</p>
                <p>Side Effects: {medicine.sideEffects.join(', ')}</p>
                <p>Additional Info: {medicine.additionalInfo}</p>
              </li>
            ))}
          </ul>
        );
      case 'name':
        return (
          <div>
            <p><strong>Name:</strong> {resultData.name}</p>
            <p>Function: {resultData.function}</p>
            <p>Common Uses: {resultData.commonUses.join(', ')}</p>
            {resultData.dosageInformation && (
              <div>
                <p><strong>Dosage Information:</strong></p>
                <p>Adults: {resultData.dosageInformation.adults || "N/A"}</p>
                <p>Children: {resultData.dosageInformation.children || "N/A"}</p>
                <p>Special Populations: {resultData.dosageInformation.specialPopulations || "N/A"}</p>
                <p>Dosage Forms: {resultData.dosageInformation.dosageForms || "N/A"}</p>
                <p>General Notes: {resultData.dosageInformation.generalNotes || "N/A"}</p>
              </div>
            )}
            <p>Administration: {resultData.administration}</p>
            <p>Side Effects: {resultData.sideEffects.join(', ')}</p>
            <p>Additional Info: {resultData.additionalInfo}</p>
          </div>
        );
      case 'sideEffects':
        return (
          <ul>
            {resultData.map((medicine: any, index: number) => (
              <li key={index}>
                <strong>{medicine.name}</strong>
                <p>Function: {medicine.function}</p>
                <p>Common Uses: {medicine.commonUses.join(', ')}</p>
                {medicine.dosageInformation && (
                  <div>
                    <p><strong>Dosage Information:</strong></p>
                    <p>Adults: {medicine.dosageInformation.adults || "N/A"}</p>
                    <p>Children: {medicine.dosageInformation.children || "N/A"}</p>
                    <p>Special Populations: {medicine.dosageInformation.specialPopulations || "N/A"}</p>
                    <p>Dosage Forms: {medicine.dosageInformation.dosageForms || "N/A"}</p>
                    <p>General Notes: {medicine.dosageInformation.generalNotes || "N/A"}</p>
                  </div>
                )}
                <p>Administration: {medicine.administration}</p>
                <p>Side Effects: {medicine.sideEffects.join(', ')}</p>
                <p>Additional Info: {medicine.additionalInfo}</p>
              </li>
            ))}
          </ul>
        )
      case 'ingredient':
        return (
          <div>
            <p><strong>Name:</strong> {resultData.name}</p>
            <p><strong>Uses:</strong> {resultData.uses}</p>
            <p><strong>Mechanism:</strong> {resultData.mechanism}</p>
            <p><strong>Side Effects:</strong> {resultData.sideEffects.join(', ')}</p>
            {resultData.dosageInformation && (
              <div>
                <p><strong>Dosage Information:</strong></p>
                <p>General Notes: {resultData.dosageInformation.generalDosageNotes || "N/A"}</p>
              </div>
            )}
          </div>
        );
      case 'similar':
        return (
          <ul>
            {resultData.map((medicine: any, index: number) => (
              <li key={index}>
                <strong>{medicine.name}</strong>
                <p>Function: {medicine.function}</p>
                <p>Common Uses: {medicine.commonUses}</p>
                {medicine.dosageInformation && (
                  <div>
                    <p><strong>Dosage Information:</strong></p>
                    <p>Adults: {medicine.dosageInformation.adults || "N/A"}</p>
                    <p>Children: {medicine.dosageInformation.children || "N/A"}</p>
                    <p>Special Populations: {medicine.dosageInformation.specialPopulations || "N/A"}</p>
                    <p>Dosage Forms: {medicine.dosageInformation.dosageForms || "N/A"}</p>
                    <p>General Notes: {medicine.dosageInformation.generalNotes || "N/A"}</p>
                  </div>
                )}
                <p>Similarity: {medicine.similarities}</p>
                <p>Differences: {medicine.differences}</p>
              </li>
            ))}
          </ul>
        );
      default:
        return <p>No results found.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Medicine Search Results</h1>
      <h2 className="text-xl font-semibold mb-2">Query: {searchResult.query}</h2>
      <h3 className="text-lg mb-4">Search Type: {searchResult.searchType}</h3>
      {resultData ? (
        renderResult()
      ) : (
        <p>Loading...</p>
      )}

      <p className="mt-8 text-sm text-gray-600">
        <strong>Disclaimer:</strong> This information is generated by an AI and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.
      </p>
    </div>
  );
}