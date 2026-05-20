import { useEffect, useState } from 'react';

export default function useSession({ loadZones, loadCompanyUsers }) {
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem('accessToken'),
  );

  const [appReady, setAppReady] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');

    setIsLogged(false);

    setAppReady(false);
  };

  useEffect(() => {
    const init = async () => {
      if (!isLogged) return;

      try {
        await Promise.all([loadZones(), loadCompanyUsers()]);

        setAppReady(true);
      } catch (err) {
        console.log(err);

        handleLogout();
      }
    };

    init();
  }, [isLogged]);

  return {
    isLogged,
    setIsLogged,

    appReady,

    handleLogout,
  };
}
