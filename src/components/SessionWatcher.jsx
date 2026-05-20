import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ENV } from '../env';

export default function SessionWatcher({ onLogout }) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      try {
        const decoded = jwtDecode(token);

        const exp = decoded.exp * 1000;

        const remaining = Math.floor((exp - Date.now()) / 1000);

        setSecondsLeft(remaining);

        //  mostrar warning faltando 5 min
        if (remaining === 300) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');

            const refreshRes = await fetch(`${ENV.API_URL}/auth/refresh`, {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
              },

              body: JSON.stringify({
                refreshToken,
              }),
            });

            const refreshData = await refreshRes.json();

            if (!refreshRes.ok) {
              throw new Error('No se pudo renovar');
            }

            localStorage.setItem('accessToken', refreshData.accessToken);

            localStorage.setItem('refreshToken', refreshData.refreshToken);

            setShowWarning(false);
          } catch (err) {
            console.log('❌ refresh falló');

            setShowWarning(true);
          }
        }

        //  logout automático
        if (remaining <= 0) {
          localStorage.removeItem('accessToken');

          onLogout();
        }
      } catch (err) {
        console.log(err);

        localStorage.removeItem('accessToken');

        onLogout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div
        className="
        w-[420px]
        rounded-3xl

        bg-[#071226]/95
        border border-white/10

        shadow-2xl
        overflow-hidden
      "
      >
        {/* HEADER */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="
              w-12 h-12 rounded-2xl
              bg-yellow-500/20
              flex items-center justify-center
              text-2xl
            "
            >
              ⚠️
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Sesión por expirar
              </h2>

              <p className="text-sm text-gray-400">
                Tu sesión finalizará pronto por seguridad
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div
            className="
            bg-black/20
            border border-white/10
            rounded-2xl
            p-5
            text-center
          "
          >
            <div className="text-sm text-gray-400 mb-2">Tiempo restante</div>

            <div className="text-5xl font-bold text-yellow-400">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4 text-center">
            Guarda tus cambios para evitar pérdida de información
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={async () => {
              try {
                const refreshToken = localStorage.getItem('refreshToken');

                const res = await fetch(`${ENV.API_URL}/auth/refresh`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },

                  body: JSON.stringify({
                    refreshToken,
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  throw new Error('No se pudo renovar');
                }

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                setShowWarning(false);
              } catch (err) {
                console.log(err);

                localStorage.removeItem('accessToken');

                onLogout();
              }
            }}
            className="
    flex-1
    bg-cyan-500
    hover:bg-cyan-400
    text-black
    font-semibold
    rounded-xl
    p-3
    transition
  "
          >
            Extender sesión
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('accessToken');

              onLogout();
            }}
            className="
            flex-1
            bg-gray-700
            hover:bg-gray-600
            rounded-xl
            p-3
            transition
          "
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
