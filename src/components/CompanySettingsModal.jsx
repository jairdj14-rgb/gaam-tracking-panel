import { useEffect, useState } from 'react';
import { ENV } from '../env';

export default function CompanySettingsModal({ onClose }) {
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');

  const [maxSpeed, setMaxSpeed] = useState(120);
  const [maxIdleTime, setMaxIdleTime] = useState(30);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const loadSettings = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${ENV.API_URL}/company-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json) return;

      setWorkStart(json.workStart || '08:00');
      setWorkEnd(json.workEnd || '18:00');

      setMaxSpeed(json.maxSpeed || 120);
      setMaxIdleTime(json.maxIdleTime || 30);
    } catch (err) {
      console.log(err);
    }
  };

  const saveSettings = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      setLoading(true);

      setMessage(null);
      setError(null);

      // VALIDACIONES
      if (!workStart || !workEnd) {
        setError('Selecciona horario laboral');
        return;
      }

      if (Number(maxSpeed) <= 10) {
        setError('Velocidad inválida');
        return;
      }

      if (Number(maxIdleTime) <= 1) {
        setError('Tiempo inválido');
        return;
      }

      const res = await fetch(`${ENV.API_URL}/company-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workStart,
          workEnd,
          maxSpeed: Number(maxSpeed),
          maxIdleTime: Number(maxIdleTime),
        }),
      });

      if (!res.ok) {
        throw new Error('Error guardando configuración');
      }

      setMessage('✅ Configuración guardada');

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.log(err);

      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="
        w-full max-w-[720px]

        max-h-[90vh]

        overflow-hidden

        rounded-[32px]

        border border-white/10

        bg-[#06111f]/95
        backdrop-blur-2xl

        shadow-[0_20px_80px_rgba(0,0,0,0.55)]

        text-white

        flex flex-col
      "
      >
        {/* HEADER */}
        <div
          className="
          flex items-start justify-between

          px-7 py-6

          border-b border-white/5
        "
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
              Enterprise Settings
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Company Control Center
            </h2>

            <p className="text-sm text-white/40 mt-2">
              Configuración operativa y comportamiento del sistema
            </p>
          </div>

          <button
            onClick={onClose}
            className="
            w-11 h-11

            rounded-2xl

            bg-white/[0.04]
            hover:bg-white/[0.08]

            border border-white/10

            text-white/60
            hover:text-white

            transition-all duration-200
          "
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div
          className="
    flex-1 overflow-y-auto

    px-7 py-6

    space-y-5
  "
        >
          {message && (
            <div
              className="
      mx-7

      rounded-2xl

      border border-emerald-400/20

      bg-emerald-400/[0.08]

      px-4 py-3

      text-sm text-emerald-300
    "
            >
              {message}
            </div>
          )}

          {error && (
            <div
              className="
      mx-7

      rounded-2xl

      border border-red-400/20

      bg-red-400/[0.08]

      px-4 py-3

      text-sm text-red-300
    "
            >
              ⚠️ {error}
            </div>
          )}
          {/* HORARIO */}
          <div
            className="
  rounded-3xl

  border border-white/10

  bg-white/[0.03]

  p-5

  backdrop-blur-xl

  transition-all duration-300

  hover:border-cyan-400/15
  hover:bg-white/[0.05]
"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
      w-11 h-11

      rounded-2xl

      bg-cyan-400/10

      border border-cyan-400/15

      flex items-center justify-center

      text-cyan-300
    "
              >
                🕒
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Horario laboral
                </div>

                <div className="text-xs text-white/35 mt-1">
                  Definición de jornada laboral
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-2">
                  Hora inicio
                </div>

                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="
  w-full h-12 px-4

  rounded-2xl

  bg-white/[0.04]

  border border-white/10

  text-white

  outline-none

  focus:border-cyan-400/30
  focus:bg-cyan-400/[0.03]

  transition-all
"
                />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/35 mb-2">
                  Hora fin
                </div>

                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="
  w-full h-12 px-4

  rounded-2xl

  bg-white/[0.04]

  border border-white/10

  text-white

  outline-none

  focus:border-cyan-400/30
  focus:bg-cyan-400/[0.03]

  transition-all
"
                />
              </div>
            </div>
          </div>

          {/* VELOCIDAD */}
          <div
            className="
  rounded-3xl

  border border-white/10

  bg-white/[0.03]

  p-5

  backdrop-blur-xl

  transition-all duration-300

  hover:border-cyan-400/15
  hover:bg-white/[0.05]
"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
      w-11 h-11

      rounded-2xl

      bg-cyan-400/10

      border border-cyan-400/15

      flex items-center justify-center

      text-cyan-300
    "
              >
                🚗
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Velocidad máxima
                </div>

                <div className="text-xs text-white/35 mt-1">
                  Límites de velocidad permitidos
                </div>
              </div>
            </div>

            <input
              type="number"
              value={maxSpeed}
              onChange={(e) => setMaxSpeed(e.target.value)}
              className="
  w-full h-12 px-4

  rounded-2xl

  bg-white/[0.04]

  border border-white/10

  text-white

  outline-none

  focus:border-cyan-400/30
  focus:bg-cyan-400/[0.03]

  transition-all
"
            />

            <div className="text-xs text-gray-500 mt-2">
              km/h permitidos antes de generar alerta
            </div>
          </div>

          {/* INACTIVIDAD */}
          <div
            className="
  rounded-3xl

  border border-white/10

  bg-white/[0.03]

  p-5

  backdrop-blur-xl

  transition-all duration-300

  hover:border-cyan-400/15
  hover:bg-white/[0.05]
"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="
      w-11 h-11

      rounded-2xl

      bg-cyan-400/10

      border border-cyan-400/15

      flex items-center justify-center

      text-cyan-300
    "
              >
                ⚠️
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Tiempo máximo en zona
                </div>

                <div className="text-xs text-white/35 mt-1">
                  Detección de tiempos inactivos
                </div>
              </div>
            </div>

            <input
              type="number"
              value={maxIdleTime}
              onChange={(e) => setMaxIdleTime(e.target.value)}
              className="
  w-full h-12 px-4

  rounded-2xl

  bg-white/[0.04]

  border border-white/10

  text-white

  outline-none

  focus:border-cyan-400/30
  focus:bg-cyan-400/[0.03]

  transition-all
"
            />

            <div className="text-xs text-gray-500 mt-2">
              minutos antes de marcar inactividad
            </div>
          </div>
        </div>
        {/* FOOTER */}
        <div
          className="
    flex items-center gap-3

    px-7 py-5

    border-t border-white/5
  "
        >
          <button
            onClick={saveSettings}
            disabled={loading}
            className="
      group relative overflow-hidden

      flex-1 h-14

      rounded-2xl

      border border-cyan-400/20

      bg-cyan-400/[0.10]
      hover:bg-cyan-400/[0.16]

      text-cyan-300

      font-medium

      transition-all duration-300

      disabled:opacity-50
      disabled:cursor-not-allowed
    "
          >
            <div
              className="
        absolute inset-0

        opacity-0
        group-hover:opacity-100

        transition-opacity duration-500

        bg-gradient-to-r
        from-cyan-400/10
        to-transparent
      "
            />

            <div className="relative">
              {loading
                ? 'Guardando configuración...'
                : '💾 Guardar configuración'}
            </div>
          </button>

          <button
            onClick={onClose}
            className="
      flex-1 h-14

      rounded-2xl

      border border-white/10

      bg-white/[0.04]
      hover:bg-white/[0.08]

      text-white/70
      hover:text-white

      transition-all duration-300
    "
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
