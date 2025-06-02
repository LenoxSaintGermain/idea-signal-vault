
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { createIdea } from '@/services/supabaseService';
import { Idea } from '@/types';

interface PainPointFormatterResultProps {
  formattedResult: any;
  supabaseUser: any;
  rawIdea: string;
  onPainPointAdded?: () => void;
  onClearForm: () => void;
}

const PainPointFormatterResult = ({ 
  formattedResult, 
  supabaseUser, 
  rawIdea, 
  onPainPointAdded, 
  onClearForm 
}: PainPointFormatterResultProps) => {
  const [isAddingToGallery, setIsAddingToGallery] = useState(false);

  const handleAddToGallery = async () => {
    if (!formattedResult || !supabaseUser) return;

    setIsAddingToGallery(true);
    
    try {
      const newPainPoint: Omit<Idea, 'id' | 'createdAt'> = {
        headline: formattedResult.headline,
        subheadline: formattedResult.subheadline,
        title: formattedResult.headline,
        summary: formattedResult.solution || formattedResult.subheadline,
        painPoint: `Generated from user input: ${rawIdea}`,
        solution: formattedResult.solution || 'Solution to be detailed',
        tags: formattedResult.tags || [],
        valuationEstimate: Math.floor(Math.random() * 5000000) + 500000,
        voteCount: 0,
        commentCount: 0,
        authorId: supabaseUser.id,
        totalPoints: 0,
        isPainPoint: true,
        cta: formattedResult.cta || 'Request Full Concept'
      };

      await createIdea(newPainPoint, supabaseUser.id);

      toast({
        title: "Added to Gallery!",
        description: "Your pain point has been saved to the Pain Points gallery",
      });

      onClearForm();

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

  if (!formattedResult) return null;

  return (
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
            disabled={isAddingToGallery || !formattedResult.headline || !formattedResult.subheadline || !supabaseUser}
            variant="outline"
            className="flex-1 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 disabled:opacity-50"
          >
            {isAddingToGallery ? 'Adding...' : 'Add to Gallery'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PainPointFormatterResult;
