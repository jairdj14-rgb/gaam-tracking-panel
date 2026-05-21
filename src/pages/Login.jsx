import { useState } from 'react';
import toast from 'react-hot-toast';
import { ENV } from '../env';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toast.error('Completa los campos');
        return;
      }

      const loading = toast.loading('Iniciando sesión...');

      const res = await fetch(`${ENV.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      toast.dismiss(loading);

      if (!data.accessToken) {
        toast.error('Credenciales inválidas');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);

      localStorage.setItem('refreshToken', data.refreshToken);

      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Bienvenido');

      setTimeout(() => {
        onLogin();
      }, 600);
    } catch (err) {
      console.log(err);

      toast.error('Error de conexión');
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex items-center justify-center
      bg-[#020817]
      relative
      overflow-hidden
    "
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-blue-600/20 blur-3xl rounded-full bottom-[-120px] right-[-120px]" />

      {/* CARD */}
      <div
        className="
        relative z-10

        w-[400px]
        rounded-3xl

        border border-white/10
        bg-white/5

        backdrop-blur-xl

        shadow-2xl

        p-8
      "
      >
        {/* LOGO */}
        <div className="mb-8">
          <div
            className="
            w-14 h-14
            rounded-2xl
            bg-cyan-500/20
            border border-cyan-400/20

            flex items-center justify-center

            text-2xl
            mb-4
          "
          >
            🌐
          </div>

          <h1 className="text-3xl font-semibold text-white">GAAMTracking</h1>

          <p className="text-gray-400 mt-2 text-sm">
            Plataforma inteligente de monitoreo operativo
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="
            mb-4
            bg-red-500/10
            border border-red-500/20
            text-red-300
            p-3
            rounded-xl
            text-sm
          "
          >
            ⚠️ {error}
          </div>
        )}

        {/* INPUTS */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 mb-2">
                Correo empresarial
              </div>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="empresa@correo.com"
                className="
              w-full
              bg-black/20
              border border-white/10

              rounded-xl
              p-3

              text-white
              placeholder:text-gray-500

              outline-none
              focus:border-cyan-400/40
              transition
            "
              />
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">Contraseña</div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
              w-full
              bg-black/20
              border border-white/10

              rounded-xl
              p-3

              text-white
              placeholder:text-gray-500

              outline-none
              focus:border-cyan-400/40
              transition
            "
              />
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              type="submit"
              className="
          w-full
          mt-6

          bg-cyan-500
          hover:bg-cyan-400

          text-black
          font-semibold

          rounded-xl
          p-3

          transition
          shadow-lg
          shadow-cyan-500/20

          
        "
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Secure enterprise monitoring platform
        </div>
      </div>
    </div>
  );
}
