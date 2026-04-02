import { supabase } from './supabase';

export async function logRequest(data: {
  user_name: string;
  platform: string;
  input_text: string;
  output_text: string;
}) {
  try {
    const { error } = await supabase
      .from('user_requests')
      .insert([
        {
          ...data,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('[Logger] Supabase error:', error.message);
      return;
    }

    // Rolling log: Keep only the most recent 100 entries
    // We do this by deleting anything older than the 100th record
    const { data: limitRecord } = await supabase
      .from('user_requests')
      .select('created_at')
      .order('created_at', { ascending: false })
      .range(99, 99)
      .single();

    if (limitRecord) {
      await supabase
        .from('user_requests')
        .delete()
        .lt('created_at', limitRecord.created_at);
    }
  } catch (err) {
    console.error('[Logger] Failed to log request:', err);
  }
}
