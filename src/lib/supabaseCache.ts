import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T = any> {
  data: T[];
  promise: Promise<{ data: T[]; error: any }> | null;
  timestamp: number;
  channel: ReturnType<typeof supabase.channel> | null;
  subscribers: number;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  refetchFn: (() => void) | null;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000;
const DEBOUNCE_MS = 2_000;

function getEntry<T>(key: string): CacheEntry<T> {
  if (!cache.has(key)) {
    cache.set(key, {
      data: [],
      promise: null,
      timestamp: 0,
      channel: null,
      subscribers: 0,
      debounceTimer: null,
      refetchFn: null,
    });
  }
  return cache.get(key)! as CacheEntry<T>;
}

export async function cachedFetch<T>(
  key: string,
  fetchFn: () => PromiseLike<{ data: T[] | null; error: any }>,
): Promise<{ data: T[]; error: any }> {
  const entry = getEntry<T>(key);
  const now = Date.now();

  // Fresh cache → return immediately
  if (entry.data.length > 0 && now - entry.timestamp < CACHE_TTL) {
    return { data: entry.data, error: null };
  }

  // Another fetch in progress → wait for it
  if (entry.promise) {
    return await entry.promise;
  }

  // Start fresh fetch
  entry.promise = (async () => {
    try {
      console.log(`[FETCH START] ${key}`);
      const { data, error } = await fetchFn();

      if (error) {
        console.error(`[FETCH ERROR] ${key}:`, error.message || error);
        // Return old data if available, but ALWAYS propagate error
        return { data: entry.data, error };
      }

      const rows = (data ?? []) as T[];
      entry.data = rows;
      entry.timestamp = Date.now();
      console.log(`[FETCH SUCCESS] ${key}:`, rows.length);
      return { data: rows, error: null };
    } catch (e: any) {
      console.error(`[FETCH ERROR] ${key} exception:`, e?.message || e);
      return { data: entry.data, error: { message: e?.message || String(e) } };
    } finally {
      entry.promise = null;
    }
  })();

  return await entry.promise;
}

export function invalidateCache(key: string) {
  const entry = cache.get(key);
  if (entry) {
    entry.timestamp = 0;
  }
}

export function subscribeRealtime(
  key: string,
  table: string,
  onRefetch: () => void,
): () => void {
  const entry = getEntry(key);
  entry.subscribers += 1;
  entry.refetchFn = onRefetch;

  if (!entry.channel) {
    entry.channel = supabase
      .channel(`shared-${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        if (entry.debounceTimer) clearTimeout(entry.debounceTimer);
        entry.debounceTimer = setTimeout(() => {
          entry.timestamp = 0;
          entry.refetchFn?.();
        }, DEBOUNCE_MS);
      })
      .subscribe();
  }

  return () => {
    entry.subscribers -= 1;
    if (entry.subscribers <= 0) {
      entry.subscribers = 0;
      if (entry.debounceTimer) clearTimeout(entry.debounceTimer);
      if (entry.channel) {
        supabase.removeChannel(entry.channel);
        entry.channel = null;
      }
    }
  };
}
