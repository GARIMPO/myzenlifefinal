import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Home,
  Lightbulb,
  Target,
  ListTodo,
  Heart,
  Timer,
  Salad,
  Utensils,
  Wrench,
  ExternalLink,
  Instagram,
  User,
  ShoppingCart
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { getGoals } from '@/lib/goalStorage';
import { getHabits } from '@/lib/habitStorage';
import { getTasks } from '@/lib/taskStorage';
import { getIdeas } from '@/lib/ideaStorage';
import { getGratitudeEntries } from '@/lib/gratitudeStorage';
import { dbGet } from '@/lib/indexedDBStorage';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({
    goals: 0,
    habits: 0,
    tasks: 0,
    ideas: 0,
    gratitude: 0
  });
  const [userFirstName, setUserFirstName] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState('');
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get user info
  useEffect(() => {
    const getUserInfo = async () => {
      // Buscar do perfil do usuário
      const userProfile = await dbGet('userData', 'profile_userInfo');
      
      if (userProfile) {
        // Se houver um nome no perfil, usa o primeiro nome
        if (userProfile.name) {
          const firstName = userProfile.name.split(' ')[0];
          setUserFirstName(firstName);
        }
        
        // Se houver uma foto no perfil
        if (userProfile.photoUrl) {
          setUserPhotoUrl(userProfile.photoUrl);
        }
      }
    };
    
    getUserInfo();
  }, [location.pathname]);

  // Get counts of active items - Update whenever location changes
  useEffect(() => {
    const updateCounts = () => {
      // Get active goals (not archived or completed)
      const activeGoals = getGoals().filter(goal => !goal.archived && goal.progress < 100);
      
      // Get active habits (not archived)
      const activeHabits = getHabits().filter(habit => !habit.archived);
      
      // Get active tasks (not completed)
      const activeTasks = getTasks().filter(task => !task.completed);
      
      // Get all ideas
      const allIdeas = getIdeas();
      
      // Get gratitude entries that are not archived
      const activeGratitude = getGratitudeEntries().filter(entry => !entry.archived);
      
      setCounts({
        goals: activeGoals.length,
        habits: activeHabits.length,
        tasks: activeTasks.length,
        ideas: allIdeas.length,
        gratitude: activeGratitude.length
      });
    };

    // Initial count update
    updateCounts();

    // Set up interval to refresh counts every few seconds while the user is on the app
    const intervalId = setInterval(updateCounts, 3000);

    return () => clearInterval(intervalId);
  }, [location.pathname]);

  // Handle click outside sidebar to close it in mobile view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { icon: User, label: 'Quem Sou Eu', href: '/profile' },
    { icon: Home, label: 'Início', href: '/' },
    { icon: Target, label: 'Metas', href: '/goals', count: counts.goals },
    { icon: CheckSquare, label: 'Hábitos', href: '/habits', count: counts.habits },
    { icon: ListTodo, label: 'Tarefas', href: '/tasks', count: counts.tasks },
    { icon: Salad, label: 'Receitas Saudáveis', href: '/recipes' },
    { icon: Utensils, label: 'Monte Seu Prato', href: '/meal-planner' },
    { icon: CircleDollarSign, label: 'Finanças', href: '/finances', count: counts.gratitude },
    { icon: ShoppingCart, label: 'Lista de Compras', href: '/shopping-list' },
    { icon: Lightbulb, label: 'Ideias', href: '/knowledge', count: counts.ideas },
    { icon: Heart, label: 'Mural de Gratidão', href: '/gratitude', count: counts.gratitude },
    { icon: Wrench, label: 'Utilidades', href: '/utilities' }
  ];

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'h-screen fixed left-0 top-0 z-40 flex flex-col justify-between',
        'bg-background border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col flex-1 p-3 space-y-3">
        <div className="flex flex-col mb-2">
          <div className="flex items-center justify-center">
            {!collapsed && <h1 className="text-xl font-bold text-white">ZenLife</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={collapsed ? "" : "absolute right-2"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-white" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
          {!collapsed && userFirstName && (
            <div className="flex flex-col items-center gap-2 mt-3">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                {userPhotoUrl ? (
                  <AvatarImage src={userPhotoUrl} alt="Perfil" />
                ) : (
                  <AvatarFallback>
                    {userFirstName ? userFirstName[0].toUpperCase() : <User className="h-9 w-9" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-sm text-white text-center font-medium">Uma vida saudável de {userFirstName}</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg',
                'hover:bg-accent transition-colors duration-200',
                'text-white hover:text-white',
                'relative md:text-sm text-base',
                location.pathname === item.href && "bg-accent/50 text-white"
              )}
            >
              <item.icon className="h-6 w-6 text-white" />
              {!collapsed && <span className="ml-3 font-medium text-base md:text-base md:font-medium text-white">{item.label}</span>}
              
              {item.count > 0 && (
                <div className={cn(
                  "absolute min-w-[1.15rem] h-[1.15rem] rounded-full bg-primary text-primary-foreground",
                  "flex items-center justify-center text-xs font-medium",
                  collapsed ? "right-1 top-1" : "right-3 top-1/2 -translate-y-1/2"
                )}>
                  {item.count > 99 ? '99+' : item.count}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
