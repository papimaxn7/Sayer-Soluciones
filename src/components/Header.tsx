import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  userRole: UserRole;
  onRoleToggle: (role: UserRole) => void;
  isClosed: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onMonthChange,
  userRole,
  onRoleToggle,
  isClosed,
  onOpenHelp
}) => {
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);

  const months = [
    { label: 'Octubre 2026', range: '01/10/2026 - 31/10/2026', status: isClosed ? 'Cerrado' : 'En Proceso' },
    { label: 'Septiembre 2026', range: '01/09/2026 - 30/09/2026', status: 'Cerrado' },
    { label: 'Agosto 2026', range: '01/08/2026 - 31/08/2026', status: 'Cerrado' },
    { label: 'Julio 2026', range: '01/07/2026 - 31/07/2026', status: 'Cerrado' }
  ];

  return (
    <header className="fixed top-0 left-[240px] right-0 z-40 bg-surface-container-lowest border-b border-outline-variant/30 flex flex-col select-none">
      {/* Top Banner Bar */}
      <div className="w-full bg-surface-container-low px-6 py-1 border-b border-outline-variant/20 flex items-center justify-between text-outline text-[12px]">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-on-surface-variant">SayerPro Cierre v1.0</span>
          <span>·</span>
          <span className="truncate">Operando sobre 3 sucursales: Santa Rosa (Matriz), Cuautepec, Tlalnepantla</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#2F7A00] font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#67E100] animate-pulse"></span>
          <span>Conectado a libro local</span>
        </div>
      </div>

      {/* Main Header Toolbar */}
      <div className="h-14 px-6 flex items-center justify-between">
        {/* Left: Period & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                calendar_today
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {selectedMonth}
              </span>
              <span className="text-xs text-outline hidden sm:inline">
                (01/10/2026 - 31/10/2026)
              </span>
              <span className="material-symbols-outlined text-[18px] text-outline ml-1">
                expand_more
              </span>
            </button>

            {/* Dropdown Menu */}
            {showMonthDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-outline uppercase tracking-wider">
                  Seleccionar Periodo Contable
                </div>
                {months.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => {
                      onMonthChange(m.label);
                      setShowMonthDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-container-low transition-colors ${
                      selectedMonth === m.label ? 'bg-surface-container text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-[11px] text-outline">{m.range}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      m.status === 'Cerrado' 
                        ? 'bg-[#F0FDF4] text-[#2F7A00]' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {m.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Badge */}
          {isClosed ? (
            <div className="flex items-center gap-1.5 bg-[#F0FDF4] border border-[#67E100]/50 text-[#2F7A00] px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Cerrado Definitivo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">pending</span>
              <span>En Proceso de Conciliación</span>
            </div>
          )}
        </div>

        {/* Right: Role Switcher & Help */}
        <div className="flex items-center gap-4">
          {/* Role Toggle */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/30 text-xs">
            <button
              onClick={() => onRoleToggle('Operador')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                userRole === 'Operador'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
              type="button"
            >
              Operador
            </button>
            <button
              onClick={() => onRoleToggle('Director')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                userRole === 'Director'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
              type="button"
            >
              Director
            </button>
          </div>

          {/* Quick Help */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm px-2 py-1 rounded-md"
            type="button"
            title="Guía de uso y reglas contables"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span className="hidden xl:inline font-medium">Ayuda rápida</span>
          </button>

          {/* User Icon */}
          <div 
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-xs cursor-pointer"
            title={`Sesión iniciada: ${userRole === 'Director' ? 'Rodolfo' : 'Max'}`}
          >
            {userRole === 'Director' ? 'R' : 'M'}
          </div>
        </div>
      </div>
    </header>
  );
};
