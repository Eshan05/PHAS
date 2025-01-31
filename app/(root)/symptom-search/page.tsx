// app/symptom-search/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AutosizeTextarea } from '@/components/ui/autoresize-textarea';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

const FormSchema = z.object({
  symptoms: z.string(),
  duration: z.number().optional(),
  pastContext: z.string().optional(),
  otherInfo: z.string().optional(),
});

export default function SymptomSearchPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      symptoms: '',
      duration: undefined,
      pastContext: '',
      otherInfo: '',
    },
  });

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
    <section className="container mx-auto p-4">
      <ModeToggle />
      <h1 className="text-2xl font-bold mb-4">Symptom Search</h1>
      <Form {...form}>
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
            />
          </div>
          <div>
            <label htmlFor="pastContext" className="block text-sm font-medium text-gray-700">Past related Context:</label>
            <textarea
              id="pastContext"
              value={pastContext}
              onChange={(e) => setPastContext(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="otherInfo" className="block text-sm font-medium text-gray-700">Other Information:</label>
            <textarea
              id="otherInfo"
              value={otherInfo}
              onChange={(e) => setOtherInfo(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}        >
            {loading ? 'Searching...' : 'Search'}
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </Form>
    </section>
  );
}