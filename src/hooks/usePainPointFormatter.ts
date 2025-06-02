import { useState } from 'react';
import { formatPainPoint } from '@/services/openaiService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useSupabaseAuth';

export const usePainPointFormatter = () => {
  const { supabaseUser } = useAuth();
  const [rawIdea, setRawIdea] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const clearForm = () => {
    setRawIdea('');
    setFormattedResult(null);
  };

  return {
    rawIdea,
    setRawIdea,
    apiKey,
    setApiKey,
    isLoading,
    formattedResult,
    setFormattedResult,
    handleFormat,
    clearForm,
    supabaseUser
  };
};
