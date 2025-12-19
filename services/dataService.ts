
import { FeedbackEntry } from '../types';

// Unique topic for the event to ensure no overlap with others
const SYNC_TOPIC = 'gurukul_mela_sync_2025_26_v1';
const BASE_URL = 'https://ntfy.sh';
const STORAGE_KEY = 'gurukul_feedback_data_2025';

export const broadcast = new BroadcastChannel('gurukul_local_sync_2025');

export const saveFeedback = async (entry: FeedbackEntry) => {
  // 1. Local device storage
  const existing = getFeedback();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, entry]));

  // 2. Tab-to-tab sync (same device)
  broadcast.postMessage({ type: 'NEW_FEEDBACK', entry });

  // 3. Global Sync (Cross-device)
  try {
    // We use a simplified POST to avoid pre-flight issues in some browsers
    await fetch(`${BASE_URL}/${SYNC_TOPIC}`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error("Cloud sync failed. The app will continue working locally.", err);
  }
};

export const getFeedback = (): FeedbackEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export type SyncStatus = 'active' | 'offline' | 'error';

/**
 * Hybrid Subscriber: Uses EventSource for real-time speed, 
 * with a Polling fallback for restricted environments.
 */
export const subscribeToGlobalFeedback = (
  onNewFeedback: (entry: FeedbackEntry) => void,
  onStatusChange: (status: SyncStatus) => void
) => {
  let eventSource: EventSource | null = null;
  let pollingInterval: any = null;
  let lastReceivedTime = Date.now() / 1000;

  const connectSSE = () => {
    if (eventSource) eventSource.close();
    
    // ntfy.sh sse endpoint
    eventSource = new EventSource(`${BASE_URL}/${SYNC_TOPIC}/sse`);

    eventSource.onopen = () => onStatusChange('active');
    
    eventSource.addEventListener('message', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.message) {
          const entry: FeedbackEntry = JSON.parse(payload.message);
          if (entry && entry.id) {
            onNewFeedback(entry);
            lastReceivedTime = payload.time;
          }
        }
      } catch (err) { /* silent */ }
    });

    eventSource.onerror = () => {
      onStatusChange('offline');
      console.warn("Real-time stream unavailable, switching to polling...");
      startPolling();
    };
  };

  const startPolling = () => {
    if (pollingInterval) return;
    onStatusChange('active'); // Polling is active
    
    pollingInterval = setInterval(async () => {
      try {
        // Poll for new messages since the last one we saw
        const response = await fetch(`${BASE_URL}/${SYNC_TOPIC}/json?since=${lastReceivedTime}`);
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        lines.forEach(line => {
          try {
            const payload = JSON.parse(line);
            if (payload.message) {
              const entry: FeedbackEntry = JSON.parse(payload.message);
              onNewFeedback(entry);
              lastReceivedTime = payload.time;
            }
          } catch (e) { /* silent */ }
        });
      } catch (err) {
        onStatusChange('offline');
      }
    }, 5000); // Poll every 5 seconds
  };

  connectSSE();

  return () => {
    if (eventSource) eventSource.close();
    if (pollingInterval) clearInterval(pollingInterval);
  };
};
