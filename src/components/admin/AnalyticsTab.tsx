
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStats } from '@/types';

interface AnalyticsTabProps {
  stats: AdminStats | null;
}

const AnalyticsTab = ({ stats }: AnalyticsTabProps) => {
  return (
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
  );
};

export default AnalyticsTab;
