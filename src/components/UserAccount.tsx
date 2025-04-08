import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbGet } from '@/lib/indexedDBStorage';

export default function UserAccount() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Buscar nome do perfil
    const getUserProfile = async () => {
      const userProfile = await dbGet('userData', 'profile_userInfo');
      if (userProfile?.name) {
        setUserName(userProfile.name);
      }
    };
    
    getUserProfile();
  }, []);

  // Sempre mostrar link para perfil, independente de estar logado ou não
  return (
    <div className="flex items-center">
      <Link to="/profile" className="flex items-center gap-2 hover:text-foreground">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium cursor-pointer">
          {userName ? userName.split(' ')[0] : 'Perfil'}
        </span>
      </Link>
    </div>
  );
}
