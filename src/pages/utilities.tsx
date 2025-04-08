import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Weight, 
  Activity, 
  HardDrive, 
  Save, 
  Download, 
  Wrench, 
  ArrowDown, 
  Smartphone, 
  Share2 
} from "lucide-react";
import Sidebar from '@/components/Sidebar';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBMICalculator } from '@/lib/indexedDBStorage';
import { UserStorageInfo } from '@/components/ui/user-storage-info';
import { DataBackup } from '@/components/ui/data-backup';

// Interface para o evento de instalação do PWA
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Utilities() {
  const { toast } = useToast();
  
  // Use our custom hook for BMI calculator data
  const { data: calculatorData, saveData: saveCalculatorData } = useBMICalculator();
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstallable, setIsAppInstallable] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  // Verificar se o app já está instalado ou pode ser instalado
  useEffect(() => {
    // Verificar se está rodando como PWA instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    // Capturar o evento beforeinstallprompt para usar mais tarde
    const handleBeforeInstallPrompt = (e: Event) => {
      // Impedir que o Chrome mostre automaticamente o prompt
      e.preventDefault();
      // Armazenar o evento para poder acionar mais tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Atualizar estado para mostrar que o app é instalável
      setIsAppInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsPWAInstalled(true);
      setDeferredPrompt(null);
      
      toast({
        title: "Aplicativo instalado!",
        description: "ZenLife foi instalado com sucesso.",
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  // Função para instalar o aplicativo
  const installApp = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    await deferredPrompt.prompt();

    // Aguardar a escolha do usuário
    const choiceResult = await deferredPrompt.userChoice;
    
    // Limpar o deferredPrompt
    setDeferredPrompt(null);

    if (choiceResult.outcome === 'accepted') {
      toast({
        title: "Instalando...",
        description: "ZenLife está sendo instalado no seu dispositivo.",
      });
    } else {
      toast({
        title: "Instalação cancelada",
        description: "Você pode instalar o aplicativo a qualquer momento.",
        variant: "destructive",
      });
    }
  };

  // Verificar se está em um dispositivo móvel
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // BMI calculation
  const calculateBMI = async () => {
    const { height, weight, age } = calculatorData;
    const heightVal = parseFloat(height);
    const weightVal = parseFloat(weight);
    
    if (!weightVal || !heightVal || heightVal <= 0 || weightVal <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, insira altura e peso válidos.",
        variant: "destructive",
      });
      return;
    }
    
    const heightInMeters = heightVal / 100;
    const bmi = weightVal / (heightInMeters * heightInMeters);
    
    const updatedData = {
      ...calculatorData,
      bmi_result: bmi
    };
    
    // Also calculate BMR if age is provided
    if (age) {
      const ageVal = parseFloat(age);
      let bmr;
      
      if (updatedData.gender === 'male') {
        bmr = 10 * weightVal + 6.25 * heightVal - 5 * ageVal + 5;
      } else {
        bmr = 10 * weightVal + 6.25 * heightVal - 5 * ageVal - 161;
      }
      
      bmr = Math.round(bmr);
      
      // Calculate calorie goal based on objective
      let calories = bmr;
      
      // Apply activity factor (moderate activity as default)
      calories = calories * 1.55;
      
      // Apply goal adjustment
      switch (updatedData.goal) {
        case 'lose':
          calories = calories - 500; // Deficit of 500 calories
          break;
        case 'gain':
          calories = calories + 500; // Surplus of 500 calories
          break;
        default:
          // maintain - keep the same
          break;
      }
      
      updatedData.bmr_result = bmr;
      updatedData.calorie_goal = Math.round(calories);
    }
    
    // Save the updated data
    saveCalculatorData(updatedData);
  };
  
  // BMI category determination
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Abaixo do peso", color: "text-blue-500" };
    if (bmi < 25) return { category: "Peso normal", color: "text-green-500" };
    if (bmi < 30) return { category: "Sobrepeso", color: "text-yellow-500" };
    if (bmi < 35) return { category: "Obesidade Grau 1", color: "text-orange-500" };
    if (bmi < 40) return { category: "Obesidade Grau 2", color: "text-red-500" };
    return { category: "Obesidade Grau 3", color: "text-red-700" };
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 pt-6 overflow-auto ml-16 md:ml-64">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Utilidades
          </h1>

          <Tabs defaultValue="health" className="mb-8">
            <TabsList className="flex flex-wrap w-full mb-10 gap-y-2">
              <TabsTrigger value="health" className="flex items-center gap-2 flex-grow text-xs sm:text-sm">
                <Weight className="h-4 w-4" />
                <span>IMC & TMB</span>
              </TabsTrigger>
              <TabsTrigger value="pwa" className="flex items-center gap-2 flex-grow text-xs sm:text-sm">
                <Smartphone className="h-4 w-4" />
                <span>Instalar App</span>
              </TabsTrigger>
              <div className="w-full"></div>
              <TabsTrigger value="storage" className="flex items-center gap-2 flex-grow text-xs sm:text-sm">
                <HardDrive className="h-4 w-4" />
                <span>Armazenamento</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2 flex-grow text-xs sm:text-sm">
                <Save className="h-4 w-4" />
                <span>Backup & Restauração</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="health" className="mt-10 pt-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle>Calculadora IMC & TMB</CardTitle>
                  <CardDescription>Cálculo de Índice de Massa Corporal e Taxa de Metabolismo Basal</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">Informações Pessoais</h3>
                      
                      <div className="space-y-2">
                        <label htmlFor="height" className="text-sm font-medium">
                          Altura (cm)
                        </label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="170"
                          value={calculatorData.height}
                          onChange={(e) => saveCalculatorData({...calculatorData, height: e.target.value})}
                          className="max-w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="weight" className="text-sm font-medium">
                          Peso (kg)
                        </label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="70"
                          value={calculatorData.weight}
                          onChange={(e) => saveCalculatorData({...calculatorData, weight: e.target.value})}
                          className="max-w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="age" className="text-sm font-medium">
                          Idade (anos)
                        </label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="30"
                          value={calculatorData.age}
                          onChange={(e) => saveCalculatorData({...calculatorData, age: e.target.value})}
                          className="max-w-full"
                        />
                      </div>
                    
                      <div className="space-y-2">
                        <label className="text-sm font-medium block mb-1">
                          Gênero
                        </label>
                        <ToggleGroup type="single" variant="outline" className="flex flex-wrap gap-1 sm:gap-2" 
                          value={calculatorData.gender} 
                          onValueChange={(value) => value && saveCalculatorData({...calculatorData, gender: value})}
                        >
                          <ToggleGroupItem value="male" className="flex-1">
                            Masculino
                          </ToggleGroupItem>
                          <ToggleGroupItem value="female" className="flex-1">
                            Feminino
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium block mb-1">
                          Objetivo
                        </label>
                        <ToggleGroup type="single" variant="outline" className="flex flex-wrap gap-1 sm:gap-2"
                          value={calculatorData.goal} 
                          onValueChange={(value) => value && saveCalculatorData({...calculatorData, goal: value})}
                        >
                          <ToggleGroupItem value="lose" className="flex-1 text-xs sm:text-sm">
                            Perder Peso
                          </ToggleGroupItem>
                          <ToggleGroupItem value="maintain" className="flex-1 text-xs sm:text-sm">
                            Manter Peso
                          </ToggleGroupItem>
                          <ToggleGroupItem value="gain" className="flex-1 text-xs sm:text-sm">
                            Ganhar Peso
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                     
                      <Button 
                        onClick={calculateBMI} 
                        className="w-full md:w-auto mt-2"
                      >
                        <Weight className="h-4 w-4 mr-2" />
                        Calcular
                      </Button>
                    </div>
                    
                    {/* Resultados */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Resultados</h3>
                      
                      {calculatorData.bmi_result ? (
                        <div className="space-y-4">
                          <div className="bg-card p-4 rounded-lg border">
                            <div className="text-sm text-muted-foreground mb-1">Seu IMC</div>
                            <div className="flex items-baseline gap-2">
                              <div className="text-2xl font-bold">{calculatorData.bmi_result.toFixed(1)}</div>
                              <div className={getBMICategory(calculatorData.bmi_result).color}>
                                {getBMICategory(calculatorData.bmi_result).category}
                              </div>
                            </div>
                          </div>
                          
                          {calculatorData.bmr_result && (
                            <>
                              <div className="bg-card p-4 rounded-lg border">
                                <div className="text-sm text-muted-foreground mb-1">Taxa Metabólica Basal</div>
                                <div className="text-2xl font-bold">
                                  {calculatorData.bmr_result.toLocaleString()} kcal/dia
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Calorias que seu corpo precisa em repouso</div>
                              </div>
                              
                              <div className="bg-card p-4 rounded-lg border">
                                <div className="text-sm text-muted-foreground mb-1">Meta Diária de Calorias</div>
                                <div className="text-2xl font-bold">
                                  {calculatorData.calorie_goal?.toLocaleString()} kcal/dia
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {calculatorData.goal === 'lose'
                                    ? 'Para perda de peso (déficit de ~500 kcal/dia)'
                                    : calculatorData.goal === 'gain'
                                      ? 'Para ganho de peso (superávit de ~500 kcal/dia)'
                                      : 'Para manutenção do peso atual'
                                  }
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                          <Weight className="h-12 w-12 mb-4 opacity-20" />
                          <p>Preencha os dados e clique em calcular para visualizar os resultados.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pwa" className="mt-10 pt-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Instale o ZenLife no seu dispositivo
                  </CardTitle>
                  <CardDescription>
                    Instale o ZenLife como um aplicativo em seu dispositivo para ter uma experiência completa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  {isPWAInstalled ? (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg">
                      <p className="font-medium">O ZenLife já está instalado como aplicativo!</p>
                      <p className="text-sm mt-1">Você está usando a versão instalada do aplicativo.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 text-primary">Benefícios de instalar o app:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Acesso rápido pela tela inicial do seu dispositivo</li>
                          <li>Funciona mesmo sem conexão com a internet</li>
                          <li>Experiência completa como um aplicativo nativo</li>
                          <li>Não ocupa muito espaço no seu dispositivo</li>
                          <li>Receba atualizações automaticamente</li>
                        </ul>
                      </div>
                      
                      {isAppInstallable ? (
                        <Button 
                          className="w-full" 
                          size="lg" 
                          onClick={installApp}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Instalar ZenLife
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-lg">
                            <p className="font-medium">Instalação via navegador</p>
                            <p className="text-sm mt-1">Este navegador não suporta instalação direta ou você já possui o aplicativo instalado.</p>
                          </div>
                          
                          {isMobile && (
                            <div className="rounded-lg border p-4">
                              <h3 className="font-medium mb-2">Instruções para instalar:</h3>
                              
                              {/iPhone|iPad|iPod/i.test(navigator.userAgent) ? (
                                <div className="space-y-2">
                                  <p className="text-sm flex items-center"><Share2 className="h-4 w-4 mr-2" /> Toque no ícone de compartilhamento</p>
                                  <p className="text-sm flex items-center"><ArrowDown className="h-4 w-4 mr-2" /> Role para baixo e selecione "Adicionar à Tela de Início"</p>
                                  <p className="text-sm flex items-center"><Download className="h-4 w-4 mr-2" /> Confirme a instalação</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm flex items-center"><Download className="h-4 w-4 mr-2" /> Toque nos três pontos (menu) do navegador</p>
                                  <p className="text-sm flex items-center"><ArrowDown className="h-4 w-4 mr-2" /> Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                                  <p className="text-sm flex items-center"><Download className="h-4 w-4 mr-2" /> Confirme a instalação</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage" className="mt-10 pt-2">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Informações de Armazenamento
                  </CardTitle>
                  <CardDescription>
                    Visualize e gerencie o espaço utilizado pelo ZenLife no seu dispositivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <UserStorageInfo />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backup" className="mt-10 pt-2">
              <DataBackup />
            </TabsContent>
            
          </Tabs>
        </div>
      </div>
    </div>
  );
}
