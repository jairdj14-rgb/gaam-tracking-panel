import { useState, useEffect } from 'react';
import { ENV } from '../env';

export default function ReportsModal({ onClose }) {
  const today = new Date();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [from, setFrom] = useState(weekAgo.toISOString().split('T')[0]);

  const [to, setTo] = useState(today.toISOString().split('T')[0]);

  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');

  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);

  const [mode, setMode] = useState('visits'); // 'visits' | 'analytics'
  const [errorMsg, setErrorMsg] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  const [showDrilldown, setShowDrilldown] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownItems, setDrilldownItems] = useState([]);

  const token = localStorage.getItem('accessToken');

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

  //  cargar users + zones
  useEffect(() => {
    fetch(`${ENV.API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUsers);

    fetch(`${ENV.API_URL}/zones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setZones);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`${ENV.API_URL}/reports/company-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      setDashboard(json);
    } catch (err) {
      console.log(err);
    }
  };

  const openDrilldown = (title, items) => {
    setDrilldownTitle(title);
    setDrilldownItems(items || []);
    setShowDrilldown(true);
  };

  const buildQuery = () => {
    if (!from || !to) {
      throw new Error('Fechas inválidas');
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    if (startDate > endDate) {
      throw new Error('La fecha inicial no puede ser mayor a la final');
    }

    return `from=${from}&to=${to}${
      userId ? `&userId=${userId}` : ''
    }${zoneId ? `&zoneId=${zoneId}` : ''}`;
  };

  const loadPreview = async () => {
    try {
      const query = buildQuery();

      const res = await fetch(
        `${ENV.API_URL}/reports/visits-summary?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await res.json();

      if (!json.visits?.length) {
        setErrorMsg('No hay visitas en ese rango');
        setData([]);
        return;
      }

      setErrorMsg(null);
      setData(json.visits);
      setMetrics(json.metrics);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const exportExcel = async () => {
    const res = await fetch(
      `${ENV.API_URL}/reports/visits/export?${buildQuery()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitas.xlsx';
    a.click();
  };

  const exportPDF = async () => {
    const res = await fetch(
      `${ENV.API_URL}/reports/visits/export-pdf?${buildQuery()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitas.pdf';
    a.click();
  };

  return (
    <div
      className="
    fixed inset-0 z-[99999]

    flex items-center justify-center

    bg-black/60
    backdrop-blur-md

    p-6
  "
    >
      <div
        className="
    w-[1100px]
    h-[88vh]

    overflow-hidden

    rounded-[32px]

    border border-white/10

    bg-[#06111f]/90
    backdrop-blur-2xl

    shadow-[0_30px_120px_rgba(0,0,0,0.55)]

    flex flex-col
  "
      >
        <div
          className="
    px-7 py-6

    border-b border-white/5

    bg-white/[0.02]
  "
        >
          {/* TOP */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
                Analytics
              </div>

              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Reports Center
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

          {/* TABS */}
          <div
            className="
      flex gap-2

      p-1

      rounded-2xl

      bg-black/20

      border border-white/5
    "
          >
            <button
              onClick={() => {
                setMode('visits');
                setErrorMsg(null);
              }}
              className={`
        flex-1 h-12

        rounded-xl

        text-sm font-medium

        transition-all duration-200

        ${
          mode === 'visits'
            ? `
              bg-cyan-400/15

              border border-cyan-400/20

              text-cyan-300

              shadow-[0_0_20px_rgba(34,211,238,0.15)]
            `
            : `
              text-white/50
              hover:text-white
              hover:bg-white/[0.03]
            `
        }
      `}
            >
              📄 Visitas
            </button>

            <button
              onClick={async () => {
                setMode('analytics');

                setData([]);
                setMetrics(null);
                setErrorMsg(null);

                await loadDashboard();
              }}
              className={`
        flex-1 h-12

        rounded-xl

        text-sm font-medium

        transition-all duration-200

        ${
          mode === 'analytics'
            ? `
              bg-yellow-400/15

              border border-yellow-400/20

              text-yellow-300

              shadow-[0_0_20px_rgba(250,204,21,0.12)]
            `
            : `
              text-white/50
              hover:text-white
              hover:bg-white/[0.03]
            `
        }
      `}
            >
              🧠 Análisis Interno
            </button>
          </div>
        </div>

        <div
          className="
    px-7 py-5

    border-b border-white/5

    bg-black/10
  "
        >
          {errorMsg && (
            <div
              className="
        mb-4

        rounded-2xl

        border border-red-400/20

        bg-red-500/10

        px-4 py-3

        text-sm text-red-300
      "
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* FROM */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">
                Fecha inicio
              </div>

              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
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

            {/* TO */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">
                Fecha fin
              </div>

              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
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

            {/* USERS */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">
                Usuario
              </div>

              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="
          w-full h-12 px-4

          rounded-2xl

          bg-white/[0.04]

          border border-white/10

          text-white

          appearance-none

          focus:border-cyan-400/30

          transition-all
        "
              >
                <option value="">Todos los usuarios</option>

                {users.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    className="bg-[#06111f] text-white"
                  >
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ZONES */}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-2">
                Zona
              </div>

              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="
          w-full h-12 px-4

          rounded-2xl

          bg-white/[0.04]

          border border-white/10

          text-white

          appearance-none

          focus:border-cyan-400/30

          transition-all
        "
              >
                <option value="">Todas las zonas</option>

                {zones.map((z) => (
                  <option
                    key={z.id}
                    value={z.id}
                    className="bg-[#06111f] text-white"
                  >
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mode === 'visits' && (
            <>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {/* PREVIEW */}
                <button
                  onClick={loadPreview}
                  className="
      group

      relative overflow-hidden

      rounded-3xl

      border border-cyan-400/10

      bg-cyan-400/[0.04]

      p-5

      text-left

      transition-all duration-300

      hover:border-cyan-400/30
      hover:bg-cyan-400/[0.08]

      hover:-translate-y-1
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
                    <div className="text-3xl mb-4">🔎</div>

                    <div className="text-white font-semibold mb-1">
                      Vista previa
                    </div>

                    <div className="text-xs text-white/45 leading-5">
                      Genera una visualización rápida del reporte filtrado.
                    </div>
                  </div>
                </button>

                {/* EXCEL */}
                <button
                  onClick={exportExcel}
                  className="
      group

      relative overflow-hidden

      rounded-3xl

      border border-emerald-400/10

      bg-emerald-400/[0.04]

      p-5

      text-left

      transition-all duration-300

      hover:border-emerald-400/30
      hover:bg-emerald-400/[0.08]

      hover:-translate-y-1
    "
                >
                  <div
                    className="
        absolute inset-0

        opacity-0
        group-hover:opacity-100

        transition-opacity duration-500

        bg-gradient-to-r
        from-emerald-400/10
        to-transparent
      "
                  />

                  <div className="relative">
                    <div className="text-3xl mb-4">📗</div>

                    <div className="text-white font-semibold mb-1">
                      Exportar Excel
                    </div>

                    <div className="text-xs text-white/45 leading-5">
                      Descarga datos tabulados para auditoría y análisis.
                    </div>
                  </div>
                </button>

                {/* PDF */}
                <button
                  onClick={exportPDF}
                  className="
      group

      relative overflow-hidden

      rounded-3xl

      border border-purple-400/10

      bg-purple-400/[0.04]

      p-5

      text-left

      transition-all duration-300

      hover:border-purple-400/30
      hover:bg-purple-400/[0.08]

      hover:-translate-y-1
    "
                >
                  <div
                    className="
        absolute inset-0

        opacity-0
        group-hover:opacity-100

        transition-opacity duration-500

        bg-gradient-to-r
        from-purple-400/10
        to-transparent
      "
                  />

                  <div className="relative">
                    <div className="text-3xl mb-4">📄</div>

                    <div className="text-white font-semibold mb-1">
                      Exportar PDF
                    </div>

                    <div className="text-xs text-white/45 leading-5">
                      Genera un reporte ejecutivo listo para compartir.
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
          {mode === 'visits' && (
            <>
              {/* MÉTRICAS */}
              {metrics && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {/* VISITS */}
                  <div
                    className="
      rounded-3xl

      border border-cyan-400/10

      bg-cyan-400/[0.04]

      p-4
    "
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/60 mb-2">
                      Visitas
                    </div>

                    <div className="text-3xl font-semibold text-white">
                      {metrics.totalVisits}
                    </div>
                  </div>

                  {/* TIME */}
                  <div
                    className="
      rounded-3xl

      border border-emerald-400/10

      bg-emerald-400/[0.04]

      p-4
    "
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/60 mb-2">
                      Tiempo total
                    </div>

                    <div className="text-3xl font-semibold text-white">
                      {metrics.totalTime}
                    </div>

                    <div className="text-xs text-white/35 mt-1">minutos</div>
                  </div>

                  {/* AVG */}
                  <div
                    className="
      rounded-3xl

      border border-purple-400/10

      bg-purple-400/[0.04]

      p-4
    "
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-purple-300/60 mb-2">
                      Promedio
                    </div>

                    <div className="text-3xl font-semibold text-white">
                      {metrics.avgTime}
                    </div>

                    <div className="text-xs text-white/35 mt-1">
                      min por visita
                    </div>
                  </div>
                </div>
              )}

              {/* TABLA */}
              <div className="space-y-3">
                {(data || []).map((v, i) => (
                  <div
                    key={i}
                    className="
        group

        relative overflow-hidden

        rounded-3xl

        border border-white/6

        bg-white/[0.03]

        p-4

        transition-all duration-300

        hover:bg-white/[0.05]
        hover:border-cyan-400/15
      "
                  >
                    {/* glow */}
                    <div
                      className="
          absolute inset-0

          opacity-0
          group-hover:opacity-100

          transition-opacity duration-500

          bg-gradient-to-r
          from-cyan-400/5
          to-transparent
        "
                    />

                    <div className="relative flex items-center justify-between gap-4">
                      {/* LEFT */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="
                w-2 h-2 rounded-full

                bg-cyan-400

                shadow-[0_0_10px_rgba(34,211,238,0.9)]
              "
                          />

                          <div className="truncate text-sm font-medium text-white">
                            {v.user}
                          </div>
                        </div>

                        <div className="text-xs text-white/40">
                          Zona visitada: {v.zone}
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right shrink-0">
                        <div
                          className="
              inline-flex items-center

              px-3 py-1.5

              rounded-full

              bg-cyan-400/10

              border border-cyan-400/15

              text-cyan-300 text-xs font-medium
            "
                        >
                          {v.durationMinutes} min
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'analytics' && dashboard && (
            <div className="space-y-4">
              {/* KPI CARDS */}
              <div className="grid grid-cols-2 gap-4">
                {/* FRAUD */}
                <button
                  onClick={() =>
                    openDrilldown('Alertas de fraude', dashboard.fraudUsers)
                  }
                  className="
      group

      relative overflow-hidden

      rounded-3xl

      border border-red-400/10

      bg-red-500/[0.04]

      p-5

      text-left

      transition-all duration-300

      hover:border-red-400/25
      hover:bg-red-500/[0.07]

      hover:-translate-y-1
    "
                >
                  {/* glow */}
                  <div
                    className="
        absolute inset-0

        opacity-0
        group-hover:opacity-100

        transition-opacity duration-500

        bg-gradient-to-r
        from-red-400/10
        to-transparent
      "
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="
            w-12 h-12

            rounded-2xl

            bg-red-500/10

            flex items-center justify-center

            text-2xl
          "
                      >
                        🚨
                      </div>

                      <div className="text-red-300 text-xs">HIGH RISK</div>
                    </div>

                    <div className="text-[11px] uppercase tracking-[0.2em] text-red-300/60 mb-2">
                      Alertas fraude
                    </div>

                    <div className="text-4xl font-semibold text-white">
                      {dashboard.kpis.fraudAlerts}
                    </div>

                    <div className="text-xs text-white/35 mt-3">
                      Eventos sospechosos detectados
                    </div>
                  </div>
                </button>

                {/* INACTIVE */}
                <button
                  onClick={() =>
                    openDrilldown('Usuarios inactivos', dashboard.inactiveUsers)
                  }
                  className="
      group

      relative overflow-hidden

      rounded-3xl

      border border-yellow-400/10

      bg-yellow-500/[0.04]

      p-5

      text-left

      transition-all duration-300

      hover:border-yellow-400/25
      hover:bg-yellow-500/[0.07]

      hover:-translate-y-1
    "
                >
                  {/* glow */}
                  <div
                    className="
        absolute inset-0

        opacity-0
        group-hover:opacity-100

        transition-opacity duration-500

        bg-gradient-to-r
        from-yellow-400/10
        to-transparent
      "
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="
            w-12 h-12

            rounded-2xl

            bg-yellow-500/10

            flex items-center justify-center

            text-2xl
          "
                      >
                        ⚠️
                      </div>

                      <div className="text-yellow-300 text-xs">WARNING</div>
                    </div>

                    <div className="text-[11px] uppercase tracking-[0.2em] text-yellow-300/60 mb-2">
                      Inactividad
                    </div>

                    <div className="text-4xl font-semibold text-white">
                      {dashboard.kpis.inactiveAlerts}
                    </div>

                    <div className="text-xs text-white/35 mt-3">
                      Usuarios sin actividad reciente
                    </div>
                  </div>
                </button>
              </div>

              {/* ZONAS */}
              <div
                className="
    rounded-3xl

    border border-white/8

    bg-white/[0.03]

    p-5
  "
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/60 mb-1">
                      Activity
                    </div>

                    <div className="text-xl font-semibold text-white">
                      Zonas más activas
                    </div>
                  </div>

                  <div
                    className="
        px-3 py-1.5

        rounded-full

        bg-cyan-400/10

        border border-cyan-400/15

        text-cyan-300 text-xs
      "
                  >
                    LIVE
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.topZones.map((z, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!z.users?.length) return;

                        openDrilldown(z.name, z.users);
                      }}
                      className="
          group

          relative overflow-hidden

          w-full

          rounded-2xl

          border border-white/5

          bg-black/20

          px-4 py-4

          text-left

          transition-all duration-300

          hover:border-cyan-400/20
          hover:bg-cyan-400/[0.04]
        "
                    >
                      {/* glow */}
                      <div
                        className="
            absolute inset-0

            opacity-0
            group-hover:opacity-100

            transition-opacity duration-500

            bg-gradient-to-r
            from-cyan-400/5
            to-transparent
          "
                      />

                      <div className="relative flex items-center justify-between">
                        {/* LEFT */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className="
                w-10 h-10 shrink-0

                rounded-2xl

                bg-cyan-400/10

                border border-cyan-400/15

                flex items-center justify-center

                text-cyan-300 font-semibold
              "
                          >
                            #{i + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {z.name}
                            </div>

                            <div className="text-xs text-white/35 mt-1">
                              Zona con alta actividad registrada
                            </div>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-semibold text-cyan-300">
                            {z.visits}
                          </div>

                          <div className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                            visitas
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIESGO */}
              <div
                className="
    rounded-3xl

    border border-white/8

    bg-white/[0.03]

    p-5
  "
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-red-300/60 mb-1">
                      Monitoring
                    </div>

                    <div className="text-xl font-semibold text-white">
                      Riesgo operativo
                    </div>
                  </div>

                  <div
                    className="
        px-3 py-1.5

        rounded-full

        bg-red-500/10

        border border-red-400/15

        text-red-300 text-xs
      "
                  >
                    SECURITY
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.suspiciousUsers.map((u, i) => {
                    const riskLevel =
                      u.risk >= 6
                        ? {
                            color: 'text-red-300',
                            bg: 'bg-red-500/10',
                            border: 'border-red-400/15',
                            label: 'HIGH',
                          }
                        : u.risk >= 3
                          ? {
                              color: 'text-yellow-300',
                              bg: 'bg-yellow-500/10',
                              border: 'border-yellow-400/15',
                              label: 'MEDIUM',
                            }
                          : {
                              color: 'text-emerald-300',
                              bg: 'bg-emerald-500/10',
                              border: 'border-emerald-400/15',
                              label: 'LOW',
                            };

                    return (
                      <div
                        key={i}
                        className="
            group

            relative overflow-hidden

            rounded-2xl

            border border-white/5

            bg-black/20

            px-4 py-4

            transition-all duration-300

            hover:border-white/10
          "
                      >
                        {/* glow */}
                        <div
                          className="
              absolute inset-0

              opacity-0
              group-hover:opacity-100

              transition-opacity duration-500

              bg-gradient-to-r
              from-red-400/5
              to-transparent
            "
                        />

                        <div className="relative flex items-center justify-between">
                          {/* LEFT */}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white">
                              {u.name}
                            </div>

                            <div className="text-xs text-white/35 mt-1">
                              Riesgo operativo detectado
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div
                              className={`
                  px-3 py-1.5

                  rounded-full

                  border

                  text-xs font-medium

                  ${riskLevel.bg}
                  ${riskLevel.border}
                  ${riskLevel.color}
                `}
                            >
                              {riskLevel.label}
                            </div>

                            <div
                              className={`
                  text-2xl font-semibold

                  ${riskLevel.color}
                `}
                            >
                              {u.risk}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* TIMELINE */}
              <div
                className="
    rounded-3xl

    border border-white/8

    bg-white/[0.03]

    p-5
  "
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/60 mb-1">
                      Activity Stream
                    </div>

                    <div className="text-xl font-semibold text-white">
                      Actividad reciente
                    </div>
                  </div>

                  <div
                    className="
        px-3 py-1.5

        rounded-full

        bg-cyan-400/10

        border border-cyan-400/15

        text-cyan-300 text-xs
      "
                  >
                    LIVE FEED
                  </div>
                </div>

                <div className="space-y-3">
                  {(dashboard.timeline || []).map((t, i) => (
                    <div
                      key={i}
                      className="
          group

          relative overflow-hidden

          rounded-2xl

          border border-white/5

          bg-black/20

          px-4 py-4

          transition-all duration-300

          hover:border-cyan-400/15
          hover:bg-cyan-400/[0.03]
        "
                    >
                      {/* glow */}
                      <div
                        className="
            absolute inset-0

            opacity-0
            group-hover:opacity-100

            transition-opacity duration-500

            bg-gradient-to-r
            from-cyan-400/5
            to-transparent
          "
                      />

                      <div className="relative flex items-start gap-4">
                        {/* DOT */}
                        <div
                          className="
              mt-1

              w-2.5 h-2.5 shrink-0

              rounded-full

              bg-cyan-400

              shadow-[0_0_12px_rgba(34,211,238,0.9)]
            "
                        />

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white leading-6">
                            {t.message}
                          </div>

                          <div className="text-[11px] text-white/35 mt-2">
                            {new Date(t.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDrilldown && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999]">
          <div className="bg-gray-900 w-[500px] max-h-[70vh] rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{drilldownTitle}</h2>

              <button
                onClick={() => setShowDrilldown(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {drilldownItems.length === 0 && (
                <div className="text-gray-500 text-sm">Sin registros</div>
              )}

              {drilldownItems.map((item, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3">
                  {typeof item === 'string'
                    ? item
                    : item.name || JSON.stringify(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
