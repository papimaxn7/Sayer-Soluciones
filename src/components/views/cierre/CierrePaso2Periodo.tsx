import React, { useState, useEffect } from 'react';
import { UploadedFileRecord } from '../../../types';

interface CierrePaso2Props {
  files: UploadedFileRecord[];
  onBack: () => void;
  onNext: () => void;
  onRunEngine?: (options: { cashTolerance: number; bankDayTolerance: number; providerThreshold: number }) => void;
  onEngineRunComplete?: () => void;
  isEngineRunDone: boolean;
}

export const CierrePaso2Periodo: React.FC<CierrePaso2Props> = ({
  files,
  onBack,
  onNext,
  onRunEngine,
  onEngineRunComplete,
  isEngineRunDone
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isMesCerrado, setIsMesCerrado] = useState(true);
  const [cashTolerance, setCashTolerance] = useState('10.00');
  const [bankDayTolerance, setBankDayTolerance] = useState('2');
  const [providerAlertThreshold, setProviderAlertThreshold] = useState('500.00');
  const [strictFeeMatching, setStrictFeeMatching] = useState(true);
  
  // Engine execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentRuleLog, setCurrentRuleLog] = useState('');
  const [completedRules, setCompletedRules] = useState<string[]>([]);

  const runReconciliationEngine = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
    setCompletedRules([]);

    const steps = [
      { progress: 12, rule: 'Regla 01', text: 'Analizando Abonos Santander ↔ Venta Tarjeta TPV (70 de 72 conciliados)...' },
      { progress: 25, rule: 'Regla 02', text: 'Cruzando Traspasos AFI ↔ Abonos Santander (58 de 60 lotes verificados)...' },
      { progress: 38, rule: 'Regla 03', text: 'Verificando Depósitos AFI Banamex ↔ Traspasos (58/58 - 100% Exacto)...' },
      { progress: 52, rule: 'Regla 04', text: 'Revisando Transferencias Clientes ↔ Resúmenes de Venta (141/158 asociadas)...' },
      { progress: 66, rule: 'Regla 05', text: 'Comprobando Depósitos en Efectivo ↔ Ventas al Día (22 de 24 cortes)...' },
      { progress: 79, rule: 'Regla 06', text: `Aplicando tolerancia ±$${cashTolerance} MXN en Efectivo Tienda-Día (71/75 turnos)...` },
      { progress: 90, rule: 'Regla 07', text: 'Calculando bonificaciones Fórmula J en compras Planta Sayer ($94,547.00)...' },
      { progress: 100, rule: 'Regla 08', text: 'Conciliando Pagos a Proveedores contra facturas Banamex (31/34 conciliadas)...' }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setExecutionProgress(step.progress);
        setCurrentRuleLog(step.text);
        setCompletedRules(prev => [...prev, `${step.rule}: ${step.text}`]);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsExecuting(false);
          const tol = parseFloat(cashTolerance) || 10.0;
          const bankDays = parseInt(bankDayTolerance) || 2;
          const provThresh = parseFloat(providerAlertThreshold) || 500.0;
          if (onRunEngine) {
            onRunEngine({ cashTolerance: tol, bankDayTolerance: bankDays, providerThreshold: provThresh });
          } else if (onEngineRunComplete) {
            onEngineRunComplete();
          }
        }, 500);
      }
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface">Paso 2: Periodo de Cierre & Parámetros del Motor</h2>
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
              {isEngineRunDone ? 'Motor Ejecutado (Listo)' : 'Pendiente de Ejecución'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Configura las fechas a procesar y los parámetros de tolerancia del motor de correspondencia para <strong className="font-semibold text-on-surface">Octubre 2026</strong>. Al presionar "Ejecutar Motor", se procesarán las 8 reglas contables.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs shrink-0">
          <div className="flex -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#67E100]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCA800]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F72800]"></span>
          </div>
          <span className="text-xs text-on-surface-variant font-semibold">
            {files.length} Archivos Enlazados
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Parameters & Settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Periodo a Conciliar */}
          <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Periodo a Conciliar</h3>
                  <span className="text-xs text-outline">Verificación temporal contra cortes fiscales y de caja</span>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-md font-semibold">
                Regla 01/08
              </span>
            </div>

            {/* Detected Period Box */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5 border border-outline-variant/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">date_range</span>
                  <span className="text-base text-on-surface font-bold">Octubre 2026 (01/10/2026 a 31/10/2026)</span>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#2F7A00] text-xs px-3 py-1 rounded-full font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#67E100]"></span>
                  Detectado en 3 Resúmenes
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tomado automáticamente del encabezado de los Resúmenes de Venta de las 3 sucursales (Santa Rosa, Cuautepec y Tlalnepantla).
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setShowCustomRange(!showCustomRange)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary font-bold group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                  <span>{showCustomRange ? 'Ocultar rango personalizado' : 'Usar otro rango / periodo personalizado'}</span>
                </button>
              </div>

              {/* Custom Range Collapsible */}
              {showCustomRange && (
                <div className="mt-2 pt-3 border-t border-outline-variant/30 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-bold uppercase tracking-wider">Desde</label>
                      <input
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        type="date"
                        defaultValue="2026-10-01"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface font-bold uppercase tracking-wider">Hasta</label>
                      <input
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                        type="date"
                        defaultValue="2026-10-31"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-error text-xs bg-error-container/30 p-2.5 rounded-lg border border-error/20">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Atención: Modificar las fechas puede generar desalineación con las carátulas bancarias del mes completo.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Switch: Modo Mes Cerrado Definitivo */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 hover:bg-surface-container-low/40 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm text-on-surface font-bold">Modo Mes Cerrado Definitivo</span>
                <span className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Garantiza que no sea un periodo parcial distorsionado. Bloquea validaciones incompletas y verifica saldos de cierre final contra libro mayor.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isMesCerrado}
                  onChange={(e) => setIsMesCerrado(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-on-primary peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </section>

          {/* Card 2: Tolerancias y Reglas del Motor */}
          <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Opciones de Tolerancia y Reglas del Motor</h3>
                  <span className="text-xs text-outline">Filtros de redondeo y emparejamiento cronológico de caja</span>
                </div>
              </div>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">Recomendado</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tolerance 1 */}
              <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Tolerancia de Efectivo Diario</span>
                  <span className="text-[11px] text-primary font-semibold">Regla 06</span>
                </label>
                <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-3 py-1.5">
                  <span className="text-xs text-outline mr-1.5 font-bold">±$</span>
                  <input
                    type="number"
                    value={cashTolerance}
                    onChange={(e) => setCashTolerance(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface w-full focus:outline-none"
                  />
                  <span className="text-[11px] text-outline font-medium">MXN</span>
                </div>
                <span className="text-[11px] text-outline">
                  Diferencias menores a este monto en el turno se aprueban automáticamente.
                </span>
              </div>

              {/* Tolerance 2 */}
              <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Desfase de Fecha Bancaria</span>
                  <span className="text-[11px] text-primary font-semibold">Regla 01, 02</span>
                </label>
                <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-3 py-1.5">
                  <span className="text-xs text-outline mr-1.5 font-bold">±</span>
                  <input
                    type="number"
                    value={bankDayTolerance}
                    onChange={(e) => setBankDayTolerance(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface w-full focus:outline-none"
                  />
                  <span className="text-[11px] text-outline font-medium">días hábiles</span>
                </div>
                <span className="text-[11px] text-outline">
                  Acepta cortes en fin de semana acreditados el siguiente lunes.
                </span>
              </div>

              {/* Tolerance 3 */}
              <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Umbral de Alerta en Proveedores</span>
                  <span className="text-[11px] text-primary font-semibold">Regla 08</span>
                </label>
                <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-3 py-1.5">
                  <span className="text-xs text-outline mr-1.5 font-bold">$</span>
                  <input
                    type="number"
                    value={providerAlertThreshold}
                    onChange={(e) => setProviderAlertThreshold(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface w-full focus:outline-none"
                  />
                  <span className="text-[11px] text-outline font-medium">MXN</span>
                </div>
                <span className="text-[11px] text-outline">
                  Envía a pendientes facturas con discrepancia mayor a esta cifra.
                </span>
              </div>

              {/* Checkbox switch */}
              <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Comisión TPV Santander</span>
                    <span className="text-[11px] text-outline block mt-0.5">
                      Descontar automáticamente 1.95% + IVA de TPV antes de comparar.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictFeeMatching}
                    onChange={(e) => setStrictFeeMatching(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer mt-1"
                  />
                </div>
                <span className="text-[10px] text-[#2F7A00] font-semibold mt-2">
                  ✓ Configuración estándar Banamex & Santander activa
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Execution Action Box & Live Terminal Log */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[100px]">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 p-6 flex flex-col gap-5">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Motor de Conciliación Sayer
              </span>
              <h3 className="text-lg font-bold text-on-surface">Ejecución del Algoritmo</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Compara los cortes de Santa Rosa, Cuautepec y Tlalne contra los movimientos bancarios de Banamex 212 y Santander 88.
              </p>
            </div>

            <div className="divide-y divide-outline-variant/20 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-outline">Periodo:</span>
                <span className="font-bold text-on-surface">Octubre 2026</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-outline">Archivos enlazados:</span>
                <span className="font-bold text-[#2F7A00]">{files.length} archivos</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-outline">Tolerancia caja:</span>
                <span className="font-bold text-on-surface">±${cashTolerance} MXN</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-outline">Blindaje:</span>
                <span className="font-bold text-primary">57 celdas manuales</span>
              </div>
            </div>

            {/* Live Progress or Completion Banner */}
            {isExecuting ? (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>Procesando Reglas Contables...</span>
                  <span>{executionProgress}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-on-surface truncate">
                  {currentRuleLog}
                </span>
              </div>
            ) : isEngineRunDone ? (
              <div className="p-4 bg-[#F0FDF4] border border-[#67E100] rounded-xl flex flex-col gap-1 text-xs text-[#2F7A00]">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>¡Conciliación Completada!</span>
                </div>
                <span>
                  8 reglas ejecutadas con éxito (94.8% de precisión). 38 partidas requieren revisión en la Bandeja F18.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                <span>Presiona el botón inferior para disparar el cruce automatizado.</span>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={runReconciliationEngine}
              disabled={isExecuting}
              className={`w-full h-11 px-5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                isExecuting
                  ? 'bg-primary/50 text-white cursor-wait'
                  : isEngineRunDone
                    ? 'bg-surface-container text-primary hover:bg-surface-container-high border border-primary/20'
                    : 'bg-primary hover:bg-[#1E6FFD] text-on-primary'
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[20px] ${isExecuting ? 'animate-spin' : ''}`}>
                {isExecuting ? 'sync' : isEngineRunDone ? 'replay' : 'bolt'}
              </span>
              <span>
                {isExecuting
                  ? 'Ejecutando...'
                  : isEngineRunDone
                    ? 'Volver a Correr Conciliación'
                    : 'Ejecutar Motor de Conciliación'}
              </span>
            </button>

            {/* Advance to Step 3 CTA when done */}
            {isEngineRunDone && (
              <button
                onClick={onNext}
                className="w-full h-11 px-5 rounded-lg bg-[#2F7A00] hover:bg-[#256300] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                type="button"
              >
                <span>Avanzar al Paso 3: Resultados</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nav Back / Forward */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm text-outline hover:text-on-surface font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Regresar a Paso 1 (Archivos)</span>
        </button>

        {isEngineRunDone ? (
          <button
            onClick={onNext}
            className="h-11 px-6 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <span>Continuar al Paso 3: Resultados</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button
            disabled
            className="h-11 px-6 rounded-lg bg-surface-container text-outline text-sm font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
            type="button"
            title="Debes ejecutar primero el motor de conciliación para desbloquear el Paso 3"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Paso 3 Bloqueado (Ejecuta el motor)</span>
          </button>
        )}
      </div>
    </div>
  );
};
