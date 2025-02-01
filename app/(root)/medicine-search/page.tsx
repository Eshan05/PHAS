'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicineSearchPage() {
  const [searchType, setSearchType] = useState<string>('disease');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/medicine-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchType, query }),
      });

      if (response.ok) {
        const data = await response.json();
        if (searchType === 'disease' || searchType === 'name') {
          const encodedQuery = encodeURIComponent(query);
          router.push(`/medicine-search/${searchType}/${encodedQuery}`);
        } else {
          router.push(`/medicine-search/${data.searchId}`);
        }
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
      <h1 className="text-2xl font-bold mb-4">Medicine Finder</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="searchType" className="block text-sm font-medium text-gray-700">Search Type:</label>
          <select
            id="searchType"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="disease">By Disease</option>
            <option value="name">By Medicine Name</option>
            <option value="sideEffects">By Side Effects</option>
            <option value="ingredient">By Ingredient</option>
            <option value="similar">Similar Medicines</option>
            <option value='dosage'>Dosage Information</option>
          </select>
        </div>
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">Search Query:</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
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