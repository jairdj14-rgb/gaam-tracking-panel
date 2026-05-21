import { useEffect, useState } from 'react';
import { ENV } from '../env';

export default function CompaniesPanel({ onClose }) {
  const [companies, setCompanies] = useState([]);

  const [companyName, setCompanyName] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [message, setMessage] = useState(null);

  const loadCompanies = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setCompanies(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const createCompany = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/companies`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          companyName,

          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error creando empresa');
      }

      setMessage({
        type: 'success',
        text: 'Empresa creada',
      });

      setCompanyName('');

      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');

      loadCompanies();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message,
      });
    }
  };

  const toggleCompany = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/companies/${id}/toggle-active`, {
        method: 'PATCH',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error actualizando empresa');
      }

      loadCompanies();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] max-h-[90vh] overflow-hidden rounded-[32px] border border-white/10 bg-[#06111f]/95 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] text-white flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-white/5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
              Super Admin
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Companies Control Center
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
          {message && (
            <div
              className={`p-3 rounded-2xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20'
                  : 'bg-red-500/10 text-red-300 border border-red-400/20'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
            />

            <input
              placeholder="Nombre admin"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
            />

            <input
              placeholder="Email admin"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
            />

            <input
              placeholder="Password admin"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white outline-none"
            />
          </div>

          <button
            onClick={createCompany}
            className="w-full h-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.10] hover:bg-cyan-400/[0.16] text-cyan-300 font-medium transition-all duration-300"
          >
            ➕ Crear empresa
          </button>

          {/* LIST */}
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="rounded-3xl border border-white/6 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-lg font-semibold">
                        {company.name}
                      </div>

                      <div
                        className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                          company.isActive
                            ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                            : 'bg-red-400/10 text-red-300 border border-red-400/20'
                        }`}
                      >
                        {company.isActive ? 'ACTIVA' : 'SUSPENDIDA'}
                      </div>
                    </div>

                    <div className="text-sm text-white/40 mt-2">
                      Usuarios: {company.users?.length || 0}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCompany(company.id)}
                    className={`h-10 px-4 rounded-2xl border text-sm font-medium transition-all ${
                      company.isActive
                        ? 'bg-yellow-500/10 hover:bg-yellow-500/15 border-yellow-400/20 text-yellow-300'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-400/20 text-emerald-300'
                    }`}
                  >
                    {company.isActive ? 'Suspender' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
