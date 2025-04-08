import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Save, Upload, Camera, X, Star, Sparkles } from "lucide-react";
import Sidebar from '@/components/Sidebar';
import { useUserProfile } from '@/lib/indexedDBStorage';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const { data: profileData, saveData: saveProfileData, loading } = useUserProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '',
    bio: '',
    dreams: '',
    photoUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do perfil
  useEffect(() => {
    if (profileData && !loading) {
      setFormData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        dreams: profileData.dreams || '',
        photoUrl: profileData.photoUrl || ''
      });
    }
  }, [profileData, loading]);

  // Função para salvar o perfil
  const handleSaveProfile = async () => {
    try {
      await saveProfileData({
        ...profileData,
        name: formData.name,
        bio: formData.bio,
        dreams: formData.dreams,
        photoUrl: formData.photoUrl,
        updatedAt: new Date().toISOString()
      });
      
      setIsEditing(false);
      
      toast({
        title: "Perfil salvo",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para lidar com upload de foto
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A foto deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFormData({ ...formData, photoUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Função para limpar a foto
  const handleClearPhoto = () => {
    setFormData({ ...formData, photoUrl: '' });
  };

  // Função para abrir o seletor de arquivos
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 pt-6 overflow-auto ml-16 md:ml-64">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <User className="h-8 w-8" />
            Quem Sou Eu
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
              <CardDescription>
                Compartilhe um pouco sobre você. Estas informações serão usadas para personalizar sua experiência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!isEditing ? (
                  // Modo de visualização
                  <div className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-2 border-primary/20">
                          {formData.photoUrl ? (
                            <AvatarImage src={formData.photoUrl} alt={formData.name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-4xl">
                              {formData.name ? formData.name[0].toUpperCase() : <User />}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">Nome</h3>
                        <p className="mt-1 text-xl">
                          {formData.name || <span className="text-muted-foreground italic">Nenhum nome definido</span>}
                        </p>
                        
                        <h3 className="text-lg font-medium mt-4">Sobre mim</h3>
                        <p className="mt-1 whitespace-pre-wrap">
                          {formData.bio || <span className="text-muted-foreground italic">Nenhuma biografia definida</span>}
                        </p>
                        
                        <h3 className="text-lg font-medium mt-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-400" />
                          Meus maiores sonhos
                        </h3>
                        <p className="mt-1 whitespace-pre-wrap">
                          {formData.dreams || <span className="text-muted-foreground italic">Nenhum sonho definido ainda</span>}
                        </p>
                      </div>
                    </div>
                    
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  </div>
                ) : (
                  // Modo de edição
                  <div className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-2 border-primary/20">
                          {formData.photoUrl ? (
                            <AvatarImage src={formData.photoUrl} alt={formData.name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-4xl">
                              {formData.name ? formData.name[0].toUpperCase() : <User />}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 rounded-full" 
                            onClick={triggerFileInput}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          
                          {formData.photoUrl && (
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8 rounded-full" 
                              onClick={handleClearPhoto}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Digite seu nome"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Sobre mim</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Conte um pouco sobre você..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dreams" className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            Meus maiores sonhos
                          </Label>
                          <Textarea
                            id="dreams"
                            value={formData.dreams}
                            onChange={(e) => setFormData({...formData, dreams: e.target.value})}
                            placeholder="Quais são seus maiores sonhos e aspirações?"
                            rows={3}
                            className="border-amber-200 focus-visible:ring-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFormData({
                            name: profileData.name || '',
                            bio: profileData.bio || '',
                            dreams: profileData.dreams || '',
                            photoUrl: profileData.photoUrl || ''
                          });
                          setIsEditing(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de preview de como o nome aparecerá na sidebar */}
          {formData.name && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Veja como seu nome aparecerá na aplicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-secondary/20">
                  <h3 className="font-medium text-sm text-muted-foreground">Sidebar Preview:</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-8 w-8">
                      {formData.photoUrl ? (
                        <AvatarImage src={formData.photoUrl} alt={formData.name} />
                      ) : (
                        <AvatarFallback>
                          {formData.name ? formData.name[0].toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <p className="text-xs text-muted-foreground">Uma vida saudável de <span className="font-medium text-foreground">{formData.name.split(' ')[0]}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 