import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  ShoppingCart, 
  Plus, 
  Pencil, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Check, 
  Save, 
  Loader2, 
  X, 
  MoreHorizontal,
  FilePlus
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useShoppingLists, ShoppingList as ShoppingListType, ShoppingItem } from '@/lib/indexedDBStorage';

export default function ShoppingList() {
  const { 
    lists, 
    loading, 
    addList, 
    addItem, 
    editItem, 
    removeItem, 
    completeList, 
    toggleArchiveList, 
    deleteList 
  } = useShoppingLists();
  const { toast } = useToast();
  
  // Estados para a interface
  const [activeTab, setActiveTab] = useState('active');
  const [listNameInput, setListNameInput] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  // Estados para diálogos
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false);
  
  // Estados para edição de item
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  
  // Estado para deleção de lista
  const [deletingList, setDeletingList] = useState<string | null>(null);
  
  // Referência para o input de adicionar item para focar após abrir o diálogo
  const addItemInputRef = useRef<HTMLInputElement>(null);
  const editItemInputRef = useRef<HTMLInputElement>(null);
  
  // Filtros para as listas
  const activeLists = lists.filter(list => !list.isArchived);
  const archivedLists = lists.filter(list => list.isArchived);
  
  // Função para formatar preço como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: pt });
  };
  
  // Funções para gerenciar listas de compras
  const handleCreateList = async () => {
    if (!listNameInput.trim()) {
      toast({
        title: "Nome vazio",
        description: "Por favor, insira um nome para a lista.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addList(listNameInput);
      setListNameInput('');
      setIsAddListDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    }
  };
  
  const handleAddItem = async () => {
    if (!editingList) return;
    
    if (!newItemName.trim()) {
      toast({
        title: "Nome vazio",
        description: "Por favor, insira um nome para o item.",
        variant: "destructive"
      });
      return;
    }
    
    const price = parseFloat(newItemPrice.replace(',', '.'));
    if (isNaN(price) || price < 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addItem(editingList, {
        name: newItemName,
        price: price
      });
      
      setNewItemName('');
      setNewItemPrice('');
      setIsAddItemDialogOpen(false);
      
      toast({
        title: "Item adicionado",
        description: "Item adicionado à lista com sucesso."
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };
  
  const handleEditItem = async () => {
    if (!editingList || !editingItem) return;
    
    if (!editItemName.trim()) {
      toast({
        title: "Nome vazio",
        description: "Por favor, insira um nome para o item.",
        variant: "destructive"
      });
      return;
    }
    
    const price = parseFloat(editItemPrice.replace(',', '.'));
    if (isNaN(price) || price < 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, insira um preço válido.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await editItem(editingList, editingItem.id, {
        name: editItemName,
        price: price
      });
      
      setIsEditItemDialogOpen(false);
      setEditingItem(null);
      
      toast({
        title: "Item atualizado",
        description: "Item atualizado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao editar item:', error);
    }
  };
  
  const handleDeleteList = async () => {
    if (!deletingList) return;
    
    try {
      await deleteList(deletingList);
      setDeletingList(null);
      setIsDeleteListDialogOpen(false);
      
      toast({
        title: "Lista excluída",
        description: "Lista excluída permanentemente."
      });
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
    }
  };
  
  // Função para abrir diálogo de adicionar item
  const openAddItemDialog = (listId: string) => {
    setEditingList(listId);
    setNewItemName('');
    setNewItemPrice('');
    setIsAddItemDialogOpen(true);
    
    // Focar no input depois que o diálogo abrir
    setTimeout(() => {
      if (addItemInputRef.current) {
        addItemInputRef.current.focus();
      }
    }, 100);
  };
  
  // Função para abrir diálogo de editar item
  const openEditItemDialog = (listId: string, item: ShoppingItem) => {
    setEditingList(listId);
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString().replace('.', ','));
    setIsEditItemDialogOpen(true);
    
    // Focar no input depois que o diálogo abrir
    setTimeout(() => {
      if (editItemInputRef.current) {
        editItemInputRef.current.focus();
      }
    }, 100);
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 pt-6 overflow-auto ml-16 md:ml-64">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Lista de Compras
            </h1>
            
            <Button 
              onClick={() => setIsAddListDialogOpen(true)} 
              className="gap-1"
            >
              <FilePlus className="h-4 w-4" />
              Nova Lista
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando listas...</span>
            </div>
          ) : (
            <>
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="active" className="relative">
                      Listas Ativas
                      {activeLists.length > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground">
                          {activeLists.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                      Arquivadas
                      {archivedLists.length > 0 && (
                        <Badge className="ml-2 bg-muted text-muted-foreground">
                          {archivedLists.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="active" className="space-y-4">
                  {activeLists.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Nenhuma lista de compras ativa</p>
                        <p className="text-muted-foreground mb-4">
                          Crie sua primeira lista de compras para começar a organizar suas compras.
                        </p>
                        <Button 
                          onClick={() => setIsAddListDialogOpen(true)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Criar Lista
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    activeLists.map(list => (
                      <Card key={list.id} className="mb-6">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {list.name}
                                {list.isCompleted && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    <Check className="h-3 w-3 mr-1" />
                                    Finalizada
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                Criada em {formatDate(list.createdAt)}
                              </CardDescription>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!list.isCompleted && (
                                  <DropdownMenuItem onClick={() => completeList(list.id)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Finalizar Compra
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => toggleArchiveList(list.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Arquivar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeletingList(list.id);
                                    setIsDeleteListDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {list.items.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                Esta lista está vazia. Adicione itens para começar.
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="w-40">Preço</TableHead>
                                    <TableHead className="text-right w-32">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {list.items.map(item => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{formatCurrency(item.price)}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditItemDialog(list.id, item)}
                                            disabled={list.isCompleted}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(list.id, item.id)}
                                            disabled={list.isCompleted}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between pt-2 border-t">
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2">
                              Total:
                            </span>
                            <span className="font-medium text-lg">
                              {formatCurrency(list.total)}
                            </span>
                          </div>
                          
                          {!list.isCompleted && (
                            <Button 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => openAddItemDialog(list.id)}
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar Item
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="archived" className="space-y-4">
                  {archivedLists.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Nenhuma lista arquivada</p>
                        <p className="text-muted-foreground">
                          As listas arquivadas aparecerão aqui.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    archivedLists.map(list => (
                      <Card key={list.id} className="mb-6 opacity-80">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {list.name}
                                {list.isCompleted && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    <Check className="h-3 w-3 mr-1" />
                                    Finalizada
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                Criada em {formatDate(list.createdAt)}
                              </CardDescription>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleArchiveList(list.id)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restaurar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeletingList(list.id);
                                    setIsDeleteListDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {list.items.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">
                                Esta lista está vazia.
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="w-40">Preço</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {list.items.map(item => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{formatCurrency(item.price)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between pt-2 border-t">
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-2">
                              Total:
                            </span>
                            <span className="font-medium text-lg">
                              {formatCurrency(list.total)}
                            </span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      
      {/* Diálogo para criar nova lista */}
      <Dialog open={isAddListDialogOpen} onOpenChange={setIsAddListDialogOpen}>
        <DialogContent className="sm:max-w-[425px] fixed top-[30%] left-1/2 -translate-x-1/2">
          <DialogHeader>
            <DialogTitle>Nova Lista de Compras</DialogTitle>
            <DialogDescription>
              Dê um nome para sua nova lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="list-name">Nome da Lista</Label>
              <Input
                id="list-name"
                placeholder="Ex: Compras do mês"
                value={listNameInput}
                onChange={(e) => setListNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateList();
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddListDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateList}>
              Criar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para adicionar item */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px] fixed top-[30%] left-1/2 -translate-x-1/2">
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
            <DialogDescription>
              Adicione um novo item à sua lista de compras.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="item-name">Nome do Item</Label>
              <Input
                id="item-name"
                placeholder="Ex: Arroz"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                ref={addItemInputRef}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-price">Preço (R$)</Label>
              <Input
                id="item-price"
                placeholder="Ex: 10,50"
                value={newItemPrice}
                onChange={(e) => {
                  // Permite apenas números e vírgula
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setNewItemPrice(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar item */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px] fixed top-[30%] left-1/2 -translate-x-1/2">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Edite os detalhes do item da sua lista.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Nome do Item</Label>
              <Input
                id="edit-item-name"
                placeholder="Ex: Arroz"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                ref={editItemInputRef}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-item-price">Preço (R$)</Label>
              <Input
                id="edit-item-price"
                placeholder="Ex: 10,50"
                value={editItemPrice}
                onChange={(e) => {
                  // Permite apenas números e vírgula
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setEditItemPrice(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditItem();
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditItem}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de lista */}
      <Dialog open={isDeleteListDialogOpen} onOpenChange={setIsDeleteListDialogOpen}>
        <DialogContent className="sm:max-w-[425px] fixed top-[30%] left-1/2 -translate-x-1/2">
          <DialogHeader>
            <DialogTitle>Excluir Lista</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteListDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteList}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 