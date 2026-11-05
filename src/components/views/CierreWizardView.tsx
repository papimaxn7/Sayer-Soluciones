import React, { useState } from 'react';
import { CierreStep, NavigationTab, UploadedFileRecord, PendingItem, FullReconciliationResult } from '../../types';
import { CierrePaso1Archivos } from './cierre/CierrePaso1Archivos';
import { CierrePaso2Periodo } from './cierre/CierrePaso2Periodo';
import { CierrePaso3Resultados } from './cierre/CierrePaso3Resultados';
import { CierrePaso4Publicar } from './cierre/CierrePaso4Publicar';
import { verifyRequiredFiles } from '../../utils/excelEngine';
import { SayerEngineOptions } from '../../utils/sayerEngine';

interface CierreWizardViewProps {
  currentStep: CierreStep;
  onStepChange: (step: CierreStep) => void;
  onNavigate: (tab: NavigationTab) => void;
  openPendingCount: number;
  isPublished: boolean;
  onPublishSuccess: () => void;
  files: UploadedFileRecord[];
  onFilesChange: (files: UploadedFileRecord[]) => void;
  onLoadDemoFiles: () => void;
  onClearFiles: () => void;
  isEngineRunDone: boolean;
  onEngineRunComplete: () => void;
  onRunEngine: (options: SayerEngineOptions) => void;
  pendings: PendingItem[];
  reconciliationResult: FullReconciliationResult;
}

