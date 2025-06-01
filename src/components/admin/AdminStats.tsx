
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Zap, UserCheck } from 'lucide-react';
import { AdminStats as AdminStatsType } from '@/types';
import { PersonaProfile } from '@/types/persona';

interface AdminStatsProps {
  stats: AdminStatsType | null;
  personas: PersonaProfile[];
}

const AdminStats = ({ stats, personas }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

      <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Personas</p>
              <p className="text-3xl font-bold">{personas.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-indigo-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
