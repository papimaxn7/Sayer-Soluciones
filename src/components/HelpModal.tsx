import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-5 max-h-[85vh] overflow-y-auto animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Logo_Sayer_Soluciones_-_General_a25d2f77.png"
              alt="Sayer Soluciones"
              className="w-28 h-auto object-contain shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-on-surface">Guía de Operación y Reglas SayerPro</h3>
              <span className="text-xs text-outline font-medium">Metodología oficial de cierre financiero y auditoría</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-4 text-xs text-on-surface-variant">
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
            <h4 className="font-bold text-on-surface text-sm mb-1 flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
              <span>1. Flujo de 4 Pasos del Cierre</span>
            </h4>
            <p className="leading-relaxed">
              El proceso garantiza el blindaje de datos: <strong>Paso 1</strong> ingesta y valida 5 libros; <strong>Paso 2</strong> verifica el periodo de mes cerrado y tolerancias; <strong>Paso 3</strong> ejecuta las 8 reglas contables sin alterar celdas manuales; y <strong>Paso 4</strong> emite los libros oficiales (.xlsx) y publica métricas directivas.
            </p>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
            <h4 className="font-bold text-on-surface text-sm mb-1 flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>2. Las 8 Reglas Contables del Motor</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed">
              <li><strong>R01 & R02:</strong> Abonos y traspasos TPV Santander (Afiliaciones 9731247 y 8581544) contra ventas con tarjeta de crédito/débito.</li>
              <li><strong>R03:</strong> Depósitos de concentración en cuenta maestra Banamex 212.</li>
              <li><strong>R04:</strong> Identificación de transferencias bancarias de clientes contra notas de venta.</li>
              <li><strong>R05 & R06:</strong> Cuadre de efectivo físico en mostrador contra fichas de depósito (Tolerancia ±$10 MXN).</li>
              <li><strong>R07:</strong> Pagos a planta Sayer con cálculo de bonificaciones por volumen (Fórmula J).</li>
              <li><strong>R08:</strong> Pagos a proveedores de insumos (brochas, solventes, abrasivos).</li>
            </ul>
          </div>

          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
            <h4 className="font-bold text-on-surface text-sm mb-1 flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
              <span>3. Criterio de Reparto Normativo (Prorrateo)</span>
            </h4>
            <p className="leading-relaxed">
              Para determinar la utilidad real por tienda (Santa Rosa, Cuautepec, Tlalne), la mercancía y gastos centrales se asignan de acuerdo al porcentaje de venta bruta de cada sucursal. Los márgenes netos reflejan fielmente el control de egresos propios (renta, nómina local y gastos operativos).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs cursor-pointer hover:bg-[#1E6FFD]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
