import { useEffect, useState } from 'react';
import { ENV } from '../env';

export default function GlobalReportsModal({ onClose }) {
  const [metrics, setMetrics] = useState(null);

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/reports/global`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setMetrics(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const cards = [
    {
      title: 'Empresas',
      value: metrics?.companies || 0,
      subtitle: `${metrics?.activeCompanies || 0} activas`,
      icon: '🏢',
    },

    {
      title: 'Usuarios',
      value: metrics?.users || 0,
      subtitle: `${metrics?.onlineUsers || 0} online`,
      icon: '👥',
    },

    {
      title: 'Zonas',
      value: metrics?.zones || 0,
      subtitle: 'Geofences activas',
      icon: '📍',
    },

    {
      title: 'Incidentes hoy',
      value: metrics?.incidentsToday || 0,
      subtitle: 'Eventos críticos',
      icon: '🚨',
    },

    {
      title: 'Evidencias hoy',
      value: metrics?.evidencesToday || 0,
      subtitle: 'Capturas registradas',
      icon: '📸',
    },
  ];

  return (
    <div
      className="
        fixed inset-0 z-[99999]

        bg-black/60
        backdrop-blur-sm

        flex items-center justify-center

        p-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-7xl

          max-h-[90vh]

          overflow-hidden

          rounded-[36px]

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
            flex items-center justify-between

            px-8 py-6

            border-b border-white/10
          "
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
              Enterprise Analytics
            </div>

            <h2 className="text-3xl font-semibold tracking-tight">
              📊 Global Reports
            </h2>
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
        <div className="flex-1 overflow-y-auto p-8">
          {!metrics ? (
            <div className="text-white/40">Cargando métricas...</div>
          ) : (
            <>
              {/* KPI GRID */}
              <div
                className="
                  grid

                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-3

                  gap-5
                "
              >
                {cards.map((card) => (
                  <div
                    key={card.title}
                    className="
                      relative overflow-hidden

                      rounded-3xl

                      border border-white/10

                      bg-white/[0.03]

                      p-6

                      hover:border-cyan-400/20

                      transition-all duration-300
                    "
                  >
                    {/* glow */}
                    <div
                      className="
                        absolute inset-0

                        opacity-0
                        hover:opacity-100

                        transition-opacity duration-300

                        bg-gradient-to-r
                        from-cyan-400/5
                        to-blue-500/5
                      "
                    />

                    <div className="relative">
                      <div className="text-4xl mb-4">{card.icon}</div>

                      <div className="text-sm text-white/50">{card.title}</div>

                      <div className="mt-2 text-4xl font-bold">
                        {card.value}
                      </div>

                      <div className="mt-3 text-sm text-cyan-300">
                        {card.subtitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ENTERPRISE STATUS */}
              <div
                className="
                  mt-8

                  rounded-3xl

                  border border-cyan-400/10

                  bg-cyan-400/[0.03]

                  p-6
                "
              >
                <div className="text-lg font-semibold mb-2">
                  🌐 Estado del sistema
                </div>

                <div className="text-white/60 leading-7">
                  Plataforma operando correctamente. Realtime tracking activo.
                  Infraestructura multiempresa estable. Monitoreo GPS y eventos
                  en tiempo real funcionando.
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div
                    className="
                      px-4 py-2

                      rounded-2xl

                      bg-emerald-500/10

                      border border-emerald-400/20

                      text-emerald-300 text-sm
                    "
                  >
                    🟢 Tracking Online
                  </div>

                  <div
                    className="
                      px-4 py-2

                      rounded-2xl

                      bg-cyan-500/10

                      border border-cyan-400/20

                      text-cyan-300 text-sm
                    "
                  >
                    ⚡ WebSockets Active
                  </div>

                  <div
                    className="
                      px-4 py-2

                      rounded-2xl

                      bg-indigo-500/10

                      border border-indigo-400/20

                      text-indigo-300 text-sm
                    "
                  >
                    🔒 Enterprise Security
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