export const CierreWizardView: React.FC<CierreWizardViewProps> = ({
  currentStep,
  onStepChange,
  onNavigate,
  openPendingCount,
  isPublished,
  onPublishSuccess,
  files,
  onFilesChange,
  onLoadDemoFiles,
  onClearFiles,
  isEngineRunDone,
  onEngineRunComplete,
  onRunEngine,
  pendings,
  reconciliationResult
}) => {
  const [lockedStepAlert, setLockedStepAlert] = useState<string | null>(null);

  const verification = verifyRequiredFiles(files);
  const isStep1Done = verification.isComplete;
  const isStep2Done = isEngineRunDone;
  const isStep3Done = isEngineRunDone;
  const isStep4Done = isPublished;

  const showLockedNotice = (msg: string) => {
    setLockedStepAlert(msg);
    setTimeout(() => setLockedStepAlert(null), 4000);
  };

  const handleStepClick = (targetStep: CierreStep) => {
    if (targetStep === 1) {
      onStepChange(1);
      return;
    }

    if (targetStep === 2) {
      if (!isStep1Done) {
        showLockedNotice(`Paso 2 bloqueado: Debes subir y verificar primero los 4 archivos obligatorios en el Paso 1 (Faltan: ${verification.missingNames.join(', ')}).`);
        return;
      }
      onStepChange(2);
      return;
    }

    if (targetStep === 3) {
      if (!isStep1Done) {
        showLockedNotice('Paso 3 bloqueado: Carga primero los 4 archivos obligatorios en el Paso 1.');
        return;
      }
      if (!isStep2Done) {
        showLockedNotice('Paso 3 bloqueado: Debes ejecutar primero el Motor de Conciliación en el Paso 2 para generar los resultados.');
        return;
      }
      onStepChange(3);
      return;
    }

    if (targetStep === 4) {
      if (!isStep1Done) {
        showLockedNotice('Paso 4 bloqueado: Carga primero los 4 archivos obligatorios en el Paso 1.');
        return;
      }
      if (!isStep2Done) {
        showLockedNotice('Paso 4 bloqueado: Ejecuta primero el Motor de Conciliación en el Paso 2.');
        return;
      }
      onStepChange(4);
      return;
    }
  };

  const stepsConfig = [
    {
      number: 1 as CierreStep,
      title: 'Archivos Fuente',
      subtitle: 'Paso 1',
      isCompleted: isStep1Done,
      isUnlocked: true,
      hint: `${verification.requiredCount}/4 archivos listos`
    },
    {
      number: 2 as CierreStep,
      title: 'Periodo & Parámetros',
      subtitle: 'Paso 2',
      isCompleted: isStep2Done,
      isUnlocked: isStep1Done,
      hint: isStep2Done ? 'Motor ejecutado' : 'Requiere Paso 1'
    },
    {
      number: 3 as CierreStep,
      title: 'Resultados del Motor',
      subtitle: 'Paso 3',
      isCompleted: isStep2Done,
      isUnlocked: isStep2Done,
      hint: isStep2Done ? '94.8% conciliado' : 'Requiere Paso 2'
    },
    {
      number: 4 as CierreStep,
      title: 'Publicar al Libro',
      subtitle: 'Paso 4',
      isCompleted: isStep4Done,
      isUnlocked: isStep2Done,
      hint: isStep4Done ? 'Libro publicado' : 'Entrega y descarga'
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12">
      {/* 4-Step Stepper Component with Clear Lock Status */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30 mb-5">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-surface-container-highest z-0"></div>

          {stepsConfig.map((s) => {
            const isActive = currentStep === s.number;
            const isCompleted = s.isCompleted;
            const isUnlocked = s.isUnlocked;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => handleStepClick(s.number)}
                className={`relative z-10 flex items-center gap-2.5 bg-surface-container-lowest px-3 py-1.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'ring-2 ring-primary/25 bg-surface-container/50'
                    : isUnlocked
                      ? 'cursor-pointer hover:bg-surface-container-low'
                      : 'cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-2xs ${
                    isActive
                      ? 'bg-primary text-on-primary ring-4 ring-primary-fixed'
                      : isCompleted
                        ? 'bg-[#F0FDF4] text-[#2F7A00] border border-[#67E100]/50'
                        : isUnlocked
                          ? 'bg-surface-container text-on-surface'
                          : 'bg-surface-container-high text-outline'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : !isUnlocked ? (
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                  ) : (
                    s.number
                  )}
                </div>

                <div className="hidden sm:flex flex-col">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] uppercase font-bold tracking-wider ${
                        isActive
                          ? 'text-primary'
                          : isCompleted
                            ? 'text-[#2F7A00]'
                            : isUnlocked
                              ? 'text-on-surface'
                              : 'text-outline'
                      }`}
                    >
                      {s.subtitle}
                    </span>
                    {isActive && (
                      <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.2 rounded font-bold">
                        En curso
                      </span>
                    )}
                    {isCompleted && !isActive && (
                      <span className="text-[10px] text-[#2F7A00] font-bold">✓ Listo</span>
                    )}
                    {!isUnlocked && (
                      <span className="text-[10px] text-outline font-medium">Bloqueado</span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isActive ? 'text-on-surface' : isUnlocked ? 'text-on-surface-variant' : 'text-outline'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Banner when clicking locked step */}
      {lockedStepAlert && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs mb-4 animate-shake">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-700">lock</span>
            <span>{lockedStepAlert}</span>
          </div>
          <button onClick={() => setLockedStepAlert(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Render Active Step */}
      {currentStep === 1 && (
        <CierrePaso1Archivos
          files={files}
          onFilesChange={onFilesChange}
          onNext={() => onStepChange(2)}
          onLoadDemoFiles={onLoadDemoFiles}
          onClearFiles={onClearFiles}
        />
      )}

      {currentStep === 2 && (
        <CierrePaso2Periodo
          files={files}
          onBack={() => onStepChange(1)}
          onNext={() => onStepChange(3)}
          onRunEngine={onRunEngine}
          onEngineRunComplete={onEngineRunComplete}
          isEngineRunDone={isEngineRunDone}
        />
      )}

      {currentStep === 3 && (
        <CierrePaso3Resultados
          onBack={() => onStepChange(2)}
          onNext={() => onStepChange(4)}
          onNavigate={onNavigate}
          openPendingCount={openPendingCount}
          rulesData={reconciliationResult.rulesSummary}
          cashAuditRows={reconciliationResult.cashAuditRows}
          sayerAuditRows={reconciliationResult.sayerAuditRows}
          periodLabel={reconciliationResult.periodLabel}
        />
      )}

      {currentStep === 4 && (
        <CierrePaso4Publicar
          onBack={() => onStepChange(3)}
          onPublishSuccess={onPublishSuccess}
          isPublished={isPublished}
          openPendingCount={openPendingCount}
          onNavigate={onNavigate}
          pendings={pendings}
          reconciliationResult={reconciliationResult}
        />
      )}
    </div>
  );
};
