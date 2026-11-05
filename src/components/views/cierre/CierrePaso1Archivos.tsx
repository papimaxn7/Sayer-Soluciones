import React, { useState, useRef } from 'react';
import { UploadedFileRecord, SourceFileRole } from '../../../types';
import { verifyRequiredFiles, parseUploadedExcel, downloadBlankTemplatesPackage } from '../../../utils/excelEngine';

interface CierrePaso1Props {
  files: UploadedFileRecord[];
  onFilesChange: (files: UploadedFileRecord[]) => void;
  onNext: () => void;
  onLoadDemoFiles: () => void;
  onClearFiles: () => void;
}

export const CierrePaso1Archivos: React.FC<CierrePaso1Props> = ({
  files,
  onFilesChange,
  onNext,
  onLoadDemoFiles,
  onClearFiles
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [inspectedFile, setInspectedFile] = useState<UploadedFileRecord | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verification = verifyRequiredFiles(files);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsProcessing(true);

    const newRecords: UploadedFileRecord[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const record = await parseUploadedExcel(file);
        newRecords.push(record);
      } catch (err: any) {
        console.error('Error parsing file:', file.name, err);
        errors.push(`${file.name}: ${err?.message || 'Formato no soportado'}`);
      }
    }

    if (newRecords.length > 0) {
      // Avoid exact duplicates by name
      const existingNames = new Set(files.map(f => f.name.toLowerCase()));
      const filteredNew = newRecords.filter(r => !existingNames.has(r.name.toLowerCase()));
      const updated = [...files, ...(filteredNew.length > 0 ? filteredNew : newRecords)];
      onFilesChange(updated);

      const check = verifyRequiredFiles(updated);
      if (check.isComplete) {
        showNotification('success', `Se procesaron ${newRecords.length} archivo(s) correctamente. Los 4 archivos obligatorios están completos.`);
      } else {
        showNotification('info', `Se cargaron ${newRecords.length} archivo(s). Faltan: ${check.missingNames.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      showNotification('error', `Hubo errores al leer algunos archivos: ${errors.join(', ')}`);
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRoleChange = (fileId: string, newRole: SourceFileRole) => {
    const roleLabels: Record<SourceFileRole, string> = {
      libro_principal: 'Libro Principal',
      resumen_santa_rosa: 'Resumen de Venta',
      resumen_cuautepec: 'Resumen de Venta',
      resumen_tlalne: 'Resumen de Venta',
      extracto_bancario: 'Extracto Bancario',
      otro: 'Documento Complementario'
    };

    const branchMapping: Record<SourceFileRole, any> = {
      libro_principal: 'Matriz y Sucursales',
      resumen_santa_rosa: 'Santa Rosa',
      resumen_cuautepec: 'Cuautepec',
      resumen_tlalne: 'Tlalnepantla',
      extracto_bancario: 'Santander CTA 88',
      otro: undefined
    };

    const updated = files.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          role: newRole,
          roleLabel: roleLabels[newRole],
          branch: branchMapping[newRole]
        };
      }
      return f;
    });

    onFilesChange(updated);
    showNotification('info', 'Rol de archivo reasignado manualmente.');
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = files.filter(f => f.id !== fileId);
    onFilesChange(updated);
    showNotification('info', 'Archivo removido de la sesión.');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden Real File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Header of Step 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface">Paso 1: Carga y Verificación de Archivos Fuente</h2>
            {verification.isComplete ? (
              <span className="bg-[#F0FDF4] text-[#2F7A00] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-[#67E100]/40">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                4 de 4 Obligatorios Listos
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold border border-amber-300">
                <span className="material-symbols-outlined text-[15px]">pending</span>
                {verification.requiredCount} de 4 Obligatorios
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Para conciliar el mes de Octubre 2026, el motor requiere obligatoriamente el <strong className="text-on-surface font-semibold">Libro Principal SAYER VENTAS</strong> y los <strong className="text-on-surface font-semibold">3 Resúmenes de Venta</strong> (Santa Rosa, Cuautepec y Tlalnepantla).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={downloadBlankTemplatesPackage}
            className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container text-xs font-semibold transition-colors border border-outline-variant/30 shadow-xs cursor-pointer"
            type="button"
            title="Descarga una plantilla Excel con la estructura de columnas requerida"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Plantilla de ejemplo (.xlsx)</span>
          </button>

          <button
            onClick={onLoadDemoFiles}
            className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors border border-primary/30 shadow-xs cursor-pointer"
            type="button"
            title="Carga de inmediato los 4 archivos verificados de Octubre 2026"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Cargar Archivos Demo (1-Clic)</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fadeIn ${
          notification.type === 'success' 
            ? 'bg-[#F0FDF4] border border-[#67E100] text-[#2F7A00]'
            : notification.type === 'error'
              ? 'bg-error-container border border-error text-on-error-container'
              : 'bg-surface-container-high border border-outline-variant text-on-surface'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* 4 Required Files Checklist Tracker */}
      <section className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-outline">
            Requisitos Previos del Motor Contable (Checklist de Entrada)
          </span>
          <span className="text-xs font-bold text-on-surface">
            {verification.requiredCount} / 4 Requeridos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Requirement 1: Libro Principal */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            verification.hasLibroPrincipal 
              ? 'bg-[#F0FDF4] border-[#67E100]/60 text-[#2F7A00]' 
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">1. Libro Principal</span>
              <span className="material-symbols-outlined text-[18px]">
                {verification.hasLibroPrincipal ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-[11px] font-mono truncate">SAYER_VENTAS_2026.xlsx</span>
            <span className="text-[10px] opacity-80">Pestañas: Ventas, Proveedores, Pagos</span>
          </div>

          {/* Requirement 2: Santa Rosa */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            verification.hasSantaRosa 
              ? 'bg-[#F0FDF4] border-[#67E100]/60 text-[#2F7A00]' 
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">2. Resumen Santa Rosa</span>
              <span className="material-symbols-outlined text-[18px]">
                {verification.hasSantaRosa ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-[11px] font-mono truncate">ResumenSantaRosa_Oct.xlsx</span>
            <span className="text-[10px] opacity-80">Sucursal Matriz (72 turnos)</span>
          </div>

          {/* Requirement 3: Cuautepec */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            verification.hasCuautepec 
              ? 'bg-[#F0FDF4] border-[#67E100]/60 text-[#2F7A00]' 
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">3. Resumen Cuautepec</span>
              <span className="material-symbols-outlined text-[18px]">
                {verification.hasCuautepec ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-[11px] font-mono truncate">ResumenCuautepec_Oct.xlsx</span>
            <span className="text-[10px] opacity-80">Sucursal Periférica TPV 9731294</span>
          </div>

          {/* Requirement 4: Tlalnepantla */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
            verification.hasTlalne 
              ? 'bg-[#F0FDF4] border-[#67E100]/60 text-[#2F7A00]' 
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">4. Resumen Tlalnepantla</span>
              <span className="material-symbols-outlined text-[18px]">
                {verification.hasTlalne ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>
            <span className="text-[11px] font-mono truncate">ResumenTlalne_Oct.xlsx</span>
            <span className="text-[10px] opacity-80">Sucursal Industrial TPV 9731308</span>
          </div>
        </div>
      </section>

      {/* Real Dropzone Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-surface-container-lowest rounded-xl p-8 shadow-xs border transition-all text-center cursor-pointer relative overflow-hidden ${
          isDragging 
            ? 'bg-primary/10 border-primary scale-[1.01]' 
            : 'border-primary/40 hover:bg-surface-container-low/50'
        }`}
        style={{ outline: '2px dashed #156bf9', outlineOffset: '-2px' }}
      >
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-2">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-3 shadow-xs">
            <span className={`material-symbols-outlined text-[36px] ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? 'sync' : 'upload_file'}
            </span>
          </div>

          <h3 className="text-base text-on-surface font-bold mb-1">
            {isProcessing ? 'Procesando y analizando libros Excel con SheetJS...' : 'Arrastra o selecciona los archivos Excel de tu equipo'}
          </h3>
          <p className="text-xs text-on-surface-variant mb-4 max-w-lg">
            Acepta archivos reales <strong className="text-on-surface">.xlsx, .xls y .csv</strong>. El motor lee automáticamente los nombres de hojas de cálculo, fechas de corte y correspondencias de sucursal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>Elegir archivos locales (.xlsx)</span>
            </button>

            {files.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFiles();
                  showNotification('info', 'Se limpiaron los archivos cargados.');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-lg bg-surface-container text-outline hover:text-error text-xs font-semibold transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                <span>Limpiar lista</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detected and Verified Files List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low/60 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px]">task</span>
            <h3 className="text-sm font-bold text-on-surface">Archivos cargados en la sesión</h3>
            <span className="bg-surface-container text-on-secondary-container text-xs px-2.5 py-0.5 rounded-full font-bold">
              {files.length} documento(s)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {verification.isComplete ? (
              <span className="text-[#2F7A00] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Listo para avanzar al Paso 2</span>
              </span>
            ) : (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Incompleto ({verification.missingNames.length} faltante(s))</span>
              </span>
            )}
          </div>
        </div>

        {/* Files Table List */}
        {files.length === 0 ? (
          <div className="p-8 text-center text-outline text-xs flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-outline/50">folder_off</span>
            <span>No hay archivos cargados. Arrastra los archivos arriba o presiona "Cargar Archivos Demo".</span>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 hover:bg-surface-container-low/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#E6F4EA] text-[#137333] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[24px]">
                      {file.role === 'libro_principal' ? 'description' : file.role === 'extracto_bancario' ? 'account_balance' : 'table_view'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-on-surface truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[11px] text-outline">
                        ({(file.sizeBytes / 1024).toFixed(0)} KB · {file.rowCount} renglones)
                      </span>

                      {/* Role selection dropdown */}
                      <select
                        value={file.role}
                        onChange={(e) => handleRoleChange(file.id, e.target.value as SourceFileRole)}
                        className="bg-surface-container text-primary font-semibold text-[11px] px-2 py-0.5 rounded border border-primary/20 focus:outline-none cursor-pointer"
                        title="Cambiar clasificación de archivo"
                      >
                        <option value="libro_principal">Libro Principal (SAYER VENTAS)</option>
                        <option value="resumen_santa_rosa">Resumen Santa Rosa</option>
                        <option value="resumen_cuautepec">Resumen Cuautepec</option>
                        <option value="resumen_tlalne">Resumen Tlalnepantla</option>
                        <option value="extracto_bancario">Extracto Bancario</option>
                        <option value="otro">Documento Complementario</option>
                      </select>

                      {file.branch && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-surface-container-low text-on-surface border border-outline-variant/30">
                          {file.branch}
                        </span>
                      )}

                      {file.isRealFile && (
                        <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold px-1.5 py-0.2 rounded">
                          Archivo Local
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {file.details}
                    </p>

                    {file.sheetNames && file.sheetNames.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] text-outline font-semibold">Pestañas leídas:</span>
                        {file.sheetNames.slice(0, 5).map(s => (
                          <span key={s} className="bg-surface-container-low text-on-surface-variant text-[10px] font-mono px-1.5 py-0.2 rounded border border-outline-variant/20">
                            {s}
                          </span>
                        ))}
                        {file.sheetNames.length > 5 && (
                          <span className="text-[10px] text-outline">+{file.sheetNames.length - 5} más</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 shrink-0">
                  <div className="flex flex-col text-left lg:text-right">
                    <span className="text-[11px] text-outline uppercase font-semibold tracking-wider">Periodo Detectado</span>
                    <span className="text-xs text-on-surface font-bold tabular-nums">{file.period}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#2F7A00] px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span>{file.status}</span>
                  </div>

                  <button
                    onClick={() => {
                      setInspectedFile(file);
                      setSelectedSheet(file.sheetNames[0] || 'Hoja1');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-outline-variant/30"
                    title="Ver datos y celdas leídas de este archivo Excel"
                  >
                    <span className="material-symbols-outlined text-[15px]">table_chart</span>
                    <span>Ver datos</span>
                  </button>

                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar archivo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 1 Completion Callout / Gating Explanation */}
      {!verification.isComplete && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">lock</span>
            <div>
              <span className="font-bold block">El Paso 2 está bloqueado</span>
              <span>
                Para continuar, debes tener cargados los 4 archivos obligatorios. Faltan: <strong>{verification.missingNames.join(', ')}</strong>. Puedes subir tus archivos o presionar el botón de prueba rápida.
              </span>
            </div>
          </div>
          <button
            onClick={onLoadDemoFiles}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
          >
            Cargar 4 Demo Ahora
          </button>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onClearFiles}
          className="px-4 py-2 rounded-lg text-xs text-outline hover:text-error font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Reiniciar todo</span>
        </button>

        {verification.isComplete ? (
          <button
            onClick={onNext}
            className="h-11 px-6 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
            type="button"
          >
            <span>Continuar al Paso 2: Periodo & Parámetros</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              disabled
              className="h-11 px-6 rounded-lg bg-surface-container text-outline text-sm font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
              type="button"
              title="Completa la carga de los 4 archivos requeridos para habilitar este botón"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Continuar al Paso 2 (Bloqueado)</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Inspección de Celdas y Pestañas del Archivo Excel */}
      {inspectedFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-scaleUp">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">table_view</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    Inspección de Libro: {inspectedFile.name}
                  </h3>
                  <span className="text-xs text-outline">
                    {inspectedFile.roleLabel} · {inspectedFile.rowCount} renglones detectados · Periodo {inspectedFile.period}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedFile(null)}
                className="text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Sheet Tabs */}
            {inspectedFile.sheetNames.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-outline-variant/20">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider mr-1">Pestaña:</span>
                {inspectedFile.sheetNames.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSheet(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedSheet === s
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Sheet Table Data Preview */}
            <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[420px] rounded-lg border border-outline-variant/30 bg-surface-container-low/30">
              {inspectedFile.sheetData && inspectedFile.sheetData[selectedSheet] && inspectedFile.sheetData[selectedSheet].length > 0 ? (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="bg-surface-container-low sticky top-0 z-10">
                    <tr className="border-b border-outline-variant/30 text-outline">
                      <th className="p-2 text-center w-10 bg-surface-container-high font-sans text-[10px]">#</th>
                      {inspectedFile.sheetData[selectedSheet][0].map((cell: any, cIdx: number) => (
                        <th key={cIdx} className="p-2 font-bold whitespace-nowrap bg-surface-container-low">
                          {String(cell || `Col ${cIdx + 1}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                    {inspectedFile.sheetData[selectedSheet].slice(1).map((row: any[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-surface-container-low/50">
                        <td className="p-2 text-center text-outline bg-surface-container-low/60 font-sans text-[10px]">
                          {rIdx + 1}
                        </td>
                        {row.map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap text-on-surface">
                            {typeof cell === 'number' ? cell.toLocaleString('es-MX') : String(cell || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2 text-xs text-outline">
                  <span className="material-symbols-outlined text-[28px] text-primary">verified</span>
                  <span className="font-semibold text-on-surface">Pestaña leída y validada correctamente por el motor</span>
                  <span>Estructura de encabezados y fórmulas conforme a la especificación oficial de SayerPro.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
              <span className="text-outline">
                Vista previa de hasta 35 renglones leídos del archivo original.
              </span>
              <button
                onClick={() => setInspectedFile(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs cursor-pointer hover:bg-[#1E6FFD]"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
