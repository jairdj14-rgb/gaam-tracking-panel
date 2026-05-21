import { useState, useEffect } from 'react';
import { useIncidentsStore } from '../store/incidentsStore';
import { ENV } from '../env';
import toast from 'react-hot-toast';

export default function Sidebar({
  users,
  setFollowUserId,
  onLogout,
  setCreatingZone,
  tempZone,
  setTempZone,
  creatingZone,
  loadZones,
  selectedZone,
  setSelectedZone,
  setOriginalZone,
  zones,
  setZones,
  isEditingZone,
  setIsEditingZone,
  setFlyToZone,
  role,
  setShowUsersPanel,
  zoneEvents,
  onSelectUser,
  evidences,
  open,
  onClose,
  setShowReports,
  setShowCompanySettings,
  setSidebarOpen,
  search,
  setSearch,

  searchResults,
  setSearchResults,
  setShowCompaniesPanel,
  setShowAuditPanel,
}) {
  const [showZones, setShowZones] = useState(false);
  const [openZoneId, setOpenZoneId] = useState(null);
  const list = Object.values(users || {});
  const [inside, setInside] = useState(false);
  const safeZones = zones || [];
  const safeEvents = zoneEvents || [];
  const [showZoneEvents, setShowZoneEvents] = useState(false);
  const { incidents, unread, clearUnread } = useIncidentsStore();

  const [showIncidents, setShowIncidents] = useState(false);

  const isSuspicious = (userId) => {
    const userEvents = (zoneEvents || [])
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (userEvents.length < 2) return false;

    let lastEnter = null;

    for (let i = userEvents.length - 1; i >= 0; i--) {
      const e = userEvents[i];

      if (e.type === 'EXIT' && !lastEnter) {
        // buscamos el ENTER correspondiente hacia atrás
        for (let j = i - 1; j >= 0; j--) {
          const prev = userEvents[j];

          if (prev.type === 'ENTER') {
            lastEnter = prev;

            const hasEvidenceBetween = (evidences || []).some((ev) => {
              const getTime = (val) => {
                if (!val) return 0;
                const t = new Date(val).getTime();
                return isNaN(t) ? 0 : t;
              };

              const evTime = getTime(ev.createdAt);
              const enterTime = getTime(lastEnter.createdAt);
              const exitTime = getTime(e.createdAt);

              return (
                ev.userId === userId &&
                ev.zoneId === e.zoneId &&
                evTime >= enterTime &&
                evTime <= exitTime + 1000 * 60 * 5
              );
            });

            return !hasEvidenceBetween;
          }
        }
      }
    }

    return false;
  };

  const getUserName = (userId) => {
    const user = list.find((u) => u.userId === userId);
    return user?.name || userId;
  };

  const groups = {
    FRAUD: [],
    INACTIVE: [],
    OFFLINE: [],
    OFF_SHIFT: [],
    NORMAL: [],
  };

  const actionButton = `
    w-full h-12 px-4

    rounded-2xl

    flex items-center gap-3

    bg-white/[0.04]
    hover:bg-white/[0.07]

    border border-white/10

    text-white/85
    hover:text-white

    transition-all duration-200

    active:scale-[0.98]
  `;

  useEffect(() => {
    if (selectedZone) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedZone]);

  list.forEach((user) => {
    if (user.status === 'FRAUD') {
      groups.FRAUD.push(user);
    } else if (user.status === 'OFF_SHIFT') {
      groups.OFF_SHIFT.push(user);
    } else if (user.status === 'OFFLINE') {
      groups.OFFLINE.push(user);
    } else if (user.status === 'INACTIVE') {
      groups.INACTIVE.push(user);
    } else {
      groups.NORMAL.push(user);
    }
  });

  return (
    <div
      className={`
  fixed top-0 left-0 h-full w-[340px] z-[9998]

  flex flex-col

  bg-[#06111f]/85
  backdrop-blur-2xl

  border-r border-white/10

  shadow-[0_20px_80px_rgba(0,0,0,0.45)]

  transform transition-all duration-300

  ${open ? 'translate-x-0' : '-translate-x-full'}
`}
    >
      <div
        className="
    sticky top-0 z-20

    flex items-center justify-between

    px-5 py-5

    backdrop-blur-2xl

    bg-[#06111f]/70

    border-b border-white/5

    shadow-[0_10px_40px_rgba(0,0,0,0.25)]
  "
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
            GAAMTracking
          </div>

          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Control Center
          </h1>
        </div>

        <button
          onClick={onClose}
          className="
      w-10 h-10 rounded-2xl

      bg-white/5
      hover:bg-white/10

      border border-white/10

      text-white/70 hover:text-white

      transition-all duration-200
    "
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-3">
        {/* CREAR ZONA */}
        {['ADMIN', 'SUPER_ADMIN'].includes(role) && (
          <>
            {!creatingZone ? (
              <button
                onClick={() => {
                  setSidebarOpen(false);

                  setCreatingZone(true);

                  setTempZone(null);

                  setSearch('');

                  setSearchResults([]);
                }}
                className={`${actionButton} shimmer-button

          border-cyan-400/20
          hover:border-cyan-400/40

          hover:bg-cyan-400/10
        `}
              >
                ➕ Crear zona
              </button>
            ) : (
              <button
                onClick={() => {
                  setCreatingZone(false);

                  setTempZone(null);

                  setSearch('');

                  setSearchResults([]);
                }}
                className={`${actionButton} shimmer-button

          border-red-400/20
          hover:border-red-400/40

          hover:bg-red-400/10
        `}
              >
                ❌ Cancelar
              </button>
            )}
          </>
        )}

        <button
          onClick={() => setShowZones(!showZones)}
          className={`${actionButton} shimmer-button`}
        >
          📍 Zonas
        </button>
        {/* 📍 INDICADOR */}
        {creatingZone && ['ADMIN', 'SUPER_ADMIN'].includes(role) && (
          <div className="mb-2 text-sm text-cyan-400">
            📍 Haz click en el mapa
          </div>
        )}
        {showZones && (
          <div className="mb-4">
            {(zones || []).map((zone) => (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  setOriginalZone(zone);

                  setFlyToZone({
                    lat: zone.lat ?? zone.centerLat,
                    lng: zone.lng ?? zone.centerLng,
                  });
                }}
                className={`
  group

  relative overflow-hidden

  p-4 mb-2

  rounded-3xl

  border

  transition-all duration-300

  cursor-pointer

  ${
    selectedZone?.id === zone.id
      ? `
        bg-cyan-400/[0.10]

        border-cyan-400/30

        shadow-[0_0_30px_rgba(34,211,238,0.15)]
      `
      : `
        bg-white/[0.03]

        border-white/5

        hover:bg-white/[0.05]

        hover:border-cyan-400/15
      `
  }
`}
              >
                {/* glow */}
                <div
                  className="
      absolute inset-0

      opacity-0
      group-hover:opacity-100

      transition-opacity duration-300

      bg-gradient-to-r
      from-cyan-400/5
      to-blue-500/5
    "
                />

                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* dot */}
                    <div
                      className="
          w-2.5 h-2.5 rounded-full shrink-0

          bg-cyan-400

          shadow-[0_0_12px_rgba(34,211,238,0.9)]
        "
                    />

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {zone.name || 'Sin nombre'}
                      </div>

                      <div className="text-[11px] text-white/35">
                        Radio: {Math.round(zone.radius)}m
                      </div>
                    </div>
                  </div>

                  {['ADMIN', 'SUPER_ADMIN'].includes(role) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setSelectedZone(zone);
                        setOriginalZone(zone);

                        setIsEditingZone(true);
                      }}
                      className="
          opacity-0
          group-hover:opacity-100

          w-9 h-9

          rounded-xl

          bg-cyan-400/10
          hover:bg-cyan-400/20

          border border-cyan-400/20

          text-cyan-300

          transition-all duration-200
        "
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowReports(true)}
          className={`${actionButton} shimmer-button`}
        >
          📊 Reportes
        </button>

        <button
          onClick={() => {
            setShowIncidents(!showIncidents);

            clearUnread();
          }}
          className={`${actionButton} shimmer-button relative`}
        >
          🚨 Incidentes
          {unread > 0 && (
            <div
              className="
        absolute right-3 top-1/2 -translate-y-1/2

        min-w-[22px] h-[22px]

        px-1

        rounded-full

        bg-red-500

        flex items-center justify-center

        text-[11px]
        text-white
        font-bold
      "
            >
              {unread}
            </div>
          )}
        </button>

        {showIncidents && (
          <div
            className="
      rounded-3xl

      border border-red-400/10

      bg-red-500/[0.03]

      p-3

      space-y-2
    "
          >
            {incidents.length === 0 ? (
              <div className="text-sm text-white/40">Sin incidentes</div>
            ) : (
              incidents.map((incident, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const user = list.find((u) => u.userId === incident.userId);

                    if (user) {
                      setFollowUserId(user.userId);

                      onSelectUser(user);
                    }
                  }}
                  className="
            w-full

            rounded-2xl

            border border-white/5

            bg-black/20
            hover:bg-black/30

            p-3

            text-left

            transition-all
          "
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-red-300 font-semibold">
                      {incident.type}
                    </div>

                    <div className="text-[10px] text-white/30">
                      {incident.severity}
                    </div>
                  </div>

                  <div className="mt-1 text-sm text-white">
                    {incident.message}
                  </div>

                  <div className="mt-2 text-[11px] text-white/40">
                    {getUserName(incident.userId)}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        <button
          onClick={() => setShowZoneEvents(!showZoneEvents)}
          className={`${actionButton} shimmer-button`}
        >
          📡 Eventos por zona
        </button>

        {showZoneEvents && (
          <div
            className="
      rounded-3xl

      border border-white/10

      bg-white/[0.03]

      p-3

      space-y-3
    "
          >
            {safeZones.map((zone) => {
              const eventsForZone = safeEvents.filter(
                (e) => e.zoneId === zone.id,
              );

              const isOpen = openZoneId === zone.id;

              return (
                <div
                  key={zone.id}
                  className="
            rounded-2xl

            border border-white/6

            bg-black/10

            overflow-hidden
          "
                >
                  <button
                    onClick={() => setOpenZoneId(isOpen ? null : zone.id)}
                    className="
              w-full

              flex items-center justify-between

              px-4 py-3

              hover:bg-white/[0.03]

              transition-all duration-200
            "
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="
                  w-2 h-2 rounded-full

                  bg-cyan-400

                  shadow-[0_0_10px_rgba(34,211,238,0.9)]
                "
                      />

                      <div className="truncate text-sm text-white">
                        {zone.name}
                      </div>
                    </div>

                    <div className="text-white/40 text-xs">
                      {isOpen ? '−' : '+'}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2">
                      {eventsForZone.length === 0 ? (
                        <div className="text-xs text-white/30">
                          Sin eventos registrados
                        </div>
                      ) : (
                        eventsForZone.map((e, i) => (
                          <div
                            key={i}
                            className="
                      flex items-center justify-between

                      rounded-xl

                      bg-white/[0.03]

                      px-3 py-2
                    "
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div>{e.type === 'ENTER' ? '🟢' : '🔴'}</div>

                              <div className="truncate text-xs text-white/80">
                                {getUserName(e.userId)}
                              </div>
                            </div>

                            <div className="text-[10px] text-white/30">
                              {e.type}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => {
                localStorage.removeItem('zoneEvents');
                window.location.reload();
              }}
              className="
        w-full h-11

        rounded-2xl

        bg-red-500/10
        hover:bg-red-500/15

        border border-red-400/20

        text-red-300 text-sm

        transition-all duration-200
      "
            >
              Limpiar eventos
            </button>
          </div>
        )}

        {['ADMIN', 'SUPER_ADMIN'].includes(role) && (
          <button
            onClick={() => setShowUsersPanel(true)}
            className={`${actionButton} shimmer-button`}
          >
            👥 Usuarios
          </button>
        )}

        {['ADMIN', 'SUPER_ADMIN'].includes(role) && (
          <button
            onClick={() => setShowCompanySettings(true)}
            className={`${actionButton} shimmer-button`}
          >
            🏢 Configuración empresa
          </button>
        )}

        {role === 'SUPER_ADMIN' && (
          <>
            <button
              onClick={() => setShowCompaniesPanel(true)}
              className={`${actionButton} shimmer-button`}
            >
              🏢 Empresas
            </button>

            <button
              onClick={() => toast('Próximamente')}
              className={`${actionButton} shimmer-button`}
            >
              👑 Admins globales
            </button>

            <button
              onClick={() => setShowAuditPanel(true)}
              className={`${actionButton} shimmer-button`}
            >
              🕒 Auditoría
            </button>

            <button
              onClick={() => toast('Próximamente')}
              className={`${actionButton} shimmer-button`}
            >
              📊 Reportes globales
            </button>
          </>
        )}

        <div className="border-t border-white/10 my-3" />
        <h2 className="text-lg font-bold mb-4">Usuarios</h2>
        {/* LISTA */}
        <div className="flex-1 overflow-y-auto">
          <Section
            title="🔴 FRAUDE"
            users={groups.FRAUD}
            color="text-red-400"
            setFollowUserId={setFollowUserId}
            onSelectUser={onSelectUser}
            isSuspicious={isSuspicious}
          />

          <Section
            title="🌙 FUERA DE TURNO"
            users={groups.OFF_SHIFT}
            color="text-indigo-400"
            setFollowUserId={setFollowUserId}
            onSelectUser={onSelectUser}
            isSuspicious={isSuspicious}
          />

          <Section
            title="🟡 INACTIVOS"
            users={groups.INACTIVE}
            color="text-yellow-400"
            setFollowUserId={setFollowUserId}
            onSelectUser={onSelectUser}
            isSuspicious={isSuspicious}
          />

          <Section
            title="⚫ OFFLINE"
            users={groups.OFFLINE}
            color="text-zinc-400"
            setFollowUserId={setFollowUserId}
            onSelectUser={onSelectUser}
            isSuspicious={isSuspicious}
          />

          <Section
            title="🟢 ACTIVOS"
            users={groups.NORMAL}
            color="text-green-400"
            setFollowUserId={setFollowUserId}
            onSelectUser={onSelectUser}
            isSuspicious={isSuspicious}
          />
        </div>
        {/*
        <button
          onClick={async () => {
            const token = localStorage.getItem('accessToken');

            const coords = inside
              ? { lat: 19.4, lng: -99.2 } // fuera
              : { lat: 19.4326, lng: -99.1332 }; // dentro

            await fetch(`${ENV.API_URL}/tracking/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(coords),
            });

            setInside(!inside);
          }}
        >
          {inside ? '🔴 Salir zona' : '🟢 Entrar zona'}
        </button>

*/}

        {/* 🚪 LOGOUT */}
        <button
          onClick={onLogout}
          className="
  w-full h-12 mt-4

  rounded-2xl

  bg-red-500/10
  hover:bg-red-500/15

  border border-red-400/20

  text-red-300

  transition-all duration-200
"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  users,
  color,
  setFollowUserId,
  onSelectUser,
  isSuspicious,
}) {
  if (users.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className={`text-xs font-medium tracking-[0.25em] ${color}`}>
          {title}
        </h3>

        <div className="text-[11px] text-white/30">{users.length}</div>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.userId}
            onClick={() => {
              setFollowUserId(user.userId);
              onSelectUser(user);
            }}
            className="
              group

              relative

              w-full

              overflow-hidden

              rounded-2xl

              border border-white/8

              bg-white/[0.03]
              hover:bg-white/[0.06]

              transition-all duration-200

              hover:border-cyan-400/20
              hover:-translate-y-[1px]

              active:scale-[0.99]
            "
          >
            {/* glow */}
            <div
              className="
                absolute inset-0

                opacity-0
                group-hover:opacity-100

                transition-opacity duration-300

                bg-gradient-to-r
                from-cyan-400/5
                to-blue-500/5
              "
            />

            <div className="relative flex items-center justify-between p-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* status dot */}
                <div
                  className={`
                    w-2.5 h-2.5 rounded-full shrink-0

                    ${
                      user.status === 'FRAUD'
                        ? 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]'
                        : user.status === 'OFF_SHIFT'
                          ? 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]'
                          : user.status === 'OFFLINE'
                            ? 'bg-zinc-500 shadow-[0_0_12px_rgba(161,161,170,0.6)]'
                            : user.status === 'INACTIVE'
                              ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                              : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]'
                    }
                  `}
                />

                <div className="min-w-0 text-left">
                  <div className="truncate text-sm font-medium text-white">
                    {user.name || user.userId}
                  </div>

                  <div className="text-[11px] text-white/35">{user.status}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSuspicious(user.userId) && (
                  <div
                    className="
                      px-2 py-1 rounded-full

                      bg-red-500/10
                      border border-red-400/20

                      text-[10px]
                      text-red-300
                    "
                  >
                    ALERT
                  </div>
                )}

                <div
                  className="
                    text-white/20
                    group-hover:text-cyan-300

                    transition-colors
                  "
                >
                  →
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
