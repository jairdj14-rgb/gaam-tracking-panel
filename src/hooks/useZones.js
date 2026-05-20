import { useState } from 'react';
import toast from 'react-hot-toast';
import { ENV } from '../env';

export default function useZones() {
  const [zones, setZones] = useState([]);

  const [selectedZone, setSelectedZone] = useState(null);

  const [originalZone, setOriginalZone] = useState(null);

  const [isEditingZone, setIsEditingZone] = useState(false);

  const [isAdjustingZone, setIsAdjustingZone] = useState(false);

  const [creatingZone, setCreatingZone] = useState(false);

  const [tempZone, setTempZone] = useState(null);

  const [flyToZone, setFlyToZone] = useState(null);

  const loadZones = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/zones`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error('Error cargando zonas');
      }

      const zonesArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];

      setZones(
        zonesArray.map((z) => ({
          id: z.id,
          lat: z.centerLat,
          lng: z.centerLng,
          radius: z.radius,
          name: z.name,
          users: z.users || [],
        })),
      );
    } catch (err) {
      console.log('❌ error cargando zonas', err);
    }
  };

  const createZone = async (tempZone, searchCleanup) => {
    if (!tempZone) return;

    try {
      toast.loading('Creando zona...');

      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tempZone.name || 'Nueva zona',
          centerLat: tempZone.lat,
          centerLng: tempZone.lng,
          radius: tempZone.radius,
        }),
      });

      if (!res.ok) {
        throw new Error('Error creando zona');
      }

      await loadZones();

      toast.dismiss();

      toast.success('Zona creada');

      setCreatingZone(false);

      setTempZone(null);

      if (searchCleanup) {
        searchCleanup();
      }
    } catch (err) {
      toast.dismiss();

      toast.error('Error creando zona');

      console.log('❌ error creando zona', err);
    }
  };

  return {
    zones,
    setZones,

    selectedZone,
    setSelectedZone,

    originalZone,
    setOriginalZone,

    isEditingZone,
    setIsEditingZone,

    isAdjustingZone,
    setIsAdjustingZone,

    creatingZone,
    setCreatingZone,

    tempZone,
    setTempZone,

    flyToZone,
    setFlyToZone,

    loadZones,
    createZone,
  };
}
