
import { usePainPointFormatter } from '@/hooks/usePainPointFormatter';
import PainPointFormatterInput from './PainPointFormatterInput';
import PainPointFormatterResult from './PainPointFormatterResult';

interface PainPointFormatterProps {
  onPainPointAdded?: () => void;
}

const PainPointFormatter = ({ onPainPointAdded }: PainPointFormatterProps) => {
  const {
    rawIdea,
    setRawIdea,
    apiKey,
    setApiKey,
    isLoading,
    formattedResult,
    handleFormat,
    clearForm,
    supabaseUser
  } = usePainPointFormatter();

  return (
    <div className="space-y-6">
      <PainPointFormatterInput
        rawIdea={rawIdea}
        setRawIdea={setRawIdea}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isLoading={isLoading}
        onFormat={handleFormat}
      />

      <PainPointFormatterResult
        formattedResult={formattedResult}
        supabaseUser={supabaseUser}
        rawIdea={rawIdea}
        onPainPointAdded={onPainPointAdded}
        onClearForm={clearForm}
      />
    </div>
  );
};

export default PainPointFormatter;
