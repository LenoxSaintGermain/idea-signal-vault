
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createConceptDoc } from '@/services/conceptDocService';
import { getAllPersonas } from '@/services/personaService';
import { PersonaProfile } from '@/types/persona';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface ConceptDocUploadProps {
  onDocUploaded: () => void;
}

const ConceptDocUpload = ({ onDocUploaded }: ConceptDocUploadProps) => {
  const { firebaseUser } = useAuth();
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const allPersonas = await getAllPersonas();
      setPersonas(allPersonas.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading personas:', error);
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

  const togglePersona = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      targetPersonas: prev.targetPersonas.includes(personaId)
        ? prev.targetPersonas.filter(id => id !== personaId)
        : [...prev.targetPersonas, personaId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    if (!formData.title || !formData.htmlUrl) {
      toast({
        title: "Missing required fields",
        description: "Please provide at least a title and HTML URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await createConceptDoc({
        title: formData.title,
        subtitle: formData.subtitle,
        author: formData.author || 'Unknown',
        htmlUrl: formData.htmlUrl,
        pdfUrl: formData.pdfUrl || undefined,
        tags: formData.tags,
        targetPersonas: formData.targetPersonas,
        status: 'draft'
      }, firebaseUser.uid);

      toast({
        title: "Concept doc uploaded!",
        description: `"${formData.title}" has been routed to ${formData.targetPersonas.length} personas for review`,
      });

      // Reset form
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
      toast({
        title: "Upload failed",
        description: "Could not upload the concept document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
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
              placeholder="Brief description"
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
                placeholder="https://example.com/document.html"
                required
              />
            </div>
            <div>
              <Label htmlFor="pdfUrl">PDF URL (Optional)</Label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                placeholder="https://example.com/document.pdf"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
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
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Target Personas ({formData.targetPersonas.length} selected)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
              {personas.map(persona => (
                <div
                  key={persona.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    formData.targetPersonas.includes(persona.id)
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => togglePersona(persona.id)}
                >
                  <div className="font-medium text-sm">{persona.name}</div>
                  <div className="text-xs text-gray-600">{persona.description}</div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload & Route to Personas'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConceptDocUpload;
