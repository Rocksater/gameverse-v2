import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useRealtimeComments = (postId, onNewComment) => {
  useEffect(() => {
    if (!postId) return;

    // Subscribe to database change events for the specific post
    const channel = supabase
      .channel(`realtime-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Fetch author profile details for the newly inserted comment
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const fullComment = {
            ...payload.new,
            profiles: profile || { username: 'Gamer' },
          };

          if (onNewComment) {
            onNewComment(fullComment);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, onNewComment]);
};