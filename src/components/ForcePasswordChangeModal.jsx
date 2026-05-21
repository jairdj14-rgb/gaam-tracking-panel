import { useState } from 'react';
import toast from 'react-hot-toast';
import { ENV } from '../env';

export default function ForcePasswordChangeModal({ onSuccess }) {
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (password.length < 8) {
        toast.error('Mínimo 8 caracteres');

        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords no coinciden');

        return;
      }

      setLoading(true);

      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${ENV.API_URL}/auth/change-password`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error');
      }

      toast.success('Password actualizada');

      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[999999]

        bg-black/70
        backdrop-blur-xl

        flex items-center justify-center

        p-4
      "
    >
      <div
        className="
          w-full max-w-md

          rounded-[32px]

          border border-white/10

          bg-[#06111f]/95

          backdrop-blur-2xl

          shadow-[0_20px_80px_rgba(0,0,0,0.55)]

          p-8

          text-white
        "
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔒</div>

          <h2 className="text-2xl font-semibold">Actualiza tu contraseña</h2>

          <p className="text-white/50 mt-3 text-sm">
            Por seguridad debes cambiar tu password temporal antes de continuar.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full h-12 px-4

              rounded-2xl

              bg-white/[0.04]

              border border-white/10

              text-white

              outline-none
            "
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              w-full h-12 px-4

              rounded-2xl

              bg-white/[0.04]

              border border-white/10

              text-white

              outline-none
            "
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full h-14

              rounded-2xl

              bg-cyan-500
              hover:bg-cyan-400

              text-black
              font-semibold

              transition-all
            "
          >
            {loading ? 'Actualizando...' : 'Actualizar password'}
          </button>
        </div>
      </div>
    </div>
  );
}
