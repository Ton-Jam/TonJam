import { supabase } from './supabaseClient';

export async function uploadTrack({
  songFile,
  coverFile,
  title,
  artist,
}: {
  songFile: File;
  coverFile: File;
  title: string;
  artist: string;
}) {
  const timestamp = Date.now();

  // Upload song
  const songExt = songFile.name.split('.').pop();
  const songPath = `song-${timestamp}.${songExt}`;
  const { data: songData, error: songError } = await supabase.storage
    .from('songs')
    .upload(songPath, songFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (songError) throw new Error('Song upload failed: ' + songError.message);

  const songUrl = supabase.storage.from('songs').getPublicUrl(songPath).data.publicUrl;

  // Upload cover
  const coverExt = coverFile.name.split('.').pop();
  const coverPath = `cover-${timestamp}.${coverExt}`;
  const { data: coverData, error: coverError } = await supabase.storage
    .from('covers')
    .upload(coverPath, coverFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (coverError) throw new Error('Cover upload failed: ' + coverError.message);

  const coverUrl = supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl;

  // Insert to songs table
  const { error: insertError } = await supabase.from('songs').insert([
    {
      title,
      artist,
      song_url: songUrl,
      cover_url: coverUrl,
    },
  ]);

  if (insertError) throw new Error('Metadata insert failed: ' + insertError.message);

  return { songUrl, coverUrl };
}
