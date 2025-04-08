
import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { useGratitude } from '@/lib/gratitudeStorage';
import { Heart, Pencil, Archive, Trash2, RotateCcw, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Gratitude() {
  const { entries, setEntries } = useGratitude();
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  
  // Filter entries by archived status
  const activeEntries = entries.filter(entry => !entry.archived);
  const archivedEntries = entries.filter(entry => entry.archived);

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    
    const entry = {
      id: Date.now(),
      text: newEntry,
      date: new Date().toISOString(),
      archived: false
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
  };

  const handleArchive = (id: number) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, archived: true } : entry
    ));
  };

  const handleRestore = (id: number) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, archived: false } : entry
    ));
  };

  const handleDelete = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleStartEdit = (entry: typeof entries[0]) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    setEntries(entries.map(entry =>
      entry.id === editingId ? { ...entry, text: editText } : entry
    ));
    
    setEditingId(null);
    setEditText('');
  };

  const GratitudeCard = ({ entry, isArchived = false }) => (
    <Card key={entry.id} className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center">
          <Heart className="h-4 w-4 text-rose-500 mr-2" />
          {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      {editingId === entry.id ? (
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className={isArchived ? "text-muted-foreground" : ""}>
            {entry.text}
          </p>
        </CardContent>
      )}
      <CardFooter className="pt-2 flex justify-end flex-wrap gap-2">
        {!isArchived ? (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleStartEdit(entry)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleArchive(entry.id)}
              className="h-8 w-8"
            >
              <Archive className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRestore(entry.id)}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja excluir esta entrada?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );

  return (
    <ThemeProvider defaultTheme="dark" enableSystem>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 ml-16 md:ml-64">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="text-rose-500" />
              <h1 className="text-3xl font-bold">Mural de Gratidão</h1>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Nova Gratidão</CardTitle>
                <CardDescription>
                  Escreva algo pelo qual você está grato hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Hoje sou grato por..."
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddEntry} className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardFooter>
            </Card>

            <Tabs defaultValue="active" className="mb-6">
              <TabsList className="w-full md:w-auto grid grid-cols-2 mb-4">
                <TabsTrigger value="active">Ativos ({activeEntries.length})</TabsTrigger>
                <TabsTrigger value="archived">Arquivados ({archivedEntries.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {activeEntries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeEntries.map(entry => (
                      <GratitudeCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Você ainda não registrou momentos de gratidão.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="archived">
                {archivedEntries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedEntries.map(entry => (
                      <GratitudeCard key={entry.id} entry={entry} isArchived={true} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Não há itens arquivados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
