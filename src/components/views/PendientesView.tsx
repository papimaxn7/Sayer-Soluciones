import React, { useState } from 'react';
import { PendingItem, StoreName, UserRole } from '../../types';

interface PendientesViewProps {
  items: PendingItem[];
  onToggleStatus: (id: string, notes?: string) => void;
  userRole: UserRole;
}

export const PendientesView: React.FC<PendientesViewProps> = ({
  items,
  onToggleStatus,
  userRole
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'amount-desc' | 'amount-asc' | 'date-desc'>('amount-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [activeNoteText, setActiveNoteText] = useState('');
  const [showToleranceModal, setShowToleranceModal] = useState(false);
  const [appliedToleranceMsg, setAppliedToleranceMsg] = useState('');

  // Categories list with counts
  const categories = [
    { label: 'Todos', count: items.length },
    { label: 'Santander abono', count: items.filter(i => i.category === 'Santander abono').length },
    { label: 'Depósito sin identificar', count: items.filter(i => i.category === 'Depósito sin identificar').length },
    { label: 'Transferencia con obs.', count: items.filter(i => i.category === 'Transferencia con obs.').length },
    { label: 'Tarjeta sin abono', count: items.filter(i => i.category === 'Tarjeta sin abono').length },
    { label: 'Efectivo desbalanceado', count: items.filter(i => i.category === 'Efectivo desbalanceado').length },
    { label: 'Proveedor sin cargo', count: items.filter(i => i.category === 'Proveedor sin cargo').length },
    { label: 'Cargo sin identificar', count: items.filter(i => i.category === 'Cargo sin identificar').length },
    { label: 'Otras', count: items.filter(i => i.category === 'Otras').length }
  ];

  // Filtering
  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'Todos' && item.category !== selectedCategory) return false;
    if (selectedStore !== 'Todas' && item.store !== selectedStore) return false;
    if (selectedStatus === 'Pendiente' && item.status !== 'Pendiente') return false;
    if (selectedStatus === 'Revisado' && item.status !== 'Revisado') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.detail.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.where.toLowerCase().includes(q) ||
        item.store.toLowerCase().includes(q) ||
        item.amount.toString().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const selectedItem = items.find(i => i.id === selectedItemId) || filteredItems[0] || items[0];

  const handleResolve = () => {
    if (!selectedItem) return;
    onToggleStatus(selectedItem.id, activeNoteText);
    setActiveNoteText('');
  };

  const handleApplyTolerance = (tolAmount: number) => {
    setShowToleranceModal(false);
    setAppliedToleranceMsg(`Tolerancia de ±$${tolAmount} aplicada exitosamente al caso ${selectedItem.code}.`);
    setTimeout(() => setAppliedToleranceMsg(''), 4000);
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              Auditoría y Conciliación
            </span>
            <span className="bg-error-container text-on-error-container text-xs px-2.5 py-0.5 rounded-full font-bold">
              {items.filter(i => i.status === 'Pendiente').length} casos abiertos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-0.5">
            Bandeja de Pendientes y Discrepancias (F18)
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Reconciliación de partidas no emparejadas automáticamente por el motor. Revisa la evidencia Lado A (Banco) vs Lado B (Resumen) para justificar o imputar saldos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,CODIGO,CATEGORIA,FECHA,MONTO,SUCURSAL,DONDE,DETALLE,ESTADO\n" + 
                items.map(i => `${i.code},"${i.category}",${i.date},${i.amount},${i.store},"${i.where}","${i.detail}",${i.status}`).join("\n");
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", "Bandeja_Pendientes_F18_Octubre2026.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-semibold text-xs border border-outline-variant/30 shadow-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar lista (.csv)</span>
          </button>
        </div>
      </div>

      {appliedToleranceMsg && (
        <div className="p-3 bg-[#F0FDF4] border border-[#67E100] text-[#2F7A00] rounded-xl flex items-center gap-2 text-xs font-semibold mb-4">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{appliedToleranceMsg}</span>
        </div>
      )}

      {/* Primary Category Filter Pills */}
      <section className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.label
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedCategory === cat.label
                  ? 'bg-on-primary text-primary'
                  : 'bg-surface-container-highest text-on-surface'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar detalle, folio, cuenta..."
                className="pl-8 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-medium text-on-surface placeholder:text-outline border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-64"
              />
            </div>

            {/* Sucursal Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
              <span className="text-outline uppercase text-[11px] font-bold">Sucursal:</span>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="Santa Rosa">Santa Rosa</option>
                <option value="Cuautepec">Cuautepec</option>
                <option value="Tlalnepantla">Tlalnepantla</option>
              </select>
            </div>

            {/* Estado Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
              <span className="text-outline uppercase text-[11px] font-bold">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos ({items.length})</option>
                <option value="Pendiente">Solo Pendientes ({items.filter(i => i.status === 'Pendiente').length})</option>
                <option value="Revisado">Solo Revisados ({items.filter(i => i.status === 'Revisado').length})</option>
              </select>
            </div>

            {/* Ordenar */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
              <span className="text-outline uppercase text-[11px] font-bold">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="amount-desc">Mayor monto</option>
                <option value="amount-asc">Menor monto</option>
                <option value="date-desc">Fecha más reciente</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-outline font-medium">
            Mostrando {filteredItems.length} de {items.length} asientos
          </div>
        </div>
      </section>

      {/* 2-Column Split View (60% Table / 40% Side-by-Side Audit Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Data Table */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-surface-container-low/70 flex items-center justify-between border-b border-outline-variant/30">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">
              Registro de Asientos No Conciliados
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              Libro: SAYER_VENTAS_2026.xlsx
            </span>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low z-10">
                <tr className="text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                  <th className="py-2.5 px-3 pl-4 font-bold">Categoría</th>
                  <th className="py-2.5 px-3 font-bold">Fecha</th>
                  <th className="py-2.5 px-3 text-right font-bold">Monto</th>
                  <th className="py-2.5 px-3 font-bold">Sucursal</th>
                  <th className="py-2.5 px-3 font-bold">Detalle</th>
                  <th className="py-2.5 px-3 pr-4 text-center font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-xs">
                {filteredItems.map((item) => {
                  const isSelected = item.id === selectedItem?.id;
                  const isReviewed = item.status === 'Revisado';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-container shadow-[inset_4px_0_0_0_#0054cc] font-semibold'
                          : isReviewed
                            ? 'bg-surface-container-low/30 opacity-70 hover:opacity-100 hover:bg-surface-container-low'
                            : 'bg-surface-container-lowest hover:bg-surface-container-low/50'
                      }`}
                    >
                      <td className="py-3 px-3 pl-4 whitespace-nowrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold inline-block ${
                          item.category === 'Santander abono'
                            ? 'bg-primary/10 text-primary'
                            : item.category.includes('Efectivo')
                              ? 'bg-error-container text-on-error-container'
                              : item.category.includes('Transferencia')
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap font-medium">
                        {item.date}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-on-surface tabular-nums whitespace-nowrap">
                        ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-outline">
                          {item.store}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-on-surface max-w-[170px] truncate" title={item.detail}>
                        {item.detail}
                      </td>

                      <td className="py-3 px-3 pr-4 text-center whitespace-nowrap">
                        {isReviewed ? (
                          <span className="bg-[#F0FDF4] text-[#2F7A00] text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Revisado
                          </span>
                        ) : (
                          <span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            Abierto
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-surface-container-low flex items-center justify-between text-xs text-outline border-t border-outline-variant/30">
            <span>{selectedItem?.code || 'Seleccione una fila'} · Modo Auditoría Activo</span>
            <span className="text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
              <span className="material-symbols-outlined text-[16px]">file_open</span>
              <span>Cuadrante de fórmulas F18</span>
            </span>
          </div>
        </section>

        {/* Right Column (5 cols): Side-by-Side Audit Drawer */}
        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-5 flex flex-col gap-4 sticky top-[100px]">
          {selectedItem ? (
            <>
              {/* Header of Detail */}
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-outline-variant/20">
                <div>
                  <span className="text-[11px] text-outline uppercase font-bold tracking-wider block">
                    Auditoría Individual Lado A vs Lado B
                  </span>
                  <h3 className="text-lg font-bold text-on-surface">
                    {selectedItem.category}
                  </h3>
                  <span className="text-xs text-primary font-semibold">
                    Sucursal: {selectedItem.store} · {selectedItem.ruleNumber}
                  </span>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide shrink-0 ${
                  selectedItem.status === 'Revisado'
                    ? 'bg-[#F0FDF4] text-[#2F7A00]'
                    : 'bg-error-container text-on-error-container'
                }`}>
                  {selectedItem.code} · {selectedItem.status}
                </span>
              </div>

              {/* Side-by-side Evidence Box */}
              <div className="grid grid-cols-2 gap-3">
                {/* LADO A: Banco */}
                <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 border border-outline-variant/20">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-[11px] text-primary font-bold uppercase tracking-wider">
                      LADO A · Banco
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
                  </div>
                  <span className="text-[11px] text-outline font-mono truncate">{selectedItem.sideA.account}</span>
                  <div className="flex flex-col mt-1">
                    <span className="text-[11px] text-on-surface-variant font-medium">Fecha Asiento:</span>
                    <span className="text-xs text-on-surface font-bold">{selectedItem.sideA.date}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-on-surface-variant font-medium">Concepto Extracto:</span>
                    <span className="text-[11px] text-on-surface bg-surface-container-lowest p-1 rounded font-mono break-all leading-tight">
                      {selectedItem.sideA.concept}
                    </span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-outline-variant/20">
                    <span className="text-[11px] text-outline">Importe Bancario:</span>
                    <span className="text-base text-primary font-bold block tabular-nums">
                      ${selectedItem.sideA.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* LADO B: Tienda / Resumen */}
                <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 border border-outline-variant/20">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                      LADO B · Tienda
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">point_of_sale</span>
                  </div>
                  <span className="text-[11px] text-outline font-mono truncate">{selectedItem.sideB.reference}</span>
                  <div className="flex flex-col mt-1">
                    <span className="text-[11px] text-on-surface-variant font-medium">Fecha de Corte:</span>
                    <span className="text-xs text-on-surface font-bold">{selectedItem.sideB.date}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-on-surface-variant font-medium">Desglose Registrado:</span>
                    <span className="text-[11px] text-on-surface bg-surface-container-lowest p-1 rounded font-mono break-all leading-tight">
                      {selectedItem.sideB.breakdown}
                    </span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-outline-variant/20">
                    <span className="text-[11px] text-outline">Importe en Resumen:</span>
                    <span className="text-base text-secondary font-bold block tabular-nums">
                      ${selectedItem.sideB.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discrepancy & AI Engine Diagnosis */}
              <div className="bg-surface-container-low/70 rounded-xl p-3.5 border border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
                    <span>Diagnóstico del Motor Sayer</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-outline">Diferencia:</span>
                    <span className={`font-bold tabular-nums ${
                      selectedItem.discrepancy === 0 
                        ? 'text-[#2F7A00]' 
                        : 'text-error'
                    }`}>
                      ${Math.abs(selectedItem.discrepancy).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20">
                  {selectedItem.suggestion}
                </p>
              </div>

              {/* Bitácora / Reviewed status info */}
              {selectedItem.reviewedBy && (
                <div className="p-3 bg-[#F0FDF4] border border-[#67E100]/40 rounded-xl text-xs flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2F7A00]">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Revisado por {selectedItem.reviewedBy} el {selectedItem.reviewedDate}</span>
                  </div>
                  {selectedItem.notes && (
                    <p className="text-on-surface-variant italic">"{selectedItem.notes}"</p>
                  )}
                </div>
              )}

              {/* Notes input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                  Nota / Justificación de Supervisor
                </label>
                <textarea
                  value={activeNoteText}
                  onChange={(e) => setActiveNoteText(e.target.value)}
                  placeholder={selectedItem.notes || "Escribe el motivo de conciliación, folio de aclaración o autorización de Rodolfo..."}
                  rows={2}
                  className="w-full p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResolve}
                  className={`w-full h-10 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer ${
                    selectedItem.status === 'Pendiente'
                      ? 'bg-primary hover:bg-[#1E6FFD] text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedItem.status === 'Pendiente' ? 'check' : 'replay'}
                  </span>
                  <span>
                    {selectedItem.status === 'Pendiente' 
                      ? 'Marcar como Revisado y Conciliar' 
                      : 'Reabrir para Nueva Revisión'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowToleranceModal(true)}
                    className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs border border-outline-variant/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Ajustar Tolerancia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Asignado a supervisor Max para seguimiento en sucursal ${selectedItem.store}.`);
                    }}
                    className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-semibold text-xs border border-outline-variant/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                    <span>Enviar a Tienda</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-outline text-xs">
              Selecciona un elemento de la lista para ver el análisis de evidencia.
            </div>
          )}
        </section>
      </div>

      {/* Tolerance Adjustment Modal */}
      {showToleranceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl border border-outline-variant/40 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-on-surface">Ajustar Tolerancia para este Asiento</h4>
              <button 
                onClick={() => setShowToleranceModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Si la diferencia de <strong className="text-on-surface font-semibold">${Math.abs(selectedItem.discrepancy).toFixed(2)}</strong> corresponde a centavos de redondeo bancario o desfase por comisión terminal, puedes aprobarla por excepción normativa.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleApplyTolerance(10)}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-outline-variant/30"
              >
                ±$10.00
              </button>
              <button
                onClick={() => handleApplyTolerance(50)}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-outline-variant/30"
              >
                ±$50.00
              </button>
              <button
                onClick={() => handleApplyTolerance(Math.abs(selectedItem.discrepancy))}
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/30"
              >
                Monto Exacto
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowToleranceModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-outline hover:text-on-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
