
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, Edit } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addRecipe, deleteRecipe, editRecipe, getRecipes, Recipe } from '@/lib/recipeStorage';

const Recipes = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>(getRecipes());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleAddRecipe = () => {
    if (title.trim() && content.trim()) {
      const newRecipe = addRecipe({ title, content });
      setRecipes(getRecipes());
      setTitle('');
      setContent('');
    }
  };

  const handleEditRecipe = (id: string) => {
    if (editTitle.trim() && editContent.trim()) {
      editRecipe(id, { title: editTitle, content: editContent });
      setRecipes(getRecipes());
      setEditingId(null);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    setRecipes(getRecipes());
  };

  const startEditing = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditTitle(recipe.title);
    setEditContent(recipe.content);
  };

  // Function to convert URLs to clickable links
  const formatContentWithLinks = (content: string) => {
    // Regular expression to identify URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the content by URLs
    const parts = content.split(urlRegex);
    
    // Map through parts, if part matches URL pattern, make it a link
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-16 md:ml-64">
        <h1 className="text-2xl font-bold mb-6">Receitas Saudáveis</h1>
        
        <div className="mb-6 bg-card rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Adicionar Nova Receita</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Título da Receita
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da receita"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Conteúdo
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ingredientes, modo de preparo, dicas... Você pode incluir links para sites ou vídeos."
                className="w-full min-h-[150px]"
              />
            </div>
            <Button onClick={handleAddRecipe} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Receita
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Minhas Receitas</h2>
          
          {recipes.length === 0 ? (
            <div className="text-center py-8 bg-muted/40 rounded-lg">
              <p className="text-muted-foreground">Você ainda não adicionou nenhuma receita.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {recipes.map((recipe) => (
                <AccordionItem
                  key={recipe.id}
                  value={recipe.id}
                  className="border rounded-lg bg-card shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                      <span className="font-medium">{recipe.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {editingId === recipe.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Título da receita"
                          className="w-full"
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Conteúdo da receita"
                          className="w-full min-h-[150px]"
                        />
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleEditRecipe(recipe.id)}
                            size="sm"
                          >
                            <Save className="mr-2 h-4 w-4" /> Salvar
                          </Button>
                          <Button 
                            onClick={() => setEditingId(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="whitespace-pre-wrap mb-4">
                          {formatContentWithLinks(recipe.content)}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => startEditing(recipe)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Button>
                          <Button 
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
