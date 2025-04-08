import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { requestPersistentStorage, checkStorageQuota } from './lib/indexedDBStorage';

// Forçar o modo escuro definindo o atributo data-theme no elemento HTML
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.classList.add('dark');

// Garantir que o tema permaneça escuro mesmo após navegação ou atualização
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
});

// Prevenir mudanças de tema, forçando o modo escuro
const forceTheme = () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}
window.addEventListener('storage', forceTheme);
window.matchMedia('(prefers-color-scheme: dark)').addListener(forceTheme);

// Solicitar armazenamento persistente ao iniciar o aplicativo
const initialize = async () => {
  try {
    // Solicitar armazenamento persistente
    const isPersisted = await requestPersistentStorage();
    console.log(`Armazenamento persistente: ${isPersisted ? 'ativo' : 'não ativo'}`);
    
    // Verificar espaço disponível
    await checkStorageQuota();
  } catch (error) {
    console.error('Erro ao inicializar armazenamento:', error);
  }
  
  // Renderizar o aplicativo
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Iniciar o aplicativo
initialize();

// Registrar o service worker para funcionalidade PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('ServiceWorker registrado com sucesso:', registration.scope);
      
      // Verificar atualizações do service worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Já existe um service worker mais antigo que controlava esta página
                console.log('Novo service worker disponível, atualizando a aplicação...');
                // Opcionalmente, pode mostrar uma notificação ao usuário sobre a atualização
              } else {
                // Primeira instalação do service worker nesta página
                console.log('Conteúdo agora está disponível offline!');
              }
            }
          };
        }
      };
      
      // Adicionar suporte a sincronização em segundo plano quando online
      if ('SyncManager' in window) {
        try {
          // Registrar uma tag de sincronização para uso posterior
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-data')
              .then(() => console.log('Sincronização em segundo plano registrada'))
              .catch(err => console.error('Erro ao registrar sincronização:', err));
          });
        } catch (error) {
          console.error('Erro ao configurar sincronização em segundo plano:', error);
        }
      }
    } catch (error) {
      console.error('Falha ao registrar o ServiceWorker:', error);
    }
  });
  
  // Adicionar detecção de conexão e informar ao usuário
  window.addEventListener('online', () => {
    console.log('Aplicação agora está online!');
    // Opcionalmente, mostrar notificação ao usuário
  });
  
  window.addEventListener('offline', () => {
    console.log('Aplicação agora está offline. Você pode continuar usando normalmente.');
    // Opcionalmente, mostrar notificação ao usuário
  });
}
