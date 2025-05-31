
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Coins, Clock, TrendingUp, MessageCircle, Star, FileText } from 'lucide-react';
import { subscribeToActivities } from '@/services/firestoreService';
import { getAllUsers } from '@/services/userService';
import { getAllIdeas } from '@/services/firestoreService';
import { User, Idea } from '@/types';

interface Activity {
  id: string;
  userId: string;
  ideaId: string;
  action: 'upvote' | 'comment' | 'detailed_feedback' | 'enhancement_accepted' | 'idea_submission';
  points: number;
  timestamp: string;
}

interface EnrichedActivity extends Activity {
  userName: string;
  ideaTitle: string;
  userInitials: string;
}

const ActivityFeed = ({ isAdminView = false }: { isAdminView?: boolean }) => {
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [ideas, setIdeas] = useState<Record<string, Idea>>({});

  useEffect(() => {
    // Load users and ideas data first
    const loadReferenceData = async () => {
      try {
        const [usersData, ideasData] = await Promise.all([
          getAllUsers(),
          getAllIdeas()
        ]);

        const usersMap = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, User>);

        const ideasMap = ideasData.reduce((acc, idea) => {
          acc[idea.id] = idea;
          return acc;
        }, {} as Record<string, Idea>);

        setUsers(usersMap);
        setIdeas(ideasMap);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };

    loadReferenceData();

    // Subscribe to real-time activities
    const unsubscribe = subscribeToActivities((activitiesData: Activity[]) => {
      const enrichedActivities = activitiesData.map(activity => {
        const user = users[activity.userId];
        const idea = ideas[activity.ideaId];
        
        return {
          ...activity,
          userName: user?.displayName || 'Unknown User',
          ideaTitle: idea?.title || idea?.headline || 'Unknown Idea',
          userInitials: user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
        };
      });

      setActivities(enrichedActivities);
      setLoading(false);
    }, isAdminView ? 50 : 20);

    return unsubscribe;
  }, [users, ideas, isAdminView]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upvote': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'detailed_feedback': return <Star className="w-4 h-4 text-purple-500" />;
      case 'enhancement_accepted': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'idea_submission': return <FileText className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'upvote': return 'upvoted';
      case 'comment': return 'commented on';
      case 'detailed_feedback': return 'provided detailed feedback on';
      case 'enhancement_accepted': return 'had enhancement accepted for';
      case 'idea_submission': return 'submitted';
      default: return 'interacted with';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upvote': return 'bg-green-100 text-green-800';
      case 'comment': return 'bg-blue-100 text-blue-800';
      case 'detailed_feedback': return 'bg-purple-100 text-purple-800';
      case 'enhancement_accepted': return 'bg-yellow-100 text-yellow-800';
      case 'idea_submission': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity feed...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>{isAdminView ? 'Platform Activity' : 'Recent Activity'}</span>
          <Badge variant="secondary">{activities.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activity yet. Start engaging with pain points!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{activity.userInitials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActionIcon(activity.action)}
                    <span className="font-medium text-sm">{activity.userName}</span>
                    <Badge className={`text-xs ${getActionColor(activity.action)}`}>
                      {getActionText(activity.action)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    "{activity.ideaTitle}"
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-green-600">+{activity.points}</span>
                      <Coins className="w-3 h-3 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
