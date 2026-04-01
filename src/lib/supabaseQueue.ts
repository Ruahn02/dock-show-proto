/**
 * Global request queue to limit concurrent Supabase REST API calls.
 * Prevents 503 errors on free-tier by limiting concurrency to 2
 * with a 300ms delay between requests.
 */

const MAX_CONCURRENT = 2;
const DELAY_MS = 300;

let running = 0;
const queue: Array<{ fn: () => Promise<any>; resolve: (v: any) => void; reject: (e: any) => void; label: string }> = [];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processQueue() {
  while (queue.length > 0 && running < MAX_CONCURRENT) {
    const item = queue.shift();
    if (!item) break;
    running++;
    const start = performance.now();
    console.log(`[Queue] ▶ ${item.label} (running: ${running}, queued: ${queue.length})`);
    
    item.fn()
      .then(result => {
        const elapsed = Math.round(performance.now() - start);
        console.log(`[Queue] ✓ ${item.label} (${elapsed}ms)`);
        item.resolve(result);
      })
      .catch(err => {
        const elapsed = Math.round(performance.now() - start);
        console.log(`[Queue] ✗ ${item.label} (${elapsed}ms)`, err?.message || err);
        item.reject(err);
      })
      .finally(async () => {
        running--;
        await delay(DELAY_MS);
        processQueue();
      });
  }
}

export function enqueue<T>(fn: () => Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({ fn, resolve, reject, label });
    processQueue();
  });
}
