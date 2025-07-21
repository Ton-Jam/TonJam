// File: src/screens/JamSpaceScreen.tsx import React, { useContext, useEffect, useState } from 'react'; import './JamSpaceScreen.css'; import { supabase } from '../supabaseClient'; import { AuthContext } from '../context/AuthContext';

interface Post { id: string; content: string; created_at: string; user_id: string; username: string; }

const JamSpaceScreen: React.FC = () => { const { user } = useContext(AuthContext); const [content, setContent] = useState(''); const [posts, setPosts] = useState<Post[]>([]);

useEffect(() => { fetchPosts(); }, []);

const fetchPosts = async () => { const { data, error } = await supabase .from('posts') .select('*') .order('created_at', { ascending: false });

if (!error && data) setPosts(data as Post[]);

};

const createPost = async () => { if (!content.trim()) return; const { error } = await supabase.from('posts').insert({ content, user_id: user.id, username: user.username || 'Anonymous', });

if (!error) {
  setContent('');
  fetchPosts();
}

};

return ( <div className="jamspace-container"> <h2>TonJam Space 🛰️</h2> <div className="create-post"> <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's jammin'?" /> <button onClick={createPost}>Post</button> </div> <div className="posts"> {posts.map((post) => ( <div className="post" key={post.id}> <div className="post-header"> <span className="post-username">@{post.username}</span> <span className="post-date">{new Date(post.created_at).toLocaleString()}</span> </div> <p className="post-content">{post.content}</p> </div> ))} </div> </div> ); };

export default JamSpaceScreen;

