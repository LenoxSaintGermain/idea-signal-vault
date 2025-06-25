import { supabase } from '@/integrations/supabase/client';
import { User, AdminStats, AdminActivity } from '@/types';
import { getAllActivities } from './supabaseService';

const ADMIN_EMAIL = 'lenox.paris@outlook.com';

export const createUserProfile = async (userId: string, email: string, displayName: string) => {
  const userData = {
    id: userId,
    email,
    display_name: displayName,
    signal_points: 0,
    ideas_influenced: 0,
    estimated_take: 0,
    is_admin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    signalPoints: data.signal_points,
    ideasInfluenced: data.ideas_influenced,
    estimatedTake: data.estimated_take,
    isAdmin: data.is_admin,
    joinedAt: new Date(data.joined_at),
    lastActive: new Date(data.last_active)
  };
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    signalPoints: data.signal_points,
    ideasInfluenced: data.ideas_influenced,
    estimatedTake: data.estimated_take,
    isAdmin: data.is_admin,
    joinedAt: new Date(data.joined_at),
    lastActive: new Date(data.last_active)
  };
};

export const updateUserStats = async (userId: string, points: number) => {
  // Get current user data
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('signal_points, estimated_take')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  // Update with new values
  const { error } = await supabase
    .from('users')
    .update({
      signal_points: user.signal_points + points,
      estimated_take: user.estimated_take + (points * 8),
      last_active: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

export const getUserContributions = async (userId: string) => {
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
    action: row.action,
    points: row.points,
    timestamp: row.timestamp
  }));
};

export const subscribeToUserProfile = (userId: string, callback: (user: User | null) => void) => {
  const subscription = supabase
    .channel(`user_${userId}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
      async () => {
        const user = await getUserProfile(userId);
        callback(user);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('joined_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    signalPoints: row.signal_points,
    ideasInfluenced: row.ideas_influenced,
    estimatedTake: row.estimated_take,
    isAdmin: row.is_admin,
    joinedAt: new Date(row.joined_at),
    lastActive: new Date(row.last_active)
  }));
};

export const getAdminStats = async (): Promise<AdminStats> => {
  // Get user count
  const { count: totalUsers, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (usersError) throw usersError;

  // Get ideas count and pain points
  const { data: ideas, error: ideasError } = await supabase
    .from('ideas')
    .select('is_pain_point');

  if (ideasError) throw ideasError;

  const totalIdeas = ideas.length;
  const totalPainPoints = ideas.filter(idea => idea.is_pain_point).length;

  // Get total signal points
  const { data: signalData, error: signalError } = await supabase
    .from('users')
    .select('signal_points');

  if (signalError) throw signalError;

  const totalSignalPoints = signalData.reduce((total, user) => total + user.signal_points, 0);

  // Get recent activity with user and idea details
  const { data: activities, error: activitiesError } = await supabase
    .from('user_activities')
    .select(`
      *,
      users(display_name),
      ideas(title, headline)
    `)
    .order('timestamp', { ascending: false })
    .limit(10);

  if (activitiesError) throw activitiesError;

  const recentActivity: AdminActivity[] = activities.map((activity, index) => ({
    id: activity.id || `activity-${index}`,
    userId: activity.user_id,
    userName: (activity.users as any)?.display_name || 'Unknown User',
    action: getActionDescription(activity.action),
    target: (activity.ideas as any)?.title || (activity.ideas as any)?.headline || 'Unknown Idea',
    timestamp: new Date(activity.timestamp),
    points: activity.points
  }));

  return {
    totalUsers: totalUsers || 0,
    totalIdeas,
    totalPainPoints,
    totalSignalPoints,
    recentActivity
  };
};

const getActionDescription = (action: string): string => {
  switch (action) {
    case 'upvote': return 'Upvoted';
    case 'comment': return 'Commented on';
    case 'detailed_feedback': return 'Provided detailed feedback on';
    case 'enhancement_accepted': return 'Enhancement accepted for';
    case 'idea_submission': return 'Submitted';
    default: return 'Interacted with';
  }
};

export const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  const userProfile = await getUserProfile(user.id);
  return userProfile?.isAdmin || false;
};

export const upgradeUserToAdmin = async (userId: string, currentAdminId: string) => {
  // Verify current user is admin
  const currentUser = await getUserProfile(currentAdminId);
  if (!currentUser?.isAdmin) {
    throw new Error('Insufficient permissions to grant admin role');
  }

  const { error } = await supabase
    .from('users')
    .update({ is_admin: true })
    .eq('id', userId);

  if (error) throw error;

  // Log admin action
  await supabase
    .from('admin_logs')
    .insert([{
      admin_user_id: currentAdminId,
      action: 'grant_admin',
      details: { targetUserId: userId }
    }]);
};

export const revokeAdminRole = async (userId: string, currentAdminId: string) => {
  // Verify current user is admin
  const currentUser = await getUserProfile(currentAdminId);
  if (!currentUser?.isAdmin) {
    throw new Error('Insufficient permissions to revoke admin role');
  }

  // Prevent self-revocation
  if (userId === currentAdminId) {
    throw new Error('Cannot revoke your own admin role');
  }

  const { error } = await supabase
    .from('users')
    .update({ is_admin: false })
    .eq('id', userId);

  if (error) throw error;

  // Log admin action
  await supabase
    .from('admin_logs')
    .insert([{
      admin_user_id: currentAdminId,
      action: 'revoke_admin',
      details: { targetUserId: userId }
    }]);
};
