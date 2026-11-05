import React from 'react';
import { NavigationTab, UserRole } from '../types';
import { LOGO_URL } from '../data/mockData';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingCount: number;
  userRole: UserRole;
  onRoleToggle: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  pendingCount,
  userRole
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container-lowest z-50 flex flex-col justify-between border-r border-outline-variant/30 select-none shadow-xs">
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="px-3 pt-4 pb-2 flex justify-center">
          <img
            alt="Sayer Soluciones"
            className="w-[208px] h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            src={LOGO_URL}
            onClick={() => onTabChange('inicio')}
            title="Sayer Soluciones · Inicio"
          />
        </div>

        {/* Section Label */}
        <div className="px-space-md pt-space-md pb-space-xs">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            Gestión Operativa
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col px-space-xs gap-1">
          {/* Inicio */}
          <button
            onClick={() => onTabChange('inicio')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'inicio'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Inicio</span>
          </button>

          {/* Cierre del Mes */}
          <button
            onClick={() => onTabChange('cierre-del-mes')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'cierre-del-mes'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span>Cierre del mes</span>
            </div>
            <span
              className="material-symbols-outlined text-[16px] text-tertiary"
              title="Asistente activo"
            >
              auto_mode
            </span>
          </button>

          {/* Pendientes */}
          <button
            onClick={() => onTabChange('pendientes')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'pendientes'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              <span>Pendientes</span>
            </div>
            {pendingCount > 0 ? (
              <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            ) : (
              <span className="bg-[#F0FDF4] text-[#2F7A00] text-[11px] px-2 py-0.5 rounded-full font-bold">
                0
              </span>
            )}
          </button>

          {/* Tablero */}
          <button
            onClick={() => onTabChange('tablero')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'tablero'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Tablero</span>
          </button>

          {/* Historial */}
          <button
            onClick={() => onTabChange('historial')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'historial'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>Historial</span>
          </button>

          {/* Configuración */}
          <button
            onClick={() => onTabChange('configuracion')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-r-lg text-sm transition-colors text-left ${
              currentTab === 'configuracion'
                ? 'bg-surface-container text-primary font-semibold border-l-[3px] border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-l-[3px] border-transparent font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Configuración</span>
          </button>
        </nav>
      </div>

      {/* User Badge & Sayer Triad Brand Wave Accent */}
      <div className="flex flex-col relative">
        <div className="p-3 mx-2 mb-2 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center gap-2.5 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm shrink-0 shadow-xs">
            {userRole === 'Director' ? 'R' : 'M'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm text-on-surface truncate font-semibold">
              {userRole === 'Director' ? 'Rodolfo' : 'Max'}
            </span>
            <span className="text-[11px] text-outline truncate">
              {userRole === 'Director' ? 'Director General · Experto' : 'Jefe Operativo · Editor'}
            </span>
          </div>
        </div>

        {/* 3-Stripe Sayer Brand Wave Accent */}
        <div className="w-full h-2 flex overflow-hidden rounded-b-none" title="Sayer Triad Brand Wave">
          <div className="h-full w-1/3 bg-[#67E100]"></div>
          <div className="h-full w-1/3 bg-[#FCA800]"></div>
          <div className="h-full w-1/3 bg-[#F72800]"></div>
        </div>
      </div>
    </aside>
  );
};
