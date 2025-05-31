
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, Plus, X } from 'lucide-react';
import { Idea } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PainPointCardProps {
  idea: Idea;
  onOpenROI: (idea: Idea) => void;
}

const PainPointCard = ({ idea, onOpenROI }: PainPointCardProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(idea.voteCount);

  const handleUpvote = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on pain points",
        variant: "destructive"
      });
      return;
    }

    setIsUpvoted(!isUpvoted);
    setVoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
    
    toast({
      title: isUpvoted ? "Vote removed" : "Upvoted!",
      description: isUpvoted ? "Your vote has been removed" : "+2 Signal Points earned for pain point engagement",
    });
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const formatValuation = (value: number) => {
    return value >= 1000000 
      ? `$${(value / 1000000).toFixed(1)}M`
      : `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-red-50 hover:from-red-50 hover:to-orange-50 cursor-pointer">
      <CardHeader className="space-y-3" onClick={handleExpandToggle}>
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-900 transition-colors line-clamp-3 flex-1">
            {idea.headline}
          </h3>
          <div className="ml-3 flex items-center space-x-2">
            <div className="text-green-600 font-semibold text-sm flex items-center">
              <span>{formatValuation(idea.valuationEstimate!)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
            >
              {isExpanded ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm font-medium">
          {idea.subheadline}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {idea.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-red-100 text-red-700 hover:bg-red-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 animate-fade-in">
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">The Problem:</h4>
            <p className="text-gray-700 text-sm mb-4">
              {idea.painPoint}
            </p>
            
            <h4 className="font-semibold text-gray-900 mb-2">The Solution:</h4>
            <p className="text-gray-700 text-sm mb-4">
              {idea.solution}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <ArrowUp className="w-4 h-4" />
                <span>{voteCount}</span>
              </span>
              <span>{idea.commentCount} comments</span>
            </div>
            <div className="text-red-600 font-medium">
              {idea.totalPoints} pts
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleUpvote();
              }}
              variant={isUpvoted ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${isUpvoted ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
            >
              <ArrowUp className="w-4 h-4 mr-1" />
              {isUpvoted ? 'Upvoted' : 'This Hurts'}
            </Button>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onOpenROI(idea);
              }}
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
            >
              {idea.cta || 'Learn More'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PainPointCard;
