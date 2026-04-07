import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { MarketWidget } from './components/MarketWidget';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <Header />
          <Calculator />
          <div className="mt-6">
            <MarketWidget />
          </div>
          <footer className="mt-8 text-center text-xs text-slate-700 pb-4">
            WIEMX Exchange &mdash; Herramienta de cotizacion de divisas
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
