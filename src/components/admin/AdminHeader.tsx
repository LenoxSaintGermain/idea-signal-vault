
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, RotateCcw, AlertTriangle } from 'lucide-react';
import { Idea } from '@/types';

interface AdminHeaderProps {
  ideas: Idea[];
  onSeedData: () => void;
  onRefresh: () => void;
}

const AdminHeader = ({ ideas, onSeedData, onRefresh }: AdminHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex space-x-2">
          {ideas.length === 0 && (
            <Button onClick={onSeedData} className="bg-green-600 hover:bg-green-700 text-white">
              <Database className="w-4 h-4 mr-2" />
              Seed Quality Data
            </Button>
          )}
          <Button onClick={onRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
    </div>
  );
};

export default AdminHeader;
