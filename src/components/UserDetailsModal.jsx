import { useEffect } from 'react';
import { ENV } from '../env';

export default function UserDetailsModal({
  liveUser,
  hasRecentEvidence,
  userEvidences,
  evidencesByZone,
  getZoneName,
  handleUpload,
  onClose,
  timeline,
  loadingTimeline,
  selectedUserId,
}) {
  useEffect(() => {
    const handler = (e) => {};

    window.addEventListener('timeline_event', handler);

    return () => {
      window.removeEventListener('timeline_event', handler);
    };
  }, []);
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
      w-full max-w-[520px]

        max-h-[85vh]

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
              Live Monitoring
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              {liveUser?.name || 'Usuario'}
            </h2>

            <p className="text-sm text-white/35 mt-2">ID: {selectedUserId}</p>
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
          {/* STATUS */}
          <div
            className="
            rounded-3xl

            border border-white/10

            bg-white/[0.03]

            p-5
          "
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Estado operativo</div>

                <div className="text-xs text-white/35 mt-1">
                  Monitoreo en tiempo real
                </div>
              </div>

              <div
                className={`text-sm font-semibold ${
                  liveUser?.status === 'FRAUD'
                    ? 'text-red-400'
                    : liveUser?.status === 'OFF_SHIFT'
                      ? 'text-indigo-400'
                      : liveUser?.status === 'INACTIVE'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                }`}
              >
                {liveUser?.status || 'UNKNOWN'}
              </div>
            </div>

            {!hasRecentEvidence && (
              <div
                className="
                mt-4

                rounded-2xl

                border border-red-400/20

                bg-red-400/[0.08]

                px-4 py-3

                text-sm text-red-300
              "
              >
                ⚠️ Sin evidencia reciente
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div
            className="
            rounded-3xl

            border border-white/10

            bg-white/[0.03]

            p-5
          "
          >
            <div className="text-sm font-semibold mb-2">Ubicación actual</div>

            {liveUser?.lat ? (
              <div className="text-cyan-300 text-sm">
                📍 {liveUser.lat.toFixed(5)}, {liveUser.lng.toFixed(5)}
              </div>
            ) : (
              <div className="text-white/35 text-sm">
                Sin datos de ubicación
              </div>
            )}
          </div>

          {/* EVIDENCES */}
          <div
            className="
            rounded-3xl

            border border-white/10

            bg-white/[0.03]

            p-5
          "
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Evidencias</div>

                <div className="text-xs text-white/35 mt-1">
                  Capturas registradas
                </div>
              </div>

              <label>
                <div
                  className="
                  px-4 py-2

                  rounded-2xl

                  border border-cyan-400/20

                  bg-cyan-400/[0.10]
                  hover:bg-cyan-400/[0.16]

                  text-cyan-300

                  text-sm

                  cursor-pointer

                  transition-all
                "
                >
                  📸 Subir evidencia
                </div>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>

            {userEvidences.length === 0 ? (
              <div className="text-sm text-white/35">
                Sin evidencia registrada
              </div>
            ) : (
              Object.entries(evidencesByZone).map(([zoneId, list]) => (
                <div key={zoneId} className="mb-5">
                  <div className="text-xs text-cyan-300 mb-2">
                    📍 {getZoneName(zoneId)}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {list.map((e) => (
                      <div
                        key={e.id}
                        className="
                        rounded-2xl

                        overflow-hidden

                        border border-white/10

                        bg-white/[0.03]
                      "
                      >
                        <img
                          src={`${ENV.API_URL}${e.imageUrl}`}
                          className="w-full h-28 object-cover"
                          onError={() => {
                            console.log('❌ IMAGE ERROR');

                            console.log('ENV.API_URL:', ENV.API_URL);

                            console.log('imageUrl:', e.imageUrl);

                            console.log('FULL:', `${ENV.API_URL}${e.imageUrl}`);
                          }}
                        />

                        <div className="p-2 text-[10px] text-white/35 text-center">
                          {new Date(e.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TIMELINE */}
          <div
            className="
  rounded-3xl

  border border-white/10

  bg-white/[0.03]

  p-5
"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Activity Timeline</div>

                <div className="text-xs text-white/35 mt-1">
                  Eventos recientes del usuario
                </div>
              </div>
            </div>

            {loadingTimeline ? (
              <div className="text-sm text-white/35">Cargando timeline...</div>
            ) : timeline.length === 0 ? (
              <div className="text-sm text-white/35">
                Sin actividad registrada
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.map((event, index) => (
                  <div
                    key={index}
                    className="
          rounded-2xl

          border border-white/6

          bg-black/20

          px-4 py-3
        "
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-xs font-semibold ${
                          event.type === 'ENTER'
                            ? 'text-green-400'
                            : event.type === 'EXIT'
                              ? 'text-red-400'
                              : event.type?.includes('FRAUD')
                                ? 'text-red-500'
                                : event.type === 'INACTIVE'
                                  ? 'text-yellow-400'
                                  : 'text-cyan-300'
                        }`}
                      >
                        {event.type}
                      </div>

                      <div className="text-[10px] text-white/30">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-sm text-white/70 mt-2">
                      {event.message || event.zone?.name || 'Evento registrado'}
                    </div>

                    {event.imageUrl && (
                      <img
                        src={`${ENV.API_URL}${event.imageUrl}`}
                        className="
    mt-3
    w-full
    h-44
    object-cover
    rounded-2xl
    border border-white/10
  "
                        onError={() => {
                          console.log('❌ TIMELINE IMAGE ERROR');

                          console.log('ENV.API_URL:', ENV.API_URL);

                          console.log('imageUrl:', event.imageUrl);

                          console.log(
                            'FULL:',
                            `${ENV.API_URL}${event.imageUrl}`,
                          );
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
          px-7 py-5

          border-t border-white/5
        "
        >
          <button
            onClick={onClose}
            className="
            w-full h-14

            rounded-2xl

            bg-white/[0.04]
            hover:bg-white/[0.08]

            border border-white/10

            text-white/70
            hover:text-white

            transition-all duration-300
          "
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
