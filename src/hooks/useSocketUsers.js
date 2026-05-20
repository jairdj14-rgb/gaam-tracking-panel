import { useEffect, useState } from 'react';
import { socket, connectSocket } from '../socket';
import { jwtDecode } from 'jwt-decode';
import { useIncidentsStore } from '../store/incidentsStore';

export default function useSocketUsers({ isLogged }) {
  const [users, setUsers] = useState({});

  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!isLogged) return;

    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const decoded = jwtDecode(token);

    setRole(decoded.role?.toUpperCase());

    connectSocket();

    socket.on('connect', () => {
      console.log('🟢 SOCKET CONECTADO');

      socket.emit('join_company', {
        companyId: decoded.companyId,
      });
    });

    if (socket.connected) {
      socket.emit('join_company', {
        companyId: decoded.companyId,
      });
    }

    socket.on('users_snapshot', (data) => {
      const normalized = {};

      (data || []).forEach((user) => {
        normalized[user.userId] = user;
      });

      setUsers(normalized);
    });

    socket.on('location_update_v2', (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          ...data,
          isOnline: true,
          status: data.status || 'ACTIVE',
        },
      }));
    });

    socket.on('user_offline', ({ userId }) => {
      setUsers((prev) => {
        if (!prev[userId]) return prev;

        return {
          ...prev,
          [userId]: {
            ...prev[userId],

            isOnline: false,

            status: 'OFFLINE',
          },
        };
      });
    });

    socket.on('user_online', (data) => {});

    socket.on('user_status', ({ userId, status }) => {
      setUsers((prev) => {
        if (!prev[userId]) return prev;

        return {
          ...prev,

          [userId]: {
            ...prev[userId],

            status,

            isOnline: status !== 'OFFLINE',
          },
        };
      });
    });

    socket.on('alert_created', (alert) => {
      window.dispatchEvent(
        new CustomEvent('timeline_event', {
          detail: alert,
        }),
      );
    });

    socket.on('incident_created', (incident) => {
      useIncidentsStore.getState().addIncident(incident);
    });

    socket.onAny((event, ...args) => {});

    return () => {
      socket.off('users_snapshot');

      socket.off('location_update_v2');

      socket.off('user_online');

      socket.off('user_offline');

      socket.off('user_status');

      socket.off('alert_created');

      socket.off('incident_created');
    };
  }, [isLogged]);

  return {
    users,
    setUsers,

    role,
  };
}
