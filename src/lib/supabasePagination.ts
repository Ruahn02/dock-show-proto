import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { enqueue } from './supabaseQueue';

type TableOrView = keyof Database['public']['Tables'] | keyof Database['public']['Views'];

interface OrderConfig {
  column: string;
  ascending?: boolean;
}

const DEBUG = false;

// Deduplication: in-flight requests by key
const inFlight = new Map<string, Promise<{ data: any[]; error: any }>>();


function makeKey(table: string, select: string, orderBy: OrderConfig[]): string {
  return `${table}|${select}|${JSON.stringify(orderBy)}`;
}

function isTransientError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('upstream connect error') ||
    msg.includes('connection timeout') ||
    msg.includes('networkerror') ||
    msg.includes('failed to fetch') ||
    (msg.includes('fetch') && msg.includes('error'))
  );
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches all rows from a Supabase table using paginated requests.
 * Includes retry with exponential backoff + jitter for transient errors.
 * Deduplicates concurrent identical requests.
 */
export async function fetchAllRows<T = any>(
  table: TableOrView,
  select: string = '*',
  orderBy: OrderConfig[] = [],
): Promise<{ data: T[]; error: any }> {
  const key = makeKey(table, select, orderBy);

  // Deduplicate: if same request is in-flight, return that promise
  const existing = inFlight.get(key);
  if (existing) {
    if (DEBUG) console.log(`[fetchAllRows] dedup hit: ${table}`);
    return existing as Promise<{ data: T[]; error: any }>;
  }

  const promise = enqueue(() => fetchAllRowsInternal<T>(table, select, orderBy, key), String(table));
  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

async function fetchAllRowsInternal<T>(
  table: TableOrView,
  select: string,
  orderBy: OrderConfig[],
  _key: string,
): Promise<{ data: T[]; error: any }> {
  const PAGE_SIZE = 1000;
  const MAX_RETRIES = 3;
  const allRows: T[] = [];
  let from = 0;

  while (true) {
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        // Longer backoff: 3s base, up to 20s max, with 0-2s jitter
        const jitter = Math.random() * 2000;
        const backoff = Math.min(3000 * Math.pow(2, attempt - 1) + jitter, 20000);
        if (DEBUG) console.log(`[fetchAllRows] retry ${attempt}/${MAX_RETRIES} for ${table}, waiting ${Math.round(backoff)}ms`);
        await delay(backoff);
      }

      try {
        let query = (supabase.from as any)(table).select(select);
        for (const order of orderBy) {
          query = query.order(order.column, { ascending: order.ascending ?? true });
        }
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, error } = await query;

        if (error) {
          lastError = error;
          if (isTransientError(error) && attempt < MAX_RETRIES) {
            continue; // retry
          }
          console.error(`[fetchAllRows] ${table} error after ${attempt + 1} attempts:`, error.message || error);
          return { data: allRows, error: { ...error, _table: table, _attempts: attempt + 1 } };
        }

        // Success
        if (data) {
          allRows.push(...(data as T[]));
        }

        if (!data || data.length < PAGE_SIZE) {
          return { data: allRows, error: null };
        }

        from += PAGE_SIZE;
        lastError = null;
        break; // next page
      } catch (fetchError: any) {
        lastError = fetchError;
        if (isTransientError(fetchError) && attempt < MAX_RETRIES) {
          continue;
        }
        console.error(`[fetchAllRows] ${table} exception after ${attempt + 1} attempts:`, fetchError);
        return { data: allRows, error: { message: fetchError?.message || String(fetchError), _table: table, _attempts: attempt + 1 } };
      }
    }

    // If we exhausted retries on this page but got a transient error
    if (lastError) {
      return { data: allRows, error: { ...lastError, _table: table, _attempts: MAX_RETRIES + 1 } };
    }
  }
}
