import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

const overlayCard = `
  rounded-3xl

  border border-white/10

  bg-[#06111f]/80
  backdrop-blur-2xl

  shadow-[0_20px_60px_rgba(0,0,0,0.45)]

  text-white
`;

const FollowUser = ({ users, followUserId }) => {
  const map = useMap();

  useEffect(() => {
    if (!followUserId) return;

    const user = users[followUserId];

    if (!user || typeof user.lat !== 'number' || typeof user.lng !== 'number') {
      return;
    }

    map.flyTo([user.lat, user.lng], 16, {
      duration: 1.2,
    });
  }, [followUserId, users, map]);

  return null;
};

const FlyToZone = ({ flyToZone }) => {
  const map = useMap();

  useEffect(() => {
    if (!flyToZone) return;

    map.flyTo([flyToZone.lat, flyToZone.lng], 18, {
      duration: 1.8,
    });
  }, [flyToZone, map]);

  return null;
};

const MapClickHandler = ({ creatingZone, setTempZone }) => {
  useMapEvents({
    click(e) {
      if (!creatingZone) return;

      const { lat, lng } = e.latlng;

      setTempZone({
        lat,
        lng,
        radius: 100,
        name: 'Nueva zona',
      });
    },
  });

  return null;
};

const ZoneCircle = React.memo(
  ({
    zone,
    isSelected,
    selectedZone,
    setSelectedZone,
    setOriginalZone,
    setIsEditingZone,
    setSidebarOpen,
    setIsAdjustingZone,
    setFlyToZone,
  }) => {
    const zoneToRender = isSelected ? selectedZone : zone;
    const active = selectedZone?.id === zone.id;

    if (
      !zoneToRender ||
      typeof zoneToRender.lat !== 'number' ||
      typeof zoneToRender.lng !== 'number'
    ) {
      return null;
    }

    return (
      <div>
        {/* MAIN */}
        <Circle
          interactive
          bubblingMouseEvents={false}
          center={[zoneToRender.lat, zoneToRender.lng]}
          radius={zoneToRender.radius}
          pathOptions={{
            color: active ? '#22d3ee' : '#3b82f6',

            dashArray: active ? '8 10' : null,

            weight: active ? 3 : 2,

            fillColor: active ? '#22d3ee' : '#3b82f6',

            fillOpacity: active ? 0.28 : 0.08,
          }}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);

              setSelectedZone(zone);
              setOriginalZone(zone);

              const map = e.target._map;

              map?.flyTo([zone.lat, zone.lng], 16, {
                duration: 1.2,
              });
            },

            dblclick: (e) => {
              L.DomEvent.stopPropagation(e);

              setSelectedZone(zone);

              setOriginalZone(zone);

              setIsEditingZone(true);

              setIsAdjustingZone(true);

              setSidebarOpen(false);

              setFlyToZone({
                lat: zone.lat ?? zone.centerLat,
                lng: zone.lng ?? zone.centerLng,
              });
            },
          }}
        />

        {/* GLOW */}
        <Circle
          interactive={false}
          bubblingMouseEvents={false}
          center={[zoneToRender.lat, zoneToRender.lng]}
          radius={zoneToRender.radius}
          pathOptions={{
            color: active ? '#22d3ee' : '#60a5fa',

            weight: 12,

            opacity: active ? 0.16 : 0.05,
          }}
        />
      </div>
    );
  },
);

