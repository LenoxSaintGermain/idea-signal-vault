
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import IdeaCard from './IdeaCard';
import PainPointCard from './PainPointCard';
import PainPointFormatter from './PainPointFormatter';
import ActivityFeed from './ActivityFeed';
import { Coins, TrendingUp, Lightbulb, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import ROISimulator from './ROISimulator';
import { Idea } from '@/types';
import { subscribeToIdeas } from '@/services/firestoreService';
import { seedMockData } from '@/services/migrationService';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import AdminPanel from './AdminPanel';
import { isAdmin } from '@/services/userService';

const Dashboard = () => {
  const { user, firebaseUser } = useAuth();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isROIOpen, setIsROIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pain-points');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToIdeas((newIdeas) => {
      setIdeas(newIdeas);
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseUser]);

  const handleOpenROI = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsROIOpen(true);
  };

  const handlePainPointAdded = () => {
    setActiveTab('pain-points');
  };

  const handleSeedData = async () => {
    if (!firebaseUser) return;
    
    try {
      const success = await seedMockData(firebaseUser.uid);
      if (success) {
        toast({
          title: "Data seeded successfully!",
          description: "Mock pain points have been added to your Firestore database",
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

        {/* Seed Data Button - Development Helper */}
        {ideas.length === 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
              <p className="text-blue-700 mb-4">No ideas yet? Seed some sample pain points to explore the platform.</p>
              <Button onClick={handleSeedData} className="bg-blue-600 hover:bg-blue-700">
                Seed Sample Data
              </Button>
            </CardContent>
          </Card>
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
