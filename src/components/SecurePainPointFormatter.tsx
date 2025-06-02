
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { createIdea } from '@/services/supabaseService';
import { validation } from '@/services/validationService';
import { SecureApiService } from '@/services/secureApiService';
import { Idea } from '@/types';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurePainPointFormatterProps {
  onPainPointAdded?: () => void;
}

const SecurePainPointFormatter = ({ onPainPointAdded }: SecurePainPointFormatterProps) => {
  const { supabaseUser, user } = useAuth();
  const [rawIdea, setRawIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToGallery, setIsAddingToGallery] = useState(false);
  const [formattedResult, setFormattedResult] = useState(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const secureApi = SecureApiService.getInstance();

  const handleFormat = async () => {
    try {
      // Input validation
      const sanitizedIdea = validation.validateTextInput(rawIdea, 5000);
      
      // Rate limiting check
      const rateLimitKey = `format_${supabaseUser?.id}`;
      if (!validation.checkRateLimit(rateLimitKey, 5, 300000)) { // 5 requests per 5 minutes
        setRateLimitExceeded(true);
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before making another request",
          variant: "destructive"
        });
        return;
      }

      if (!supabaseUser) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use this feature",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      setRateLimitExceeded(false);

      // For now, we'll use a simple formatting approach since we don't have the secure API yet
      const mockResult = {
        headline: "AI-Generated Pain Point",
        subheadline: sanitizedIdea.substring(0, 100) + "...",
        solution: "Custom solution based on user input",
        tags: ["AI-Generated", "Pain Point"],
        cta: "Request Full Concept"
      };
      
      setFormattedResult(mockResult);
      toast({
        title: "Pain point formatted!",
        description: "Your idea has been transformed into a punchy pain point card",
      });
    } catch (error) {
      console.error('Formatting error:', error);
      toast({
        title: "Formatting failed",
        description: error instanceof Error ? error.message : "Failed to format the pain point",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToGallery = async () => {
    if (!formattedResult || !supabaseUser || !user) return;

    setIsAddingToGallery(true);
    
    try {
      // Validate formatted result
      const validatedData = validation.validateIdeaData({
        title: formattedResult.headline,
        summary: formattedResult.solution,
        painPoint: `Generated from user input: ${rawIdea}`,
        solution: formattedResult.solution,
        tags: formattedResult.tags || []
      });

      const newPainPoint: Omit<Idea, 'id' | 'createdAt'> = {
        headline: validatedData.title,
        subheadline: formattedResult.subheadline,
        title: validatedData.title,
        summary: validatedData.summary,
        painPoint: validatedData.painPoint,
        solution: validatedData.solution,
        tags: validatedData.tags,
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

      setRawIdea('');
      setFormattedResult(null);

      if (onPainPointAdded) {
        onPainPointAdded();
      }

    } catch (error) {
      console.error('Error adding to gallery:', error);
      toast({
        title: "Failed to add",
        description: error instanceof Error ? error.message : "Could not add the pain point to the gallery",
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
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Secure Pain Point Formatter
            </CardTitle>
          </div>
          <p className="text-gray-600">Transform raw business ideas into punchy, viral-ready pain point cards</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {rateLimitExceeded && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Rate limit exceeded. Please wait a few minutes before making another request.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raw Business Idea
            </label>
            <Textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="Paste your raw business idea, strategy, or opportunity description here..."
              className="min-h-32"
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {rawIdea.length}/5000 characters • Content is automatically sanitized for security
            </p>
          </div>

          <Button
            onClick={handleFormat}
            disabled={isLoading || !rawIdea.trim() || !supabaseUser || rateLimitExceeded}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            {isLoading ? 'Formatting...' : 'Format as Pain Point'}
          </Button>

          {!supabaseUser && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to use the Pain Point Formatter
              </AlertDescription>
            </Alert>
          )}
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
                disabled={isAddingToGallery || !formattedResult.headline || !formattedResult.subheadline || !supabaseUser}
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

export default SecurePainPointFormatter;
