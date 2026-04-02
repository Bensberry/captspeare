import { supabase } from './supabase';

export async function logRequest(data: {
  user_name: string;
  platform: string;
  input_text: string;
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
    }
  } catch (err) {
    console.error('[Logger] Failed to log request:', err);
  }
}
