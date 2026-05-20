import { useEffect, useState } from 'react';
import { ENV } from '../env';

export default function useMaps({ setTempZone, setFlyToZone }) {
  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const searchLocation = async () => {
      try {
        if (!debouncedSearch || debouncedSearch.length < 3) {
          setSearchResults([]);
          return;
        }

        const res = await fetch(
          `${ENV.API_URL}/maps/search?q=${encodeURIComponent(debouncedSearch)}`,
        );

        const data = await res.json();

        setSearchResults(data || []);
      } catch (err) {
        console.log('❌ error buscando ubicación', err);
      }
    };

    searchLocation();
  }, [debouncedSearch]);

  const selectPlace = async (placeId, description) => {
    try {
      const res = await fetch(
        `${ENV.API_URL}/maps/place-details?placeId=${placeId}`,
      );

      const data = await res.json();

      if (!data?.geometry?.location) return;

      const lat = data.geometry.location.lat;
      const lng = data.geometry.location.lng;

      setTempZone({
        lat,
        lng,
        radius: 100,
        name: description,
      });

      setFlyToZone({
        lat,
        lng,
      });

      setSearchResults([]);
    } catch (err) {
      console.log('❌ place details error', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return {
    search,
    setSearch,

    searchResults,
    setSearchResults,

    selectPlace,
  };
}
