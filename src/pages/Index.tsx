import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  CheckCircle2,
  ListTodo,
  Target,
  Plus,
  Calendar,
  Trophy,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Utensils
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useGoals } from '@/lib/goalStorage';
import { useHabits } from '@/lib/habitStorage';
import { useTasks } from '@/lib/taskStorage';
import { useFinances } from '@/lib/financeStorage';
import { getMealPlan, WeeklyMealPlan } from '@/lib/mealPlanStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MealPlanModal from '@/components/MealPlanModal';
import { useEffect, useState } from 'react';

export default function Index() {
  const { goals } = useGoals();
  const { habits } = useHabits();
  const { tasks } = useTasks();
  const { transactions, summary } = useFinances();
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);

  useEffect(() => {
    const plan = getMealPlan();
    setMealPlan(plan);
  }, []);

  const activeHabits = habits.filter(habit => !habit.archived);
  
  const sortedTasks = [...tasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityOrder = { 'alta': 0, 'média': 1, 'baixa': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && !t.isArchived)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const calculateGrowthProgress = () => {
    const completedGoals = goals.filter(g => g.progress === 100).length;
    const completedHabits = habits.filter(h => h.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    const goalsWeight = 0.4;
    const habitsWeight = 0.35;
    const tasksWeight = 0.25;
    
    const goalsProgress = goals.length > 0 
      ? (completedGoals / goals.length) * goalsWeight
      : 0;
    
    const habitsProgress = habits.length > 0 
      ? (completedHabits / habits.length) * habitsWeight
      : 0;
    
    const tasksProgress = tasks.length > 0 
      ? (completedTasks / tasks.length) * tasksWeight
      : 0;

    return Math.round((goalsProgress + habitsProgress + tasksProgress) * 100);
  };

  const generateWeeklyReport = () => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingHighPriority = tasks.filter(t => !t.completed && t.priority === 'alta').length;
    const positiveBalance = summary.income > summary.expenses;
    
    return {
      tasksCompleted: completedTasks,
      habitsStreak: 0,
      pendingHighPriority,
      financialStatus: positiveBalance ? 'positive' : 'negative'
    };
  };

  const weeklyReport = generateWeeklyReport();

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <ArrowUp className="h-4 w-4 text-rose-500" />;
      case 'média':
        return <ArrowRight className="h-4 w-4 text-amber-500" />;
      case 'baixa':
        return <ArrowDown className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const weekDays = [
    { key: 'segunda' as keyof WeeklyMealPlan, label: 'Segunda' },
    { key: 'terca' as keyof WeeklyMealPlan, label: 'Terça' },
    { key: 'quarta' as keyof WeeklyMealPlan, label: 'Quarta' },
    { key: 'quinta' as keyof WeeklyMealPlan, label: 'Quinta' },
    { key: 'sexta' as keyof WeeklyMealPlan, label: 'Sexta' },
    { key: 'sabado' as keyof WeeklyMealPlan, label: 'Sábado' },
    { key: 'domingo' as keyof WeeklyMealPlan, label: 'Domingo' }
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-gradient rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    Análise da Semana
                  </h2>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver histórico
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                    Resumo da Semana
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Tarefas completadas:</span>
                      <span className="font-medium">{weeklyReport.tasksCompleted}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Dias seguidos de hábitos:</span>
                      <span className="font-medium">{weeklyReport.habitsStreak} dias</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Pendências de alta prioridade:</span>
                      <span className="font-medium">{weeklyReport.pendingHighPriority}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Situação financeira:</span>
                      <span className={cn(
                        "font-medium",
                        weeklyReport.financialStatus === 'positive' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {weeklyReport.financialStatus === 'positive' ? 'Positiva' : 'Negativa'}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6 border rounded-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Utensils className="h-5 w-5 text-emerald-500 mr-2" />
                    Seu Plano Alimentar
                  </h3>
                  
                  {mealPlan ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {weekDays.map((day) => (
                        <MealPlanModal 
                          key={day.key}
                          day={day.key}
                          label={day.label}
                          mealPlan={mealPlan}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Nenhum plano alimentar configurado.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        asChild
                      >
                        <Link to="/meal-planner">
                          <Plus className="h-4 w-4 mr-1" />
                          Criar Plano
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Atualizado automaticamente a cada semana
                </p>
              </Card>

              <Card className="card-gradient rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas em Progresso
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/goals">Ver todas</Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="card-gradient rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Hábitos de Hoje
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/habits">Ver todos</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeHabits.slice(0, 4).map((habit) => (
                    <div
                      key={habit.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "border transition-colors duration-200",
                        habit.completed ? "bg-primary/10" : "hover:bg-accent"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        habit.completed && "line-through text-muted-foreground"
                      )}>
                        {habit.name}
                      </span>
                      <CheckCircle2
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          habit.completed ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="card-gradient rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Tarefas Prioritárias
                  </h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tasks">Ver todas</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {sortedTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors duration-200",
                        task.priority === 'alta' && "border-l-4 border-l-rose-500"
                      )}
                    >
                      <span className="font-medium">{task.name}</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs flex items-center gap-1",
                          task.priority === "alta" ? "bg-rose-500/10 text-rose-500" :
                          task.priority === "média" ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {priorityIcon(task.priority)}
                        {task.priority}
                      </span>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <Link to="/tasks">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova tarefa
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
