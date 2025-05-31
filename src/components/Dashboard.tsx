
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { mockIdeas } from '@/data/mockData';
import IdeaCard from './IdeaCard';
import PainPointCard from './PainPointCard';
import PainPointFormatter from './PainPointFormatter';
import { Coins, TrendingUp, Lightbulb, Award } from 'lucide-react';
import { useState } from 'react';
import ROISimulator from './ROISimulator';
import { Idea } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isROIOpen, setIsROIOpen] = useState(false);

  const handleOpenROI = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsROIOpen(true);
  };

  const painPoints = mockIdeas.filter(idea => idea.isPainPoint);
  const regularIdeas = mockIdeas.filter(idea => !idea.isPainPoint);

  // Mock recent activities
  const recentActivities = [
    { action: 'Upvoted', idea: 'School pickup traffic orchestration', points: 2, time: '2 hours ago' },
    { action: 'Commented on', idea: 'Contractor marketplace verification', points: 2, time: '1 day ago' },
    { action: 'Detailed feedback', idea: 'Healthcare appointment tracking', points: 5, time: '2 days ago' },
    { action: 'Enhancement accepted', idea: 'Local business micro-investing', points: 10, time: '3 days ago' }
  ];

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
                  <p className="text-3xl font-bold">{user?.signalPoints.toLocaleString()}</p>
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
                  <p className="text-3xl font-bold">${user?.estimatedTake.toLocaleString()}</p>
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
                  <p className="text-3xl font-bold">{user?.ideasInfluenced}</p>
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

        <Tabs defaultValue="pain-points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
            <TabsTrigger value="explore">Ideas</TabsTrigger>
            <TabsTrigger value="formatter">AI Formatter</TabsTrigger>
            <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
            </div>
          </TabsContent>

          <TabsContent value="formatter" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">AI Pain Point Formatter</h2>
              <p className="text-gray-600">Transform raw ideas into viral pain points</p>
            </div>
            
            <PainPointFormatter />
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
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.action} <span className="text-red-600">"{activity.idea}"</span>
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-semibold">+{activity.points}</span>
                        <Coins className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
