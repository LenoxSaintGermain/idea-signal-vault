
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, X, ExternalLink, FileText, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PersonaProfile, ConceptDoc } from '@/types/persona';
import { getConceptDocById } from '@/services/conceptDocService';
import { reviewConceptDoc } from '@/services/personaService';

interface PersonaReviewFeedProps {
  persona: PersonaProfile;
  onReviewComplete: () => void;
}

const PersonaReviewFeed = ({ persona, onReviewComplete }: PersonaReviewFeedProps) => {
  const [reviewDocs, setReviewDocs] = useState<ConceptDoc[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviewDocs();
  }, [persona]);

  const loadReviewDocs = async () => {
    try {
      const docs = await Promise.all(
        persona.conceptDocReviewQueue.map(docId => getConceptDocById(docId))
      );
      setReviewDocs(docs.filter(doc => doc !== null) as ConceptDoc[]);
    } catch (error) {
      console.error('Error loading review docs:', error);
    }
  };

  const handleReview = async (action: 'keep' | 'reject') => {
    const currentDoc = reviewDocs[currentDocIndex];
    if (!currentDoc) return;

    setLoading(true);
    try {
      await reviewConceptDoc(persona.id, currentDoc.id, action, notes);
      
      toast({
        title: action === 'keep' ? "Document kept!" : "Document rejected",
        description: `"${currentDoc.title}" has been ${action === 'keep' ? 'added to your catalog' : 'sent to public queue'}`,
      });

      // Move to next document or finish
      if (currentDocIndex < reviewDocs.length - 1) {
        setCurrentDocIndex(prev => prev + 1);
        setNotes('');
      } else {
        onReviewComplete();
      }
    } catch (error) {
      toast({
        title: "Review failed",
        description: "Could not process your review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (reviewDocs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents to Review</h3>
          <p className="text-gray-600">All caught up! New concept documents will appear here for review.</p>
        </CardContent>
      </Card>
    );
  }

  const currentDoc = reviewDocs[currentDocIndex];
  const progress = ((currentDocIndex + 1) / reviewDocs.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Concept Doc Review</h2>
        <Badge className="bg-purple-100 text-purple-800">
          {currentDocIndex + 1} of {reviewDocs.length}
        </Badge>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{currentDoc.title}</CardTitle>
              {currentDoc.subtitle && (
                <p className="text-gray-600 mb-3">{currentDoc.subtitle}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {currentDoc.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(currentDoc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentDoc.htmlUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View HTML
              </Button>
              {currentDoc.pdfUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentDoc.pdfUrl!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {currentDoc.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <iframe
              src={currentDoc.htmlUrl}
              className="w-full h-96 border-0 rounded"
              title={currentDoc.title}
            />
          </div>

          <div>
            <Label htmlFor="notes">Review Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this document..."
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleReview('keep')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              KEEP - Add to Catalog
            </Button>
            <Button
              onClick={() => handleReview('reject')}
              disabled={loading}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              REJECT - Send to Public
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaReviewFeed;
