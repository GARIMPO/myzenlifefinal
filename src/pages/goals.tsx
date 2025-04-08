import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Plus,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Archive,
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals, Goal, archiveGoal, restoreGoal } from '@/lib/goalStorage';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Goals() {
  const { goals, setGoals } = useGoals();
  const { toast } = useToast();
  
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
    name: '',
    progress: 0,
    category: '',
    description: '',
    archived: false,
  });
  const [celebratingGoalId, setCelebratingGoalId] = useState<number | null>(null);
  const [completedGoalName, setCompletedGoalName] = useState('');
  const [activeTab, setActiveTab] = useState("active");

  // Filtramos metas ativas e arquivadas
  const activeGoals = goals.filter(goal => !goal.archived);
  const archivedGoals = goals.filter(goal => goal.archived);

  const handleUpdateProgress = (goalId: number, newProgress: number) => {
    const goal = goals.find(g => g.id === goalId);
    const updatedProgress = Math.min(100, Math.max(0, newProgress));
    
    // Check if goal is newly completed (reached 100%)
    if (goal && goal.progress < 100 && updatedProgress === 100) {
      setCelebratingGoalId(goalId);
      setCompletedGoalName(goal.name);
      setTimeout(() => {
        setCelebratingGoalId(null);
        // Arquivar automaticamente depois de celebrar quando atinge 100%
        handleArchiveGoal(goalId);
      }, 2000);
    }
    
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress: updatedProgress }
        : goal
    ));
    
    toast({
      title: "Progresso atualizado",
      description: "O progresso da meta foi atualizado com sucesso.",
    });
  };

  const handleSaveGoal = () => {
    if (editingGoal) {
      setGoals(goals.map(goal => 
        goal.id === editingGoal.id ? editingGoal : goal
      ));
      setEditingGoal(null);
      
      toast({
        title: "Meta atualizada",
        description: "Suas alterações foram salvas com sucesso.",
      });
    }
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.category) {
      const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
      setGoals([...goals, { ...newGoal, id: newId }]);
      setNewGoal({ name: '', progress: 0, category: '', description: '', archived: false });
      setShowNewGoalForm(false);
      
      toast({
        title: "Meta adicionada",
        description: "Nova meta adicionada com sucesso.",
      });
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    
    toast({
      title: "Meta removida",
      description: "A meta foi removida com sucesso.",
      variant: "destructive",
    });
  };
  
  const handleArchiveGoal = (goalId: number) => {
    // Usando a função arquivar do nosso módulo de storage
    archiveGoal(goalId, goals, setGoals);
    
    toast({
      title: "Meta arquivada",
      description: "A meta foi arquivada com sucesso.",
    });
  };
  
  const handleRestoreGoal = (goalId: number) => {
    // Usando a função restaurar do nosso módulo de storage
    restoreGoal(goalId, goals, setGoals);
    
    toast({
      title: "Meta restaurada",
      description: "A meta foi restaurada com sucesso.",
    });
  };
  
  const handleCompleteGoal = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      if (!goal.archived) {
        // Se a meta não estiver arquivada, nós a arquivamos
        handleArchiveGoal(goalId);
      } else {
        // Se a meta já estiver arquivada, nós a restauramos
        handleRestoreGoal(goalId);
      }
    }
  };

  const renderGoalCard = (goal: Goal) => (
    <div key={goal.id} className="card-gradient rounded-xl p-6 border">
      {editingGoal?.id === goal.id ? (
        <div className="space-y-4">
          <Input
            value={editingGoal.name}
            onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
          />
          <Input
            value={editingGoal.category}
            onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
          />
          <Input
            value={editingGoal.description || ''}
            placeholder="Descrição (opcional)"
            onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSaveGoal}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => setEditingGoal(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCompleteGoal(goal.id)}
                className={cn(
                  "h-10 w-10 rounded-full p-0 relative",
                  goal.progress === 100 && "bg-primary/10 text-primary",
                  goal.archived && "bg-primary/10 text-primary"
                )}
                title={goal.archived ? "Restaurar meta" : "Arquivar meta"}
              >
                {goal.archived ? (
                  <RotateCcw className="h-6 w-6 transition-colors text-primary" />
                ) : (
                  <CheckCircle2 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      goal.progress === 100 ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                )}
              </Button>
              <div>
                <h3 className={cn(
                  "text-lg font-semibold",
                  goal.progress === 100 && "line-through text-muted-foreground"
                )}>
                  {goal.name}
                </h3>
                <p className="text-sm text-muted-foreground">{goal.category}</p>
                {goal.description && (
                  <p className="text-sm mt-1">{goal.description}</p>
                )}
                {goal.archived && goal.archivedDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Arquivada em: {new Date(goal.archivedDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!goal.archived && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingGoal(goal)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {goal.archived && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRestoreGoal(goal.id)}
                  title="Restaurar meta"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir esta meta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {!goal.archived && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex justify-between gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProgress(goal.id, goal.progress - 5)}
                >
                  -5%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateProgress(goal.id, goal.progress + 5)}
                >
                  +5%
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6" />
                Minhas Metas
              </h1>
              <Button onClick={() => setShowNewGoalForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </div>

            {showNewGoalForm && (
              <div className="card-gradient rounded-xl p-6 border mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Nova Meta</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewGoalForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome da meta"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  />
                  <Input
                    placeholder="Categoria"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  />
                  <Input
                    placeholder="Descrição (opcional)"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                  <Button onClick={handleAddGoal} className="w-full">
                    Adicionar Meta
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Metas Ativas
                  {activeGoals.length > 0 && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {activeGoals.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Metas Arquivadas
                  {archivedGoals.length > 0 && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {archivedGoals.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <div className="space-y-4">
                  {activeGoals.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Você ainda não tem metas ativas cadastradas.</p>
                      <Button 
                        onClick={() => setShowNewGoalForm(true)} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Adicionar primeira meta
                      </Button>
                    </div>
                  ) : (
                    activeGoals.map(renderGoalCard)
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="archived">
                <div className="space-y-4">
                  {archivedGoals.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Você não tem metas arquivadas.</p>
                    </div>
                  ) : (
                    archivedGoals.map(renderGoalCard)
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Goal completion celebration modal */}
        {celebratingGoalId !== null && (
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
              <h3 className="text-xl font-semibold mb-6">VOCÊ COMPLETOU ESSA META!</h3>
              
              <p className="text-muted-foreground mb-6">
                Continue assim! Alcançar metas é o caminho para o sucesso.
              </p>
              
              <div className="absolute -bottom-4 -right-4">
                <Award className="h-16 w-16 text-primary/20" />
              </div>
              
              <Button 
                onClick={() => setCelebratingGoalId(null)}
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

