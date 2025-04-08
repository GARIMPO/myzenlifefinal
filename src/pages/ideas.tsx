import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Archive, 
  RefreshCw, 
  Trash2, 
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Goal, useGoals, restoreGoal } from '@/lib/goalStorage';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function Ideas() {
  const { goals, setGoals } = useGoals();
  const { toast } = useToast();
  
  const archivedGoals = goals.filter(goal => goal.archived);
  
  const handleRestoreGoal = (goalId: number) => {
    restoreGoal(goalId, goals, setGoals);
    toast({
      title: "Meta restaurada",
      description: "A meta foi restaurada com sucesso.",
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast({
      title: "Meta excluída",
      description: "A meta foi excluída permanentemente.",
      variant: "destructive",
    });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="archived-goals">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6" />
                  Ideias e Arquivados
                </h1>
                <TabsList>
                  <TabsTrigger value="archived-goals">
                    <Archive className="h-4 w-4 mr-2" />
                    Metas Arquivadas
                  </TabsTrigger>
                  <TabsTrigger value="ideas">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Minhas Ideias
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="archived-goals">
                <div className="space-y-4">
                  {archivedGoals.length === 0 ? (
                    <div className="text-center p-8 border rounded-xl">
                      <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Você não tem metas arquivadas.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Quando completar metas, elas aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    archivedGoals.map((goal) => (
                      <div key={goal.id} className="card-gradient rounded-xl p-6 border bg-muted/30">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-6 w-6 text-primary" />
                              <div>
                                <h3 className="text-lg font-semibold line-through opacity-70">
                                  {goal.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                {goal.archivedDate && (
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" /> 
                                    Arquivada em {format(new Date(goal.archivedDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreGoal(goal.id)}
                                title="Restaurar meta"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restaurar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
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
