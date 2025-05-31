
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Zap, TrendingUp, Trash2, Edit, Star, RotateCcw, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { User, AdminStats, Idea } from '@/types';
import { getAllUsers, getAdminStats } from '@/services/userService';
import { getAllIdeas, deleteIdea, toggleIdeaFeatured } from '@/services/firestoreService';
import { seedMockData } from '@/services/migrationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import EditIdeaDialog from './EditIdeaDialog';

const AdminPanel = () => {
  const { firebaseUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [adminStats, allUsers, allIdeas] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllIdeas()
      ]);
      
      setStats(adminStats);
      setUsers(allUsers);
      setIdeas(allIdeas);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error loading admin data",
        description: "Could not fetch admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!firebaseUser) return;
    
    try {
      setLoading(true);
      const success = await seedMockData(firebaseUser.uid);
      if (success) {
        toast({
          title: "Data seeded successfully!",
          description: "5 high-quality pain points have been added to the database",
        });
        await loadAdminData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Seeding failed",
        description: "Could not seed the mock data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteIdea(ideaId);
      toast({
        title: "Idea deleted",
        description: "The idea has been removed from the database",
      });
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the idea",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (ideaId: string, title: string, isFeatured: boolean) => {
    try {
      await toggleIdeaFeatured(ideaId, !isFeatured);
      toast({
        title: isFeatured ? "Idea unfeatured" : "Idea featured",
        description: `"${title}" has been ${isFeatured ? 'removed from' : 'added to'} featured content`,
      });
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update the idea",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const painPoints = ideas.filter(idea => idea.isPainPoint);
  const regularIdeas = ideas.filter(idea => !idea.isPainPoint);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex space-x-2">
          {ideas.length === 0 && (
            <Button onClick={handleSeedData} className="bg-green-600 hover:bg-green-700 text-white">
              <Database className="w-4 h-4 mr-2" />
              Seed Quality Data
            </Button>
          )}
          <Button onClick={loadAdminData} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {ideas.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Ready to populate with quality data?</h3>
                <p className="text-green-700">Seed the database with 5 compelling pain points to start testing the platform.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pain Points</p>
                <p className="text-3xl font-bold">{stats?.totalPainPoints || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Ideas</p>
                <p className="text-3xl font-bold">{stats?.totalIdeas || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Signal Points</p>
                <p className="text-3xl font-bold">{stats?.totalSignalPoints.toLocaleString() || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Signal Points</TableHead>
                    <TableHead>Ideas Influenced</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.signalPoints.toLocaleString()}</TableCell>
                      <TableCell>{user.ideasInfluenced}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-red-600">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pain Points ({painPoints.length})
                  <Badge className="bg-red-600">Live Content</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {painPoints.slice(0, 8).map((idea) => (
                    <div key={idea.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{idea.headline || idea.title}</h4>
                        <p className="text-xs text-gray-500">{idea.voteCount} votes • {idea.totalPoints} pts</p>
                        {idea.isFeatured && <Badge className="mt-1 bg-yellow-500 text-xs">Featured</Badge>}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6"
                          onClick={() => setEditingIdea(idea)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6"
                          onClick={() => handleToggleFeatured(idea.id, idea.headline || idea.title, !!idea.isFeatured)}
                        >
                          <Star className={`w-3 h-3 ${idea.isFeatured ? 'text-yellow-500' : ''}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6 text-red-600"
                          onClick={() => handleDeleteIdea(idea.id, idea.headline || idea.title)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {painPoints.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No pain points yet. Click "Seed Quality Data" to add some.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regular Ideas ({regularIdeas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regularIdeas.slice(0, 8).map((idea) => (
                    <div key={idea.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{idea.title}</h4>
                        <p className="text-xs text-gray-500">{idea.voteCount} votes • {idea.totalPoints} pts</p>
                        {idea.isFeatured && <Badge className="mt-1 bg-yellow-500 text-xs">Featured</Badge>}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6"
                          onClick={() => setEditingIdea(idea)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6"
                          onClick={() => handleToggleFeatured(idea.id, idea.title, !!idea.isFeatured)}
                        >
                          <Star className={`w-3 h-3 ${idea.isFeatured ? 'text-yellow-500' : ''}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="p-1 h-6 text-red-600"
                          onClick={() => handleDeleteIdea(idea.id, idea.title)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats?.totalIdeas || 0}</p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{stats?.totalSignalPoints.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600">Signal Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditIdeaDialog 
        idea={editingIdea}
        isOpen={!!editingIdea}
        onClose={() => setEditingIdea(null)}
        onSave={loadAdminData}
      />
    </div>
  );
};

export default AdminPanel;
