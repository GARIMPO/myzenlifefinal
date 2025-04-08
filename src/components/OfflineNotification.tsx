import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Esconder notificação após 5 segundos
      setTimeout(() => setShowNotification(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Se estiver online e não precisar mostrar notificação, não renderiza nada
  if (isOnline && !showNotification) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all ${
          isOnline 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={16} className="text-green-600 dark:text-green-400" />
            <span>Conexão restabelecida! Seus dados estão sincronizados.</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Você está offline. Seus dados continuam sendo salvos localmente.</span>
          </>
        )}
      </div>
    </div>
  );
} 