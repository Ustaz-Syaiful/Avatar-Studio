import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedAvatarRecord, SupabaseConfig } from '../types';
import { saveLocalAvatar, getLocalAvatars, deleteLocalAvatar } from './storageDb';

const SUPABASE_CONFIG_KEY = 'avatarku_supabase_config';
const DEFAULT_TABLE_NAME = 'avatar_creations';

// SQL script template ready for copy-pasting
export const SUPABASE_SQL_SCHEMA = `-- Skrip Penyediaan Pangkalan Data Supabase untuk AvatarKu Studio
-- Buka Supabase Dashboard > SQL Editor > New Query > Tampal & Klik Run

CREATE TABLE IF NOT EXISTS public.avatar_creations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT DEFAULT '',
  avatar_id TEXT NOT NULL,
  avatar_name TEXT NOT NULL,
  avatar_category TEXT NOT NULL,
  slogan_text TEXT DEFAULT '',
  image_data TEXT NOT NULL,
  frame_type TEXT DEFAULT 'gold'
);

-- Mengaktifkan Kawalan Akses (Row Level Security)
ALTER TABLE public.avatar_creations ENABLE ROW LEVEL SECURITY;

-- Benarkan pembacaan awam (pelajar/guru boleh melihat semua avatar yang disimpan)
DROP POLICY IF EXISTS "Public can view avatars" ON public.avatar_creations;
CREATE POLICY "Public can view avatars" 
  ON public.avatar_creations 
  FOR SELECT 
  USING (true);

-- Benarkan sesiapa sahaja menyimpan avatar (Insert awam tanpa login wajib)
DROP POLICY IF EXISTS "Public can insert avatars" ON public.avatar_creations;
CREATE POLICY "Public can insert avatars" 
  ON public.avatar_creations 
  FOR INSERT 
  WITH CHECK (true);

-- Benarkan padam (pilihan)
DROP POLICY IF EXISTS "Public can delete avatars" ON public.avatar_creations;
CREATE POLICY "Public can delete avatars" 
  ON public.avatar_creations 
  FOR DELETE 
  USING (true);
`;

let clientInstance: SupabaseClient | null = null;
let currentConfigCache: SupabaseConfig | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  if (currentConfigCache) return currentConfigCache;

  // 1. Try localStorage
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        currentConfigCache = {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          tableName: parsed.tableName || DEFAULT_TABLE_NAME,
          isConnected: Boolean(parsed.isConnected),
        };
        return currentConfigCache;
      }
    }
  } catch {
    // Ignore error
  }

  // 2. Try Vite Environment Variables
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  currentConfigCache = {
    url: envUrl.trim(),
    anonKey: envKey.trim(),
    tableName: DEFAULT_TABLE_NAME,
    isConnected: Boolean(envUrl && envKey),
  };

  return currentConfigCache;
}

