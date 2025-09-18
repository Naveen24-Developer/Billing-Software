'use server';
/**
 * @fileOverview An AI agent that recommends cooking utensils based on a recipe or cooking preferences.
 *
 * - recommendUtensils - A function that handles the utensil recommendation process.
 * - RecommendUtensilsInput - The input type for the recommendUtensils function.
 * - RecommendUtensilsOutput - The return type for the recommendUtensils function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendUtensilsInputSchema = z.object({
  recipe: z
    .string()
    .describe('The recipe or cooking preferences provided by the user.'),
});
export type RecommendUtensilsInput = z.infer<typeof RecommendUtensilsInputSchema>;

const RecommendUtensilsOutputSchema = z.object({
  utensilRecommendations: z
    .string()
    .describe('A list of recommended cooking utensils for the provided recipe or preferences.'),
});
export type RecommendUtensilsOutput = z.infer<typeof RecommendUtensilsOutputSchema>;

export async function recommendUtensils(input: RecommendUtensilsInput): Promise<RecommendUtensilsOutput> {
  return recommendUtensilsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendUtensilsPrompt',
  input: {schema: RecommendUtensilsInputSchema},
  output: {schema: RecommendUtensilsOutputSchema},
  prompt: `You are an expert culinary assistant. A user will provide you with a recipe or their cooking preferences, and you will recommend the optimal cooking utensils for their needs.

Recipe/Preferences: {{{recipe}}}

Based on the provided recipe/preferences, recommend a list of cooking utensils:
`, safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
});

const recommendUtensilsFlow = ai.defineFlow(
  {
    name: 'recommendUtensilsFlow',
    inputSchema: RecommendUtensilsInputSchema,
    outputSchema: RecommendUtensilsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
