
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PainPointFormatterInputProps {
  rawIdea: string;
  setRawIdea: (value: string) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  isLoading: boolean;
  onFormat: () => void;
}

const PainPointFormatterInput = ({
  rawIdea,
  setRawIdea,
  apiKey,
  setApiKey,
  isLoading,
  onFormat
}: PainPointFormatterInputProps) => {
  return (
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
          onClick={onFormat}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        >
          {isLoading ? 'Formatting...' : 'Format as Pain Point'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PainPointFormatterInput;
