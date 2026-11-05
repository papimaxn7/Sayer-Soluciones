import React, { useState } from 'react';
import { HistoricalClosing, NavigationTab } from '../../types';
import { HISTORICAL_CLOSINGS } from '../../data/mockData';

interface HistorialViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HistorialView: React.FC<HistorialViewProps> = ({ onNavigate }) => {
  const [closings] = useState<HistoricalClosing[]>(HISTORICAL_CLOSINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Todos');
  const [selectedOperatorFilter, setSelectedOperatorFilter] = useState<string>('all');
  const [inspectedClosing, setInspectedClosing] = useState<HistoricalClosing | null>(null);

  const filtered = closings.filter((c) => {
    if (selectedStatusFilter === 'Definitivo' && c.status !== 'Mes Cerrado Definitivo') return false;
    if (selectedStatusFilter === 'Parcial' && c.status !== 'Periodo Parcial') return false;
    if (selectedOperatorFilter === 'rodolfo' && !c.operator.toLowerCase().includes('rodolfo')) return false;
    if (selectedOperatorFilter === 'max' && !c.operator.toLowerCase().includes('max')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.month.toLowerCase().includes(q) ||
        c.operator.toLowerCase().includes(q) ||
        c.periodRange.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              Bitácora y Trazabilidad Fiscal
            </span>
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
              28 Periodos Históricos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-0.5">
            Historial de Cierres Mensuales y Auditoría
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Archivo oficial de cierres procesados por el motor de correspondencia SayerPro. Consulta métricas definitivas, auditoría de operadores y descarga de libros .xlsx.
          </p>
        </div>

        <button
          onClick={() => onNavigate('cierre-del-mes')}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Iniciar Nuevo Cierre</span>
        </button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Cierres en Archivo</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-on-surface">28 meses</span>
            <div className="flex items-center gap-1 text-[11px] text-outline mt-0.5">
              <span>Serie continua 2024 - 2026</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Último Cierre Publicado</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-[#2F7A00]">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-on-surface">Octubre 2026</span>
            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
              <span>Hace 2 horas por Rodolfo (Dir.)</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#67E100] h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Tasa de Cobertura Automática</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-on-surface">94.8%</span>
            <span className="text-[11px] bg-surface-container text-primary px-2 py-0.5 rounded font-bold">8 Reglas</span>
          </div>
          <div className="text-[11px] text-outline mt-0.5">
            Promedio histórico de reconciliación
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '94.8%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Pendientes Resueltos</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-on-surface">
              342 <span className="text-outline text-sm font-normal">/ 368</span>
            </span>
            <span className="text-[11px] bg-[#F0FDF4] text-[#2F7A00] px-2 py-0.5 rounded font-bold">92.9%</span>
          </div>
          <div className="text-[11px] text-outline mt-0.5">
            Efectividad acumulada de revisión
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#2F7A00] h-full rounded-full" style={{ width: '92.9%' }}></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 mb-5">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar periodo, mes o responsable..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg text-xs">
            <button
              onClick={() => setSelectedStatusFilter('Todos')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                selectedStatusFilter === 'Todos'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedStatusFilter('Definitivo')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                selectedStatusFilter === 'Definitivo'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mes Cerrado Definitivo
            </button>
            <button
              onClick={() => setSelectedStatusFilter('Parcial')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                selectedStatusFilter === 'Parcial'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Periodo Parcial
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
            <span className="material-symbols-outlined text-[16px] text-outline">person</span>
            <span className="text-outline uppercase text-[11px] font-bold">Operador:</span>
            <select
              value={selectedOperatorFilter}
              onChange={(e) => setSelectedOperatorFilter(e.target.value)}
              className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los operadores</option>
              <option value="rodolfo">Rodolfo (Director)</option>
              <option value="max">Max (Operador)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Historical Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/70 text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4 font-bold">Periodo Contable</th>
                <th className="py-3 px-3 font-bold">Rango de Días</th>
                <th className="py-3 px-3 text-right font-bold">Venta Total</th>
                <th className="py-3 px-3 text-right font-bold">Utilidad Est.</th>
                <th className="py-3 px-3 text-center font-bold">Margen %</th>
                <th className="py-3 px-3 text-center font-bold">Precisión</th>
                <th className="py-3 px-3 font-bold">Responsable</th>
                <th className="py-3 px-3 text-center font-bold">Estado</th>
                <th className="py-3 px-4 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-on-surface whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                      <span>{item.month}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-outline whitespace-nowrap">{item.periodRange}</td>
                  <td className="py-3 px-3 text-right font-bold text-on-surface tabular-nums whitespace-nowrap">
                    ${item.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#053889] tabular-nums whitespace-nowrap">
                    ${item.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#2F7A00]">
                      {item.marginPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-primary">
                    {item.accuracyPercent}%
                  </td>
                  <td className="py-3 px-3 text-on-surface-variant max-w-[180px] truncate" title={item.operator}>
                    {item.operator}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="bg-[#F0FDF4] text-[#2F7A00] text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setInspectedClosing(item)}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Ver auditoría y desglose"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Auditar</span>
                      </button>

                      <button
                        onClick={() => {
                          const csvContent = `data:text/csv;charset=utf-8,PERIODO,${item.month}\nVENTA,${item.totalSales}\nUTILIDAD,${item.totalProfit}\nRESPONSABLE,"${item.operator}"`;
                          const link = document.createElement("a");
                          link.setAttribute("href", encodeURI(csvContent));
                          link.setAttribute("download", `SAYER_VENTAS_${item.month.replace(/\s+/g, '_')}_CONCILIADO.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Descargar libro consolidado"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Closing Modal */}
      {inspectedClosing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-5 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Detalle de Cierre Auditado
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {inspectedClosing.month} · SayerPro
                </h3>
                <span className="text-xs text-outline font-medium">{inspectedClosing.periodRange}</span>
              </div>
              <button
                onClick={() => setInspectedClosing(null)}
                className="text-outline hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
                <span className="text-[11px] text-outline font-medium">Venta Consolidada</span>
                <span className="text-base font-bold text-primary mt-1">${inspectedClosing.totalSales.toLocaleString('es-MX')}</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
                <span className="text-[11px] text-outline font-medium">Utilidad Neta</span>
                <span className="text-base font-bold text-[#053889] mt-1">${inspectedClosing.totalProfit.toLocaleString('es-MX')}</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
                <span className="text-[11px] text-outline font-medium">Margen Global</span>
                <span className="text-base font-bold text-[#2F7A00] mt-1">{inspectedClosing.marginPercent}%</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg flex flex-col">
                <span className="text-[11px] text-outline font-medium">Precisión Motor</span>
                <span className="text-base font-bold text-on-surface mt-1">{inspectedClosing.accuracyPercent}%</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-lg text-xs flex flex-col gap-1.5 border border-outline-variant/20">
              <div className="flex justify-between font-semibold">
                <span className="text-on-surface">Responsable de Cierre:</span>
                <span className="text-on-surface">{inspectedClosing.operator}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-on-surface">Fecha de Emisión:</span>
                <span className="text-outline">{inspectedClosing.publishedAt}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-on-surface">Pendientes Históricos:</span>
                <span className="text-primary font-bold">{inspectedClosing.resolvedPendingCount} resueltos de {inspectedClosing.pendingCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => setInspectedClosing(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-outline hover:text-on-surface cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert(`Abriendo libros contables de ${inspectedClosing.month} en modo lectura...`);
                  setInspectedClosing(null);
                  onNavigate('tablero');
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-xs font-bold shadow-sm cursor-pointer"
              >
                Cargar en Tablero Directivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
