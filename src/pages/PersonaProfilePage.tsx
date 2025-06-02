import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, FileText, Calendar, ExternalLink } from 'lucide-react';
import { PersonaProfile, ConceptDoc } from '@/types/persona';
import { getPersonaById } from '@/services/supabasePersonaService';
import { getConceptDocsByPersona } from '@/services/supabaseConceptDocService';
import PersonaReviewFeed from '@/components/PersonaReviewFeed';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';

const PersonaProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PersonaProfile | null>(null);
  const [catalogDocs, setCatalogDocs] = useState<ConceptDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review');

  useEffect(() => {
    if (id) {
      loadPersonaData(id);
    }
  }, [id]);

  const loadPersonaData = async (personaId: string) => {
    try {
      const personaData = await getPersonaById(personaId);
      if (!personaData) {
        toast({
          title: "Persona not found",
          description: "The requested persona could not be found",
          variant: "destructive"
        });
        return;
      }

      setPersona(personaData);

      // Load catalog documents
      const catalogDocuments = await Promise.all(
        personaData.conceptDocCatalog.map(docId => getConceptDocsByPersona(docId))
      );
      setCatalogDocs(catalogDocuments.filter(doc => doc !== null) as ConceptDoc[]);
    } catch (error) {
      console.error('Error loading persona data:', error);
      toast({
        title: "Error loading persona",
        description: "Could not load persona data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComplete = () => {
    if (id) {
      loadPersonaData(id);
    }
    setActiveTab('catalog');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading persona profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Persona Not Found</h3>
              <p className="text-gray-600">The requested persona could not be found.</p>
              <Button className="mt-4" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Persona Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                  <User className="w-8 h-8 text-purple-600" />
                  {persona.name}
                </CardTitle>
                <p className="text-gray-600 mb-4">{persona.description}</p>
                <div className="flex flex-wrap gap-2">
                  {persona.tagsOfInterest.map(tag => (
                    <Badge key={tag} className="bg-purple-100 text-purple-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-bold">{persona.conceptDocReviewQueue.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Catalog Items</p>
                  <p className="text-3xl font-bold">{persona.conceptDocCatalog.length}</p>
                </div>
                <Heart className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Ideas Influenced</p>
                  <p className="text-3xl font-bold">{persona.ideaCatalog.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review" className="relative">
              Review Queue
              {persona.conceptDocReviewQueue.length > 0 && (
                <Badge className="ml-2 bg-red-600 text-white text-xs">
                  {persona.conceptDocReviewQueue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="catalog">
              My Catalog ({catalogDocs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <PersonaReviewFeed 
              persona={persona} 
              onReviewComplete={handleReviewComplete}
            />
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Concept Catalog</h2>
              <p className="text-gray-600">Documents you've curated and kept</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogDocs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    {doc.subtitle && (
                      <p className="text-gray-600 text-sm">{doc.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">By {doc.author}</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(doc.htmlUrl, '_blank')}
                        >
                          View HTML
                        </Button>
                        {doc.pdfUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.pdfUrl!, '_blank')}
                          >
                            PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {catalogDocs.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                  <p className="text-gray-600">Review and keep concept documents to build your catalog.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PersonaProfilePage;
