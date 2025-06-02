
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { getPersonaById, getPersonaConceptDocs } from '@/services/supabasePersonaService';
import { getConceptDocsByPersona } from '@/services/supabaseConceptDocService';
import { PersonaProfile, ConceptDoc } from '@/types/persona';
import { User, ArrowLeft, Calendar, Heart, Clock } from 'lucide-react';

const PersonaProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [persona, setPersona] = useState<PersonaProfile | null>(null);
  const [conceptDocs, setConceptDocs] = useState<ConceptDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonaData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        
        // Load persona details
        const personaData = await getPersonaById(id);
        if (!personaData) {
          setError('Persona not found');
          return;
        }
        setPersona(personaData);

        // Load concept docs for this persona
        const docs = await getConceptDocsByPersona(id);
        setConceptDocs(docs);

      } catch (err) {
        console.error('Error loading persona data:', err);
        setError('Failed to load persona data');
      } finally {
        setLoading(false);
      }
    };

    loadPersonaData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading persona...</p>
        </div>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>{error || 'Persona not found'}</AlertDescription>
          </Alert>
          <Link to="/" className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{persona.name}</h1>
              <p className="text-gray-600 mb-4">{persona.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(persona.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Last reviewed {new Date(persona.lastReviewed).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{persona.ideaCatalog.length} ideas in catalog</span>
                </div>
              </div>
            </div>
            
            <Badge className={persona.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {persona.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="documents">Documents ({conceptDocs.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{persona.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ideas in Catalog:</span>
                    <span className="font-semibold">{persona.ideaCatalog.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">In Review Queue:</span>
                    <span className="font-semibold">{persona.reviewQueue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concept Documents:</span>
                    <span className="font-semibold">{persona.conceptDocCatalog.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={persona.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {persona.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle>Tags of Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {persona.tagsOfInterest.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-4">
              {conceptDocs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No concept documents found for this persona.</p>
                  </CardContent>
                </Card>
              ) : (
                conceptDocs.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <p className="text-gray-600 mt-1">{doc.subtitle}</p>
                          <p className="text-sm text-gray-500 mt-2">By {doc.author}</p>
                        </div>
                        <Badge variant="secondary">{doc.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.htmlUrl} target="_blank" rel="noopener noreferrer">
                            View Document
                          </a>
                        </Button>
                        {doc.pdfUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer">
                              Download PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Activity tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PersonaProfilePage;
