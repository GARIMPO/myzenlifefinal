import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckSquare,
  Plus,
  Pencil,
  Save,
  X,
  Archive,
  CheckCircle2,
  ArrowUpDown,
  Trophy,
  Award,
  Sparkles,
  Calendar,
  List,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Infinity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabits, Habit } from '@/lib/habitStorage';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

export default function Habits() {
  const { habits, setHabits } = useHabits();
  const { toast } = useToast();
  
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState<Omit<Habit, 'id'>>({
    name: '',
    completed: false,
    frequency: '',
    archived: false,
  });
  const [animatingHabitId, setAnimatingHabitId] = useState<number | null>(null);
  const [completedHabitName, setCompletedHabitName] = useState('');
  const [isNeverEnding, setIsNeverEnding] = useState(false);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const [selectedTrackingType, setSelectedTrackingType] = useState<'daily' | 'weekly' | 'monthly' | null>(null);

  const handleToggleComplete = (habitId: number) => {
    // Find the habit
    const habit = habits.find(h => h.id === habitId);
    
    // Only animate if we're checking it (not unchecking)
    if (habit && !habit.completed) {
      setAnimatingHabitId(habitId);
      setCompletedHabitName(habit.name);
      
      // Set a timeout to archive the habit after the celebration
      setTimeout(() => {
        setHabits(habits.map(h => 
          h.id === habitId ? { ...h, archived: true } : h
        ));
        setAnimatingHabitId(null);
      }, 2000);
    } else {
      // If we're just toggling, update the state immediately
      setHabits(habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, completed: !habit.completed }
          : habit
      ));
    }
    
    toast({
      title: "Status atualizado",
      description: "O status do hábito foi atualizado.",
    });
  };

  const checkHabitCompletion = (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    
    // Check if habit has date constraints and tracking data
    if (habit.trackingType) {
      const today = new Date();
      const todayFormatted = formatDate(today);
      
      // Check if today is within the start/end date range (if set)
      if (habit.startDate && new Date(habit.startDate) > today) return false;
      if (habit.endDate && !habit.neverEnding && new Date(habit.endDate) < today) return false;
      
      // Check if all tracking data for today/this week/this month is complete
      if (habit.trackingType === 'daily' && habit.trackingData?.dates) {
        // For daily tracking, check if today is marked
        const isCompleted = habit.trackingData.dates.includes(todayFormatted);
        
        // If completed, show celebration and auto-archive
        if (isCompleted && !habit.completed) {
          setAnimatingHabitId(habitId);
          setCompletedHabitName(habit.name);
          
          setTimeout(() => {
            setHabits(habits.map(h => 
              h.id === habitId ? { ...h, archived: true, completed: true } : h
            ));
            setAnimatingHabitId(null);
          }, 2000);
        }
        
        return isCompleted;
      } else if (habit.trackingType === 'weekly' && habit.trackingData?.weekdays) {
        // For weekly tracking, check if all selected weekdays are marked
        const allCompleted = habit.trackingData.weekdays.every((day, index) => {
          // If the day is selected, it should be completed
          return !day || habit.completed;
        });
        
        // If all selected days are completed, show celebration and auto-archive
        if (allCompleted && !habit.completed && habit.trackingData.weekdays.some(day => day)) {
          setAnimatingHabitId(habitId);
          setCompletedHabitName(habit.name);
          
          setTimeout(() => {
            setHabits(habits.map(h => 
              h.id === habitId ? { ...h, archived: true, completed: true } : h
            ));
            setAnimatingHabitId(null);
          }, 2000);
        }
        
        return allCompleted;
      } else if (habit.trackingType === 'monthly' && habit.trackingData?.monthDays) {
        // For monthly tracking, check if all selected dates are marked
        const selectedDays = Object.entries(habit.trackingData.monthDays);
        const allCompleted = selectedDays.length > 0 && selectedDays.every(([_, isSelected]) => isSelected);
        
        // If all selected days are completed, show celebration and auto-archive
        if (allCompleted && !habit.completed && selectedDays.length > 0) {
          setAnimatingHabitId(habitId);
          setCompletedHabitName(habit.name);
          
          setTimeout(() => {
            setHabits(habits.map(h => 
              h.id === habitId ? { ...h, archived: true, completed: true } : h
            ));
            setAnimatingHabitId(null);
          }, 2000);
        }
        
        return allCompleted;
      }
    }
    
    // Default to the habit's completed status if no tracking data
    return habit.completed;
  };

  const handleSaveHabit = () => {
    if (editingHabit) {
      setHabits(habits.map(habit => 
        habit.id === editingHabit.id ? editingHabit : habit
      ));
      setEditingHabit(null);
      
      toast({
        title: "Hábito atualizado",
        description: "Suas alterações foram salvas com sucesso.",
      });
    }
  };

  const handleAddHabit = () => {
    if (newHabit.name) {
      const newId = habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1;
      
      // Initialize tracking data based on selected type
      let trackingData = undefined;
      if (selectedTrackingType === 'weekly') {
        trackingData = { weekdays: Array(7).fill(false) };
      } else if (selectedTrackingType === 'monthly') {
        trackingData = { monthDays: {} };
      } else if (selectedTrackingType === 'daily') {
        trackingData = { dates: [] };
      }
      
      // Create the new habit with tracking data and never-ending option
      const habitToAdd = { 
        ...newHabit, 
        id: newId,
        trackingType: selectedTrackingType || undefined,
        trackingData,
        neverEnding: isNeverEnding
      };
      
      setHabits([...habits, habitToAdd]);
      setNewHabit({ name: '', completed: false, frequency: '', archived: false });
      setSelectedTrackingType(null);
      setIsNeverEnding(false);
      setShowNewHabitForm(false);
      
      toast({
        title: "Hábito adicionado",
        description: "Novo hábito adicionado com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao adicionar hábito",
        description: "O nome do hábito é obrigatório.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
    
    toast({
      title: "Hábito removido",
      description: "O hábito foi removido com sucesso.",
      variant: "destructive",
    });
  };

  const handleArchiveHabit = (habitId: number) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, archived: true }
        : habit
    ));
    
    toast({
      title: "Hábito arquivado",
      description: "O hábito foi arquivado com sucesso.",
    });
  };

  // Toggle a weekday for weekly tracking
  const toggleWeekday = (habitId: number, dayIndex: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId && habit.trackingData?.weekdays) {
        const newWeekdays = [...habit.trackingData.weekdays];
        newWeekdays[dayIndex] = !newWeekdays[dayIndex];
        
        // Check if all selected days are completed
        const allCompleted = newWeekdays.every((day, idx) => !day || idx !== dayIndex);
        
        // If all days are now completed, show celebration
        if (allCompleted && !habit.completed && newWeekdays.some(day => day)) {
          setAnimatingHabitId(habitId);
          setCompletedHabitName(habit.name);
          
          setTimeout(() => {
            setHabits(prevHabits => prevHabits.map(h => 
              h.id === habitId ? { ...h, archived: true, completed: true } : h
            ));
            setAnimatingHabitId(null);
          }, 2000);
        }
        
        return {
          ...habit,
          trackingData: {
            ...habit.trackingData,
            weekdays: newWeekdays
          }
        };
      }
      return habit;
    }));
  };

  // Toggle a specific date for daily or monthly tracking
  const toggleDate = (habitId: number, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.trackingType === 'daily' && habit.trackingData?.dates) {
      // For daily tracking
      const dateExists = habit.trackingData.dates.includes(date);
      const newDates = dateExists
        ? habit.trackingData.dates.filter(d => d !== date)
        : [...habit.trackingData.dates, date];

      // Check if this is a new date being added
      if (!dateExists) {
        // If it's today's date, show celebration
        const today = formatDate(new Date());
        if (date === today) {
          setAnimatingHabitId(habitId);
          setCompletedHabitName(habit.name);
          
          setTimeout(() => {
            setHabits(prevHabits => prevHabits.map(h => 
              h.id === habitId ? { 
                ...h, 
                trackingData: { ...h.trackingData, dates: newDates },
                completed: true,
                archived: true 
              } : h
            ));
            setAnimatingHabitId(null);
          }, 2000);
          return;
        }
      }

      setHabits(habits.map(h => 
        h.id === habitId 
          ? { 
              ...h, 
              trackingData: { 
                ...h.trackingData, 
                dates: newDates 
              } 
            }
          : h
      ));
    } else if (habit.trackingType === 'monthly' && habit.trackingData?.monthDays) {
      // For monthly tracking
      const monthDays = { ...habit.trackingData.monthDays };
      const isMarking = !monthDays[date]; // If it wasn't marked, we're marking it now
      monthDays[date] = isMarking;

      // If it's a new date being marked and it's the current month's date, check for completion
      if (isMarking) {
        const today = new Date();
        const selectedDate = new Date(date);
        
        if (today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear()) {
          // Check if all selected days for this month are now marked
          const allMarked = Object.values(monthDays).every(marked => marked);
          
          if (allMarked) {
            setAnimatingHabitId(habitId);
            setCompletedHabitName(habit.name);
            
            setTimeout(() => {
              setHabits(prevHabits => prevHabits.map(h => 
                h.id === habitId ? { 
                  ...h, 
                  trackingData: { 
                    ...h.trackingData, 
                    monthDays 
                  },
                  completed: true,
                  archived: true 
                } : h
              ));
              setAnimatingHabitId(null);
            }, 2000);
            return;
          }
        }
      }

      setHabits(habits.map(h => 
        h.id === habitId 
          ? { 
              ...h, 
              trackingData: { 
                ...h.trackingData, 
                monthDays 
              } 
            }
          : h
      ));
    }
  };

  // Helper to format a date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date formatted
  const today = formatDate(new Date());

  // For monthly tracking, get days of current month
  const getDaysInMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  };

  const activeHabits = habits.filter(habit => !habit.archived);
  const archivedHabits = habits.filter(habit => habit.archived);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CheckSquare className="h-6 w-6" />
                Meus Hábitos
              </h1>
              <Button onClick={() => setShowNewHabitForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Hábito
              </Button>
            </div>

            {showNewHabitForm && (
              <div className="card-gradient rounded-xl p-6 border mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Novo Hábito</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewHabitForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome do hábito"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data de início (opcional)</label>
                      <Input
                        type="date"
                        onChange={(e) => setNewHabit({ ...newHabit, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Data de término (opcional)
                      </label>
                      <Input
                        type="date"
                        onChange={(e) => setNewHabit({ ...newHabit, endDate: e.target.value })}
                        disabled={isNeverEnding}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="never-ending"
                      checked={isNeverEnding}
                      onCheckedChange={(checked) => {
                        setIsNeverEnding(checked === true);
                        if (checked) {
                          setNewHabit({ ...newHabit, endDate: undefined, neverEnding: true });
                        } else {
                          setNewHabit({ ...newHabit, neverEnding: false });
                        }
                      }}
                    />
                    <label 
                      htmlFor="never-ending"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <Infinity className="h-4 w-4 mr-1" />
                      Sempre (sem data de término)
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Acompanhamento (opcional)</label>
                    <div className="flex space-x-2 mb-3">
                      <Button 
                        type="button" 
                        variant={selectedTrackingType === 'daily' ? 'default' : 'outline'}
                        onClick={() => setSelectedTrackingType('daily')}
                        className="flex-1"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Diário
                      </Button>
                      <Button 
                        type="button" 
                        variant={selectedTrackingType === 'weekly' ? 'default' : 'outline'}
                        onClick={() => setSelectedTrackingType('weekly')}
                        className="flex-1"
                      >
                        <List className="h-4 w-4 mr-2" />
                        Semanal
                      </Button>
                      <Button 
                        type="button" 
                        variant={selectedTrackingType === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setSelectedTrackingType('monthly')}
                        className="flex-1"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Mensal
                      </Button>
                    </div>
                  </div>
                  
                  <Button onClick={handleAddHabit} className="w-full">
                    Adicionar Hábito
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="active">Hábitos Ativos</TabsTrigger>
                <TabsTrigger value="archived">Hábitos Arquivados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <div className="space-y-4">
                  {activeHabits.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Você ainda não tem hábitos ativos.</p>
                      <Button 
                        onClick={() => setShowNewHabitForm(true)} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Adicionar primeiro hábito
                      </Button>
                    </div>
                  ) : (
                    activeHabits.map((habit) => (
                      <div key={habit.id} className="card-gradient rounded-xl p-5 border">
                        {editingHabit?.id === habit.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editingHabit.name}
                              onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                            />
                            <Input
                              value={editingHabit.frequency}
                              onChange={(e) => setEditingHabit({ ...editingHabit, frequency: e.target.value })}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Data de início</label>
                                <Input
                                  type="date"
                                  value={editingHabit.startDate || ''}
                                  onChange={(e) => setEditingHabit({ ...editingHabit, startDate: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Data de término</label>
                                <Input
                                  type="date"
                                  value={editingHabit.endDate || ''}
                                  onChange={(e) => setEditingHabit({ ...editingHabit, endDate: e.target.value })}
                                  disabled={editingHabit.neverEnding}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="edit-never-ending"
                                checked={editingHabit.neverEnding || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEditingHabit({ 
                                      ...editingHabit, 
                                      endDate: undefined, 
                                      neverEnding: true 
                                    });
                                  } else {
                                    setEditingHabit({ 
                                      ...editingHabit, 
                                      neverEnding: false 
                                    });
                                  }
                                }}
                              />
                              <label 
                                htmlFor="edit-never-ending"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                              >
                                <Infinity className="h-4 w-4 mr-1" />
                                Sempre (sem data de término)
                              </label>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Tipo de Acompanhamento</label>
                              <div className="flex space-x-2">
                                <Button 
                                  type="button" 
                                  variant={editingHabit.trackingType === 'daily' ? 'default' : 'outline'}
                                  onClick={() => setEditingHabit({ 
                                    ...editingHabit, 
                                    trackingType: 'daily',
                                    trackingData: { dates: [] }
                                  })}
                                  className="flex-1"
                                >
                                  Diário
                                </Button>
                                <Button 
                                  type="button" 
                                  variant={editingHabit.trackingType === 'weekly' ? 'default' : 'outline'}
                                  onClick={() => setEditingHabit({ 
                                    ...editingHabit, 
                                    trackingType: 'weekly',
                                    trackingData: { weekdays: Array(7).fill(false) }
                                  })}
                                  className="flex-1"
                                >
                                  Semanal
                                </Button>
                                <Button 
                                  type="button" 
                                  variant={editingHabit.trackingType === 'monthly' ? 'default' : 'outline'}
                                  onClick={() => setEditingHabit({ 
                                    ...editingHabit, 
                                    trackingType: 'monthly',
                                    trackingData: { monthDays: {} }
                                  })}
                                  className="flex-1"
                                >
                                  Mensal
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button onClick={handleSaveHabit}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                              <Button variant="ghost" onClick={() => setEditingHabit(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleComplete(habit.id)}
                                  className={cn(
                                    "h-10 w-10 rounded-full p-0 relative",
                                    habit.completed && "bg-primary/10 text-primary"
                                  )}
                                >
                                  {animatingHabitId === habit.id && (
                                    <>
                                      {/* Particles for celebration effect */}
                                      <span className="absolute w-1.5 h-1.5 bg-emerald-500 rounded-full animate-[ping_0.8s_ease-in-out_forwards]" style={{ left: '30%', top: '10%' }}></span>
                                      <span className="absolute w-1.5 h-1.5 bg-yellow-500 rounded-full animate-[ping_0.8s_ease-in-out_forwards]" style={{ left: '70%', top: '20%' }}></span>
                                      <span className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full animate-[ping_0.8s_ease-in-out_forwards]" style={{ left: '20%', top: '70%' }}></span>
                                      <span className="absolute w-1.5 h-1.5 bg-purple-500 rounded-full animate-[ping_0.8s_ease-in-out_forwards]" style={{ left: '60%', top: '80%' }}></span>
                                      <span className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-[ping_0.8s_ease-in-out_forwards]" style={{ left: '80%', top: '40%' }}></span>
                                    </>
                                  )}
                                  
                                  <CheckCircle2 
                                    className={cn(
                                      "h-6 w-6 transition-colors",
                                      habit.completed ? "text-primary" : "text-muted-foreground",
                                      animatingHabitId === habit.id && "animate-[pulse_0.4s_ease-in-out_2]"
                                    )} 
                                  />
                                </Button>
                                
                                <div>
                                  <h3 className={cn(
                                    "text-lg font-medium",
                                    habit.completed && "line-through text-muted-foreground"
                                  )}>
                                    {habit.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{habit.frequency}</p>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {habit.startDate && `De: ${new Date(habit.startDate).toLocaleDateString()}`}
                                    {habit.startDate && (habit.endDate || habit.neverEnding) && ' '}
                                    {habit.endDate && !habit.neverEnding && `Até: ${new Date(habit.endDate).toLocaleDateString()}`}
                                    {habit.neverEnding && <span className="flex items-center">Sem fim <Infinity className="h-3 w-3 ml-1" /></span>}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingHabit(habit)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                {habit.completed && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleArchiveHabit(habit.id)}
                                    className="h-8 w-8"
                                    title="Arquivar hábito"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Tracking section based on tracking type */}
                            {habit.trackingType && (
                              <div className="mt-4 pt-3 border-t">
                                {/* Weekly tracking */}
                                {habit.trackingType === 'weekly' && habit.trackingData?.weekdays && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      Acompanhamento semanal
                                    </h4>
                                    <div className="flex justify-between">
                                      {weekdays.map((day, index) => (
                                        <div key={day} className="flex flex-col items-center">
                                          <span className="text-xs text-muted-foreground mb-1">{day}</span>
                                          <button
                                            onClick={() => toggleWeekday(habit.id, index)}
                                            className={cn(
                                              "h-8 w-8 rounded-md border border-white flex items-center justify-center bg-white/5 backdrop-blur-sm",
                                              habit.trackingData?.weekdays[index]
                                                ? "bg-primary/20 border-primary"
                                                : "border-white"
                                            )}
                                          >
                                            {habit.trackingData?.weekdays[index] && (
                                              <Check className="h-4 w-4 text-primary" />
                                            )}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Daily tracking */}
                                {habit.trackingType === 'daily' && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      Acompanhamento diário
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Input 
                                        type="date" 
                                        className="max-w-[200px]"
                                        defaultValue={today}
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            toggleDate(habit.id, e.target.value);
                                          }
                                        }}
                                      />
                                      <span className="text-sm text-muted-foreground">
                                        {habit.trackingData?.dates?.length || 0} dias registrados
                                      </span>
                                    </div>
                                    
                                    {habit.trackingData?.dates && habit.trackingData.dates.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {habit.trackingData.dates
                                          .sort()
                                          .slice(-5) // Show only the last 5 dates
                                          .map(date => (
                                            <div 
                                              key={date} 
                                              className="bg-primary/20 text-xs px-2 py-1 rounded flex items-center gap-1"
                                            >
                                              <span>{new Date(date).toLocaleDateString()}</span>
                                              <button 
                                                onClick={() => toggleDate(habit.id, date)}
                                                className="text-destructive"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          ))
                                        }
                                        {habit.trackingData.dates.length > 5 && (
                                          <span className="text-xs text-muted-foreground flex items-center px-2">
                                            +{habit.trackingData.dates.length - 5} dias
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Monthly tracking */}
                                {habit.trackingType === 'monthly' && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                      <CalendarIcon className="h-4 w-4" />
                                      Acompanhamento mensal
                                    </h4>
                                    <div className="grid grid-cols-7 gap-1">
                                      {getDaysInMonth().map(day => {
                                        const date = new Date();
                                        date.setDate(day);
                                        const formattedDate = formatDate(date);
                                        const isChecked = habit.trackingData?.monthDays?.[formattedDate];
                                        
                                        return (
                                          <button
                                            key={day}
                                            onClick={() => toggleDate(habit.id, formattedDate)}
                                            className={cn(
                                              "h-8 w-8 rounded-md border border-white flex items-center justify-center text-xs bg-white/5 backdrop-blur-sm",
                                              isChecked
                                                ? "bg-primary/20 border-primary"
                                                : "border-white"
                                            )}
                                          >
                                            {day}
                                            {isChecked && (
                                              <Check className="h-3 w-3 absolute text-primary" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="archived">
                <div className="space-y-4">
                  {archivedHabits.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Não há hábitos arquivados.</p>
                    </div>
                  ) : (
                    archivedHabits.map((habit) => (
                      <div key={habit.id} className="rounded-xl p-5 border bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-medium text-muted-foreground line-through">
                                {habit.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{habit.frequency}</p>
                              {(habit.startDate || habit.endDate || habit.neverEnding) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {habit.startDate && `De: ${new Date(habit.startDate).toLocaleDateString()}`}
                                  {habit.startDate && (habit.endDate || habit.neverEnding) && ' '}
                                  {habit.endDate && !habit.neverEnding && `Até: ${new Date(habit.endDate).toLocaleDateString()}`}
                                  {habit.neverEnding && <span className="flex items-center">Sem fim <Infinity className="h-3 w-3 ml-1" /></span>}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setHabits(habits.map(h => 
                                  h.id === habit.id ? { ...h, archived: false } : h
                                ));
                                toast({
                                  title: "Hábito restaurado",
                                  description: "Hábito retornado para a lista ativa.",
                                });
                              }}
                              className="h-8 w-8"
                              title="Restaurar hábito"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Individual habit completion celebration */}
        {animatingHabitId !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-background p-8 rounded-xl shadow-xl max-w-md w-full border-2 border-primary animate-scale-in text-center relative overflow-hidden">
              {/* Confetti animation */}
              <div className="absolute top-0 left-1/4">
                <Sparkles className="h-10 w-10 text-yellow-400 animate-bounce" />
              </div>
              <div className="absolute top-10 right-1/4">
                <Sparkles className="h-8 w-8 text-blue-400 animate-ping" />
              </div>
              <div className="absolute bottom-10 left-1/4">
                <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
              </div>
              
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2 text-primary">PARABÉNS!</h2>
              <h3 className="text-xl font-semibold mb-6">VOCÊ CUMPRIU ESSE HÁBITO!</h3>
              
              <p className="text-muted-foreground mb-6">
                Continue assim! Manter bons hábitos é o caminho para o sucesso.
              </p>
              
              <div className="absolute -bottom-4 -right-4">
                <Award className="h-16 w-16 text-primary/20" />
              </div>
              
              <Button 
                onClick={() => setAnimatingHabitId(null)}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
