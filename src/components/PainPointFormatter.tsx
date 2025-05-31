import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatPainPoint } from '@/services/openaiService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createIdea } from '@/services/firestoreService';
import { Idea } from '@/types';

interface PainPointFormatterProps {
  onPainPointAdded?: () => void;
}

const PainPointFormatter = ({ onPainPointAdded }: PainPointFormatterProps) => {
  const { firebaseUser } = useAuth();
  const [rawIdea, setRawIdea] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToGallery, setIsAddingToGallery] = useState(false);
  const [formattedResult, setFormattedResult] = useState(null);

  const handleFormat = async () => {
    if (!rawIdea.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a raw business idea to format",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API key required",
        description: "Please enter your OpenAI API key",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await formatPainPoint(apiKey, rawIdea);
      console.log('Formatted result from OpenAI:', result);
      setFormattedResult(result);
      toast({
        title: "Pain point formatted!",
        description: "Your idea has been transformed into a punchy pain point card",
      });
    } catch (error) {
      console.error('Formatting error:', error);
      toast({
        title: "Formatting failed",
        description: error.message || "Failed to format the pain point",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToGallery = async () => {
    if (!formattedResult || !firebaseUser) return;

    setIsAddingToGallery(true);
    
    try {
      // Create new pain point entry
      const newPainPoint: Omit<Idea, 'id' | 'createdAt'> = {
        headline: formattedResult.headline,
        subheadline: formattedResult.subheadline,
        title: formattedResult.headline, // Use headline as title
        summary: formattedResult.solution,
        painPoint: `Generated from user input: ${rawIdea}`,
        solution: formattedResult.solution,
        tags: formattedResult.tags || [],
        valuationEstimate: Math.floor(Math.random() * 5000000) + 500000, // Random valuation
        voteCount: 0,
        commentCount: 0,
        authorId: firebaseUser.uid,
        totalPoints: 0,
        isPainPoint: true,
        cta: formattedResult.cta || 'Request Full Concept'
      };

      // Save to Firestore
      await createIdea(newPainPoint, firebaseUser.uid);

      toast({
        title: "Added to Gallery!",
        description: "Your pain point has been saved to the Pain Points gallery",
      });

      // Clear the form
      setRawIdea('');
      setFormattedResult(null);

      // Notify parent component
      if (onPainPointAdded) {
        onPainPointAdded();
      }

    } catch (error) {
      console.error('Error adding to gallery:', error);
      toast({
        title: "Failed to add",
        description: "Could not add the pain point to the gallery",
        variant: "destructive"
      });
    } finally {
      setIsAddingToGallery(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Pain Point Formatter Agent
          </CardTitle>
          <p className="text-gray-600">Transform raw business ideas into punchy, viral-ready pain point cards</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is not stored and only used for this formatting request
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raw Business Idea
            </label>
            <Textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="Paste your raw business idea, strategy, or opportunity description here..."
              className="min-h-32"
            />
          </div>

          <Button
            onClick={handleFormat}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            {isLoading ? 'Formatting...' : 'Format as Pain Point'}
          </Button>
        </CardContent>
      </Card>

      {formattedResult && (
        <Card className="bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-900">Formatted Pain Point Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Headline:</h4>
              <div className="p-3 bg-white rounded border border-red-200 cursor-pointer" onClick={() => copyToClipboard(formattedResult.headline)}>
                <p className="font-bold text-lg text-red-900">{formattedResult.headline}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Subheadline:</h4>
              <div className="p-3 bg-white rounded border border-red-200 cursor-pointer" onClick={() => copyToClipboard(formattedResult.subheadline)}>
                <p className="text-gray-700">{formattedResult.subheadline}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {formattedResult.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
              <div className="p-3 bg-white rounded border border-red-200 cursor-pointer" onClick={() => copyToClipboard(formattedResult.solution || 'No solution provided')}>
                <p className="text-gray-700">{formattedResult.solution || 'No solution provided in response'}</p>
              </div>
              {!formattedResult.solution && (
                <p className="text-xs text-red-500 mt-1">Note: Solution field was not returned by the AI</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => copyToClipboard(JSON.stringify(formattedResult, null, 2))}
                variant="outline"
                className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                Copy JSON
              </Button>
              <Button
                onClick={handleAddToGallery}
                disabled={isAddingToGallery || !formattedResult.headline || !formattedResult.subheadline || !firebaseUser}
                variant="outline"
                className="flex-1 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 disabled:opacity-50"
              >
                {isAddingToGallery ? 'Adding...' : 'Add to Gallery'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PainPointFormatter;
