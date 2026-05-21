import { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import AlertOverlay from './components/AlertOverlay';
import Login from './pages/Login';
import ZoneEditorModal from './components/ZoneEditorModal';
import UsersPanel from './components/UsersPanel';
import ReportsModal from './components/ReportsModal';
import CompanySettingsModal from './components/CompanySettingsModal';
import SessionWatcher from './components/SessionWatcher';
import toast from 'react-hot-toast';
import UserDetailsModal from './components/UserDetailsModal';
import CreateZoneModal from './components/CreateZoneModal';
import useZones from './hooks/useZones';
import useMaps from './hooks/useMaps';
import useSocketUsers from './hooks/useSocketUsers';
import useEvidence from './hooks/useEvidence';
import useCompany from './hooks/useCompany';
import useSession from './hooks/useSession';
import useTimeline from './hooks/useTimeline';
import { socket } from './socket';
import { ENV } from './env';
import CompaniesPanel from './components/CompaniesPanel';
import AuditLogsPanel from './components/AuditLogsPanel';
import GlobalAdminsModal from './components/GlobalAdminsModal';
import GlobalReportsModal from './components/GlobalReportsModal';

export default function App() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [followUserId, setFollowUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [alert, setAlert] = useState(null);

  const [showCompaniesPanel, setShowCompaniesPanel] = useState(false);

  const [showGlobalAdmins, setShowGlobalAdmins] = useState(false);

  const [showAuditPanel, setShowAuditPanel] = useState(false);

  const [showUsersPanel, setShowUsersPanel] = useState(false);

  const [zoneEvents, setZoneEvents] = useState([]);
  const [zoneToast, setZoneToast] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  const [showReports, setShowReports] = useState(false);
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  const [showGlobalReports, setShowGlobalReports] = useState(false);

  const lastClickRef = useRef(0);

  const {
    zones,
    setZones,

    selectedZone,
    setSelectedZone,

    originalZone,
    setOriginalZone,

    isEditingZone,
    setIsEditingZone,

    isAdjustingZone,
    setIsAdjustingZone,

    creatingZone,
    setCreatingZone,

    tempZone,
    setTempZone,

    flyToZone,
    setFlyToZone,

    loadZones,
    createZone,
  } = useZones();

  const {
    search,
    setSearch,

    searchResults,
    setSearchResults,

    selectPlace,
  } = useMaps({
    setTempZone,
    setFlyToZone,
  });

  const {
    companyUsers,

    loadCompanyUsers,
  } = useCompany();

  const {
    isLogged,
    setIsLogged,

    appReady,

    handleLogout,
  } = useSession({
    loadZones,
    loadCompanyUsers,
  });

  const {
    users,
    setUsers,

    role,
  } = useSocketUsers({
    isLogged,
  });

  const liveUser = selectedUserId ? users[selectedUserId] : null;

  const {
    timeline,
    setTimeline,

    loadingTimeline,

    loadTimeline,
  } = useTimeline();

  useEffect(() => {
    if (!selectedUserId) return;

    loadTimeline(selectedUserId);
  }, [selectedUserId]);

  useEffect(() => {
    const handleAlert = (alert) => {
      if (alert.userId !== selectedUserId) return;

      setTimeline((prev) => [
        {
          type: 'ALERT',
          timestamp: alert.createdAt,
          data: alert,
        },

        ...prev,
      ]);
    };

    socket.on('alert_created', handleAlert);

    return () => {
      socket.off('alert_created', handleAlert);
    };
  }, [selectedUserId]);

  useEffect(() => {
    const handleZoneEvent = (event) => {
      if (event.userId !== selectedUserId) return;

      setTimeline((prev) => [
        {
          type: 'ZONE',
          timestamp: event.createdAt,
          data: event,
        },

        ...prev,
      ]);
    };

    socket.on('zone_event', handleZoneEvent);

    return () => {
      socket.off('zone_event', handleZoneEvent);
    };
  }, [selectedUserId]);
  const handleSelectUser = async (user) => {
    if (!user?.userId) return;

    setSelectedUserId(user.userId);

    await loadTimeline(user.userId);
  };

  const {
    evidences,

    loadEvidences,

    handleUpload,

    userEvidences,

    hasRecentEvidence,

    evidencesByZone,
  } = useEvidence({
    selectedUserId,
    liveUser,
  });

  useEffect(() => {
    if (!isLogged) return;

    loadEvidences();
  }, [isLogged]);

  const exportVisits = async () => {
    const token = localStorage.getItem('accessToken');

    if (!reportFrom || !reportTo) {
      toast.success('Selecciona fechas');
      return;
    }

    try {
      const res = await fetch(
        `${ENV.API_URL}/reports/visits/export?from=${reportFrom}&to=${reportTo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'visitas.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log('❌ error exportando', err);
    }
  };

  const getUserName = (userId) => {
    const user = Object.values(users).find((u) => u.userId === userId);
    return user?.name || userId;
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.name || zoneId;
  };

  useEffect(() => {
    const saved = localStorage.getItem('zoneEvents');

    if (saved) {
      setZoneEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleZoneEvent = (event) => {
      setZoneEvents((prev) => {
        const updated = [event, ...prev];

        localStorage.setItem('zoneEvents', JSON.stringify(updated));

        return updated;
      });

      setZoneToast(event);

      setTimeout(() => {
        setZoneToast(null);
      }, 4000);
    };

    socket.on('zone_event', handleZoneEvent);

    return () => {
      socket.off('zone_event', handleZoneEvent);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const zoneId = e.detail;

      setZones((prev) => prev.filter((z) => z.id !== zoneId));
      setSelectedZone(null);
    };

    window.addEventListener('zoneDeleted', handler);

    return () => {
      window.removeEventListener('zoneDeleted', handler);
    };
  }, []);

  useEffect(() => {
    const handler = async (e) => {
      const zone = e.detail;
      const token = localStorage.getItem('accessToken');

      try {
        await fetch(`${ENV.API_URL}/zones/${zone.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: zone.name,
            centerLat: zone.lat,
            centerLng: zone.lng,
            radius: zone.radius,
          }),
        });

        setZones((prev) => prev.map((z) => (z.id === zone.id ? zone : z)));
      } catch (err) {
        console.log('❌ error guardando zona', err);
      }
    };

    window.addEventListener('saveZone', handler);

    return () => {
      window.removeEventListener('saveZone', handler);
    };
  }, []);

  //  LOGIN GATE
  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  if (!appReady) {
    return (
      <div
        className="
        h-screen w-screen

        flex items-center justify-center

        bg-[#030712]

        overflow-hidden
      "
      >
        {/* glow */}
        <div
          className="
          absolute

          w-[500px] h-[500px]

          rounded-full

          bg-cyan-400/10

          blur-3xl
        "
        />

        <div className="relative flex flex-col items-center">
          {/* radar */}
          <div className="relative">
            <div
              className="
              w-28 h-28

              rounded-full

              border border-cyan-400/20
            "
            />

            <div
              className="
              absolute inset-0

              rounded-full

              border-t border-cyan-400

              animate-spin
            "
            />

            <div
              className="
              absolute inset-4

              rounded-full

              border border-cyan-400/10
            "
            />

            <div
              className="
              absolute inset-8

              rounded-full

              bg-cyan-400/20

              blur-md
            "
            />
          </div>

          <div className="mt-8 text-center">
            <div
              className="
              text-xs uppercase

              tracking-[0.35em]

              text-cyan-300/50
            "
            >
              GAAMTracking
            </div>

            <div className="mt-2 text-white/90 text-lg font-medium">
              Inicializando panel
            </div>

            <div className="mt-1 text-sm text-white/35">
              Conectando nodos de rastreo...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANEL
  return (
    <div className="fixed inset-0 bg-[#020817] text-white overflow-hidden">
      {/* OPEN BUTTON */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="
          fixed top-5 left-5 z-[9999]

          h-12 px-5

          flex items-center gap-3

          rounded-2xl

          bg-[#06111f]/85
          backdrop-blur-2xl

          border border-white/10

          text-white/85
          hover:text-white

          shadow-[0_10px_40px_rgba(0,0,0,0.35)]

          hover:bg-white/[0.06]

          transition-all duration-200

          active:scale-[0.97]
        "
        >
          <span className="text-lg">☰</span>

          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] tracking-[0.25em] text-cyan-300/60 uppercase">
              GAAM
            </span>

            <span className="text-sm font-medium">Control Center</span>
          </div>
        </button>
      )}

      {/* BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="
          fixed inset-0 z-[9997]

          bg-black/50
          backdrop-blur-[2px]

          animate-in fade-in duration-200
        "
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        users={users}
        setFollowUserId={setFollowUserId}
        creatingZone={creatingZone}
        onLogout={handleLogout}
        setCreatingZone={setCreatingZone}
        tempZone={tempZone}
        setTempZone={setTempZone}
        loadZones={loadZones}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        originalZone={originalZone}
        zones={zones}
        setZones={setZones}
        isEditingZone={isEditingZone}
        setIsEditingZone={setIsEditingZone}
        setOriginalZone={setOriginalZone}
        setFlyToZone={setFlyToZone}
        role={currentUser?.role}
        setShowUsersPanel={setShowUsersPanel}
        setShowCompaniesPanel={setShowCompaniesPanel}
        setShowGlobalAdmins={setShowGlobalAdmins}
        setShowGlobalReports={setShowGlobalReports}
        setShowAuditPanel={setShowAuditPanel}
        zoneEvents={zoneEvents}
        onSelectUser={handleSelectUser}
        evidences={evidences}
        exportVisits={exportVisits}
        setReportFrom={setReportFrom}
        setReportTo={setReportTo}
        setShowReports={setShowReports}
        setShowCompanySettings={setShowCompanySettings}
        setSidebarOpen={setSidebarOpen}
        search={search}
        setSearch={setSearch}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setIsAdjustingZone={setIsAdjustingZone}
      />
      <div className="w-full h-full bg-[#020617]">
        <MapView
          users={users}
          setUsers={setUsers}
          followUserId={followUserId}
          setAlert={setAlert}
          setFollowUserId={setFollowUserId}
          creatingZone={creatingZone}
          tempZone={tempZone}
          setTempZone={setTempZone}
          zones={zones}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          setOriginalZone={setOriginalZone}
          isEditingZone={isEditingZone}
          setIsEditingZone={setIsEditingZone}
          flyToZone={flyToZone}
          isAdjustingZone={isAdjustingZone}
          setIsAdjustingZone={setIsAdjustingZone}
          lastClickRef={lastClickRef}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      <SessionWatcher onLogout={handleLogout} />

      {showUsersPanel && (
        <UsersPanel onClose={() => setShowUsersPanel(false)} />
      )}
      {showCompaniesPanel && (
        <CompaniesPanel onClose={() => setShowCompaniesPanel(false)} />
      )}
      {showGlobalAdmins && (
        <GlobalAdminsModal onClose={() => setShowGlobalAdmins(false)} />
      )}
      {showAuditPanel && (
        <AuditLogsPanel onClose={() => setShowAuditPanel(false)} />
      )}
      {showGlobalReports && (
        <GlobalReportsModal onClose={() => setShowGlobalReports(false)} />
      )}
      {showCompanySettings && (
        <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />
      )}

      {showReports && <ReportsModal onClose={() => setShowReports(false)} />}

      {alert && <AlertOverlay alert={alert} />}

      {creatingZone && (
        <CreateZoneModal
          search={search}
          setSearch={setSearch}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          tempZone={tempZone}
          setTempZone={setTempZone}
          setFlyToZone={setFlyToZone}
          setCreatingZone={setCreatingZone}
          onSave={() =>
            createZone(tempZone, () => {
              setSearch('');
              setSearchResults([]);
            })
          }
          selectPlace={selectPlace}
        />
      )}

      {zoneToast ? (
        <div
          className="
      fixed top-5 right-5 z-[9999]
      px-4 py-3 rounded-2xl

      bg-gradient-to-br from-white/10 to-white/5
      backdrop-blur-xl

      border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]

      text-white
      animate-slideIn
    "
        >
          <div
            className={`flex items-center gap-2 pl-3 border-l-4 ${
              zoneToast.type === 'ENTER' ? 'border-green-400' : 'border-red-400'
            }`}
          >
            <span className="text-lg">
              {zoneToast.type === 'ENTER' ? '🟢' : '🔴'}
            </span>

            <div>
              <div className="font-semibold text-white">
                {getUserName(zoneToast.userId)}
              </div>

              <div
                className={`text-xs ${
                  zoneToast.type === 'ENTER' ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {zoneToast.type === 'ENTER' ? 'Entró a' : 'Salió de'}{' '}
                {getZoneName(zoneToast.zoneId)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedZone &&
        isEditingZone &&
        !isAdjustingZone &&
        role === 'ADMIN' && (
          <ZoneEditorModal
            zone={selectedZone}
            setZone={setSelectedZone}
            setIsAdjustingZone={setIsAdjustingZone}
            setFlyToZone={setFlyToZone}
            setSidebarOpen={setSidebarOpen}
            users={companyUsers}
            onClose={() => setIsEditingZone(false)}
            onSave={async (updatedZone) => {
              const token = localStorage.getItem('accessToken');

              try {
                const res = await fetch(
                  `${ENV.API_URL}/zones/${updatedZone.id}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name: updatedZone.name,
                      centerLat: updatedZone.lat,
                      centerLng: updatedZone.lng,
                      radius: updatedZone.radius,
                      users: updatedZone.users,
                    }),
                  },
                );

                const data = await res.json();
                if (!res.ok) {
                  throw new Error('Unauthorized');
                }

                await loadZones();

                setIsEditingZone(false);
                setSelectedZone(null);
              } catch (err) {
                console.log('❌ error guardando zona', err);
              }
            }}
          />
        )}
      {selectedUserId && (
        <UserDetailsModal
          liveUser={liveUser}
          hasRecentEvidence={hasRecentEvidence}
          userEvidences={userEvidences}
          evidencesByZone={evidencesByZone}
          getZoneName={getZoneName}
          handleUpload={handleUpload}
          onClose={() => setSelectedUserId(null)}
          timeline={timeline}
          loadingTimeline={loadingTimeline}
          selectedUserId={selectedUserId}
        />
      )}
    </div>
  );
}
