'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recommendUtensils } from '@/ai/flows/intelligent-utensil-recommendation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  recipe: z.string().min(10, {
    message: 'Please enter at least 10 characters to get a recommendation.',
  }),
});

type Recommendation = {
  utensilRecommendations: string;
};

export default function RecommendationForm() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipe: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await recommendUtensils(values);
      setRecommendation(result);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get a recommendation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="recipe"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Recipe or Cooking Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'I want to bake a three-layer chocolate cake' or paste a full recipe here."
                    className="min-h-[150px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Recommendations
          </Button>
        </form>
      </Form>

      {recommendation && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Our Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground">
              {recommendation.utensilRecommendations
                .split('\n')
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
