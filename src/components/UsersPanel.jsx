import { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ENV } from '../env';

export default function UsersPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [workMode, setWorkMode] = useState('FIELD');
  const [message, setMessage] = useState(null);

  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${ENV.API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setUsers(data);
  }, []);

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const decoded = jwtDecode(token);

    setCurrentUserId(decoded?.sub ?? null);
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  //  CREATE
  const createUser = async () => {
    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Faltan campos' });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, role, workMode, }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          Array.isArray(err.message)
            ? err.message[0]
            : err.message || 'Error creando usuario',
        );
      }

      setMessage({ type: 'success', text: 'Usuario creado' });

      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
      setWorkMode('FIELD');

      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const toggleUser = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/users/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error actualizando usuario');
      }

      setMessage({
        type: 'success',
        text: data.isActive ? 'Usuario activado' : 'Usuario desactivado',
      });

      loadUsers();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message,
      });
    }
  };

  //  DELETE
  const deleteUser = async (id) => {
    const confirmDelete = confirm('¿Seguro que deseas eliminar este usuario?');

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();

        throw new Error(err.message || 'Error eliminando usuario');
      }

      setMessage({
        type: 'success',
        text: 'Usuario eliminado',
      });

      loadUsers();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message,
      });
    }
  };

  const resetPassword = async (id) => {
    const confirmReset = confirm('¿Resetear password de este usuario?');

    if (!confirmReset) return;

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/users/${id}/reset-password`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error reseteando password');
      }

      alert(`Password temporal:\n\n${data.temporaryPassword}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const editUser = async (user) => {
  const name = prompt('Nombre', user.name);

  if (!name) return;

  const email = prompt('Email', user.email);

  if (!email) return;

  try {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(
      `${ENV.API_URL}/users/${user.id}/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    loadUsers();

    setMessage({
      type: 'success',
      text: 'Usuario actualizado',
    });
  } catch (err) {
    setMessage({
      type: 'error',
      text: err.message,
    });
  }
};

  //  UPDATE ROLE
  const updateRole = async (id, newRole) => {
    const token = localStorage.getItem('accessToken');

    await fetch(`${ENV.API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    loadUsers();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
      <div
        className="
        w-full max-w-[900px]

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
          flex items-start justify-between

          px-7 py-6

          border-b border-white/5
        "
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/60 mb-1">
              Administration
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Users Control Center
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
        <div
          className="
          flex-1 overflow-y-auto

          px-7 py-6

          space-y-4
        "
        >
          {message && (
            <div
              className={`mb-3 p-2 rounded text-sm ${
                message.type === 'success' ? 'bg-green-700' : 'bg-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* FORM */}
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
  w-full h-12 px-4

  rounded-2xl

  bg-white/[0.04]

  border border-white/10

  text-white

  appearance-none

  outline-none

  focus:border-cyan-400/30
  focus:bg-cyan-400/[0.03]

  transition-all
"
          >
            <option value="USER" className="bg-[#06111f] text-white">
              USER
            </option>
            <option value="SUPERVISOR" className="bg-[#06111f] text-white">
              SUPERVISOR
            </option>
            <option value="ADMIN" className="bg-[#06111f] text-white">
              ADMIN
            </option>
          </select>

          <select
  value={workMode}
  onChange={(e) => setWorkMode(e.target.value)}
  className="
w-full h-12 px-4

rounded-2xl

bg-[#06111f]

border border-white/10

text-white

outline-none

focus:border-cyan-400/30
focus:bg-cyan-400/[0.03]

transition-all
"
>
  <option value="FIELD" className="bg-[#06111f] text-white">
    CAMPO (GPS)
  </option>

  <option value="OFFICE" className="bg-[#06111f] text-white">
    OFICINA / HOME OFFICE
  </option>

  <option value="HYBRID" className="bg-[#06111f] text-white">
    HÍBRIDO
  </option>
</select>

          <button
            onClick={createUser}
            className="
  group

  relative overflow-hidden

  w-full h-14 mb-5

  rounded-2xl

  border border-emerald-400/15

  bg-emerald-400/[0.08]

  text-emerald-300

  font-medium

  transition-all duration-300

  hover:bg-emerald-400/[0.14]
  hover:border-emerald-400/30
"
          >
            ➕ Crear usuario
          </button>

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto">
            {users.map((u) => (
              <div
                key={u.id}
                className="
  group

  relative overflow-hidden

  rounded-3xl

  flex items-center justify-between gap-4

  border border-white/6

  bg-white/[0.03]

  p-5 mb-4

  transition-all duration-300

  hover:bg-white/[0.05]
  hover:border-cyan-400/15
"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-medium text-white">
                      {u.name}
                    </div>

                    <div
                      className={`
        px-2 py-1 rounded-full text-[10px] font-medium

        ${
          u.isActive
            ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
            : 'bg-red-400/10 text-red-300 border border-red-400/20'
        }
      `}
                    >
                      {u.isActive ? 'ACTIVO' : 'DESACTIVADO'}
                    </div>

                    {u.role === 'ADMIN' && (
                      <div className="px-2 py-1 rounded-full text-[10px] bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                        ADMIN
                      </div>
                    )}

                    {u.role === 'SUPERVISOR' && (
                      <div className="px-2 py-1 rounded-full text-[10px] bg-indigo-400/10 text-indigo-300 border border-indigo-400/20">
                        SUPERVISOR
                      </div>
                    )}

                    {u.role === 'USER' && (
                      <div className="px-2 py-1 rounded-full text-[10px] bg-white/10 text-white/70 border border-white/10">
                        USER
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-white/35 mt-2 truncate">
                    {u.email}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      Tú
                    </span>
                  ) : (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="
  px-3 py-1.5

  rounded-full

  bg-cyan-400/10

  border border-cyan-400/15

  text-cyan-300 text-xs
"
                      >
                        <option
                          value="USER"
                          className="bg-[#06111f] text-white"
                        >
                          USER
                        </option>
                        <option
                          value="SUPERVISOR"
                          className="bg-[#06111f] text-white"
                        >
                          SUPERVISOR
                        </option>
                        <option
                          value="ADMIN"
                          className="bg-[#06111f] text-white"
                        >
                          ADMIN
                        </option>

                        
                      </select>

                      <select
  value={u.workMode || 'FIELD'}
  onChange={async (e) => {
    const token = localStorage.getItem('accessToken');

    await fetch(`${ENV.API_URL}/users/${u.id}/work-mode`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        workMode: e.target.value,
      }),
    });

    loadUsers();
  }}
  className="
    px-3 py-1.5

rounded-xl

    appearance-none
bg-[#06111f]


    border border-indigo-400/15

    text-indigo-300 text-xs
  "
>
  <option value="FIELD" className="bg-[#06111f] text-white">
    FIELD
  </option>

  <option value="OFFICE" className="bg-[#06111f] text-white">
    OFFICE
  </option>

  <option value="HYBRID" className="bg-[#06111f] text-white">
    HYBRID
  </option>
</select>

                      <button
                          onClick={() => toggleUser(u.id)}
                          className={`
    h-9 px-3

    rounded-xl

    border

    text-xs font-medium

    transition-all duration-200

    ${
      u.isActive
        ? `
          bg-yellow-500/10
          hover:bg-yellow-500/15

          border-yellow-400/20

          text-yellow-300
        `
        : `
          bg-emerald-500/10
          hover:bg-emerald-500/15

          border-emerald-400/20

          text-emerald-300
        `
    }
  `}
                        >
                          {u.isActive ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
  onClick={() => editUser(u)}
  className="
    h-9 px-3

    rounded-xl

    bg-indigo-500/10
    hover:bg-indigo-500/15

    border border-indigo-400/20

    text-indigo-300
    text-xs

    transition-all duration-200
  "
>
  ✏️
</button>

                      <button
                        onClick={() => deleteUser(u.id)}
                        className="
  w-9 h-9

  rounded-xl

  bg-red-500/10
  hover:bg-red-500/15

  border border-red-400/15

  text-red-300

  transition-all duration-200
"
                      >
                        🗑
                      </button>

                      <button
                        onClick={() => resetPassword(u.id)}
                        className="
    h-9 px-3

    rounded-xl

    bg-cyan-400/10
    hover:bg-cyan-400/15

    border border-cyan-400/20

    text-cyan-300
    text-xs font-medium

    transition-all duration-200
  "
                      >
                        Reset password
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
