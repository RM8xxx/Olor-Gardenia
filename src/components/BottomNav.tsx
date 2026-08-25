import React from 'react';
import { Home, PlusCircle, Package, ArrowLeftRight, BarChart3 } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onOpenOcr?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
}) => {
  const navItems: { tab: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'inicio', label: 'Inicio', icon: Home },
    { tab: 'pos', label: 'Nuevo Mov.', icon: PlusCircle },
    { tab: 'inventario', label: 'Inventario', icon: Package },
    { tab: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { tab: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#13131b]/95 backdrop-blur-xl border-t border-[#292932] px-2 sm:px-3 py-1.5 max-w-lg mx-auto rounded-t-2xl shadow-2xl">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              id={`bottom-nav-${tab}`}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#f2ca50] bg-[#1f1f27] border border-[#f2ca50]/30 font-bold shadow-sm'
                  : 'text-[#99907c] hover:text-[#e4e1ed] hover:bg-[#1b1b23] font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.3] text-[#f2ca50]' : 'stroke-[1.8]'}`} />
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


