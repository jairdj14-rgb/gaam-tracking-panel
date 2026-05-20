import { useState, useEffect } from 'react';
import { ENV } from '../env';

export default function ZoneEditorModal({
  zone,
  onClose,
  onSave,
  users,
  setIsAdjustingZone,
  setSidebarOpen,
  setFlyToZone,
}) {
  const [name, setName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    const confirmDelete = confirm('¿Eliminar zona?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('accessToken');

    await fetch(`${ENV.API_URL}/zones/${zone.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    window.dispatchEvent(new CustomEvent('zoneDeleted', { detail: zone.id }));

    onClose();
  };

  useEffect(() => {
    if (zone) {
      setName(zone.name || '');
      setSelectedUserIds(zone.users?.map((u) => u.id) || []);
    }
  }, [zone]);

  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
      <div
        className="
        relative
        w-full max-w-md

        rounded-3xl

        border border-white/10
        bg-white/[0.06]

        backdrop-blur-2xl

        shadow-[0_20px_80px_rgba(0,0,0,0.45)]

        overflow-hidden
      "
      >
        {/* GLOW */}
        <div
          className="
          absolute inset-0

          bg-gradient-to-br
          from-cyan-400/10
          via-transparent
          to-blue-500/10

          pointer-events-none
        "
        />

        {/* HEADER */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/70 mb-2">
                Zone Control
              </div>

              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Editar zona
              </h2>
            </div>

            <button
              onClick={onClose}
              className="
              w-10 h-10 rounded-2xl

              bg-white/5
              hover:bg-white/10

              border border-white/10

              flex items-center justify-center

              text-white/70 hover:text-white

              transition-all duration-200
            "
            >
              ✕
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative p-6 space-y-6">
          {/* NOMBRE */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-white/50 mb-2 block">
              Nombre de zona
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zona corporativa"
              className="
              w-full h-12 px-4

              rounded-2xl

              bg-white/5
              border border-white/10

              text-white
              placeholder:text-white/30

              outline-none

              focus:border-cyan-400/40
              focus:bg-white/[0.07]

              transition-all duration-200
            "
            />
          </div>

          {/* USERS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium uppercase tracking-wider text-white/50">
                Usuarios asignados
              </label>

              <div className="text-xs text-cyan-300">
                {selectedUserIds.length} seleccionados
              </div>
            </div>

            <div
              className="
              max-h-56 overflow-y-auto

              rounded-2xl

              bg-black/20
              border border-white/10

              p-2

              space-y-1
            "
            >
              {Object.values(users || {}).map((u) => {
                const active = selectedUserIds.includes(u.id);

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`
                    w-full

                    flex items-center justify-between

                    px-3 py-3

                    rounded-xl

                    border

                    transition-all duration-200

                    ${
                      active
                        ? `
                          bg-cyan-400/15
                          border-cyan-400/30
                          text-cyan-100
                        `
                        : `
                          bg-white/[0.03]
                          border-transparent
                          text-white/70

                          hover:bg-white/[0.06]
                          hover:text-white
                        `
                    }
                  `}
                  >
                    <span className="text-sm font-medium">{u.name}</span>

                    <div
                      className={`
                      w-5 h-5 rounded-full border flex items-center justify-center text-[10px]

                      ${
                        active
                          ? `
                            border-cyan-300
                            bg-cyan-400
                            text-black
                          `
                          : `
                            border-white/20
                          `
                      }
                    `}
                    >
                      {active ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="relative p-6 pt-0 space-y-3">
          <button
            onClick={() =>
              onSave({
                ...zone,
                name,
                users: selectedUserIds.map((id) => ({ id })),
              })
            }
            className="
            w-full h-12 rounded-2xl

            bg-gradient-to-r
            from-cyan-500
            to-blue-500

            hover:scale-[1.01]
            active:scale-[0.99]

            text-white font-medium

            shadow-[0_10px_30px_rgba(34,211,238,0.35)]

            transition-all duration-200
          "
          >
            Guardar cambios
          </button>

          <button
            onClick={() => {
              setIsAdjustingZone(true);
              setSidebarOpen(false);

              setFlyToZone({
                lat: zone.lat,
                lng: zone.lng,
              });
            }}
            className="
            w-full h-12 rounded-2xl

            bg-white/[0.05]
            hover:bg-white/[0.08]

            border border-white/10

            text-white/80 hover:text-white

            transition-all duration-200
          "
          >
            Ajustar en mapa
          </button>

          <button
            onClick={handleDelete}
            className="
            w-full h-12 rounded-2xl

            bg-red-500/10
            hover:bg-red-500/15

            border border-red-400/20

            text-red-300

            transition-all duration-200
          "
          >
            Eliminar zona
          </button>
        </div>
      </div>
    </div>
  );
}
