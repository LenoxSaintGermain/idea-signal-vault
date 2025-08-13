
import { supabase } from '@/integrations/supabase/client';
import { Idea, Contribution } from '@/types';

const ADMIN_EMAIL = 'lenox.paris@outlook.com';

export const createIdea = async (idea: Omit<Idea, 'id' | 'createdAt'>, userId: string) => {
  const ideaData = {
    title: idea.title,
    summary: idea.summary,
    tags: idea.tags,
    valuation_estimate: idea.valuationEstimate,
    author_id: userId,
    vote_count: 0,
    comment_count: 0,
    total_points: 0,
    is_featured: false,
    headline: idea.headline || null,
    subheadline: idea.subheadline || null,
    pain_point: idea.painPoint || null,
    solution: idea.solution || null,
    is_pain_point: idea.isPainPoint || false,
    cta: idea.cta || null,
    target_personas: idea.targetPersonas || null
  };
  
  const { data, error } = await supabase
    .from('ideas')
    .insert([ideaData])
    .select()
    .single();

  if (error) throw error;

  // Log the idea creation activity
  await logUserActivity(userId, data.id, 'idea_submission', 5);
  
  return data.id;
};

export const getAllIdeas = async (): Promise<Idea[]> => {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    tags: row.tags,
    valuationEstimate: row.valuation_estimate,
    voteCount: row.vote_count,
    commentCount: row.comment_count,
    createdAt: row.created_at.split('T')[0],
    authorId: row.author_id,
    totalPoints: row.total_points,
    isFeatured: row.is_featured,
    headline: row.headline,
    subheadline: row.subheadline,
    painPoint: row.pain_point,
    solution: row.solution,
    isPainPoint: row.is_pain_point,
    cta: row.cta,
    targetPersonas: row.target_personas
  }));
};

export const updateIdea = async (ideaId: string, updates: Partial<Idea>) => {
  const updateData: any = {};
  
  if (updates.title) updateData.title = updates.title;
  if (updates.summary) updateData.summary = updates.summary;
  if (updates.tags) updateData.tags = updates.tags;
  if (updates.valuationEstimate !== undefined) updateData.valuation_estimate = updates.valuationEstimate;
  if (updates.voteCount !== undefined) updateData.vote_count = updates.voteCount;
  if (updates.commentCount !== undefined) updateData.comment_count = updates.commentCount;
  if (updates.totalPoints !== undefined) updateData.total_points = updates.totalPoints;
  if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
  if (updates.headline !== undefined) updateData.headline = updates.headline;
  if (updates.subheadline !== undefined) updateData.subheadline = updates.subheadline;
  if (updates.painPoint !== undefined) updateData.pain_point = updates.painPoint;
  if (updates.solution !== undefined) updateData.solution = updates.solution;
  if (updates.isPainPoint !== undefined) updateData.is_pain_point = updates.isPainPoint;
  if (updates.cta !== undefined) updateData.cta = updates.cta;
  if (updates.targetPersonas !== undefined) updateData.target_personas = updates.targetPersonas;

  const { error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', ideaId);

  if (error) throw error;
};

export const deleteIdea = async (ideaId: string) => {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', ideaId);

  if (error) throw error;
};

export const toggleIdeaFeatured = async (ideaId: string, featured: boolean) => {
  const { error } = await supabase
    .from('ideas')
    .update({ is_featured: featured })
    .eq('id', ideaId);

  if (error) throw error;
};

export const upvoteIdea = async (ideaId: string, userId: string) => {
  // Get current vote count
  const { data: idea, error: fetchError } = await supabase
    .from('ideas')
    .select('vote_count, total_points')
    .eq('id', ideaId)
    .single();

  if (fetchError) throw fetchError;

  // Update vote count and total points
  const { error } = await supabase
    .from('ideas')
    .update({ 
      vote_count: idea.vote_count + 1,
      total_points: idea.total_points + 2
    })
    .eq('id', ideaId);

  if (error) throw error;

  // Log the upvote activity
  await logUserActivity(userId, ideaId, 'upvote', 2);
};

export const commentOnIdea = async (ideaId: string, userId: string, comment: string) => {
  // Add comment to comments table
  const { error: commentError } = await supabase
    .from('comments')
    .insert([{
      idea_id: ideaId,
      user_id: userId,
      comment: comment
    }]);

  if (commentError) throw commentError;

  // Get current comment count
  const { data: idea, error: fetchError } = await supabase
    .from('ideas')
    .select('comment_count')
    .eq('id', ideaId)
    .single();

  if (fetchError) throw fetchError;

  // Update comment count
  const { error } = await supabase
    .from('ideas')
    .update({ comment_count: idea.comment_count + 1 })
    .eq('id', ideaId);

  if (error) throw error;

  // Log the comment activity
  await logUserActivity(userId, ideaId, 'comment', 3);
};

export const submitDetailedFeedback = async (ideaId: string, userId: string, feedback: string) => {
  const { error } = await supabase
    .from('detailed_feedback')
    .insert([{
      idea_id: ideaId,
      user_id: userId,
      feedback: feedback
    }]);

  if (error) throw error;

  // Log the detailed feedback activity
  await logUserActivity(userId, ideaId, 'detailed_feedback', 5);
};

export const logUserActivity = async (
  userId: string, 
  ideaId: string, 
  action: 'upvote' | 'comment' | 'detailed_feedback' | 'enhancement_accepted' | 'idea_submission',
  points: number
) => {
  const { error } = await supabase
    .from('user_activities')
    .insert([{
      user_id: userId,
      idea_id: ideaId,
      action: action,
      points: points
    }]);

  if (error) throw error;
};

export const getUserActivities = async (userId: string): Promise<Contribution[]> => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    ideaId: row.idea_id,
    action: row.action as any,
    points: row.points,
    timestamp: row.timestamp
  }));
};

export const getAllActivities = async (limitCount: number = 100) => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limitCount);

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    ideaId: row.idea_id,
    action: row.action,
    points: row.points,
    timestamp: row.timestamp
  }));
};

export const getAllActivitiesForUser = async (userId: string, limitCount: number = 100) => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limitCount);

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    ideaId: row.idea_id,
    action: row.action,
    points: row.points,
    timestamp: row.timestamp
  }));
};

export const subscribeToActivities = (
  callback: (activities: any[]) => void, 
  limitCount: number = 20,
  userId?: string
) => {
  const subscription = supabase
    .channel('user_activities_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'user_activities' },
      async () => {
        const activities = userId 
          ? await getAllActivitiesForUser(userId, limitCount)
          : await getAllActivities(limitCount);
        callback(activities);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToIdeas = (callback: (ideas: Idea[]) => void) => {
  const subscription = supabase
    .channel('ideas_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'ideas' },
      async () => {
        const ideas = await getAllIdeas();
        callback(ideas);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
