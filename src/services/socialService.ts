// import { db } from '@/lib/firebase';
// import { collection, addDoc, updateDoc, deleteDoc, doc, increment, serverTimestamp } from 'firebase/firestore';

import { supabase } from '@/lib/supabase';

export const createPost = async (authorId: string, authorName: string, authorPhoto: string | null, content: string) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { 
        user_id: authorId, 
        user_name: authorName, 
        user_avatar: authorPhoto, 
        content,
        timestamp: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
};

export const likePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('likes')
    .insert([{ post_id: postId, user_id: userId }]);

  if (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const addComment = async (postId: string, userId: string, userName: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ 
      post_id: postId, 
      user_id: userId, 
      user_name: userName, 
      content,
      timestamp: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
  return data;
};

export const followUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, following_id: followingId }]);

  if (error) {
    console.error('Error following user:', error);
    throw error;
  }
};
