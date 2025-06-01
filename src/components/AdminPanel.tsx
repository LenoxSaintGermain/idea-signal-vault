
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, AdminStats, Idea } from '@/types';
import { PersonaProfile, ConceptDoc } from '@/types/persona';
import { getAllUsers, getAdminStats } from '@/services/userService';
import { getAllIdeas, deleteIdea, toggleIdeaFeatured } from '@/services/firestoreService';
import { getAllPersonas, deletePersona } from '@/services/personaService';
import { getAllConceptDocs, deleteConceptDoc } from '@/services/conceptDocService';
import { seedMockData } from '@/services/migrationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import EditIdeaDialog from './EditIdeaDialog';
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import UserManagementTab from './admin/UserManagementTab';
import ContentManagementTab from './admin/ContentManagementTab';
import PersonasTab from './admin/PersonasTab';
import ConceptDocsTab from './admin/ConceptDocsTab';
import ActivityTab from './admin/ActivityTab';
import AnalyticsTab from './admin/AnalyticsTab';

const AdminPanel = () => {
  const { firebaseUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [conceptDocs, setConceptDocs] = useState<ConceptDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [adminStats, allUsers, allIdeas, allPersonas, allConceptDocs] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllIdeas(),
        getAllPersonas(),
        getAllConceptDocs()
      ]);
      
      setStats(adminStats);
      setUsers(allUsers);
      setIdeas(allIdeas);
      setPersonas(allPersonas);
      setConceptDocs(allConceptDocs);
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
        await loadAdminData();
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

  const handleDeletePersona = async (personaId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete persona "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePersona(personaId);
      toast({
        title: "Persona deleted",
        description: "The persona has been removed from the database",
      });
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the persona",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConceptDoc = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteConceptDoc(docId);
      toast({
        title: "Concept doc deleted",
        description: "The document has been removed from the database",
      });
      await loadAdminData();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the concept document",
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

  return (
    <div className="space-y-6">
      <AdminHeader 
        ideas={ideas}
        onSeedData={handleSeedData}
        onRefresh={loadAdminData}
      />

      <AdminStats stats={stats} personas={personas} />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="concept-docs">Concept Docs</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementTab users={users} />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagementTab 
            ideas={ideas}
            onEditIdea={setEditingIdea}
            onToggleFeatured={handleToggleFeatured}
            onDeleteIdea={handleDeleteIdea}
          />
        </TabsContent>

        <TabsContent value="personas">
          <PersonasTab 
            personas={personas}
            onDeletePersona={handleDeletePersona}
          />
        </TabsContent>

        <TabsContent value="concept-docs">
          <ConceptDocsTab 
            conceptDocs={conceptDocs}
            onDeleteConceptDoc={handleDeleteConceptDoc}
            onDocUploaded={loadAdminData}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab stats={stats} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab stats={stats} />
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
