import { io } from 'socket.io-client';
import { ENV } from './env';

const SOCKET_URL = ENV.API_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,

  transports: ['websocket', 'polling'],

  reconnection: true,

  reconnectionAttempts: Infinity,

  reconnectionDelay: 2000,

  timeout: 10000,

  withCredentials: true,
});

export const connectSocket = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) return;

  socket.auth = { token };
  socket.connect();
};
