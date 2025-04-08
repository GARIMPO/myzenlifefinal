import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ListTodo,
  Plus,
  Pencil,
  Save,
  X,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks, Task } from '@/lib/taskStorage';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

export default function Tasks() {
  const { tasks, setTasks } = useTasks();
  const { toast } = useToast();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    name: '',
    priority: 'média',
    completed: false,
    dueDate: undefined,
  });

  const handleToggleComplete = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
    
    toast({
      title: "Status atualizado",
      description: "O status da tarefa foi atualizado.",
    });
  };

  const handleSaveTask = () => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTask(null);
      
      toast({
        title: "Tarefa atualizada",
        description: "Suas alterações foram salvas com sucesso.",
      });
    }
  };

  const handleAddTask = () => {
    if (newTask.name) {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      setTasks([...tasks, { ...newTask, id: newId }]);
      setNewTask({ 
        name: '', 
        priority: 'média', 
        completed: false, 
        dueDate: undefined 
      });
      setShowNewTaskForm(false);
      
      toast({
        title: "Tarefa adicionada",
        description: "Nova tarefa adicionada com sucesso.",
      });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Tarefa removida",
      description: "A tarefa foi removida com sucesso.",
      variant: "destructive",
    });
  };

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

  // Função para ordenar as tarefas por prioridade
  const sortedTasks = [...tasks].sort((a, b) => {
    // Primeiro ordenar por status (não completadas primeiro)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Depois por prioridade
    const priorityOrder = { 'alta': 0, 'média': 1, 'baixa': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const activeTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ListTodo className="h-6 w-6" />
                Tarefas Prioritárias
              </h1>
              <Button onClick={() => setShowNewTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>

            {showNewTaskForm && (
              <div className="card-gradient rounded-xl p-6 border mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Nova Tarefa</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewTaskForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome da tarefa"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  />
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value: 'alta' | 'média' | 'baixa') => 
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="média">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <Input
                        type="date"
                        placeholder="Data"
                        value={newTask.dueDate || ''}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value || undefined })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTask} className="w-full">
                    Adicionar Tarefa
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="active">Tarefas Pendentes</TabsTrigger>
                <TabsTrigger value="completed">Tarefas Concluídas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                <div className="space-y-4">
                  {activeTasks.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Você não tem tarefas pendentes.</p>
                      <Button 
                        onClick={() => setShowNewTaskForm(true)} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Adicionar primeira tarefa
                      </Button>
                    </div>
                  ) : (
                    activeTasks.map((task) => (
                      <div key={task.id} className={cn(
                        "card-gradient rounded-xl p-5 border",
                        task.priority === 'alta' && "border-l-4 border-l-rose-500"
                      )}>
                        {editingTask?.id === task.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editingTask.name}
                              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                            />
                            <div className="flex flex-col gap-4 sm:flex-row">
                              <div className="w-full sm:w-1/2">
                                <Select 
                                  value={editingTask.priority} 
                                  onValueChange={(value: 'alta' | 'média' | 'baixa') => 
                                    setEditingTask({ ...editingTask, priority: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Prioridade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="alta">Alta</SelectItem>
                                      <SelectItem value="média">Média</SelectItem>
                                      <SelectItem value="baixa">Baixa</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="w-full sm:w-1/2">
                                <Input
                                  type="date"
                                  placeholder="Data"
                                  value={editingTask.dueDate || ''}
                                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value || undefined })}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveTask}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                              <Button variant="ghost" onClick={() => setEditingTask(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleComplete(task.id)}
                                className="h-8 w-8 rounded-full p-0"
                              >
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                              </Button>
                              
                              <div>
                                <h3 className="text-lg font-medium">{task.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
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
                                  
                                  {task.dueDate && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingTask(task)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza que deseja excluir essa tarefa?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="space-y-4">
                  {completedTasks.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <p className="text-muted-foreground">Não há tarefas concluídas.</p>
                    </div>
                  ) : (
                    completedTasks.map((task) => (
                      <div key={task.id} className="rounded-xl p-5 border bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleComplete(task.id)}
                              className="h-8 w-8 rounded-full p-0 bg-primary/10 text-primary"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                            
                            <div>
                              <h3 className="text-lg font-medium text-muted-foreground line-through">
                                {task.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="px-2 py-1 rounded-full text-xs text-muted-foreground bg-muted flex items-center gap-1"
                                >
                                  {priorityIcon(task.priority)}
                                  {task.priority}
                                </span>
                                
                                {task.dueDate && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleComplete(task.id)}
                              title="Restaurar tarefa"
                              className="h-8 w-8"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tem certeza que deseja excluir essa tarefa?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      </div>
    </ThemeProvider>
  );
}