export function saveSupabaseConfig(url: string, anonKey: string, tableName = DEFAULT_TABLE_NAME): void {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  const cleanTable = tableName.trim() || DEFAULT_TABLE_NAME;

  currentConfigCache = {
    url: cleanUrl,
    anonKey: cleanKey,
    tableName: cleanTable,
    isConnected: Boolean(cleanUrl && cleanKey),
  };

  clientInstance = null; // Reset client

  try {
    localStorage.setItem(
      SUPABASE_CONFIG_KEY,
      JSON.stringify(currentConfigCache)
    );
  } catch (err) {
    console.error('Failed to save config to localStorage', err);
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    return clientInstance;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string, tableName?: string): Promise<{ success: boolean; message: string; rowCount?: number }> {
  const targetUrl = (url !== undefined ? url : getSupabaseConfig().url).trim().replace(/\/+$/, '');
  const targetKey = (anonKey !== undefined ? anonKey : getSupabaseConfig().anonKey).trim();
  const targetTable = (tableName || getSupabaseConfig().tableName || DEFAULT_TABLE_NAME).trim();

  if (!targetUrl) {
    return { success: false, message: 'Sila masukkan URL Supabase (cth: https://xyz.supabase.co)' };
  }
  if (!targetKey) {
    return { success: false, message: 'Sila masukkan Anon/Public Key Supabase' };
  }

  try {
    const testClient = createClient(targetUrl, targetKey, {
      auth: { persistSession: false },
    });

    // Test a lightweight select from the target table
    const { count, error } = await testClient
      .from(targetTable)
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: `Jadual "${targetTable}" belum wujud di Supabase. Sila salin & jalankan skrip SQL yang disediakan dalam tab Panduan SQL.`,
        };
      }
      return {
        success: false,
        message: `Ralat sambungan (${error.code || 'API'}): ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Berjaya disambungkan ke Supabase! Jadual "${targetTable}" sedia digunakan.`,
      rowCount: count ?? 0,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Tidak dapat menyambung ke pelayan Supabase: ${msg}`,
    };
  }
}

export async function saveAvatar(record: Omit<SavedAvatarRecord, 'sync_status'>): Promise<{ success: boolean; record: SavedAvatarRecord; source: 'supabase' | 'local'; message: string }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  // Always save locally first so user never loses their creation
  let fullRecord: SavedAvatarRecord = {
    ...record,
    sync_status: client ? 'syncing' : 'local_only',
  };

  await saveLocalAvatar(fullRecord);

  // If Supabase is connected, write to Supabase table
  if (client && config.url && config.anonKey) {
    try {
      const { error } = await client
        .from(config.tableName || DEFAULT_TABLE_NAME)
        .insert({
          id: record.id,
          created_at: record.created_at,
          student_name: record.student_name,
          class_name: record.class_name || '',
          avatar_id: record.avatar_id,
          avatar_name: record.avatar_name,
          avatar_category: record.avatar_category,
          slogan_text: record.slogan_text || '',
          image_data: record.image_data,
          frame_type: record.frame_type || 'gold',
        });

      if (error) {
        console.warn('Supabase insert failed, keeping as local_only:', error.message);
        fullRecord = { ...fullRecord, sync_status: 'local_only' };
        await saveLocalAvatar(fullRecord);
        return {
          success: true,
          record: fullRecord,
          source: 'local',
          message: `Disimpan setempat (Ralat awan: ${error.message})`,
        };
      }

      // Updated to synced
      fullRecord = { ...fullRecord, sync_status: 'synced' };
      await saveLocalAvatar(fullRecord);

      return {
        success: true,
        record: fullRecord,
        source: 'supabase',
        message: 'Berjaya disimpan ke pangkalan data awan Supabase & peranti!',
      };
    } catch (e: unknown) {
      console.warn('Exception while saving to Supabase:', e);
      fullRecord = { ...fullRecord, sync_status: 'local_only' };
      await saveLocalAvatar(fullRecord);
      return {
        success: true,
        record: fullRecord,
        source: 'local',
        message: 'Disimpan secara setempat di peranti (Offline).',
      };
    }
  }

  return {
    success: true,
    record: fullRecord,
    source: 'local',
    message: 'Berjaya disimpan ke simpanan setempat (Mod Luar Talian). Sambungkan Supabase untuk simpanan awan kelas.',
  };
}

export async function fetchAllAvatars(): Promise<{ records: SavedAvatarRecord[]; isOnline: boolean }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  const localItems = await getLocalAvatars();

  if (!client || !config.url || !config.anonKey) {
    return { records: localItems, isOnline: false };
  }

  try {
    const { data, error } = await client
      .from(config.tableName || DEFAULT_TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      console.warn('Supabase fetch error, fallback to local:', error?.message);
      return { records: localItems, isOnline: false };
    }

    // Merge Supabase records with any purely local records not yet uploaded
    const localMap = new Map(localItems.map((r) => [r.id, r]));
    const merged: SavedAvatarRecord[] = [];

    for (const row of data) {
      merged.push({
        id: row.id,
        created_at: row.created_at,
        student_name: row.student_name,
        class_name: row.class_name,
        avatar_id: row.avatar_id,
        avatar_name: row.avatar_name,
        avatar_category: row.avatar_category,
        slogan_text: row.slogan_text,
        image_data: row.image_data,
        frame_type: row.frame_type,
        sync_status: 'synced',
      });
      localMap.delete(row.id);
    }

    // Add remaining local-only items to the top
    for (const remaining of localMap.values()) {
      merged.unshift({
        ...remaining,
        sync_status: 'local_only',
      });
    }

    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { records: merged, isOnline: true };
  } catch (err) {
    console.warn('Network error reading Supabase:', err);
    return { records: localItems, isOnline: false };
  }
}

export async function deleteAvatar(id: string): Promise<boolean> {
  await deleteLocalAvatar(id);

  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (client && config.url && config.anonKey) {
    try {
      await client
        .from(config.tableName || DEFAULT_TABLE_NAME)
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to delete on Supabase:', err);
    }
  }

  return true;
}

export async function syncLocalRecordsToSupabase(): Promise<{ syncedCount: number; errors: number }> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();
  if (!client || !config.url || !config.anonKey) {
    return { syncedCount: 0, errors: 0 };
  }

  const localItems = await getLocalAvatars();
  const toSync = localItems.filter((i) => i.sync_status !== 'synced');

  let syncedCount = 0;
  let errors = 0;

  for (const item of toSync) {
    try {
      const { error } = await client
        .from(config.tableName || DEFAULT_TABLE_NAME)
        .upsert({
          id: item.id,
          created_at: item.created_at,
          student_name: item.student_name,
          class_name: item.class_name || '',
          avatar_id: item.avatar_id,
          avatar_name: item.avatar_name,
          avatar_category: item.avatar_category,
          slogan_text: item.slogan_text || '',
          image_data: item.image_data,
          frame_type: item.frame_type || 'gold',
        });

      if (!error) {
        await saveLocalAvatar({ ...item, sync_status: 'synced' });
        syncedCount++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { syncedCount, errors };
}
