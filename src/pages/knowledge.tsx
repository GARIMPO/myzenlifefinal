import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  Plus,
  Pencil,
  Save,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileText,
  Trash2,
  CheckCircle2,
  DollarSign,
  Archive,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIdeas, Idea, IdeaStep, archiveIdea, restoreIdea } from '@/lib/ideaStorage';
import { cn } from '@/lib/utils';

export default function Knowledge() {
  const { ideas, setIdeas } = useIdeas();
  const { toast } = useToast();

  const [editingIdeaId, setEditingIdeaId] = useState<number | null>(null);
  const [editingStepId, setEditingStepId] = useState<{ideaId: number | null, stepId: number | null}>({ideaId: null, stepId: null});
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);
  const [celebratingIdeaId, setCelebratingIdeaId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  const [newIdea, setNewIdea] = useState<Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    totalCost: 0,
    steps: [],
    archived: false
  });

  const [editIdea, setEditIdea] = useState<Idea | null>(null);

  const [newStep, setNewStep] = useState<{
    description: string;
    cost: number;
    ideaId: number | null;
  }>({
    description: '',
    cost: 0,
    ideaId: null
  });

  const [editedStep, setEditedStep] = useState<{
    description: string;
    cost: number;
  }>({
    description: '',
    cost: 0
  });

  // Filtramos ideias ativas e arquivadas
  const activeIdeas = ideas.filter(idea => !idea.archived);
  const archivedIdeas = ideas.filter(idea => idea.archived);

  // Função para iniciar edição de ideia
  const handleStartEditIdea = (idea: Idea) => {
    setEditIdea({ ...idea });
    setEditingIdeaId(idea.id);
  };

  // Função para salvar ideia editada
  const handleSaveEditedIdea = async () => {
    if (!editIdea) return;
    
    const updatedIdeas = ideas.map(idea => 
      idea.id === editIdea.id ? { ...editIdea, updatedAt: new Date().toISOString() } : idea
    );
    
    await setIdeas(updatedIdeas);
    setEditingIdeaId(null);
    setEditIdea(null);
    
    toast({
      title: "Ideia atualizada",
      description: "As alterações foram salvas com sucesso."
    });
  };

  // Função para iniciar edição de passo
  const handleStartEditStep = (ideaId: number, stepId: number) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    
    const step = idea.steps.find(s => s.id === stepId);
    if (!step) return;
    
    setEditedStep({
      description: step.description,
      cost: step.cost
    });
    
    setEditingStepId({ ideaId, stepId });
  };

  // Função para salvar passo editado
  const handleSaveEditedStep = async () => {
    const { ideaId, stepId } = editingStepId;
    if (!ideaId || !stepId) return;
    
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        const updatedSteps = idea.steps.map(step => 
          step.id === stepId 
            ? { ...step, description: editedStep.description, cost: editedStep.cost } 
            : step
        );
        
        // Recalcular o custo total
        const totalCost = updatedSteps.reduce((acc, step) => acc + step.cost, 0);
        
        return { 
          ...idea, 
          steps: updatedSteps,
          totalCost,
          updatedAt: new Date().toISOString()
        };
      }
      return idea;
    });
    
    await setIdeas(updatedIdeas);
    setEditingStepId({ ideaId: null, stepId: null });
    
    toast({
      title: "Passo atualizado",
      description: "As alterações foram salvas com sucesso."
    });
  };

  // Função para adicionar nova ideia
  const handleAddIdea = async () => {
    if (!newIdea.name) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a ideia.",
        variant: "destructive"
      });
      return;
    }

    const newId = ideas.length > 0 ? Math.max(...ideas.map(idea => idea.id)) + 1 : 1;
    const now = new Date().toISOString();
    
    const createdIdea: Idea = {
      ...newIdea,
      id: newId,
      createdAt: now,
      updatedAt: now,
      totalCost: newIdea.steps.reduce((acc, step) => acc + step.cost, 0),
      archived: false
    };
    
    await setIdeas([...ideas, createdIdea]);
    setNewIdea({
      name: '',
      description: '',
      totalCost: 0,
      steps: [],
      archived: false
    });
    setShowNewIdeaForm(false);
    
    toast({
      title: "Ideia adicionada",
      description: "Nova ideia adicionada com sucesso."
    });
  };

  // Função para adicionar novo passo a uma ideia existente
  const handleAddStep = async (ideaId: number) => {
    if (!newStep.description) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, insira uma descrição para o passo.",
        variant: "destructive"
      });
      return;
    }

    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        const newStepId = idea.steps.length > 0 ? Math.max(...idea.steps.map(step => step.id)) + 1 : 1;
        const newStepItem: IdeaStep = {
          id: newStepId,
          description: newStep.description,
          cost: newStep.cost,
          completed: false
        };
        
        return {
          ...idea,
          steps: [...idea.steps, newStepItem],
          totalCost: idea.totalCost + newStep.cost,
          updatedAt: new Date().toISOString()
        };
      }
      return idea;
    });
    
    await setIdeas(updatedIdeas);
    setNewStep({
      description: '',
      cost: 0,
      ideaId: null
    });
    
    toast({
      title: "Passo adicionado",
      description: "Novo passo adicionado com sucesso."
    });
  };

  // Função para adicionar novo passo à nova ideia
  const handleAddStepToNewIdea = () => {
    if (!newStep.description) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, insira uma descrição para o passo.",
        variant: "destructive"
      });
      return;
    }
    
    const newStepId = newIdea.steps.length > 0 ? Math.max(...newIdea.steps.map(step => step.id)) + 1 : 1;
    const step: IdeaStep = {
      id: newStepId,
      description: newStep.description,
      cost: newStep.cost,
      completed: false
    };
    
    setNewIdea({
      ...newIdea,
      steps: [...newIdea.steps, step],
      totalCost: newIdea.totalCost + newStep.cost
    });
    
    setNewStep({
      description: '',
      cost: 0,
      ideaId: null
    });
  };

  // Função para alternar o estado de conclusão de um passo
  const handleToggleStepComplete = async (ideaId: number, stepId: number) => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          steps: idea.steps.map(step => 
            step.id === stepId 
              ? { ...step, completed: !step.completed } 
              : step
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return idea;
    });
    
    await setIdeas(updatedIdeas);
    
    // Verificar se todos os passos estão completos para mostrar a celebração
    const idea = updatedIdeas.find(i => i.id === ideaId);
    if (idea && idea.steps.length > 0 && idea.steps.every(step => step.completed)) {
      setCelebratingIdeaId(ideaId);
      setTimeout(() => {
        setCelebratingIdeaId(null);
      }, 3000);
    }
  };

  // Função para mover um passo para cima ou para baixo na lista
  const handleMoveStep = async (ideaId: number, stepId: number, direction: 'up' | 'down') => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        const stepIndex = idea.steps.findIndex(s => s.id === stepId);
        if (
          (direction === 'up' && stepIndex === 0) || 
          (direction === 'down' && stepIndex === idea.steps.length - 1)
        ) {
          return idea;
        }
        
        const newSteps = [...idea.steps];
        const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
        
        // Trocar de posição
        [newSteps[stepIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[stepIndex]];
        
        return {
          ...idea,
          steps: newSteps,
          updatedAt: new Date().toISOString()
        };
      }
      return idea;
    });
    
    await setIdeas(updatedIdeas);
  };

  // Função para excluir um passo
  const handleDeleteStep = async (ideaId: number, stepId: number) => {
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId) {
        const stepToDelete = idea.steps.find(s => s.id === stepId);
        const updatedSteps = idea.steps.filter(s => s.id !== stepId);
        
        return {
          ...idea,
          steps: updatedSteps,
          totalCost: stepToDelete ? idea.totalCost - stepToDelete.cost : idea.totalCost,
          updatedAt: new Date().toISOString()
        };
      }
      return idea;
    });
    
    await setIdeas(updatedIdeas);
    
    toast({
      title: "Passo excluído",
      description: "O passo foi excluído com sucesso."
    });
  };

  // Função para excluir uma ideia
  const handleDeleteIdea = async (ideaId: number) => {
    const updatedIdeas = ideas.filter(idea => idea.id !== ideaId);
    await setIdeas(updatedIdeas);
    
    toast({
      title: "Ideia excluída",
      description: "A ideia foi excluída com sucesso."
    });
  };

  // Função para arquivar uma ideia
  const handleArchiveIdea = async (ideaId: number) => {
    await archiveIdea(ideaId, ideas, setIdeas);
    
    toast({
      title: "Ideia arquivada",
      description: "A ideia foi arquivada com sucesso."
    });
  };

  // Função para restaurar uma ideia arquivada
  const handleRestoreIdea = async (ideaId: number) => {
    await restoreIdea(ideaId, ideas, setIdeas);
    
    toast({
      title: "Ideia restaurada",
      description: "A ideia foi restaurada com sucesso."
    });
  };

  const renderIdeaCard = (idea: Idea) => (
    <Card key={idea.id} className={cn(
      "border",
      celebratingIdeaId === idea.id && "border-2 border-primary animate-pulse"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          {editingIdeaId === idea.id ? (
            <div className="flex-1 space-y-2">
              <Input
                value={editIdea?.name || ''}
                onChange={(e) => setEditIdea(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Nome da ideia"
                className="font-bold text-lg"
              />
              <Textarea
                value={editIdea?.description || ''}
                onChange={(e) => setEditIdea(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="Descrição da ideia"
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveEditedIdea}
                  disabled={!editIdea?.name}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingIdeaId(null);
                    setEditIdea(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className={cn(
                "h-5 w-5",
                idea.steps.every(step => step.completed) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )} />
              {idea.name}
            </CardTitle>
          )}
          
          {editingIdeaId !== idea.id && (
            <div className="flex gap-2">
              {!idea.archived && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartEditIdea(idea)}
                    title="Editar ideia"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {idea.steps.every(step => step.completed) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleArchiveIdea(idea.id)}
                      title="Arquivar ideia"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              
              {idea.archived && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRestoreIdea(idea.id)}
                  title="Restaurar ideia"
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
                    <AlertDialogTitle>Tem certeza que deseja excluir toda essa ideia?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os passos serão excluídos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        {editingIdeaId !== idea.id && (
          <CardDescription>
            {idea.description || "Sem descrição"}
            {idea.archived && idea.archivedDate && (
              <div className="flex items-center gap-1 text-xs mt-1">
                <Clock className="h-3 w-3" />
                <span>Arquivada em: {new Date(idea.archivedDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Progresso ({idea.steps.filter(s => s.completed).length}/{idea.steps.length})
            </span>
            <span className="text-sm font-medium">
              {idea.steps.length > 0 
                ? Math.round((idea.steps.filter(s => s.completed).length / idea.steps.length) * 100)
                : 0}%
            </span>
          </div>
          <Progress 
            value={idea.steps.length > 0 
              ? (idea.steps.filter(s => s.completed).length / idea.steps.length) * 100
              : 0} 
            className="h-2" 
          />
        </div>
        
        {/* Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Passos da Implementação</h3>
          {idea.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum passo registrado</p>
          ) : (
            <div className="space-y-2">
              {idea.steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex items-start justify-between p-3 rounded-md border",
                    step.completed && "bg-primary/5 border-primary/20"
                  )}
                >
                  {editingStepId.ideaId === idea.id && editingStepId.stepId === step.id ? (
                    <div className="w-full space-y-2">
                      <Input
                        value={editedStep.description}
                        onChange={(e) => setEditedStep(prev => ({...prev, description: e.target.value}))}
                        placeholder="Descrição do passo"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Custo:</span>
                        <div className="flex items-center w-24">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={editedStep.cost || ''}
                            onChange={(e) => setEditedStep(prev => ({...prev, cost: Number(e.target.value) || 0}))}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleSaveEditedStep}
                          disabled={!editedStep.description}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingStepId({ideaId: null, stepId: null})}
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                          <Checkbox 
                            checked={step.completed}
                            onCheckedChange={() => !idea.archived && handleToggleStepComplete(idea.id, step.id)}
                            className={cn(
                              "h-5 w-5 rounded border-primary bg-white",
                              step.completed && "text-primary"
                            )}
                            disabled={idea.archived}
                          />
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm",
                            step.completed && "line-through text-muted-foreground"
                          )}>
                            {step.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            {step.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                      {!idea.archived && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveStep(idea.id, step.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveStep(idea.id, step.id, 'down')}
                            disabled={index === idea.steps.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEditStep(idea.id, step.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza que deseja excluir esse passo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteStep(idea.id, step.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add new step - only for active ideas */}
        {!idea.archived && (
          <div className="pt-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Descrição do novo passo"
                  value={newStep.ideaId === idea.id ? newStep.description : ''}
                  onChange={(e) => setNewStep({ 
                    ...newStep, 
                    description: e.target.value,
                    ideaId: idea.id 
                  })}
                  onFocus={() => setNewStep({ ...newStep, ideaId: idea.id })}
                />
              </div>
              <div className="w-[100px]">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Custo"
                    value={newStep.ideaId === idea.id ? (newStep.cost || '') : ''}
                    onChange={(e) => setNewStep({ 
                      ...newStep, 
                      cost: Number(e.target.value) || 0,
                      ideaId: idea.id 
                    })}
                    onFocus={() => setNewStep({ ...newStep, ideaId: idea.id })}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleAddStep(idea.id)}
                disabled={!newStep.description || newStep.ideaId !== idea.id}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm flex items-center">
          <span className="font-medium mr-1">Investimento Total:</span>
          <span>
            {idea.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Última atualização: {new Date(idea.updatedAt).toLocaleDateString('pt-BR')}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              Minhas Ideias
            </h1>
            <Button onClick={() => setShowNewIdeaForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ideia
            </Button>
          </div>

          {showNewIdeaForm && (
            <Card className="mb-8 border-2 border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nova Ideia</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNewIdeaForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Registre sua ideia e os passos necessários para implementá-la
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Nome da ideia"
                    value={newIdea.name}
                    onChange={(e) => setNewIdea({ ...newIdea, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={newIdea.description || ''}
                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Passos da Implementação</h3>
                  
                  {newIdea.steps.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {newIdea.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-background rounded-md border">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                              {index + 1}
                            </div>
                            <span>{step.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {step.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tem certeza que deseja excluir esse passo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => {
                                      setNewIdea({
                                        ...newIdea,
                                        steps: newIdea.steps.filter(s => s.id !== step.id),
                                        totalCost: newIdea.steps.reduce((acc, s) => s.id !== step.id ? acc + s.cost : acc, 0)
                                      });
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Descrição do passo"
                        value={newStep.description}
                        onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                      />
                    </div>
                    <div className="w-[100px]">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Custo"
                          value={newStep.cost || ''}
                          onChange={(e) => setNewStep({ ...newStep, cost: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleAddStepToNewIdea}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm font-medium flex items-center">
                  Total: {(newIdea.totalCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <Button 
                  onClick={handleAddIdea}
                  disabled={!newIdea.name}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Ideia
                </Button>
              </CardFooter>
            </Card>
          )}

          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Ideias Ativas
                {activeIdeas.length > 0 && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {activeIdeas.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Ideias Arquivadas
                {archivedIdeas.length > 0 && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {archivedIdeas.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <div className="space-y-8">
                {activeIdeas.length === 0 ? (
                  <div className="text-center p-8 border rounded-xl">
                    <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Você ainda não tem ideias ativas registradas.</p>
                    <Button 
                      onClick={() => setShowNewIdeaForm(true)} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Adicionar Nova Ideia
                    </Button>
                  </div>
                ) : (
                  activeIdeas.map(idea => renderIdeaCard(idea))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="archived">
              <div className="space-y-8">
                {archivedIdeas.length === 0 ? (
                  <div className="text-center p-8 border rounded-xl">
                    <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma ideia arquivada.</p>
                  </div>
                ) : (
                  archivedIdeas.map(idea => renderIdeaCard(idea))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
