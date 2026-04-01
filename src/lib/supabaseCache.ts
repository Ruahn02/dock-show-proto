import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T = any> {
  data: T[];
  promise: Promise<T[]> | null;
  timestamp: number;
  channel: ReturnType<typeof supabase.channel> | null;
  subscribers: number;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  refetchFn: (() => void) | null;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30s
const DEBOUNCE_MS = 2_000; // 2s debounce on Realtime

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

/**
 * Fetch data from cache or Supabase. Deduplicates concurrent fetches.
 * If cache is fresh (< TTL), returns cached data immediately.
 */
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
    const data = await entry.promise;
    return { data, error: null };
  }

  // Start fresh fetch
  entry.promise = (async () => {
    try {
      const { data, error } = await fetchFn();
      if (error) {
        console.error(`[cachedFetch] ${key} error:`, error.message || error);
        // Keep old data on error
        return entry.data;
      }
      const rows = (data ?? []) as T[];
      entry.data = rows;
      entry.timestamp = Date.now();
      return rows;
    } catch (e: any) {
      console.error(`[cachedFetch] ${key} exception:`, e?.message || e);
      return entry.data;
    } finally {
      entry.promise = null;
    }
  })();

  const result = await entry.promise;
  return { data: result ?? entry.data, error: null };
}

/**
 * Force refresh cache for a key (used after mutations).
 */
export function invalidateCache(key: string) {
  const entry = cache.get(key);
  if (entry) {
    entry.timestamp = 0;
  }
}

/**
 * Subscribe to a shared Realtime channel for a table.
 * Only creates ONE channel per table regardless of how many hook instances call this.
 * Debounces the refetch callback by 2 seconds.
 */
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
        // Debounce: if 5 events arrive in 2s, only 1 refetch
        if (entry.debounceTimer) clearTimeout(entry.debounceTimer);
        entry.debounceTimer = setTimeout(() => {
          entry.timestamp = 0; // invalidate cache
          entry.refetchFn?.();
        }, DEBOUNCE_MS);
      })
      .subscribe();
  }

  // Cleanup function
  return () => {
    entry.subscribers -= 1;
    if (entry.subscribers <= 0) {
      entry.subscribers = 0;
      if (entry.debounceTimer) clearTimeout(entry.debounceTimer);
      if (entry.channel) {
        supabase.removeChannel(entry.channel);
        entry.channel = null;
      }
      // Keep data in cache for quick re-mount
    }
  };
}
