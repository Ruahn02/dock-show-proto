/**
 * Retry wrapper for Supabase write operations (insert/update/delete).
 * Retries transient errors (503, network timeout) with exponential backoff + jitter.
 */

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
 * Wraps an async Supabase operation with retry logic.
 * The operation function must return the Supabase query builder (thenable).
 * Usage:
 *   const { data, error } = await withRetry(() =>
 *     supabase.from('table').insert({...}).select().single()
 *   );
 */
export async function withRetry<T = any>(
  operation: () => PromiseLike<{ data: T; error: any }>,
  maxRetries: number = 3,
): Promise<{ data: T; error: any }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const jitter = Math.random() * 500;
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1) + jitter, 10000);
      await delay(backoff);
    }

    try {
      const result = await operation();
      
      if (result.error && isTransientError(result.error) && attempt < maxRetries) {
        continue;
      }
      
      return result;
    } catch (err: any) {
      if (isTransientError(err) && attempt < maxRetries) {
        continue;
      }
      return { data: null as any, error: err };
    }
  }
  
  return { data: null as any, error: { message: 'Max retries exceeded' } };
}

/**
 * Returns a user-friendly error message for network/transient errors.
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido';
  const msg = String(error.message || error || '').toLowerCase();
  if (msg.includes('503') || msg.includes('upstream') || msg.includes('timeout') || msg.includes('networkerror') || msg.includes('failed to fetch')) {
    return 'Erro de conexão com o servidor. Tente novamente em alguns segundos.';
  }
  return error.message || 'Erro ao processar operação';
}
