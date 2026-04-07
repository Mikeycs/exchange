import { useState, useEffect } from 'react';
import { ArrowLeftRight, Activity } from 'lucide-react';

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="text-center mb-8 md:mb-10">
      <div className="inline-flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <ArrowLeftRight className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
          WIEMX <span className="text-teal-400">EXCHANGE</span>
        </h1>
      </div>
      <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide uppercase">
        Cotizacion compra de Divisas
      </p>
      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
        <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span className="text-xs font-mono text-slate-300">
          {time.toLocaleString('es-MX')}
        </span>
      </div>
    </header>
  );
}
