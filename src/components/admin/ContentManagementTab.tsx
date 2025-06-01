
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Star, Trash2 } from 'lucide-react';
import { Idea } from '@/types';

interface ContentManagementTabProps {
  ideas: Idea[];
  onEditIdea: (idea: Idea) => void;
  onToggleFeatured: (ideaId: string, title: string, isFeatured: boolean) => void;
  onDeleteIdea: (ideaId: string, title: string) => void;
}

const ContentManagementTab = ({ 
  ideas, 
  onEditIdea, 
  onToggleFeatured, 
  onDeleteIdea 
}: ContentManagementTabProps) => {
  const painPoints = ideas.filter(idea => idea.isPainPoint);
  const regularIdeas = ideas.filter(idea => !idea.isPainPoint);

  const renderIdeaList = (ideaList: Idea[], bgColor: string) => (
    <div className="space-y-3">
      {ideaList.slice(0, 8).map((idea) => (
        <div key={idea.id} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
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
              onClick={() => onEditIdea(idea)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1 h-6"
              onClick={() => onToggleFeatured(idea.id, idea.headline || idea.title, !!idea.isFeatured)}
            >
              <Star className={`w-3 h-3 ${idea.isFeatured ? 'text-yellow-500' : ''}`} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1 h-6 text-red-600"
              onClick={() => onDeleteIdea(idea.id, idea.headline || idea.title)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
      {ideaList.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No items yet. Click "Seed Quality Data" to add some.
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pain Points ({painPoints.length})
            <Badge className="bg-red-600">Live Content</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderIdeaList(painPoints, 'bg-red-50')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regular Ideas ({regularIdeas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {renderIdeaList(regularIdeas, 'bg-blue-50')}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagementTab;
