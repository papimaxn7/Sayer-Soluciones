import React from 'react';
import { NavigationTab, UserRole, PendingItem, UploadedFileRecord } from '../../types';
import { STORE_PROFITABILITY_DATA, HISTORICAL_CLOSINGS, LOGO_URL } from '../../data/mockData';
import { verifyRequiredFiles } from '../../utils/excelEngine';

interface InicioViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onGoToCierreStep: (step: 1 | 2 | 3 | 4) => void;
  pendingItems: PendingItem[];
  userRole: UserRole;
  isPublished: boolean;
  files: UploadedFileRecord[];
  isEngineRunDone: boolean;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  onGoToCierreStep,
  pendingItems,
  userRole,
  isPublished,
  files,
  isEngineRunDone
}) => {
  const openCount = pendingItems.filter(p => p.status === 'Pendiente').length;
  const verification = verifyRequiredFiles(files);
  const isStep1Done = verification.isComplete;
  const isStep2Done = isEngineRunDone;
  const isStep3Done = isEngineRunDone;
  const isStep4Done = isPublished;

  let nextRecommendedStep: 1 | 2 | 3 | 4 = 1;
  let nextStepLabel = 'Paso 1: Cargar los 4 Archivos Requeridos';
  if (!isStep1Done) {
    nextRecommendedStep = 1;
    nextStepLabel = `Paso 1: Cargar Archivos (${verification.requiredCount}/4 listos)`;
  } else if (!isStep2Done) {
    nextRecommendedStep = 2;
    nextStepLabel = 'Paso 2: Ejecutar Motor de Conciliación';
  } else if (!isPublished) {
    nextRecommendedStep = 3;
    nextStepLabel = 'Paso 3: Ver Resultados y Publicar';
  } else {
    nextRecommendedStep = 4;
    nextStepLabel = 'Ver Auditoría & Descargar Libros';
  }

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Sayer Triad Top Wave Gradient */}
      <div className="w-full flex h-1.5 rounded-full overflow-hidden mb-6 opacity-95 shadow-xs">
        <div className="h-full w-1/3 bg-[#67E100]"></div>
        <div className="h-full w-1/3 bg-[#FCA800]"></div>
        <div className="h-full w-1/3 bg-[#F72800]"></div>
      </div>

      {/* Header & Executive Status Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Centro de Control Financiero
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
              Corte Operativo 16:40
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            Bienvenido, {userRole === 'Director' ? 'Rodolfo' : 'Max'}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            El cierre financiero del ciclo <strong className="text-on-surface font-semibold">Octubre 2026</strong> se encuentra {isPublished ? 'publicado y conciliado en libros directivos' : 'activo en fase de conciliación intermedia'}. 2 de 3 sucursales reportan balances operativos dentro de los umbrales autorizados.
          </p>
        </div>

        {/* Quick Store Ledger Telemetry Badges */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl shadow-xs shrink-0 self-start xl:self-end border border-outline-variant/30">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-lowest shadow-xs" title="Santa Rosa: Conciliación en orden">
            <span className="w-2.5 h-2.5 rounded-full bg-[#67E100]"></span>
            <span className="text-xs font-semibold text-on-surface">Santa Rosa</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-lowest shadow-xs" title="Cuautepec: Conciliación en orden">
            <span className="w-2.5 h-2.5 rounded-full bg-[#67E100]"></span>
            <span className="text-xs font-semibold text-on-surface">Cuautepec</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-lowest shadow-xs" title="Tlalnepantla: 4 discrepancias por resolver">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCA800]"></span>
            <span className="text-xs font-semibold text-on-surface">Tlalnepantla</span>
          </div>
        </div>
      </div>

      {/* Primary Featured Closing Card (P3 Status) */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/40 p-6 mb-6">
        {/* Brand highlight left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-6">
          {/* Title + Status + Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_URL}
                alt="Sayer Soluciones"
                className="w-32 h-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-on-surface">
                    {isPublished ? 'Cierre de Octubre 2026 completado y publicado' : 'Cierre de Octubre 2026 en curso'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isPublished 
                      ? 'bg-[#F0FDF4] text-[#2F7A00]' 
                      : 'bg-primary/10 text-primary animate-pulse'
                  }`}>
                    {isPublished ? 'Publicado' : 'Sincronizando'}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant mt-0.5">
                  Iniciado por <strong className="text-on-surface font-semibold">Max (Jefe Operativo)</strong> · Supervisado por <strong className="text-on-surface font-semibold">Rodolfo (Director)</strong>
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigate('pendientes')}
                className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">rule</span>
                <span>Ver pendientes ({openCount} abiertos)</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('cierre-del-mes');
                  onGoToCierreStep(nextRecommendedStep);
                }}
                className="h-10 px-5 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                type="button"
              >
                <span>{nextStepLabel}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Stepper Visualizer */}
          <div className="bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/30">
            <div className="flex items-center justify-between text-xs text-outline mb-3">
              <span className="font-bold uppercase tracking-wider text-primary">
                Flujo Metodológico de Cierre Sayer
              </span>
              <span className="font-semibold text-on-surface">
                {isPublished 
                  ? 'Fase 4 de 4 · Cierre Publicado y Concluido' 
                  : isStep2Done 
                    ? 'Fase 3 de 4 · Validación Cruzada Activa' 
                    : isStep1Done 
                      ? 'Fase 2 de 4 · Listo para Ejecutar Motor' 
                      : 'Fase 1 de 4 · Carga de Archivos Requeridos'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => { onNavigate('cierre-del-mes'); onGoToCierreStep(1); }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors border ${
                  isStep1Done 
                    ? 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container' 
                    : 'bg-primary text-on-primary border-primary ring-2 ring-primary/20 shadow-xs'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isStep1Done ? 'bg-[#F0FDF4] text-[#2F7A00]' : 'bg-on-primary text-primary'
                }`}>
                  {isStep1Done ? <span className="material-symbols-outlined text-[16px]">check</span> : '1'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${isStep1Done ? 'text-on-surface' : 'text-on-primary'}`}>
                    1. Extracción e Ingesta
                  </span>
                  <span className={`text-[11px] truncate ${isStep1Done ? 'text-outline' : 'text-on-primary/80'}`}>
                    {verification.requiredCount}/4 obligatorios listos
                  </span>
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => { onNavigate('cierre-del-mes'); onGoToCierreStep(isStep1Done ? 2 : 1); }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors border ${
                  isStep2Done 
                    ? 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container' 
                    : isStep1Done 
                      ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/20 shadow-xs' 
                      : 'bg-surface-container-lowest opacity-60 border-outline-variant/20 cursor-not-allowed'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isStep2Done 
                    ? 'bg-[#F0FDF4] text-[#2F7A00]' 
                    : isStep1Done 
                      ? 'bg-on-primary text-primary' 
                      : 'bg-surface-container text-outline'
                }`}>
                  {isStep2Done ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : !isStep1Done ? (
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                  ) : (
                    '2'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${
                    isStep2Done ? 'text-on-surface' : isStep1Done ? 'text-on-primary' : 'text-outline'
                  }`}>
                    2. Periodo & Parámetros
                  </span>
                  <span className={`text-[11px] truncate ${
                    isStep2Done ? 'text-outline' : isStep1Done ? 'text-on-primary/80' : 'text-outline'
                  }`}>
                    {isStep2Done ? 'Motor ejecutado' : isStep1Done ? 'Listo para correr' : 'Bloqueado (Paso 1)'}
                  </span>
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => { onNavigate('cierre-del-mes'); onGoToCierreStep(isStep2Done ? 3 : isStep1Done ? 2 : 1); }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors border ${
                  isPublished 
                    ? 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container' 
                    : isStep2Done 
                      ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/20 shadow-xs' 
                      : 'bg-surface-container-lowest opacity-60 border-outline-variant/20 cursor-not-allowed'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isPublished 
                    ? 'bg-[#F0FDF4] text-[#2F7A00]' 
                    : isStep2Done 
                      ? 'bg-on-primary text-primary' 
                      : 'bg-surface-container text-outline'
                }`}>
                  {isPublished ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : !isStep2Done ? (
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                  ) : (
                    '3'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${
                    isPublished ? 'text-on-surface' : isStep2Done ? 'text-on-primary' : 'text-outline'
                  }`}>
                    3. Resultados del Motor
                  </span>
                  <span className={`text-[11px] truncate ${
                    isPublished ? 'text-outline' : isStep2Done ? 'text-on-primary/80' : 'text-outline'
                  }`}>
                    {isStep2Done ? '94.8% conciliado' : 'Bloqueado (Paso 2)'}
                  </span>
                </div>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={() => { onNavigate('cierre-del-mes'); onGoToCierreStep(isPublished ? 4 : isStep2Done ? 4 : 1); }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors border ${
                  isPublished 
                    ? 'bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20' 
                    : 'bg-surface-container-lowest opacity-70 hover:opacity-100 border-outline-variant/30'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isPublished ? 'bg-on-primary text-primary' : 'bg-surface-container text-outline'
                }`}>
                  {isPublished ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : !isStep2Done ? (
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                  ) : (
                    '4'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-on-surface truncate">
                    4. Publicación & Entrega
                  </span>
                  <span className="text-[11px] text-outline truncate">
                    {isPublished ? 'Libro publicado' : 'Descarga de libros'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Realtime Telemetry Grid Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">table_rows</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-on-surface tabular-nums">412</span>
                <span className="text-xs text-on-surface-variant font-semibold">Celdas calculadas automáticamente</span>
                <span className="text-[11px] text-outline">Algoritmo de correspondencia Sayer</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">edit_note</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-on-surface tabular-nums">57</span>
                <span className="text-xs text-on-surface-variant font-semibold">Celdas con captura manual</span>
                <span className="text-[11px] text-outline">Blindadas contra sobreescritura</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#BA1A1A] tabular-nums">{openCount}</span>
                  <span className="text-xs text-outline">de 38 identificados</span>
                </div>
                <span className="text-xs text-on-surface-variant font-semibold">Discrepancias en revisión</span>
                <span className="text-[11px] text-outline">{38 - openCount} revisados por supervisores</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 High-Level Financial Metrics Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
            <span>Resumen Financiero Directivo · Octubre 2026</span>
          </h2>
          <button 
            onClick={() => onNavigate('tablero')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Ver Tablero Completo</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Venta Total */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Venta Total</span>
              <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-primary tabular-nums">$1,850,000</div>
              <div className="flex items-center gap-1 text-[11px] text-[#2F7A00] font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                <span>+4.2% vs sep</span>
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>Meta: $1.80 M</span>
              <span className="text-[#2F7A00] font-bold">102.7%</span>
            </div>
          </div>

          {/* Card 2: Utilidad Estimada */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Utilidad Est.</span>
              <span className="material-symbols-outlined text-[#053889] text-[18px]">trending_up</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-[#053889] tabular-nums">$248,760</div>
              <div className="flex items-center gap-1 text-[11px] text-[#2F7A00] font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>13.4% de la venta</span>
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>vs sep: +$14.4k</span>
              <span className="text-primary font-bold">Saludable</span>
            </div>
          </div>

          {/* Card 3: Compras Sayer */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Compras Sayer</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">inventory_2</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface tabular-nums">$914,200</div>
              <div className="text-[11px] text-secondary font-medium mt-0.5">
                Fórmula J: $94,547 bonif.
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>5 pedidos</span>
              <span className="text-secondary font-semibold">100% conciliado</span>
            </div>
          </div>

          {/* Card 4: Egresos Tienda */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Egresos Tienda</span>
              <span className="material-symbols-outlined text-amber-700 text-[18px]">receipt_long</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface tabular-nums">$382,100</div>
              <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Renta Tlalne +12%</span>
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>Prorrateado</span>
              <span className="text-on-surface font-semibold">Sueldos: $93.2k</span>
            </div>
          </div>

          {/* Card 5: Efectivo en Caja */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Efectivo Arqueo</span>
              <span className="material-symbols-outlined text-[#2F7A00] text-[18px]">payments</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-on-surface tabular-nums">$289,450</div>
              <div className="text-[11px] text-error font-semibold mt-0.5">
                Diferencia neta: -$1,220
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>24 fichas banco</span>
              <span className="text-outline font-semibold">±$10 tol.</span>
            </div>
          </div>

          {/* Card 6: Margen Bruto */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline text-[11px] uppercase font-bold tracking-wider">
              <span>Margen Bruto</span>
              <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-primary tabular-nums">50.6%</div>
              <div className="text-[11px] text-[#2F7A00] font-semibold mt-0.5">
                Costo mercancía: 49.4%
              </div>
            </div>
            <div className="text-[11px] text-outline pt-2 border-t border-outline-variant/20 flex justify-between">
              <span>Obj: 48.0%</span>
              <span className="text-[#2F7A00] font-bold">+2.6 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Branch Performance & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
        {/* Left: Store Contribution Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
                <h3 className="text-base font-bold text-on-surface">Rendimiento por Sucursal (Prorrateo Normativo)</h3>
              </div>
              <span className="text-xs text-outline font-medium">3 tiendas activas</span>
            </div>

            <div className="flex flex-col gap-3">
              {STORE_PROFITABILITY_DATA.map((store) => (
                <div key={store.store} className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        store.store === 'Santa Rosa' ? 'bg-[#67E100]' : store.store === 'Cuautepec' ? 'bg-[#FCA800]' : 'bg-[#F72800]'
                      }`}></span>
                      <span className="font-bold text-sm text-on-surface">{store.store}</span>
                      <span className="text-xs text-outline font-medium">({store.type})</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {store.sharePercent}% de venta total
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        store.store === 'Santa Rosa' ? 'bg-primary' : store.store === 'Cuautepec' ? 'bg-secondary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${store.sharePercent}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-outline text-[11px] block">Venta Bruta</span>
                      <span className="font-bold text-on-surface">${store.sales.toLocaleString('es-MX')}</span>
                    </div>
                    <div>
                      <span className="text-outline text-[11px] block">Egresos Propios</span>
                      <span className="font-semibold text-on-surface-variant">${store.ownExpenses.toLocaleString('es-MX')}</span>
                    </div>
                    <div>
                      <span className="text-outline text-[11px] block">Utilidad Estimada</span>
                      <span className="font-bold text-[#2F7A00]">${store.netProfit.toLocaleString('es-MX')} ({store.marginPercent}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Recent Closings & Shortcut Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Shortcuts */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
              <span>Accesos Rápidos de Auditoría</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('pendientes')}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-3 border border-outline-variant/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">notification_important</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Bandeja F18</span>
                  <span className="text-[11px] text-outline">{openCount} discrepancias</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate('tablero')}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-3 border border-outline-variant/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">P&L Sucursales</span>
                  <span className="text-[11px] text-outline">Matriz Santa Rosa</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate('historial')}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-3 border border-outline-variant/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Historial 2026</span>
                  <span className="text-[11px] text-outline">6 meses cerrados</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate('configuracion')}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-3 border border-outline-variant/20 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">Reglas & Tolerancia</span>
                  <span className="text-[11px] text-outline">Afiliaciones Santander</span>
                </div>
              </button>
            </div>
          </div>

          {/* Historial Corto */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Últimos Cierres Registrados</span>
              <button 
                onClick={() => onNavigate('historial')} 
                className="text-xs text-primary font-semibold hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="divide-y divide-outline-variant/20 text-xs">
              {HISTORICAL_CLOSINGS.slice(0, 3).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">{item.month}</span>
                    <span className="text-[11px] text-outline">{item.operator.split('·')[0]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-on-surface tabular-nums">${item.totalSales.toLocaleString('es-MX')}</span>
                    <span className="bg-[#F0FDF4] text-[#2F7A00] font-semibold text-[10px] px-2 py-0.5 rounded-full">
                      {item.status === 'Mes Cerrado Definitivo' ? 'Definitivo' : 'Parcial'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
