import React, { useState } from 'react';
import { TableroSubTab, StoreName, FullReconciliationResult } from '../../types';
import { 
  STORE_PROFITABILITY_DATA, 
  DAILY_SALES_OCTOBER, 
  STORE_EXPENSES, 
  SAYER_PURCHASES, 
  PROVIDERS_ACCOUNTS,
  PRODUCT_FAMILIES 
} from '../../data/mockData';

interface TableroViewProps {
  initialSubTab?: TableroSubTab;
  reconciliationResult?: FullReconciliationResult;
}

export const TableroView: React.FC<TableroViewProps> = ({ initialSubTab = 'resumen', reconciliationResult }) => {
  const [activeSubTab, setActiveSubTab] = useState<TableroSubTab>(initialSubTab);
  const [selectedPeriod, setSelectedPeriod] = useState('Octubre 2026');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('Todas');

  const diag = reconciliationResult?.diagnostics;
  const profitabilityData = reconciliationResult?.storeProfitability || STORE_PROFITABILITY_DATA;
  const salesData = reconciliationResult?.dailySales || DAILY_SALES_OCTOBER;
  const expensesData = reconciliationResult?.storeExpenses || STORE_EXPENSES;
  const sayerPurchasesData = reconciliationResult?.sayerPurchases || SAYER_PURCHASES;
  const providersData = reconciliationResult?.providerAccounts || PROVIDERS_ACCOUNTS;

  const subTabs = [
    { id: 'resumen', label: 'Resumen ejecutivo', icon: 'analytics', badge: null },
    { id: 'ventas', label: 'Ventas', icon: 'point_of_sale', badge: null },
    { id: 'egresos', label: 'Egresos de tienda', icon: 'receipt_long', badge: diag && diag.storeOwnExpenseFlags['Tlalnepantla'] === 'AMARILLO' ? '1 alerta' : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'rentabilidad', label: 'Rentabilidad por sucursal', icon: 'query_stats', badge: null },
    { id: 'efectivo', label: 'Efectivo', icon: 'payments', badge: '-$1.2k', badgeColor: 'bg-error-container text-on-error-container' },
    { id: 'compras', label: 'Compras Sayer', icon: 'inventory_2', badge: null },
    { id: 'proveedores', label: 'Proveedores', icon: 'local_shipping', badge: null }
  ];

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Filter & Export Bar */}
      <section className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
            <span className="text-outline uppercase text-[11px] font-bold">Periodo:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="Octubre 2026">Octubre 2026 (Cerrado)</option>
              <option value="Septiembre 2026">Septiembre 2026</option>
              <option value="Comparativo Oct vs Sep">Comparativo Oct vs Sep</option>
            </select>
          </div>

          {/* Store filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 text-xs">
            <span className="material-symbols-outlined text-[16px] text-outline">store</span>
            <span className="text-outline uppercase text-[11px] font-bold">Sucursal:</span>
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="Todas">Consolidado (3 Sucursales)</option>
              <option value="Santa Rosa">Santa Rosa (Matriz)</option>
              <option value="Cuautepec">Cuautepec</option>
              <option value="Tlalnepantla">Tlalnepantla</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPeriod('Octubre 2026');
              setSelectedStoreFilter('Todas');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Restablecer</span>
          </button>

          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,TABLERO_REPORTE,SayerPro Cierre Directivo\nPERIODO," + selectedPeriod + "\nSUCURSAL," + selectedStoreFilter + "\nVENTAS_TOTALES,1850000\nUTILIDAD_ESTIMADA,248760\nMARGEN_NETO,13.4%";
              const link = document.createElement("a");
              link.setAttribute("href", encodeURI(csvContent));
              link.setAttribute("download", `Reporte_Directivo_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Exportar Reporte</span>
          </button>
        </div>
      </section>

      {/* Pestañas Financieras de Navegación del Tablero (7 tabs) */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as TableroSubTab)}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SUB-TAB 1: RESUMEN EJECUTIVO */}
      {activeSubTab === 'resumen' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Executive Diagnosis Header */}
          <section className="bg-gradient-to-r from-surface-container to-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-primary uppercase font-bold tracking-wider">Lectura del Periodo</span>
                  <span className="text-outline text-xs">·</span>
                  <span className="text-[11px] text-outline font-semibold">Cierre Definitivo Validado</span>
                </div>
                <p className="text-sm font-medium text-on-surface leading-snug mt-0.5">
                  Octubre 2026: venta de <strong className="text-primary font-bold">$1,850,000</strong>, utilidad estimada de <strong className="text-[#053889] font-bold">$248,760 (13.4% de la venta)</strong>; Santa Rosa aporta <strong className="text-primary font-bold">44.3%</strong> de la venta total.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] text-[#2F7A00] text-xs font-bold shrink-0">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Periodo Positivo</span>
            </div>
          </section>

          {/* 6 Key KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Venta Total</span>
              <div className="text-2xl font-bold text-primary mt-2 tabular-nums">$1.85 M</div>
              <span className="text-[11px] text-[#2F7A00] font-semibold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +4.2% vs sep
              </span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Utilidad Est.</span>
              <div className="text-2xl font-bold text-[#053889] mt-2 tabular-nums">$248,760</div>
              <span className="text-[11px] text-[#2F7A00] font-semibold mt-1 block">13.4% de la venta</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Compras Sayer</span>
              <div className="text-2xl font-bold text-on-surface mt-2 tabular-nums">$914,200</div>
              <span className="text-[11px] text-secondary font-medium mt-1 block">Bonif. F-J: $94.5k</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Egresos Tienda</span>
              <div className="text-2xl font-bold text-on-surface mt-2 tabular-nums">$382,100</div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Renta Tlalne +12%</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Efectivo en Caja</span>
              <div className="text-2xl font-bold text-on-surface mt-2 tabular-nums">$289,450</div>
              <span className="text-[11px] text-error font-semibold mt-1 block">Dif. -$1,220 (24 fichas)</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Margen Bruto</span>
              <div className="text-2xl font-bold text-primary mt-2 tabular-nums">50.6%</div>
              <span className="text-[11px] text-[#2F7A00] font-semibold mt-1 block">Meta 48% superada</span>
            </div>
          </div>

          {/* Payment Methods & Product Mix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Payment Methods Distribution (5 cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                    <span>Ventas por Medio de Cobro</span>
                  </h3>
                  <span className="text-xs text-outline font-semibold">$1,850,000</span>
                </div>

                <div className="flex flex-col gap-3 my-2">
                  {/* Cash */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-on-surface">Efectivo Físico en Mostrador</span>
                      <span className="font-bold text-on-surface">$820,500 (44.3%)</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-[#67E100] h-full rounded-full" style={{ width: '44.3%' }}></div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-on-surface">Tarjeta TPV (Santander / BBVA)</span>
                      <span className="font-bold text-on-surface">$648,300 (35.0%)</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '35.0%' }}></div>
                    </div>
                  </div>

                  {/* Transfer */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-on-surface">Transferencia SPEI Clientes</span>
                      <span className="font-bold text-on-surface">$381,200 (20.7%)</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '20.7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg text-[11px] text-on-surface-variant mt-4">
                El efectivo representa el 44.3% del flujo operativo. Se mantiene dentro del umbral seguro con depósitos interdiarios en Banamex.
              </div>
            </div>

            {/* Product Family Sales Mix (7 cols) */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">format_paint</span>
                    <span>Mix de Ventas por Familia Sayer</span>
                  </h3>
                  <span className="text-xs text-outline font-semibold">Catálogo Oficial 2026</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
                  {PRODUCT_FAMILIES.map((fam) => (
                    <div key={fam.name} className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-on-surface truncate">{fam.name}</span>
                        <span className="font-bold text-primary">{fam.share}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-outline">
                        <span>${fam.sales.toLocaleString('es-MX')}</span>
                        <span className="text-[#2F7A00] font-semibold">{fam.growth}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${fam.share * 2.2}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-xs">
                <span className="text-outline">Familia líder en rentabilidad:</span>
                <span className="font-bold text-primary">Esmaltes y Primarios Sayer ($684,500)</span>
              </div>
            </div>
          </div>

          {/* Lista de Diagnósticos Semafóricos (10 Reglas Directivas Oficiales de SayerPro) */}
          <section className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">traffic</span>
                <h3 className="text-base font-bold text-on-surface">
                  Lista de Diagnósticos Semafóricos (10 Reglas Directivas)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#2F7A00]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F7A00]"></span> 5 Saludables
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FCA800]"></span> 2 Observaciones
                </span>
                <span className="flex items-center gap-1.5 text-outline">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span> 3 Informativos
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {/* Regla 1: Utilidad (Verde) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-[#2F7A00] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold text-[#2F7A00]">Utilidad estimada de $248,760:</strong> 13.4% de cada peso vendido. Es positiva y saludable para la red.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Indicador de margen operativo global</span>
                </div>
              </div>

              {/* Regla 2: Participación (Neutro) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-outline-variant shrink-0 mt-1"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold">Participación en la venta:</strong> Santa Rosa 44.3%, Cuautepec 30.3%, Tlalne 25.4%.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Santa Rosa continúa como motor principal del flujo de caja</span>
                </div>
              </div>

              {/* Regla 3: Santa Rosa Egresos (Verde) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-[#2F7A00] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold text-on-surface">Santa Rosa</strong> gasta <strong className="text-[#2F7A00] font-bold">6.8%</strong> de su venta en egresos de tienda. Dentro del límite de 10%.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Venta: $820k · Gasto tienda: $55,760</span>
                </div>
              </div>

              {/* Regla 4: Cuautepec Egresos (Verde) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-[#2F7A00] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold text-on-surface">Cuautepec</strong> gasta <strong className="text-[#2F7A00] font-bold">8.9%</strong> de su venta en egresos de tienda. Dentro del límite de 10%.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Venta: $560k · Gasto tienda: $49,840</span>
                </div>
              </div>

              {/* Regla 5: Tlalne Egresos (Ámbar Alerta) */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 transition-colors border border-amber-300">
                <div className="w-3 h-3 rounded-full bg-[#FCA800] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold text-amber-900">⚠️ Tlalne gasta 11.2%</strong> de su venta en egresos de tienda ($52,640). Rebasa el límite de 10%.
                  </span>
                  <button
                    onClick={() => setActiveSubTab('rentabilidad')}
                    className="text-xs text-primary hover:underline font-bold mt-1 flex items-center gap-1 cursor-pointer text-left"
                  >
                    <span>Ver desglose de renta y costos en Rentabilidad</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Regla 6: Cancelaciones (Verde) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-[#2F7A00] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold">Cancelaciones por error:</strong> $41,000 = 2.2% de la venta. Debajo del límite de 3%. Las globales para refacturar ($22,500) no penalizan.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Auditoría de tickets completada sin anomalías de dolo</span>
                </div>
              </div>

              {/* Regla 7: Efectivo Recibido vs Entregar (Ámbar Alerta) */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 transition-colors border border-amber-300">
                <div className="w-3 h-3 rounded-full bg-[#FCA800] shrink-0 mt-1 shadow-xs"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold text-amber-900">⚠️ Efectivo recibido menos efectivo a entregar: -$1,240.</strong> Fuera del rango de tolerancia de ±$500.
                  </span>
                  <button
                    onClick={() => setActiveSubTab('efectivo')}
                    className="text-xs text-primary hover:underline font-bold mt-1 flex items-center gap-1 cursor-pointer text-left"
                  >
                    <span>Revisar arqueo físico en pestaña Efectivo</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Regla 8: Compras Mercancía (Neutro) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-outline-variant shrink-0 mt-1"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold">Compras de mercancía:</strong> 65.7% de la venta; Sayer representa 92.2% de las compras totales.
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Almacén central y reabastecimiento en orden</span>
                </div>
              </div>

              {/* Regla 9: Sayer Condiciones y Plazos (Neutro) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-outline-variant shrink-0 mt-1"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold">Sayer:</strong> 46 facturas procesadas, descuento promedio obtenido 1.5%, pagadas en 4.3 días en promedio (3 sin pago registrado).
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Línea de crédito comercial en condiciones óptimas</span>
                </div>
              </div>

              {/* Regla 10: Retiros y Pagos Personales (Neutro) */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/15">
                <div className="w-3 h-3 rounded-full bg-outline-variant shrink-0 mt-1"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface leading-snug">
                    <strong className="font-bold">Retiros y pagos personales de socios:</strong> $24,500 (no se restan de la utilidad estimada por regla financiera interna).
                  </span>
                  <span className="text-[11px] text-outline mt-0.5">Contabilizados como anticipo de dividendos en balance general</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer de Confirmación y Cierre Directivo */}
          <footer className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#2F7A00] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-on-surface">Validado y Autorizado por Dirección General</span>
                <span className="text-outline">Rodolfo · Cierre Contable Certificado para Sayer México</span>
              </div>
            </div>
            <div className="text-xs text-outline font-mono">
              Firma Digital SHA256: 8f4b...39e1
            </div>
          </footer>
        </div>
      )}

      {/* SUB-TAB 2: VENTAS */}
      {activeSubTab === 'ventas' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-on-surface">Evolución Diaria de Ventas · Octubre 2026</h3>
                <span className="text-xs text-outline">Registro sincronizado de las 3 sucursales</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#67E100]"></span> Santa Rosa
                </span>
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FCA800]"></span> Cuautepec
                </span>
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F72800]"></span> Tlalnepantla
                </span>
              </div>
            </div>

            {/* Visual Bar Graph */}
            <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-outline-variant/20 overflow-x-auto">
              {DAILY_SALES_OCTOBER.map((day) => {
                const heightPercent = Math.min(100, (day.total / 120000) * 100);
                return (
                  <div key={day.date} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end group">
                    <div 
                      className="w-full bg-primary hover:bg-[#1E6FFD] rounded-t transition-all group-hover:scale-y-105"
                      style={{ height: `${heightPercent}%` }}
                      title={`${day.date} (${day.dayName}): $${day.total.toLocaleString('es-MX')}`}
                    ></div>
                    <span className="text-[10px] text-outline font-medium truncate w-full text-center">
                      {day.date.slice(0, 5)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Daily Sales Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">Fecha</th>
                    <th className="py-2.5 px-3 font-bold">Día</th>
                    <th className="py-2.5 px-3 text-right font-bold">Santa Rosa</th>
                    <th className="py-2.5 px-3 text-right font-bold">Cuautepec</th>
                    <th className="py-2.5 px-3 text-right font-bold">Tlalnepantla</th>
                    <th className="py-2.5 px-3 text-right font-bold text-primary">Venta Total</th>
                    <th className="py-2.5 px-3 text-right font-bold">Efectivo</th>
                    <th className="py-2.5 px-3 text-right font-bold">Tarjeta</th>
                    <th className="py-2.5 px-3 text-right font-bold">Transferencia</th>
                    <th className="py-2.5 px-3 text-center font-bold">Tickets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-medium">
                  {DAILY_SALES_OCTOBER.map((row) => (
                    <tr key={row.date} className="hover:bg-surface-container-low/50">
                      <td className="py-2 px-3 font-bold text-on-surface">{row.date}</td>
                      <td className="py-2 px-3 text-outline">{row.dayName}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.santaRosa.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.cuautepec.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right tabular-nums">${row.tlalne.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right font-bold text-primary tabular-nums">${row.total.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">${row.cashAmount.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">${row.cardAmount.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">${row.transferAmount.toLocaleString('es-MX')}</td>
                      <td className="py-2 px-3 text-center text-outline">{row.ticketsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EGRESOS DE TIENDA */}
      {activeSubTab === 'egresos' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Alert Header */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-700 text-[24px]">warning</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-900">Alerta de Desvío Presupuestal: Renta Sucursal Tlalnepantla</span>
                <span className="text-xs text-amber-800">
                  El recibo de renta de Tlalnepantla ($14,000.00 MXN) presenta un incremento del 12% sobre el presupuesto autorizado de $12,500.00 MXN.
                </span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-300 transition-colors shrink-0">
              Ver detalle de contrato
            </button>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">Egresos Operativos por Sucursal</h3>
                <span className="text-xs text-outline">Total comprobado en octubre: $382,100.00 MXN</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                10 partidas registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">Folio</th>
                    <th className="py-2.5 px-3 font-bold">Sucursal</th>
                    <th className="py-2.5 px-3 font-bold">Categoría</th>
                    <th className="py-2.5 px-3 font-bold">Concepto</th>
                    <th className="py-2.5 px-3 text-right font-bold">Monto</th>
                    <th className="py-2.5 px-3 font-bold">Fecha</th>
                    <th className="py-2.5 px-3 font-bold">Autorizó</th>
                    <th className="py-2.5 px-3 text-center font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-medium">
                  {STORE_EXPENSES.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-outline">{exp.folio}</td>
                      <td className="py-2.5 px-3 font-bold text-on-surface">{exp.store}</td>
                      <td className="py-2.5 px-3 text-on-surface-variant">{exp.category}</td>
                      <td className="py-2.5 px-3 text-on-surface">{exp.concept}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-on-surface tabular-nums">
                        ${exp.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-outline">{exp.date}</td>
                      <td className="py-2.5 px-3 text-on-surface">{exp.approvedBy}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          exp.status === 'Autorizado'
                            ? 'bg-[#F0FDF4] text-[#2F7A00]'
                            : exp.status === 'Excedente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RENTABILIDAD POR SUCURSAL */}
      {activeSubTab === 'rentabilidad' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Methodology Banner */}
          <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3.5 border border-outline-variant/30 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Criterio de Reparto Normativo Sayer
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                La mercancía (<strong className="text-on-surface font-semibold">$1,215,000</strong>), gastos centrales (<strong className="text-on-surface font-semibold">$210,000</strong>) y servicios generales (<strong className="text-on-surface font-semibold">$18,000</strong>) no traen sucursal asignada en el libro; se prorratean de forma proporcional a la venta bruta de cada tienda. Las variaciones de rentabilidad neta derivan estrictamente de la eficiencia en egresos propios.
              </p>
            </div>
          </div>

          {/* Master Profitability Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
            <div className="p-4 bg-surface-container-low flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">table_chart_view</span>
                <h3 className="text-sm font-bold text-on-surface">
                  Tabla Maestra de Rentabilidad por Sucursal (Cierre Octubre 2026)
                </h3>
              </div>
              <span className="text-xs text-[#2F7A00] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Consolidación calculada al 100% de venta verificada</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/60 text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="py-2.5 px-3 font-bold">Sucursal</th>
                    <th className="py-2.5 px-3 text-right font-bold">Venta Total</th>
                    <th className="py-2.5 px-3 text-right font-bold">% Part.</th>
                    <th className="py-2.5 px-3 text-right font-bold">Sueldos</th>
                    <th className="py-2.5 px-3 text-right font-bold">Renta</th>
                    <th className="py-2.5 px-3 text-right font-bold">Gasto Oper.</th>
                    <th className="py-2.5 px-3 text-right font-bold text-on-surface">Egresos Propios</th>
                    <th className="py-2.5 px-3 text-center font-bold">% Egr/Venta</th>
                    <th className="py-2.5 px-3 text-right font-bold">Merc. + Asignados</th>
                    <th className="py-2.5 px-3 text-right font-bold text-primary">Utilidad Estimada</th>
                    <th className="py-2.5 px-3 text-center font-bold">% Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 font-medium">
                  {STORE_PROFITABILITY_DATA.map((st) => (
                    <tr key={st.store} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-3 font-bold text-on-surface flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          st.store === 'Santa Rosa' ? 'bg-[#67E100]' : st.store === 'Cuautepec' ? 'bg-[#FCA800]' : 'bg-[#F72800]'
                        }`}></span>
                        <span>{st.store}</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-on-surface">${st.sales.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-right text-outline">{st.sharePercent}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">${st.salaries.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">${st.rent.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">${st.opExpenses.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-on-surface">${st.ownExpenses.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#2F7A00]">
                          {st.expToSalesRatio}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">${st.assignedMerchandise.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-primary text-sm">${st.netProfit.toLocaleString('es-MX')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDF4] text-[#2F7A00]">
                          <span className="material-symbols-outlined text-[13px]">arrow_drop_up</span>
                          {st.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/30">
                    <td className="py-3 px-3">TOTAL GENERAL</td>
                    <td className="py-3 px-3 text-right tabular-nums text-primary text-sm">$1,850,000</td>
                    <td className="py-3 px-3 text-right">100.0%</td>
                    <td className="py-3 px-3 text-right tabular-nums">$93,200</td>
                    <td className="py-3 px-3 text-right tabular-nums">$31,500</td>
                    <td className="py-3 px-3 text-right tabular-nums">$33,540</td>
                    <td className="py-3 px-3 text-right tabular-nums">$158,240</td>
                    <td className="py-3 px-3 text-center">8.6%</td>
                    <td className="py-3 px-3 text-right tabular-nums">$1,443,000</td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#053889] text-sm">$248,760</td>
                    <td className="py-3 px-3 text-center text-[#2F7A00]">13.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: EFECTIVO */}
      {activeSubTab === 'efectivo' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Efectivo Cobrado</span>
              <div className="text-2xl font-bold text-on-surface mt-2">$820,500.00</div>
              <span className="text-xs text-outline mt-1 block">44.3% de la venta global</span>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Depositado en Banco</span>
              <div className="text-2xl font-bold text-[#2F7A00] mt-2">$819,280.00</div>
              <span className="text-xs text-[#2F7A00] mt-1 block">24 fichas de depósito Banamex</span>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Diferencia Acumulada</span>
              <div className="text-2xl font-bold text-error mt-2">-$1,220.00</div>
              <span className="text-xs text-error font-medium mt-1 block">4 turnos fuera de tolerancia (±$10)</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-3">Arqueos de Caja con Discrepancia Pendiente</h3>
            <div className="divide-y divide-outline-variant/20 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-on-surface block">15/10/2026 · Santa Rosa Turno 2 (Cajero Pedro H.)</span>
                  <span className="text-outline">Corte Z: $24,150 vs Sobre entregado: $22,700</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-error block">Faltante -$1,450.00</span>
                  <span className="text-[11px] text-outline">Enviado a Bandeja F18</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-on-surface block">22/10/2026 · Cuautepec Turno 1 (Cajera Sonia G.)</span>
                  <span className="text-outline">Corte Z: $15,200 vs Sobre entregado: $15,650</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2F7A00] block">Sobrante +$450.00</span>
                  <span className="text-[11px] text-outline">Enviado a Bandeja F18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: COMPRAS SAYER */}
      {activeSubTab === 'compras' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">Facturación de Pedidos Directos Planta Sayer</h3>
                <span className="text-xs text-outline">Descuentos comerciales y bonificaciones de Fórmula J aplicadas</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                5 Pedidos · Octubre 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">Fecha</th>
                    <th className="py-2.5 px-3 font-bold">Factura Sayer</th>
                    <th className="py-2.5 px-3 font-bold">Descripción</th>
                    <th className="py-2.5 px-3 text-right font-bold">Importe Bruto</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#2F7A00]">Fórmula J</th>
                    <th className="py-2.5 px-3 text-right font-bold text-primary">Importe Pagado</th>
                    <th className="py-2.5 px-3 text-center font-bold">Estado Banamex</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-medium">
                  {SAYER_PURCHASES.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-3 font-bold text-on-surface">{p.date}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-primary">{p.invoice}</td>
                      <td className="py-2.5 px-3 text-on-surface">{p.description}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">${p.grossAmount.toLocaleString('es-MX')}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#2F7A00]">-${p.formulaJDiscount.toLocaleString('es-MX')}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-primary">${p.netAmount.toLocaleString('es-MX')}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-[#F0FDF4] text-[#2F7A00] text-[10px] px-2 py-0.5 rounded-full font-bold">
                          ✓ {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/30">
                    <td className="py-3 px-3" colSpan={3}>TOTAL COMPRAS PLANTA SAYER</td>
                    <td className="py-3 px-3 text-right tabular-nums">$1,008,200</td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#2F7A00]">-$94,000</td>
                    <td className="py-3 px-3 text-right tabular-nums text-primary text-sm">$914,200</td>
                    <td className="py-3 px-3 text-center text-[#2F7A00]">100% Cuadrado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PROVEEDORES */}
      {activeSubTab === 'proveedores' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-on-surface">Cuentas por Pagar y Proveedores Externos</h3>
                <span className="text-xs text-outline">Pestaña PROVEDORES cruzada contra extractos Banamex</span>
              </div>
              <span className="text-xs font-bold text-outline">5 proveedores recurrentes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-bold">Proveedor</th>
                    <th className="py-2.5 px-3 font-bold">Factura</th>
                    <th className="py-2.5 px-3 font-bold">Concepto Insumo</th>
                    <th className="py-2.5 px-3 text-right font-bold">Monto</th>
                    <th className="py-2.5 px-3 font-bold">Vencimiento</th>
                    <th className="py-2.5 px-3 font-bold">Cuenta Cargo</th>
                    <th className="py-2.5 px-3 text-center font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-medium">
                  {PROVIDERS_ACCOUNTS.map((prov) => (
                    <tr key={prov.id} className="hover:bg-surface-container-low/50">
                      <td className="py-2.5 px-3 font-bold text-on-surface">{prov.provider}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-primary">{prov.invoice}</td>
                      <td className="py-2.5 px-3 text-on-surface-variant">{prov.concept}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-on-surface">
                        ${prov.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-outline">{prov.dueDate}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{prov.bankAccount}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prov.status === 'Conciliado'
                            ? 'bg-[#F0FDF4] text-[#2F7A00]'
                            : prov.status === 'En Proceso'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-error-container text-on-error-container'
                        }`}>
                          {prov.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
