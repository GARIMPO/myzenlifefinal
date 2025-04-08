import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Download, Upload, File, AlertCircle, RefreshCcw, Loader } from 'lucide-react';
import { Button } from './button';
import { useToast } from './use-toast';
import { exportAllData, importAllData, downloadBackup, readBackupFile } from '@/lib/backupUtil';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Progress } from './progress';

export function DataBackup() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportAlert, setShowImportAlert] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importComplete, setImportComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para exportar os dados
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();
      downloadBackup(data);
      
      toast({
        title: "Backup concluído",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: error instanceof Error ? error.message : "Não foi possível exportar os dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para importar os dados
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(10);
      setShowImportAlert(true);
      setImportStatus('Lendo arquivo de backup...');
      
      // Ler o arquivo
      const jsonData = await readBackupFile(file);
      setImportProgress(30);
      setImportStatus('Verificando dados...');
      
      // Validar formato do arquivo
      try {
        const data = JSON.parse(jsonData);
        const itemCount = data.userData?.length || 0;
        setImportStatus(`Preparando para importar ${itemCount} itens...`);
      } catch (err) {
        throw new Error('O arquivo não está no formato de backup válido');
      }
      
      setImportProgress(50);
      setImportStatus('Importando dados para o aplicativo...');
      
      // Importar os dados
      const result = await importAllData(jsonData);
      setImportProgress(90);
      
      if (result.success) {
        setImportStatus('Importação concluída! Reiniciando aplicativo...');
        setImportComplete(true);
        setImportProgress(100);
        
        toast({
          title: "Importação concluída",
          description: result.message,
        });
        
        // Esperar 2 segundos e recarregar a página
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Erro na importação",
          description: result.message,
          variant: "destructive",
        });
        setShowImportAlert(false);
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Não foi possível importar o arquivo",
        variant: "destructive",
      });
      setShowImportAlert(false);
    } finally {
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Se não completou com sucesso, resetar o estado
      if (!importComplete) {
        setIsImporting(false);
      }
    }
  };

  // Recarregar manualmente a página
  const handleReload = () => {
    window.location.reload();
  };

  // Gatilho para abrir o seletor de arquivos
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Backup e Restauração
        </CardTitle>
        <CardDescription>
          Exporte seus dados para backup ou restaure a partir de um arquivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {showImportAlert && (
          <Alert className="mb-4" variant={importComplete ? "default" : "destructive"}>
            {importComplete ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{importComplete ? "Importação concluída" : "Importando dados"}</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{importStatus}</p>
              <Progress value={importProgress} className="h-2 mt-2" />
              {importComplete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={handleReload}
                >
                  <RefreshCcw className="h-3 w-3 mr-2" />
                  Reiniciar Aplicativo
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-6"
            onClick={handleExportData}
            disabled={isExporting || isImporting}
          >
            <Download className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Exportar Backup</span>
              <span className="text-xs text-muted-foreground">Salve seus dados</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-6"
            onClick={triggerFileInput}
            disabled={isExporting || isImporting}
          >
            <Upload className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Importar Backup</span>
              <span className="text-xs text-muted-foreground">Restaure seus dados</span>
            </div>
          </Button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          accept=".json"
          className="hidden"
          onChange={handleImportData}
        />

        <div className="space-y-2 mt-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Instruções para restaurar seu backup:</p>
              <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                <li>Clique em "Importar Backup" e selecione seu arquivo</li>
                <li>Aguarde a conclusão da importação</li>
                <li>O aplicativo será reiniciado automaticamente</li>
                <li>Verifique se seus dados foram restaurados</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 