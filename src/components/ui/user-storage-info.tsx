import { useState, useEffect } from 'react';
import { checkStorageQuota, requestPersistentStorage } from '@/lib/indexedDBStorage';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { HardDrive, Lock } from 'lucide-react';
import { useToast } from './use-toast';
import { Progress } from './progress';

export function UserStorageInfo() {
  const { toast } = useToast();
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        // Verificar se armazenamento já é persistente
        if (navigator.storage && navigator.storage.persisted) {
          const persisted = await navigator.storage.persisted();
          setIsPersisted(persisted);
        }
        
        // Verificar uso de armazenamento
        const quota = await checkStorageQuota();
        setStorageInfo(quota);
      } catch (error) {
        console.error('Erro ao verificar armazenamento:', error);
      }
    };
    
    checkStorage();
  }, []);

  const handleRequestPersistence = async () => {
    setLoading(true);
    try {
      const persisted = await requestPersistentStorage();
      setIsPersisted(persisted);
      
      toast({
        title: persisted ? "Armazenamento persistente ativado" : "Não foi possível ativar",
        description: persisted 
          ? "Seus dados agora têm menor chance de serem removidos pelo navegador"
          : "O navegador não concedeu permissão para armazenamento persistente",
        variant: persisted ? "default" : "destructive",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível configurar o armazenamento persistente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular percentual de uso
  const usagePercent = storageInfo && storageInfo.quota > 0
    ? Math.round((storageInfo.used / storageInfo.quota) * 100)
    : 0;

  // Formatar tamanhos para exibição
  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Armazenamento Local
        </CardTitle>
        <CardDescription>
          Informações sobre o armazenamento de dados no seu dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {storageInfo ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Espaço usado: {formatStorage(storageInfo.used)}</span>
              <span>Disponível: {formatStorage(storageInfo.quota)}</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível obter informações de armazenamento
          </p>
        )}

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Proteção contra limpeza de dados</span>
            </div>
            <span 
              className={`text-xs px-2 py-1 rounded-full ${
                isPersisted 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}
            >
              {isPersisted ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            O armazenamento persistente reduz a chance de seus dados serem removidos quando o navegador limpa o cache.
          </p>
          {!isPersisted && (
            <Button 
              onClick={handleRequestPersistence} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {loading ? 'Solicitando...' : 'Ativar armazenamento persistente'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 