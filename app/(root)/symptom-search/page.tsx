// app/symptom-search/page.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';

export default function SymptomSearchPage() {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState<number | undefined>();
  const [pastContext, setPastContext] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms, duration, pastContext, otherInfo }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/symptom-search/${data.searchId}`); //
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Symptom Search</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Symptoms:</label>
          <AutosizeTextarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (days):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="pastContext" className="block text-sm font-medium text-gray-700">Past related Context:</label>
          <textarea
            id="pastContext"
            value={pastContext}
            onChange={(e) => setPastContext(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="otherInfo" className="block text-sm font-medium text-gray-700">Other Information:</label>
          <textarea
            id="otherInfo"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}