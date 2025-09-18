import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecommendationForm from './recommendation-form';

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Utensil Assistant</h2>
        <p className="mt-2 text-muted-foreground">
          Not sure what you need? Paste a recipe or describe your cooking plans, and our AI will suggest the perfect utensils for the job.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Get Recommendations</CardTitle>
          <CardDescription>Enter a recipe or your cooking needs below.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendationForm />
        </CardContent>
      </Card>
    </div>
  );
}
