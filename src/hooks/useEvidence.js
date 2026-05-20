import { useMemo, useState } from 'react';
import { ENV } from '../env';

export default function useEvidence({ selectedUserId, liveUser }) {
  const [evidences, setEvidences] = useState([]);

  const loadEvidences = async () => {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${ENV.API_URL}/evidence`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    const data = await res.json();

    setEvidences(Array.isArray(data) ? data : []);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!liveUser?.lat || !liveUser?.lng) {
      console.log('❌ no hay ubicación para evidencia');
      return;
    }

    const token = localStorage.getItem('accessToken');

    const formData = new FormData();

    formData.append('file', file);

    formData.append('lat', liveUser.lat);

    formData.append('lng', liveUser.lng);

    try {
      const res = await fetch(`${ENV.API_URL}/evidence/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      await loadEvidences();
    } catch (err) {
      console.log('❌ error subiendo imagen', err);
    }
  };

  const userEvidences = useMemo(() => {
    return (evidences || []).filter((e) => e.userId === selectedUserId);
  }, [evidences, selectedUserId]);

  const hasRecentEvidence = useMemo(() => {
    return userEvidences.some((e) => {
      const diff = Date.now() - new Date(e.createdAt).getTime();

      return diff < 1000 * 60 * 10;
    });
  }, [userEvidences]);

  const evidencesByZone = useMemo(() => {
    const grouped = {};

    userEvidences.forEach((e) => {
      const zoneId = e.zoneId || 'sin-zona';

      if (!grouped[zoneId]) {
        grouped[zoneId] = [];
      }

      grouped[zoneId].push(e);
    });

    return grouped;
  }, [userEvidences]);

  return {
    evidences,
    setEvidences,

    loadEvidences,

    handleUpload,

    userEvidences,

    hasRecentEvidence,

    evidencesByZone,
  };
}
