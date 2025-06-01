
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { AdminStats } from '@/types';
import ActivityFeed from '@/components/ActivityFeed';

interface ActivityTabProps {
  stats: AdminStats | null;
}

const ActivityTab = ({ stats }: ActivityTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-Time Platform Activity</h3>
        <Badge className="bg-green-600">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>
      
      <ActivityFeed isAdminView={true} />

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {activity.userName} {activity.action.toLowerCase()} "{activity.target}"
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {activity.points && (
                    <Badge className="bg-green-100 text-green-800">
                      +{activity.points} pts
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityTab;
