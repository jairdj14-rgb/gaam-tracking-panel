import { useState } from 'react';
import { ENV } from '../env';

export default function useCompany() {
  const [companyUsers, setCompanyUsers] = useState([]);

  const loadCompanyUsers = async () => {
    const token = localStorage.getItem('accessToken');

    try {
      const res = await fetch(`${ENV.API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        console.log('🚫 No autorizado');

        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error('Unauthorized');
      }

      setCompanyUsers(data);
    } catch (err) {
      console.log('❌ error cargando users', err);
    }
  };

  return {
    companyUsers,

    loadCompanyUsers,
  };
}