const createUserIcon = (color) =>
  new L.divIcon({
    className: '',

    html: `
      <div
        style="
          position:relative;

          width:18px;
          height:18px;

          display:flex;
          align-items:center;
          justify-content:center;
        "
      >
        <div
          style="
            position:absolute;

            width:18px;
            height:18px;

            border-radius:999px;

            background:${color};

            opacity:0.25;

            animation:pulse 2s infinite;
          "
        ></div>

        <div
          style="
            width:12px;
            height:12px;

            border-radius:999px;

            background:${color};

            border:2px solid rgba(255,255,255,0.95);

            box-shadow:
              0 0 12px ${color},
              0 0 24px ${color};
          "
        ></div>
      </div>

      <style>
        @keyframes pulse {
          0% {
            transform:scale(1);
            opacity:0.25;
          }

          70% {
            transform:scale(2.2);
            opacity:0;
          }

          100% {
            transform:scale(2.2);
            opacity:0;
          }
        }
      </style>
    `,

    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const greenIcon = createUserIcon('#22c55e');

const yellowIcon = createUserIcon('#eab308');

const redIcon = createUserIcon('#ef4444');

const grayIcon = createUserIcon('#6b7280');

const zonePreviewIcon = new L.divIcon({
  className: '',

  html: `
    <div
      style="
        position:relative;

        width:24px;
        height:24px;

        display:flex;
        align-items:center;
        justify-content:center;
      "
    >
      <div
        style="
          position:absolute;

          width:24px;
          height:24px;

          border-radius:999px;

          background:#22d3ee;

          opacity:0.18;

          animation:pulseZone 2s infinite;
        "
      ></div>

      <div
        style="
          width:14px;
          height:14px;

          border-radius:999px;

          background:#22d3ee;

          border:3px solid rgba(255,255,255,0.95);

          box-shadow:
            0 0 12px #22d3ee,
            0 0 24px #22d3ee;
        "
      ></div>
    </div>

    <style>
      @keyframes pulseZone {
        0% {
          transform:scale(1);
          opacity:0.18;
        }

        70% {
          transform:scale(2.4);
          opacity:0;
        }

        100% {
          transform:scale(2.4);
          opacity:0;
        }
      }
    </style>
  `,

  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getHandlePosition = (zone) => {
  const dx = zone.radius / 111111;
  return [zone.lat, zone.lng + dx];
};

const UserMarker = ({ user }) => {
  if (typeof user.lat !== 'number' || typeof user.lng !== 'number') {
    return null;
  }

  let icon = greenIcon;

  if (!user.isOnline) {
    icon = grayIcon;
  } else if (user.status === 'FRAUD') {
    icon = redIcon;
  } else if (user.status === 'INACTIVE') {
    icon = yellowIcon;
  }
  if (user.status === 'OFF_SHIFT' || !user.isOnline) {
    icon = grayIcon;
  }

  return (
    <Marker
      position={[user.lat, user.lng]}
      icon={icon}
      eventHandlers={{
        add: (e) => {
          const marker = e.target;

          marker._icon?.classList.add('smooth-marker');
        },
      }}
    >
      <Popup className="custom-popup" closeButton={false}>
        <div
          className="
      min-w-[180px]

      rounded-2xl

      bg-[#07111f]

      text-white

      p-4

      border border-white/10

      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
    "
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">{user.name}</div>

            <div
              className={`
          px-2 py-1 rounded-full text-[10px]

          ${
            !user.isOnline
              ? 'bg-gray-500/15 text-gray-300'
              : user.status === 'FRAUD'
                ? 'bg-red-500/15 text-red-300'
                : user.status === 'INACTIVE'
                  ? 'bg-yellow-500/15 text-yellow-300'
                  : 'bg-emerald-500/15 text-emerald-300'
          }
        `}
            >
              {!user.isOnline ? 'OFFLINE' : user.status}
            </div>
          </div>

          <div className="text-[11px] text-white/40">
            LAT: {user.lat?.toFixed(5)}
          </div>

          <div className="text-[11px] text-white/40">
            LNG: {user.lng?.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default function MapView({
  users,
  followUserId,
  creatingZone,
  tempZone,
  setTempZone,
  zones,
  selectedZone,
  setSelectedZone,
  setOriginalZone,
  setIsEditingZone,
  flyToZone,
  setIsAdjustingZone,
  isAdjustingZone,
  setSidebarOpen,
  setFlyToZone,
}) {
  const assignedUserIds = selectedZone?.users?.map((u) => u.id) || [];
  const selectedZoneRef = useRef(null);

  const originalZoneRef = useRef(null);

  useEffect(() => {
    selectedZoneRef.current = selectedZone;
  }, [selectedZone]);

  useEffect(() => {
    if (isAdjustingZone && selectedZone) {
      originalZoneRef.current = { ...selectedZone };
      selectedZoneRef.current = { ...selectedZone };
    }
  }, [isAdjustingZone]);

  return (
    <>
      <MapContainer
        className="h-screen w-screen"
        center={[19.4326, -99.1332]}
        zoom={13}
        doubleClickZoom={false}
        zoomControl={true}
        zoomAnimation={true}
      >
        <FlyToZone flyToZone={flyToZone} />
        <MapClickHandler
          creatingZone={creatingZone}
          setTempZone={setTempZone}
        />
        <FollowUser users={users} followUserId={followUserId} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* USERS */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
          {Object.values(users)
            .filter((user) => {
              if (typeof user.lat !== 'number' || typeof user.lng !== 'number')
                return false;

              if (selectedZone) {
                return assignedUserIds.includes(user.userId);
              }

              return true;
            })
            .map((user) => (
              <UserMarker key={user.userId} user={user} />
            ))}
        </MarkerClusterGroup>
        {/* ZONAS */}
        {zones?.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          const zoneToRender = isSelected ? selectedZone : zone;

          if (!zoneToRender || typeof zoneToRender.lat !== 'number')
            return null;

          return (
            <ZoneCircle
              key={zone.id}
              zone={zone}
              isSelected={selectedZone?.id === zone.id}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              setOriginalZone={setOriginalZone}
              setIsEditingZone={setIsEditingZone}
              setSidebarOpen={setSidebarOpen}
              setIsAdjustingZone={setIsAdjustingZone}
              setFlyToZone={setFlyToZone}
            />
          );
        })}

        {/* HANDLE */}
        {selectedZone && isAdjustingZone && (
          <Marker
            key={selectedZone.radius}
            icon={
              new L.Icon({
                iconUrl:
                  'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                iconSize: [40, 40],
              })
            }
            position={getHandlePosition(selectedZone)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const zone = selectedZoneRef.current;
                if (!zone) return;

                const { lat, lng } = e.target.getLatLng();

                const dx = lat - zone.lat;
                const dy = lng - zone.lng;

                const distance = Math.sqrt(dx * dx + dy * dy);
                const newRadius = distance * 111111;

                const updated = {
                  ...zone,
                  radius: newRadius,
                };

                selectedZoneRef.current = updated;
                setSelectedZone(updated);
              },
            }}
          />
        )}

        {/* HANDLE CENTRO */}
        {selectedZone && isAdjustingZone && (
          <Marker
            position={[selectedZone.lat, selectedZone.lng]}
            draggable={true}
            icon={
              new L.Icon({
                iconUrl:
                  'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                iconSize: [30, 30],
              })
            }
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();

                const updated = {
                  ...selectedZone,
                  lat,
                  lng,
                };

                setSelectedZone(updated);
              },
            }}
          />
        )}

        {/* PREVIEW */}
        {tempZone && (
          <>
            <Circle
              center={[tempZone.lat, tempZone.lng]}
              radius={tempZone.radius}
              pathOptions={{
                color: 'cyan',
                fillOpacity: 0.3,
              }}
            />

            {tempZone && (
              <Marker
                position={[tempZone.lat, tempZone.lng]}
                draggable={true}
                icon={zonePreviewIcon}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();

                    setTempZone({
                      ...tempZone,
                      lat,
                      lng,
                    });
                  },
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -16]}>
                  <div
                    className="
      px-3 py-1

      rounded-xl

      bg-[#06111f]/95

      border border-cyan-400/20

      text-cyan-300 text-xs font-medium

      backdrop-blur-xl
    "
                  >
                    {tempZone.radius}m
                  </div>
                </Tooltip>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
      {isAdjustingZone && selectedZone && (
        <div
          className={`
      ${overlayCard}

      absolute

      bottom-4 left-4 right-4 md:left-auto md:right-6

      z-[1000]

      flex flex-col md:flex-row items-center gap-3

      p-3
    `}
        >
          <button
            onClick={() => {
              if (originalZoneRef.current) {
                setSelectedZone({ ...originalZoneRef.current });
              }

              setIsAdjustingZone(false);
            }}
            className="
    px-5 py-3

    rounded-2xl

    bg-white/[0.12]
    hover:bg-white/[0.18]

    border border-white/15

    shadow-[0_4px_20px_rgba(0,0,0,0.25)]

    text-white/90
    hover:text-white

    transition-all duration-200
  "
          >
            ❌ Cancelar
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('saveZone', {
                  detail: selectedZone,
                }),
              );

              setIsAdjustingZone(false);
            }}
            className={`
        ${overlayCard}

        px-5 py-3

        border-cyan-400/20

        text-cyan-300

        hover:bg-cyan-400/10

        transition-all duration-200
      `}
          >
            💾 Guardar
          </button>
        </div>
      )}

      {selectedZone && isAdjustingZone && (
        <div
          className={`
      ${overlayCard}

      absolute top-5 right-5 z-[1000]

      px-5 py-4

      text-sm leading-6

      text-white/80
    `}
        >
          🟡 Arrastra el punto amarillo para cambiar tamaño
          <br />
          🔵 Arrastra el punto azul para mover la zona
        </div>
      )}
    </>
  );
}
