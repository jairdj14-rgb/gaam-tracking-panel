import { useEffect, useState } from 'react';

import { ENV } from '../env';

export default function AuditLogsPanel({ onClose }) {
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/audit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLogs(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes('DELETE')) {
      return 'text-red-300 border-red-400/20 bg-red-500/10';
    }

    if (action.includes('RESET')) {
      return 'text-yellow-300 border-yellow-400/20 bg-yellow-500/10';
    }

    if (action.includes('UPDATE')) {
      return 'text-cyan-300 border-cyan-400/20 bg-cyan-500/10';
    }

    return 'text-emerald-300 border-emerald-400/20 bg-emerald-500/10';
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] max-h-[90vh] overflow-hidden rounded-[32px] border border-white/10 bg-[#06111f]/95 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] text-white flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-white/5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
              Enterprise Audit
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Audit Logs
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center text-white/40 py-10">Sin registros</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="
                  rounded-3xl

                  border border-white/6

                  bg-white/[0.03]

                  p-5

                  hover:bg-white/[0.05]

                  transition-all duration-300
                "
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-3">
                    {/* ACTION */}
                    <div
                      className={`
                        inline-flex items-center gap-2

                        px-3 py-1.5

                        rounded-full

                        border

                        text-xs font-medium

                        ${getActionColor(log.action)}
                      `}
                    >
                      {log.action}
                    </div>

                    {/* USER */}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {log.actor?.name || 'Sistema'}
                      </div>

                      <div className="text-xs text-white/35 mt-1">
                        {log.actor?.email || 'system'}
                      </div>
                    </div>

                    {/* TARGET */}
                    {log.targetType && (
                      <div className="text-xs text-white/45">
                        Target:
                        <span className="text-white/70 ml-1">
                          {log.targetType}
                        </span>
                      </div>
                    )}

                    {/* METADATA */}
                    {log.metadata && (
                      <div className="rounded-2xl bg-black/20 border border-white/5 p-3 overflow-auto">
                        <pre className="text-[11px] text-cyan-200 whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* DATE */}
                  <div className="text-xs text-white/30 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
