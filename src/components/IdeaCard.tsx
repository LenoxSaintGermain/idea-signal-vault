import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, MessageCircle, Calculator, TrendingUp } from 'lucide-react';
import { Idea } from '@/types';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { upvoteIdea } from '@/services/supabaseService';
import { updateUserStats } from '@/services/supabaseUserService';

interface IdeaCardProps {
  idea: Idea;
  onOpenROI: (idea: Idea) => void;
}

const IdeaCard = ({ idea, onOpenROI }: IdeaCardProps) => {
  const { user, supabaseUser } = useAuth();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async () => {
    if (!user || !supabaseUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on ideas",
        variant: "destructive"
      });
      return;
    }

    if (isUpvoting) return;

    setIsUpvoting(true);
    try {
      await upvoteIdea(idea.id, supabaseUser.id);
      await updateUserStats(supabaseUser.id, 2);
      
      setIsUpvoted(!isUpvoted);
      
      toast({
        title: "Upvoted!",
        description: "+2 Signal Points earned",
      });
    } catch (error) {
      console.error('Error upvoting:', error);
      toast({
        title: "Failed to upvote",
        description: "Could not process your vote",
        variant: "destructive"
      });
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatValuation = (value: number) => {
    return value >= 1000000 
      ? `$${(value / 1000000).toFixed(1)}M`
      : `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-blue-50">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-900 transition-colors line-clamp-2">
            {idea.title}
          </h3>
          <div className="flex items-center space-x-1 text-green-600 font-semibold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{formatValuation(idea.valuationEstimate)}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {idea.summary}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {idea.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ArrowUp className="w-4 h-4" />
              <span>{idea.voteCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{idea.commentCount}</span>
            </span>
          </div>
          <div className="text-purple-600 font-medium">
            {idea.totalPoints} pts
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpvote}
            variant={isUpvoted ? "default" : "outline"}
            size="sm"
            disabled={isUpvoting}
            className={`flex-1 ${isUpvoted ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'}`}
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            {isUpvoting ? 'Voting...' : (isUpvoted ? 'Upvoted' : 'Upvote')}
          </Button>
          
          <Button
            onClick={() => onOpenROI(idea)}
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          >
            <Calculator className="w-4 h-4 mr-1" />
            ROI Sim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
