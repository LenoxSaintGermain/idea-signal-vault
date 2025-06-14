import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useSupabaseAuth';
import IdeaCard from './IdeaCard';
import PainPointCard from './PainPointCard';
import PainPointFormatter from './PainPointFormatter';
import ActivityFeed from './ActivityFeed';
import { Coins, TrendingUp, Lightbulb, Award, Users, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import ROISimulator from './ROISimulator';
import { Idea } from '@/types';
import { PersonaProfile } from '@/types/persona';
import { subscribeToIdeas } from '@/services/supabaseService';
import { getAllPersonas } from '@/services/supabasePersonaService';
import { supabaseMigrationService } from '@/services/supabaseMigrationService';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import AdminPanel from './AdminPanel';
import { isAdmin } from '@/services/supabaseUserService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, supabaseUser } = useAuth();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isROIOpen, setIsROIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pain-points');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseUser) return;

    const unsubscribe = subscribeToIdeas((newIdeas) => {
      setIdeas(newIdeas);
      setLoading(false);
    });

    loadPersonas();

    return unsubscribe;
  }, [supabaseUser]);

  const loadPersonas = async () => {
    try {
      const allPersonas = await getAllPersonas();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const handleOpenROI = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsROIOpen(true);
  };

  const handlePainPointAdded = () => {
    setActiveTab('pain-points');
  };

  const handleSeedData = async () => {
    if (!supabaseUser) return;
    
    try {
      const result = await supabaseMigrationService.seedMockIdeas(supabaseUser.id);
      if (result.success) {
        toast({
          title: "Data seeded successfully!",
          description: "Mock pain points have been added to your Supabase database",
        });
      }
    } catch (error) {
      toast({
        title: "Seeding failed",
        description: "Could not seed the mock data",
        variant: "destructive"
      });
    }
  };

  const handleSeedPersonas = async () => {
    try {
      const result = await supabaseMigrationService.seedSamplePersonas();
      if (result.success) {
        toast({
          title: "Sample personas created!",
          description: "Sample personas have been added to test the concept doc routing",
        });
        await loadPersonas();
      }
    } catch (error) {
      toast({
        title: "Persona seeding failed",
        description: "Could not create sample personas",
        variant: "destructive"
      });
    }
  };

  const painPoints = ideas.filter(idea => idea.isPainPoint);
  const regularIdeas = ideas.filter(idea => !idea.isPainPoint);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your Signal Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Signal Points</p>
                  <p className="text-3xl font-bold">{user?.signalPoints.toLocaleString() || 0}</p>
                </div>
                <Coins className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Est. Take</p>
                  <p className="text-3xl font-bold">${user?.estimatedTake.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Ideas Influenced</p>
                  <p className="text-3xl font-bold">{user?.ideasInfluenced || 0}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Rank</p>
                  <p className="text-3xl font-bold">#47</p>
                </div>
                <Award className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personas Quick Access */}
        {personas.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Active Personas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {personas.slice(0, 5).map(persona => (
                  <Link key={persona.id} to={`/persona/${persona.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{persona.name}</h4>
                        <p className="text-xs text-gray-600">
                          {persona.conceptDocReviewQueue.length} pending
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Cards */}
        {(ideas.length === 0 || personas.length === 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {ideas.length === 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started with Ideas</h3>
                  <p className="text-blue-700 mb-4">No ideas yet? Seed some sample pain points to explore the platform.</p>
                  <Button onClick={handleSeedData} className="bg-blue-600 hover:bg-blue-700">
                    Seed Sample Ideas
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {personas.length === 0 && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Create Sample Personas</h3>
                  <p className="text-purple-700 mb-4">Set up personas to test concept doc routing and review workflows.</p>
                  <Button onClick={handleSeedPersonas} className="bg-purple-600 hover:bg-purple-700">
                    Create Sample Personas
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin(user) ? 'grid-cols-6' : 'grid-cols-5'} lg:w-auto`}>
            <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
            <TabsTrigger value="explore">Ideas</TabsTrigger>
            <TabsTrigger value="formatter">AI Formatter</TabsTrigger>
            <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {isAdmin(user) && (
              <TabsTrigger value="admin" className="bg-red-50 text-red-700 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="pain-points" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Problems Worth Solving</h2>
              <p className="text-gray-600">Discover pain points that stop the scroll</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {painPoints.map((idea) => (
                <PainPointCard key={idea.id} idea={idea} onOpenROI={handleOpenROI} />
              ))}
              {painPoints.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">No pain points yet. Use the AI Formatter to create some!</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Traditional Ideas</h2>
              <p className="text-gray-600">Standard idea format and evaluation</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onOpenROI={handleOpenROI} />
              ))}
              {regularIdeas.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">No traditional ideas yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="formatter" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">AI Pain Point Formatter</h2>
              <p className="text-gray-600">Transform raw ideas into viral pain points</p>
            </div>
            
            <PainPointFormatter onPainPointAdded={handlePainPointAdded} />
          </TabsContent>

          <TabsContent value="my-contributions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Contributions</h2>
              <p className="text-gray-600">Pain points you've supported and influenced</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {painPoints.slice(0, 3).map((idea) => (
                <PainPointCard key={idea.id} idea={idea} onOpenROI={handleOpenROI} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600">Your Signal Point earning history</p>
            </div>
            
            <ActivityFeed />
          </TabsContent>

          {isAdmin(user) && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ROISimulator 
        idea={selectedIdea}
        isOpen={isROIOpen}
        onClose={() => setIsROIOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
