
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { createConceptDoc } from '@/services/conceptDocService';
import { getAllPersonas } from '@/services/personaService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ConceptDocUploadProps {
  onDocUploaded: () => void;
}

const ConceptDocUpload = ({ onDocUploaded }: ConceptDocUploadProps) => {
  const { firebaseUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    author: '',
    htmlUrl: '',
    pdfUrl: '',
    tags: [] as string[],
    targetPersonas: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPersonas = async () => {
    try {
      const allPersonas = await getAllPersonas();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload concept docs",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.htmlUrl) {
      toast({
        title: "Missing required fields",
        description: "Title and HTML URL are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await createConceptDoc({
        title: formData.title,
        subtitle: formData.subtitle,
        author: formData.author,
        htmlUrl: formData.htmlUrl,
        pdfUrl: formData.pdfUrl,
        tags: formData.tags,
        targetPersonas: formData.targetPersonas,
        status: 'draft'
      }, firebaseUser.uid);

      toast({
        title: "Concept doc uploaded",
        description: "Document has been created and routed to target personas",
      });

      setFormData({
        title: '',
        subtitle: '',
        author: '',
        htmlUrl: '',
        pdfUrl: '',
        tags: [],
        targetPersonas: []
      });
      
      onDocUploaded();
    } catch (error) {
      console.error('Error uploading concept doc:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload the concept document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Concept Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Document subtitle"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="htmlUrl">HTML URL *</Label>
              <Input
                id="htmlUrl"
                type="url"
                value={formData.htmlUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, htmlUrl: e.target.value }))}
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <Label htmlFor="pdfUrl">PDF URL (optional)</Label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center">
                  {tag}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload Concept Document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConceptDocUpload;
