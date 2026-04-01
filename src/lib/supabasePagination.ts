import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableOrView = keyof Database['public']['Tables'] | keyof Database['public']['Views'];

interface OrderConfig {
  column: string;
  ascending?: boolean;
}

/**
 * Fetches all rows from a Supabase table using paginated requests.
 * Direct calls, no queue, no retry, no dedup.
 */
export async function fetchAllRows<T = any>(
  table: TableOrView,
  select: string = '*',
  orderBy: OrderConfig[] = [],
): Promise<{ data: T[]; error: any }> {
  const PAGE_SIZE = 1000;
  const allRows: T[] = [];
  let from = 0;

  while (true) {
    try {
      let query = (supabase.from as any)(table).select(select);
      for (const order of orderBy) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, error } = await query;

      if (error) {
        console.error(`[fetchAllRows] ${table} error:`, error.message || error);
        return { data: allRows, error };
      }

      if (data) {
        allRows.push(...(data as T[]));
      }

      if (!data || data.length < PAGE_SIZE) {
        return { data: allRows, error: null };
      }

      from += PAGE_SIZE;
    } catch (fetchError: any) {
      console.error(`[fetchAllRows] ${table} exception:`, fetchError?.message || fetchError);
      return { data: allRows, error: { message: fetchError?.message || String(fetchError) } };
    }
  }
}
