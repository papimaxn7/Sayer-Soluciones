/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab, CierreStep, UserRole, PendingItem, UploadedFileRecord, FullReconciliationResult } from './types';
import { INITIAL_PENDINGS, DEFAULT_DEMO_FILES } from './data/mockData';
import { executeSayerReconciliation, SayerEngineOptions } from './utils/sayerEngine';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InicioView } from './components/views/InicioView';
import { CierreWizardView } from './components/views/CierreWizardView';
import { PendientesView } from './components/views/PendientesView';
import { TableroView } from './components/views/TableroView';
import { HistorialView } from './components/views/HistorialView';
import { ConfiguracionView } from './components/views/ConfiguracionView';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [cierreStep, setCierreStep] = useState<CierreStep>(1);
  const [selectedMonth, setSelectedMonth] = useState('Octubre 2026');
  const [userRole, setUserRole] = useState<UserRole>('Director');
  const [isPublished, setIsPublished] = useState(false);
  
  // Execution engine state
  const [reconciliationResult, setReconciliationResult] = useState<FullReconciliationResult>(() => 
    executeSayerReconciliation(DEFAULT_DEMO_FILES, { cashTolerance: 10.0 })
  );
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(() => reconciliationResult.pendingItems);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>(DEFAULT_DEMO_FILES);
  const [isEngineRunDone, setIsEngineRunDone] = useState(false); // Starts as false so user can run it explicitly
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleFilesChange = (newFiles: UploadedFileRecord[]) => {
    setUploadedFiles(newFiles);
    setIsEngineRunDone(false); // When files are added or modified, require re-running the engine
  };

  const handleLoadDemoFiles = () => {
    setUploadedFiles(DEFAULT_DEMO_FILES);
    const result = executeSayerReconciliation(DEFAULT_DEMO_FILES, { cashTolerance: 10.0 });
    setReconciliationResult(result);
    setPendingItems(result.pendingItems);
    setIsEngineRunDone(true);
    showToast('Los 4 archivos de Octubre 2026 fueron verificados y el motor procesó las 8 reglas.');
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
    setIsEngineRunDone(false);
    setCierreStep(1);
    showToast('Se han limpiado los archivos. Arrastra o sube los 4 archivos para comenzar.');
  };

  const handleRunEngine = (options: SayerEngineOptions) => {
    const result = executeSayerReconciliation(uploadedFiles, options);
    setReconciliationResult(result);
    setPendingItems(result.pendingItems);
    setIsEngineRunDone(true);
    showToast('¡Motor Sayer ejecutado con éxito! Se procesaron las 8 reglas contables.');
  };

  const handleEngineRunComplete = () => {
    handleRunEngine({ cashTolerance: 10.0 });
  };

  const handleTogglePendingStatus = (id: string, notes?: string) => {
    setPendingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Pendiente' ? 'Revisado' : 'Pendiente';
          const isNowReviewed = nextStatus === 'Revisado';
          return {
            ...item,
            status: nextStatus,
            reviewedBy: isNowReviewed ? `${userRole === 'Director' ? 'Rodolfo (Director)' : 'Max (Operador)'}` : undefined,
            reviewedDate: isNowReviewed ? '28/10/2026' : undefined,
            notes: notes?.trim() ? notes : item.notes
          };
        }
        return item;
      })
    );
    showToast(`Asiento actualizado exitosamente.`);
  };

  const handlePublishSuccess = () => {
    setIsPublished(true);
    showToast('¡Cierre de Octubre 2026 publicado en el Tablero Directivo con éxito!');
  };

  const openPendingCount = pendingItems.filter((i) => i.status === 'Pendiente').length;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#141c28] text-white px-4 py-2.5 rounded-xl shadow-xl border border-outline/30 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-[#67E100]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Fixed Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingCount={openPendingCount}
        userRole={userRole}
        onRoleToggle={setUserRole}
      />

      {/* Main Container with 240px offset for Sidebar */}
      <div className="pl-[240px] flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          userRole={userRole}
          onRoleToggle={setUserRole}
          isClosed={isPublished}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Dynamic Main Body Content */}
        <main className="w-full pt-[82px] min-h-screen bg-surface px-6 py-6 max-w-[1600px] mx-auto">
          {currentTab === 'inicio' && (
            <InicioView
              onNavigate={setCurrentTab}
              onGoToCierreStep={(step) => {
                setCierreStep(step);
                setCurrentTab('cierre-del-mes');
              }}
              pendingItems={pendingItems}
              userRole={userRole}
              isPublished={isPublished}
              files={uploadedFiles}
              isEngineRunDone={isEngineRunDone}
            />
          )}

          {currentTab === 'cierre-del-mes' && (
            <CierreWizardView
              currentStep={cierreStep}
              onStepChange={setCierreStep}
              onNavigate={setCurrentTab}
              openPendingCount={openPendingCount}
              isPublished={isPublished}
              onPublishSuccess={handlePublishSuccess}
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
              onLoadDemoFiles={handleLoadDemoFiles}
              onClearFiles={handleClearFiles}
              isEngineRunDone={isEngineRunDone}
              onEngineRunComplete={handleEngineRunComplete}
              onRunEngine={handleRunEngine}
              pendings={pendingItems}
              reconciliationResult={reconciliationResult}
            />
          )}

          {currentTab === 'pendientes' && (
            <PendientesView
              items={pendingItems}
              onToggleStatus={handleTogglePendingStatus}
              userRole={userRole}
            />
          )}

          {currentTab === 'tablero' && (
            <TableroView 
              initialSubTab="resumen" 
              reconciliationResult={reconciliationResult}
            />
          )}

          {currentTab === 'historial' && (
            <HistorialView onNavigate={setCurrentTab} />
          )}

          {currentTab === 'configuracion' && (
            <ConfiguracionView />
          )}
        </main>
      </div>

      {/* Quick Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
