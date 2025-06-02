
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Idea } from '@/types';
import { updateIdea } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface EditIdeaDialogProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditIdeaDialog = ({ idea, isOpen, onClose, onSave }: EditIdeaDialogProps) => {
  const [formData, setFormData] = useState<Partial<Idea>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idea) {
      setFormData(idea);
    } else {
      setFormData({});
    }
  }, [idea]);

  const handleSave = async () => {
    if (!idea || !formData) return;

    setLoading(true);
    try {
      await updateIdea(idea.id, formData);
      toast({
        title: "Idea updated",
        description: "The idea has been successfully updated",
      });
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update the idea",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof Idea, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!idea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Content</span>
            {idea.isPainPoint && <Badge className="bg-red-600">Pain Point</Badge>}
            {idea.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {idea.isPainPoint ? (
            <>
              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline || ''}
                  onChange={(e) => updateField('headline', e.target.value)}
                  placeholder="Why does problem exist..."
                />
              </div>

              <div>
                <Label htmlFor="subheadline">Subheadline</Label>
                <Input
                  id="subheadline"
                  value={formData.subheadline || ''}
                  onChange={(e) => updateField('subheadline', e.target.value)}
                  placeholder="Brief solution description"
                />
              </div>

              <div>
                <Label htmlFor="painPoint">Pain Point</Label>
                <Textarea
                  id="painPoint"
                  value={formData.painPoint || ''}
                  onChange={(e) => updateField('painPoint', e.target.value)}
                  placeholder="Detailed pain point description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  value={formData.solution || ''}
                  onChange={(e) => updateField('solution', e.target.value)}
                  placeholder="Detailed solution description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cta">Call to Action</Label>
                <Input
                  id="cta"
                  value={formData.cta || ''}
                  onChange={(e) => updateField('cta', e.target.value)}
                  placeholder="Request Full Concept"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary || ''}
                  onChange={(e) => updateField('summary', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => updateField('tags', e.target.value.split(',').map(tag => tag.trim()))}
              placeholder="AI, SaaS, HealthTech"
            />
          </div>

          <div>
            <Label htmlFor="valuation">Valuation Estimate ($)</Label>
            <Input
              id="valuation"
              type="number"
              value={formData.valuationEstimate || ''}
              onChange={(e) => updateField('valuationEstimate', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.isFeatured || false}
              onCheckedChange={(checked) => updateField('isFeatured', checked)}
            />
            <Label htmlFor="featured">Featured Content</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditIdeaDialog;
