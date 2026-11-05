import React, { useState } from 'react';
import { RuleSummary, NavigationTab, CashAuditRow, SayerAuditRow } from '../../../types';

interface CierrePaso3Props {
  onBack: () => void;
  onNext: () => void;
  onNavigate: (tab: NavigationTab) => void;
  openPendingCount: number;
  rulesData?: RuleSummary[];
  cashAuditRows?: CashAuditRow[];
  sayerAuditRows?: SayerAuditRow[];
  periodLabel?: string;
}

export const CierrePaso3Resultados: React.FC<CierrePaso3Props> = ({
  onBack,
  onNext,
  onNavigate,
  openPendingCount,
  rulesData,
  cashAuditRows,
  sayerAuditRows,
  periodLabel = 'Octubre 2026'
}) => {
  const [selectedRuleModal, setSelectedRuleModal] = useState<RuleSummary | null>(null);
  const activeRules = rulesData && rulesData.length > 0 ? rulesData : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de Éxito de Conciliación */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#67E100]"></span>
              <span className="text-xs font-bold text-outline uppercase tracking-wider">
                Motor Financiero SayerPro · v3.8
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Octubre 2026 conciliado con éxito
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              El motor de conciliación automática procesó las 8 reglas contables entre los cortes de caja de las 3 sucursales, terminales Santander y cuentas maestras Banamex.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('pendientes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container text-primary font-semibold text-sm hover:bg-secondary-fixed transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              <span>Ir a bandeja de pendientes ({openPendingCount})</span>
            </button>

            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-[#1E6FFD] transition-colors shadow-sm cursor-pointer active:scale-95"
              type="button"
            >
              <span>Continuar a Publicar</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Barra de Resumen Métrico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] text-primary shrink-0">calculate</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-on-surface">412 celdas calculadas</span>
              <span className="text-xs text-on-surface-variant">Fórmulas ejecutadas y montos conciliados</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] text-[#2F7A00] shrink-0">verified_user</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-on-surface">57 celdas respetadas</span>
              <span className="text-xs text-on-surface-variant">Contenido previo blindado (sin sobreescritura)</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] text-error shrink-0">notification_important</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-error">{openPendingCount} pendientes de revisión</span>
              <span className="text-xs text-on-surface-variant">Diferencias superiores a tolerancia o sin match</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reglas Financieras del Motor (8 Tarjetas de Cruce) */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">Reglas Financieras del Motor</h2>
            <span className="text-xs text-outline px-2 py-0.5 rounded bg-surface-container-low font-mono font-bold">
              8 / 8 EJECUTADAS
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">
            Precisión global calculada: <strong className="text-on-surface font-bold">94.8%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    {rule.ruleNumber}
                  </span>
                  <span className={`text-xs font-bold ${
                    rule.accuracyPercent === 100 
                      ? 'text-[#2F7A00]' 
                      : rule.accuracyPercent >= 94 
                        ? 'text-primary' 
                        : 'text-amber-700'
                  }`}>
                    {rule.accuracyPercent.toFixed(1)}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-on-surface mb-1 leading-snug cursor-pointer hover:text-primary"
                    onClick={() => setSelectedRuleModal(rule)}>
                  {rule.title}
                </h3>
                <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                  {rule.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      rule.accuracyPercent === 100 ? 'bg-[#67E100]' : 'bg-primary'
                    }`}
                    style={{ width: `${rule.accuracyPercent}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-outline mb-2">
                  {rule.matchedCount} de {rule.totalCount} operaciones cuadradas
                </div>
              </div>

              {rule.pendingCount > 0 ? (
                <button
                  type="button"
                  onClick={() => onNavigate('pendientes')}
                  className="text-xs text-primary hover:text-primary-container font-bold flex items-center justify-between pt-2 border-t border-outline-variant/20 cursor-pointer"
                >
                  <span>Ver {rule.pendingCount} pendientes</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pt-2 border-t border-outline-variant/20 text-[#2F7A00] text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Sin pendientes (100%)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Muestra de Auditoría: 2 Tablas Lado a Lado (50% / 50%) */}
      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Tabla A: Control de Efectivo por Tienda-Día (Regla 06) */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/30 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">
                Regla 06 · Detalle de Muestreo
              </span>
              <h3 className="text-base font-bold text-on-surface">Control de Efectivo por Tienda-Día</h3>
            </div>
            <span className="bg-surface-container px-2.5 py-0.5 rounded text-on-secondary-container text-xs font-bold">
              Tolerancia ±$10
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Cruce entre el reporte resumen de caja de sucursal contra la relación final de depósitos reportada en VENTAS AL DÍA.
          </p>

          <div className="overflow-x-auto w-full max-h-[340px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-surface-container-lowest z-10">
                <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                  <th className="py-2 px-2.5 font-bold">Tienda</th>
                  <th className="py-2 px-2.5 font-bold">Fecha</th>
                  <th className="py-2 px-2.5 text-right font-bold">Efectivo Resumen</th>
                  <th className="py-2 px-2.5 text-right font-bold">Ventas al Día</th>
                  <th className="py-2 px-2.5 text-right font-bold">Diferencia</th>
                  <th className="py-2 px-2.5 text-center font-bold">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 font-medium">
                {(cashAuditRows && cashAuditRows.length > 0 ? cashAuditRows.slice(0, 8) : [
                  { tienda: 'Santa Rosa' as any, fecha: '12/10/2026', efectivoEntregar: 8420, ventasAlDia: 8420, diferencia: 0, estatus: 'OK' as const, filas: '8', notas: 'Cuadrado exacto' },
                  { tienda: 'Cuautepec' as any, fecha: '14/10/2026', efectivoEntregar: 12540, ventasAlDia: 12455, diferencia: -85, estatus: 'Revisar' as const, filas: '14', notas: 'Diferencia excede tolerancia' },
                  { tienda: 'Tlalnepantla' as any, fecha: '20/10/2026', efectivoEntregar: 9310, ventasAlDia: 0, diferencia: -9310, estatus: 'Revisar' as const, filas: '-', notas: 'Sin registro en VENTAS AL DIA' },
                  { tienda: 'Santa Rosa' as any, fecha: '22/10/2026', efectivoEntregar: 15100, ventasAlDia: 15095, diferencia: -5, estatus: 'OK' as const, filas: '88', notas: 'OK (Tol)' }
                ]).map((row, idx) => (
                  <tr key={idx} className={`hover:bg-surface-container-low/50 ${row.estatus !== 'OK' ? 'bg-[#FEF2F2]/40' : ''}`}>
                    <td className="py-2.5 px-2.5 font-bold text-on-surface">{row.tienda}</td>
                    <td className="py-2.5 px-2.5 text-outline">{row.fecha}</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">${row.efectivoEntregar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">
                      {row.ventasAlDia > 0 ? `$${row.ventasAlDia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : <span className="text-outline italic">Sin registro</span>}
                    </td>
                    <td className={`py-2.5 px-2.5 text-right font-bold tabular-nums ${row.diferencia === 0 ? 'text-[#2F7A00]' : row.estatus === 'OK' ? 'text-[#8A5A00]' : 'text-error'}`}>
                      {row.diferencia === 0 ? '$0.00' : `${row.diferencia > 0 ? '+' : ''}$${row.diferencia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.estatus === 'OK' && row.diferencia === 0 
                          ? 'bg-[#F0FDF4] text-[#2F7A00]' 
                          : row.estatus === 'OK' 
                            ? 'bg-[#FFFBEB] text-[#8A5A00]' 
                            : 'bg-error-container text-on-error-container'
                      }`}>
                        {row.estatus === 'OK' && row.diferencia === 0 ? '✓ OK' : row.estatus === 'OK' ? 'OK (Tol.)' : 'Revisar'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between items-center text-xs text-outline">
            <span>Muestreo representativo de turnos auditados</span>
            <button onClick={() => onNavigate('pendientes')} className="text-primary hover:underline font-bold cursor-pointer">
              Ver casos en Bandeja F18 →
            </button>
          </div>
        </div>

        {/* Tabla B: Validación de Pagos a Sayer (Regla 07 · Fórmula J) */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/30 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">
                Regla 07 · Detalle de Muestreo
              </span>
              <h3 className="text-base font-bold text-on-surface">Validación de Pagos a Sayer (Fórmula J)</h3>
            </div>
            <span className="bg-[#F0FDF4] text-[#2F7A00] px-2.5 py-0.5 rounded text-xs font-bold">
              Fórmula J Cuadrada
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Comprobación estricta: <code className="bg-surface-container-low px-1.5 py-0.5 rounded font-mono text-[11px] text-primary">J = Σ Facturas - Σ Descuento - NC</code> contra salidas Banamex.
          </p>

          <div className="overflow-x-auto w-full max-h-[340px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-surface-container-lowest z-10">
                <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                  <th className="py-2 px-2.5 font-bold">Fecha Pago</th>
                  <th className="py-2 px-2.5 font-bold">Facturas</th>
                  <th className="py-2 px-2.5 text-right font-bold">Suma Fact.</th>
                  <th className="py-2 px-2.5 text-right font-bold">Esperado</th>
                  <th className="py-2 px-2.5 text-right font-bold">Pagado (J)</th>
                  <th className="py-2 px-2.5 text-right font-bold">Dif.</th>
                  <th className="py-2 px-2.5 text-center font-bold">Fila Banamex</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 font-medium">
                {(sayerAuditRows && sayerAuditRows.length > 0 ? sayerAuditRows : [
                  { descripcion: 'Esmalte y Primer Epóxico', fechaPago: '06/10/2026', facturasCount: 5, sumaFacturas: 142500, descuentoK: 2137.5, notasCredito: 0, esperado: 140362.5, pagadoJ: 140362.5, diferencia: 0, filaBanamex: 'L142' },
                  { descripcion: 'Vinílica Ultra Clean', fechaPago: '15/10/2026', facturasCount: 8, sumaFacturas: 218400, descuentoK: 3276.0, notasCredito: 0, esperado: 215124.0, pagadoJ: 215124.0, diferencia: 0, filaBanamex: 'L189' },
                  { descripcion: 'Barniz y Tintas Polyform', fechaPago: '28/10/2026', facturasCount: 6, sumaFacturas: 185200, descuentoK: 2778.0, notasCredito: 0, esperado: 182422.0, pagadoJ: 182422.0, diferencia: 0, filaBanamex: 'L240' }
                ]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 px-2.5 font-bold text-on-surface">{row.fechaPago}</td>
                    <td className="py-2.5 px-2.5 text-outline">{row.facturasCount} facs</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">${row.sumaFacturas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums text-on-surface-variant">${row.esperado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-on-surface tabular-nums">${row.pagadoJ.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-2.5 text-right text-[#2F7A00] font-bold tabular-nums">
                      {row.diferencia === 0 ? '$0.00' : `$${row.diferencia.toFixed(2)}`}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="bg-surface-container px-2 py-0.5 rounded font-mono text-[11px] text-on-surface">
                        {row.filaBanamex}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between items-center text-xs text-outline">
            <span>Amortizaciones del periodo registradas</span>
            <span className="text-[#2F7A00] font-bold">100% de coincidencia exacta</span>
          </div>
        </div>
      </section>

      {/* Banner Inferior de Confirmación Previa a Publicación */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">flag</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-on-surface">Existen {openPendingCount} pendientes antes de la publicación final</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Puedes avanzar al Paso 4 para publicar el libro con las marcas de auditoría y notas de conciliación, o resolverlos de forma asistida en la bandeja de pendientes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => onNavigate('pendientes')}
              className="px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20"
              type="button"
            >
              Revisar Pendientes Ahora
            </button>
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-[#1E6FFD] transition-colors shadow-sm cursor-pointer active:scale-95"
              type="button"
            >
              <span>Publicar y Cerrar Octubre</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm text-outline hover:text-on-surface font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Regresar a Parámetros</span>
        </button>

        <button
          onClick={onNext}
          className="h-11 px-6 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          type="button"
        >
          <span>Continuar al Paso 4: Publicar</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      {/* Modal de Detalle de Regla */}
      {selectedRuleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  {selectedRuleModal.ruleNumber} · Auditoría
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  {selectedRuleModal.title}
                </h3>
              </div>
              <button onClick={() => setSelectedRuleModal(null)} className="text-outline hover:text-on-surface p-1">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedRuleModal.description}
            </p>

            <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Tasa de Efectividad:</span>
                <span className="font-bold text-primary">{selectedRuleModal.accuracyPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Operaciones Conciliadas:</span>
                <span className="font-bold text-on-surface">{selectedRuleModal.matchedCount} de {selectedRuleModal.totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Casos en Bandeja F18:</span>
                <span className="font-bold text-error">{selectedRuleModal.pendingCount} discrepancias</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedRuleModal(null)}
                className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface"
              >
                Cerrar
              </button>
              {selectedRuleModal.pendingCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedRuleModal(null);
                    onNavigate('pendientes');
                  }}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
                >
                  Ver en Bandeja de Pendientes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
