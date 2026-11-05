import React, { useState } from 'react';
import { NavigationTab, PendingItem, FullReconciliationResult } from '../../../types';
import { LOGO_URL } from '../../../data/mockData';
import { downloadReconciledMasterWorkbook, downloadPendingsWorkbook } from '../../../utils/excelEngine';
import { generateReconciledMasterWorkbook } from '../../../utils/sayerEngine';

interface CierrePaso4Props {
  onBack: () => void;
  onPublishSuccess: () => void;
  isPublished: boolean;
  openPendingCount: number;
  onNavigate: (tab: NavigationTab) => void;
  pendings: PendingItem[];
  reconciliationResult?: FullReconciliationResult;
}

export const CierrePaso4Publicar: React.FC<CierrePaso4Props> = ({
  onBack,
  onPublishSuccess,
  isPublished,
  openPendingCount,
  onNavigate,
  pendings,
  reconciliationResult
}) => {
  const [downloadingBook, setDownloadingBook] = useState(false);
  const [downloadingPendings, setDownloadingPendings] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState('');

  const handleDownloadMaster = () => {
    setDownloadingBook(true);
    setTimeout(() => {
      if (reconciliationResult) {
        generateReconciledMasterWorkbook(reconciliationResult);
      } else {
        downloadReconciledMasterWorkbook();
      }
      setDownloadingBook(false);
      setDownloadSuccessMsg('Libro SAYER_VENTAS_Octubre_CONCILIADO.xlsx generado y descargado correctamente con pestañas CONTROL y PENDIENTES.');
      setTimeout(() => setDownloadSuccessMsg(''), 5000);
    }, 600);
  };

  const handleDownloadPendings = () => {
    setDownloadingPendings(true);
    setTimeout(() => {
      downloadPendingsWorkbook(pendings);
      setDownloadingPendings(false);
      setDownloadSuccessMsg(`Libro PENDIENTES_Octubre_2026.xlsx generado y descargado con los ${pendings.length} casos de auditoría.`);
      setTimeout(() => setDownloadSuccessMsg(''), 5000);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Consolidación Mensual de Libros Contables</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Publicación del Cierre y Entrega de Resultados</h1>
          <p className="text-sm text-on-surface-variant max-w-4xl">
            El periodo <strong className="text-on-surface font-semibold">Octubre 2026</strong> ha sido conciliado satisfactoriamente. Descarga los libros oficiales de auditoría y publica los datos definitivos al Tablero Directivo para habilitar el reporte ejecutivo.
          </p>
        </div>

        {/* Indicador de Calidad */}
        <div className="flex items-center gap-3 bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xs shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-outline uppercase font-bold tracking-wider">Efectividad de Motor</span>
            <span className="text-lg font-bold text-[#2F7A00]">99.42%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#2F7A00] flex items-center justify-center shadow-2xs">
            <span className="material-symbols-outlined text-[22px]">auto_graph</span>
          </div>
        </div>
      </section>

      {downloadSuccessMsg && (
        <div className="p-3.5 bg-[#F0FDF4] border border-[#67E100] text-[#2F7A00] rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{downloadSuccessMsg}</span>
          </div>
          <button onClick={() => setDownloadSuccessMsg('')} className="p-1 hover:opacity-75 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Banner de Advertencia Informativa de Pendientes */}
      <section className="w-full bg-[#FFFBEB] border border-amber-300/80 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FCA800]/20 text-[#8A5A00] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[24px]">notification_important</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#8A5A00]">{openPendingCount} pendientes abiertos</span>
                <span className="bg-[#FCA800]/30 text-[#8A5A00] text-xs px-2 py-0.5 rounded-full font-bold">
                  {38 - openPendingCount} de 38 revisados
                </span>
              </div>
              <p className="text-xs text-on-surface-variant max-w-4xl">
                Puedes publicar ahora para habilitar las métricas directivas; la bandeja de pendientes conservará los casos para resolverlos en cualquier momento sin afectar la estabilidad del tablero.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('pendientes')}
            className="inline-flex items-center gap-1.5 bg-surface-container-lowest text-[#8A5A00] hover:text-[#5B3900] px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs shrink-0 whitespace-nowrap self-start md:self-center cursor-pointer border border-amber-200"
            type="button"
          >
            <span>Revisar pendientes en bandeja</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 3 Tarjetas de Salida Lado a Lado */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Tarjeta 1: Libro Conciliado Oficial */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-on-surface">1. Libro Conciliado Oficial</span>
              <span className="bg-primary/10 text-primary text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Libro Maestro
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-surface-container-low p-3.5 rounded-lg mb-4 border border-outline-variant/20">
              <img
                src={LOGO_URL}
                alt="Sayer Soluciones"
                className="w-16 h-auto object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-on-surface truncate" title="SAYER_VENTAS_Octubre_CONCILIADO.xlsx">
                  SAYER_VENTAS_Octubre_CONCILIADO.xlsx
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-outline mt-0.5">
                  <span>Formato Excel XLSX</span>
                  <span>•</span>
                  <span className="font-semibold text-on-surface">4.8 MB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <span className="text-[11px] text-outline uppercase tracking-wider mb-2 font-bold">Contenido generado</span>
              <ul className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2F7A00] shrink-0 mt-0.5">check</span>
                  <span>Columnas <strong className="text-on-surface font-semibold">DOCUMENTO</strong> llenas en las 5 pestañas de sucursal.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2F7A00] shrink-0 mt-0.5">check</span>
                  <span><strong className="text-on-surface font-semibold">34 renglones</strong> de detalle AFI insertados con fórmulas ajustadas.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2F7A00] shrink-0 mt-0.5">check</span>
                  <span>Pestaña nueva <strong className="text-on-surface font-semibold">'CONTROL OCT-26'</strong> con matriz de cuadre contable.</span>
                </li>
              </ul>
            </div>

            {/* Color Legend */}
            <div className="flex flex-col bg-surface-container-low p-3 rounded-lg mb-4 text-[11px]">
              <span className="text-[10px] text-outline uppercase tracking-wider mb-1.5 font-bold">Leyenda cromática de auditoría</span>
              <div className="flex flex-col gap-1 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary shrink-0"></span>
                  <span>Transferencia conciliada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#67E100] shrink-0"></span>
                  <span>Detalle de notas con tarjeta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#FCA800] shrink-0"></span>
                  <span>Conciliado con observación</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#F72800] shrink-0"></span>
                  <span>Pendiente sin correspondencia</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadMaster}
            disabled={downloadingBook}
            className="w-full h-10 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer disabled:opacity-75"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{downloadingBook ? 'Generando Excel XLSX...' : 'Descargar Libro Conciliado (.xlsx)'}</span>
          </button>
        </div>

        {/* Tarjeta 2: Libro de Pendientes */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-on-surface">2. Libro de Pendientes</span>
              <span className="bg-[#FFFBEB] text-[#8A5A00] text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Auditoría F18
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-surface-container-low p-3.5 rounded-lg mb-4 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-lg bg-[#365BAD] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[28px]">receipt_long</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-on-surface truncate" title="PENDIENTES_Octubre_2026.xlsx">
                  PENDIENTES_Octubre_2026.xlsx
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-outline mt-0.5">
                  <span>Archivo de Trabajo F18</span>
                  <span>•</span>
                  <span className="font-semibold text-on-surface">1.2 MB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <span className="text-[11px] text-outline uppercase tracking-wider mb-2 font-bold">Contenido exportable</span>
              <ul className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">filter_list</span>
                  <span><strong className="text-on-surface font-semibold">38 pendientes</strong> clasificados exhaustivamente por categoría.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">compare_arrows</span>
                  <span>Esquema <strong className="text-on-surface font-semibold">Lado A vs Lado B</strong> con desglose bancario.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">smart_toy</span>
                  <span>Sugerencia analítica del motor para resolución de cada discrepancia.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">sync</span>
                  <span>Estado: <strong className="text-[#2F7A00] font-semibold">{38 - openPendingCount} revisados</strong>, <strong className="text-[#C21F00] font-semibold">{openPendingCount} abiertos</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">edit_note</span>
                  <span>Notas de bitácora y justificaciones capturadas por Rodolfo y Max.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 bg-surface-container-low p-3 rounded-lg mb-4 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-outline">lock_clock</span>
              <span>Copia estática no destructiva generada a las 18:42 hrs para archivo fiscal y seguimiento contable.</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPendings}
            disabled={downloadingPendings}
            className="w-full h-10 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer disabled:opacity-75"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{downloadingPendings ? 'Generando Excel XLSX...' : 'Descargar Libro de Pendientes (.xlsx)'}</span>
          </button>
        </div>

        {/* Tarjeta 3: Publicar al Tablero Directivo (Destacada) */}
        <div className="bg-surface-container-low rounded-xl p-6 shadow-md border-2 border-primary/30 flex flex-col justify-between relative overflow-hidden">
          {/* Top Brand wave */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="h-full w-1/3 bg-[#67E100]"></div>
            <div className="h-full w-1/3 bg-[#FCA800]"></div>
            <div className="h-full w-1/3 bg-[#F72800]"></div>
          </div>

          <div className="flex flex-col pt-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-on-surface">3. Publicar al Tablero</span>
              <span className="bg-primary text-on-primary text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs">
                Acción Clave
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-surface-container-lowest p-3.5 rounded-lg mb-4 shadow-xs border border-outline-variant/20">
              <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-on-surface">Sincronización Directiva</span>
                <span className="text-[11px] text-outline">Alineación de BI y rentabilidad real</span>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <span className="text-[11px] text-primary uppercase tracking-wider mb-2 font-bold">Impacto en el sistema</span>
              <ul className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">update</span>
                  <span>Reemplaza únicamente fechas de <strong className="text-on-surface font-semibold">Octubre 2026</strong> en la serie histórica sin sobreescribir meses previos.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">calendar_month</span>
                  <span>Meses habilitados en Tablero tras publicar: <strong className="text-on-surface font-semibold">Septiembre 2026</strong> y <strong className="text-on-surface font-semibold">Octubre 2026</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2F7A00] shrink-0 mt-0.5">task_alt</span>
                  <span>Actualiza automáticamente <strong className="text-on-surface font-semibold">3 pagos a Sayer</strong> pendientes de conciliación bancaria.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">analytics</span>
                  <span>Diagnóstico de semáforo y rentabilidad por sucursal (<strong className="text-on-surface font-semibold">Santa Rosa, Cuautepec, Tlalne</strong>) listos para consulta.</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg mb-4 flex items-center justify-between text-xs border border-outline-variant/20">
              <span className="text-on-surface-variant font-medium">Estado actual en Tablero:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isPublished ? 'bg-[#F0FDF4] text-[#2F7A00]' : 'bg-surface-container text-outline'
              }`}>
                {isPublished ? '✓ Publicado' : 'Pendiente de publicación'}
              </span>
            </div>
          </div>

          <button
            onClick={onPublishSuccess}
            className={`w-full h-11 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPublished 
                ? 'bg-[#2F7A00] hover:bg-[#256300] text-white' 
                : 'bg-primary hover:bg-[#1E6FFD] text-on-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isPublished ? 'done_all' : 'cloud_upload'}
            </span>
            <span>{isPublished ? '¡Cierre Publicado con Éxito! (Ver Tablero)' : 'Publicar Octubre 2026 al Tablero'}</span>
          </button>
        </div>
      </section>

      {/* Resumen de Consolidación por Sucursal */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-xs border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
            <h3 className="text-base font-bold text-on-surface">Resumen de Cierre por Sucursal · Octubre 2026</h3>
          </div>
          <span className="text-xs text-outline font-medium">Libro Mayor Multitienda v1.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Santa Rosa */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">Santa Rosa (Matriz)</span>
              <span className="bg-[#F0FDF4] text-[#2F7A00] text-xs px-2 py-0.5 rounded-full font-bold">Conciliado</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-on-surface-variant">Venta Bruta:</span>
              <span className="font-bold text-on-surface">$820,000.00</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Pendientes abiertos:</span>
              <span className="font-bold text-[#8A5A00]">11 casos</span>
            </div>
            <div className="flex items-baseline justify-between text-xs pt-1 border-t border-outline-variant/20">
              <span className="text-on-surface-variant">Utilidad Neta:</span>
              <span className="font-bold text-[#2F7A00]">$124,640.00 (15.2%)</span>
            </div>
          </div>

          {/* Cuautepec */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">Cuautepec</span>
              <span className="bg-[#F0FDF4] text-[#2F7A00] text-xs px-2 py-0.5 rounded-full font-bold">Conciliado</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-on-surface-variant">Venta Bruta:</span>
              <span className="font-bold text-on-surface">$560,000.00</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Pendientes abiertos:</span>
              <span className="font-bold text-[#8A5A00]">8 casos</span>
            </div>
            <div className="flex items-baseline justify-between text-xs pt-1 border-t border-outline-variant/20">
              <span className="text-on-surface-variant">Utilidad Neta:</span>
              <span className="font-bold text-[#2F7A00]">$74,800.00 (13.4%)</span>
            </div>
          </div>

          {/* Tlalnepantla */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">Tlalnepantla</span>
              <span className="bg-[#FFFBEB] text-[#8A5A00] text-xs px-2 py-0.5 rounded-full font-bold">Observación</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-on-surface-variant">Venta Bruta:</span>
              <span className="font-bold text-on-surface">$470,000.00</span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-on-surface-variant">Pendientes abiertos:</span>
              <span className="font-bold text-error">7 casos</span>
            </div>
            <div className="flex items-baseline justify-between text-xs pt-1 border-t border-outline-variant/20">
              <span className="text-on-surface-variant">Utilidad Neta:</span>
              <span className="font-bold text-[#2F7A00]">$49,320.00 (10.5%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm text-outline hover:text-on-surface font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Regresar a Resultados</span>
        </button>

        <button
          onClick={() => onNavigate('tablero')}
          className="h-10 px-5 rounded-lg bg-surface-container text-primary font-bold text-xs flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
          type="button"
        >
          <span>Ir directamente al Tablero Directivo</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
