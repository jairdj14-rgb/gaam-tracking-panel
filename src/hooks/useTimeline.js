import { useState } from 'react';
import { ENV } from '../env';

export default function useTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const loadTimeline = async (userId) => {
    if (!userId) return;

    setLoadingTimeline(true);

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/tracking/timeline/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const merged = [
        ...(data.zoneEvents || []).map((e) => ({
          type: 'ZONE',
          timestamp: e.createdAt,
          data: e,
        })),

        ...(data.alerts || []).map((e) => ({
          type: 'ALERT',
          timestamp: e.createdAt,
          data: e,
        })),

        ...(data.evidences || []).map((e) => ({
          type: 'EVIDENCE',
          timestamp: e.createdAt,
          data: e,
        })),

        ...(data.locations || []).map((e) => ({
          type: 'LOCATION',
          timestamp: e.timestamp,
          data: e,
        })),
      ];

      merged.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setTimeline(merged);
    } catch (err) {
      console.log('❌ error timeline', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return {
    timeline,
    setTimeline,

    loadingTimeline,

    loadTimeline,
  };
}
