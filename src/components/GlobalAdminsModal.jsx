import { useEffect, useState } from 'react';
import { ENV } from '../env';
import toast from 'react-hot-toast';

export default function GlobalAdminsModal({ onClose }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken');

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${ENV.API_URL}/users/global-admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setAdmins(data);
    } catch (err) {
      console.error(err);

      toast.error('Error cargando admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const toggleActive = async (id) => {
    try {
      await fetch(`${ENV.API_URL}/users/${id}/toggle-active`, {
        method: 'PATCH',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Estado actualizado');

      loadAdmins();
    } catch {
      toast.error('Error');
    }
  };

  const resetPassword = async (id) => {
    try {
      const res = await fetch(`${ENV.API_URL}/users/${id}/reset-password`, {
        method: 'PATCH',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      toast.success(`Password temporal: ${data.temporaryPassword}`, {
        duration: 6000,
      });
    } catch {
      toast.error('Error');
    }
  };

  const updateRole = async (id, role) => {
    try {
      await fetch(`${ENV.API_URL}/users/${id}`, {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({ role }),
      });

      toast.success('Rol actualizado');

      loadAdmins();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[99999]

        bg-black/50
        backdrop-blur-sm

        flex items-center justify-center

        p-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-6xl

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
            flex items-center justify-between

            px-8 py-6

            border-b border-white/10
          "
        >
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-cyan-300/60 mb-1">
              Enterprise Control
            </div>

            <h2 className="text-3xl font-semibold">👑 Admins Globales</h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-11 h-11

              rounded-2xl

              bg-white/5
              hover:bg-white/10

              border border-white/10

              transition-all
            "
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-white/40">Cargando...</div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="
                    rounded-3xl

                    border border-white/10

                    bg-white/[0.03]

                    p-5

                    flex flex-col lg:flex-row
                    lg:items-center
                    lg:justify-between

                    gap-4
                  "
                >
                  <div>
                    <div className="text-lg font-semibold">{admin.name}</div>

                    <div className="text-sm text-white/40">{admin.email}</div>

                    <div className="mt-2 text-xs text-cyan-300">
                      🏢 {admin.company?.name || 'GLOBAL'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={admin.role}
                      onChange={(e) => updateRole(admin.id, e.target.value)}
                      className="
                        h-11 px-4

                        rounded-2xl

                        bg-black/30

                        border border-white/10

                        text-white
                      "
                    >
                      <option value="ADMIN">ADMIN</option>

                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>

                    <button
                      onClick={() => toggleActive(admin.id)}
                      className={`
                        h-11 px-5

                        rounded-2xl

                        border

                        transition-all

                        ${
                          admin.isActive
                            ? `
                              bg-green-500/10
                              border-green-400/20
                              text-green-300
                            `
                            : `
                              bg-red-500/10
                              border-red-400/20
                              text-red-300
                            `
                        }
                      `}
                    >
                      {admin.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </button>

                    <button
                      onClick={() => resetPassword(admin.id)}
                      className="
                        h-11 px-5

                        rounded-2xl

                        bg-cyan-400/10
                        hover:bg-cyan-400/20

                        border border-cyan-400/20

                        text-cyan-300

                        transition-all
                      "
                    >
                      🔑 Reset password
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
