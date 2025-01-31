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
import { Input } from '@/components/ui/input'

const FormSchema = z.object({
  symptoms: z.string(),
  duration: z.string().or(z.number()).optional(),
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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms</FormLabel>
                <FormControl>
                  <AutosizeTextarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={(e) => setDuration(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pastContext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Past Related Context</FormLabel>
                <FormControl>
                  <AutosizeTextarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='otherInfo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Information</FormLabel>
                <FormControl>
                  <AutosizeTextarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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