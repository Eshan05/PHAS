import MedicineSearch from '@/models/Medicine';
import dbConnect from '@/utils/dbConnect';
import { notFound } from 'next/navigation';
import { Medicine } from '../../[searchId]/page';
import FadeContent from '@/components/fade-content';

interface PageProps {
  params: {
    query: string;
  };
}

export default async function MedicineSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);

  const searchResult = await MedicineSearch.findOne({ searchType: 'disease', query: decodedQuery });

  if (!searchResult) {
    notFound();
  }
  let resultData: Medicine[] | null = null;
  try {
    resultData = JSON.parse(searchResult.result || "{}");
  } catch (e) {
    console.error("Error parsing result JSON:", e);
    resultData = null;
  }

  const renderResult = () => {
    return (
      <ul>
        {resultData!.map((medicine: Medicine, index: number) => (
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
  }

  return (
    <section className="relative overflow-x-hidden flex flex-col font-inter min-h-svh">
      <div className="w-full px-[1.15rem] py-8 lg:px-8 lg:py-10">
        <header className='relative flex items-center lg:mb-10 mb-6 space-y-8'>
          <h1 className="shadow-heading">Medicine Search</h1>
        </header>
        <FadeContent blur={true} duration={500} easing='ease-in' initialOpacity={0}>
          <h2 className="text-xl font-semibold mb-2">Query: {decodedQuery}</h2>
          <h3 className="text-lg mb-4">Search Type: disease</h3>
          {resultData ? (
            renderResult()
          ) : (
            <p>Loading...</p>
          )}
          <p className="mt-8 text-sm text-gray-600">
            <strong>Disclaimer:</strong> This information is generated by an AI and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.
          </p>
        </FadeContent>
      </div>
    </section>
  );
}