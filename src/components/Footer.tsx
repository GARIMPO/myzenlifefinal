import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t py-3 px-4 flex items-center justify-center bg-background text-foreground/80">
      <div className="flex items-center gap-4">
        <p className="text-sm">ZenLife</p>
        <span className="text-sm">•</span>
        <p className="text-sm">Feito por Marcos Herculano</p>
        <a 
          href="https://www.instagram.com/garimpodeofertas_top/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-primary flex items-center hover:text-primary/80"
        >
          <Instagram className="h-4 w-4 mr-1" />
          garimpodeofertas_top
        </a>
      </div>
    </footer>
  );
}
