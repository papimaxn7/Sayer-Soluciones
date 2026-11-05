import React, { useState } from 'react';
import { ConfigSubTab, BranchConfig } from '../../types';
import { BRANCH_CONFIGS } from '../../data/mockData';

export const ConfiguracionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigSubTab>('tiendas');
  const [branches, setBranches] = useState<BranchConfig[]>(BRANCH_CONFIGS);
  const [cashTolerance, setCashTolerance] = useState('10.00');
  const [bankDays, setBankDays] = useState('2');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [editingBranch, setEditingBranch] = useState<BranchConfig | null>(null);

  const tabs = [
    { id: 'tiendas', label: 'Sucursales y Afiliaciones', icon: 'domain' },
    { id: 'cuentas', label: 'Cuentas Bancarias', icon: 'account_balance' },
    { id: 'catalogo', label: 'Catálogo de Cuentas', icon: 'list_alt' },
    { id: 'reglas', label: 'Tolerancias & Motor', icon: 'tune' },
    { id: 'usuarios', label: 'Usuarios & Permisos', icon: 'group' },
    { id: 'respaldo', label: 'Respaldo de Libros', icon: 'cloud_sync' }
  ];

  const handleSave = () => {
    setSavedSuccessMsg('Configuración guardada correctamente en el motor SayerPro.');
    setTimeout(() => setSavedSuccessMsg(''), 3500);
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              Administración del Sistema
            </span>
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
              Configuración Maestra
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-0.5">
            Configuración y Parámetros Operativos
          </h1>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Ajusta los identificadores de sucursales, códigos de afiliación Santander, cuentas maestras Banamex y umbrales de correspondencia contable.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-primary hover:bg-[#1E6FFD] text-on-primary text-sm font-semibold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Guardar Cambios</span>
        </button>
      </div>

      {savedSuccessMsg && (
        <div className="p-3.5 bg-[#F0FDF4] border border-[#67E100] text-[#2F7A00] rounded-xl flex items-center gap-2 text-xs font-bold mb-4 shadow-2xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ConfigSubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 1: SUCURSALES Y AFILIACIONES */}
      {activeTab === 'tiendas' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden">
            {/* Top Brand wave */}
            <div className="w-full h-1 flex overflow-hidden">
              <div className="h-full w-1/3 bg-[#67E100]"></div>
              <div className="h-full w-1/3 bg-[#FCA800]"></div>
              <div className="h-full w-1/3 bg-[#F72800]"></div>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Sucursales Físicas y Canales de Cobro</h3>
                  <span className="text-xs text-outline">Parámetros de mapeo para hojas de cálculo Santander y formatos de venta local.</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Modal para agregar nueva tienda...') }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container text-xs font-bold transition-colors border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Agregar nueva tienda / sucursal</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                      <th className="py-2.5 px-4 font-bold">Sucursal / Entidad</th>
                      <th className="py-2.5 px-3 font-bold">Alias para Archivos Excel</th>
                      <th className="py-2.5 px-3 font-bold">Afiliaciones Santander</th>
                      <th className="py-2.5 px-3 font-bold">Resumen Venta</th>
                      <th className="py-2.5 px-3 text-right font-bold">Cuota Fija Mensual</th>
                      <th className="py-2.5 px-4 text-center font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 font-medium">
                    {branches.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container-low/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }}></span>
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface text-sm">{b.name}</span>
                              <span className="text-[11px] text-outline">{b.type} · {b.manager}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {b.excelAliases.map((alias) => (
                              <span key={alias} className="bg-surface-container px-2 py-0.5 rounded text-[11px] text-on-surface-variant font-mono">
                                {alias}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {b.affiliations.map((aff) => (
                              <div key={aff.code} className="flex items-center gap-2 text-[11px]">
                                <span className="font-bold font-mono text-on-surface">{aff.code}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  aff.active ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                                }`}>
                                  {aff.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#2F7A00] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>Activo</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right tabular-nums font-bold text-on-surface">
                          ${b.fixedMonthlyFee.toFixed(2)} MXN
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setEditingBranch(b)}
                            className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Editar sucursal"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUENTAS BANCARIAS */}
      {activeTab === 'cuentas' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      BMX
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Citibanamex · CTA FRIDA BMEX</h4>
                      <span className="text-[11px] text-outline">Concentradora Maestra · Cuenta #212</span>
                    </div>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#2F7A00] text-[10px] font-bold px-2 py-0.5 rounded-full">En Línea</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Cuenta principal para depósitos en efectivo de ventas al día, SPEI de clientes mayores y pagos de facturas a Sayer planta.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between text-xs mt-3">
                <span className="text-outline">Saldo al último corte:</span>
                <span className="font-bold text-primary tabular-nums">$1,452,180.40 MXN</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold">
                      SAN
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">Santander · CTA FRIDA SANTANDER</h4>
                      <span className="text-[11px] text-outline">Concentradora TPV · Cuenta #88</span>
                    </div>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#2F7A00] text-[10px] font-bold px-2 py-0.5 rounded-full">En Línea</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Cuenta de liquidación para terminales bancarias Santander de las 3 sucursales. Aplica regla de traspasos de concentración.
                </p>
              </div>
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between text-xs mt-3">
                <span className="text-outline">Lotes conciliados en mes:</span>
                <span className="font-bold text-[#2F7A00] tabular-nums">58 de 60 lotes (96.7%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATALOGO DE CUENTAS */}
      {activeTab === 'catalogo' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-2">Clasificación Contable de Egresos</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Mapeo de conceptos de salida de caja y facturas de gasto hacia los rubros oficiales de P&L.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="font-bold text-on-surface block">100 · Gastos Propios de Tienda</span>
                <span className="text-[11px] text-outline mt-1 block">Nóminas mostrador, rentas de local, CFE y agua, consumibles tienda.</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="font-bold text-on-surface block">200 · Mercancía & Costo de Venta</span>
                <span className="text-[11px] text-outline mt-1 block">Prorrateo proporcional: Compras Sayer directas y compras a terceros.</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="font-bold text-on-surface block">300 · Gastos Centrales Prorrateados</span>
                <span className="text-[11px] text-outline mt-1 block">Servicios administrativos generales, seguros flotilla, honorarios contables.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGLAS DEL MOTOR */}
      {activeTab === 'reglas' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-on-surface">Tolerancias Globales de Conciliación</h3>
              <span className="text-xs text-outline">Afecta las 8 reglas de correspondencia del cierre mensual.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Tolerancia de Efectivo Diario (MXN)</label>
                <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/30">
                  <span className="text-xs text-outline mr-1 font-bold">±$</span>
                  <input
                    type="number"
                    value={cashTolerance}
                    onChange={(e) => setCashTolerance(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Desfase Permitido Días Hábiles</label>
                <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/30">
                  <span className="text-xs text-outline mr-1 font-bold">±</span>
                  <input
                    type="number"
                    value={bankDays}
                    onChange={(e) => setBankDays(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface w-full focus:outline-none"
                  />
                  <span className="text-xs text-outline">días</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USUARIOS Y PERMISOS */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30">
            <h3 className="text-base font-bold text-on-surface mb-3">Usuarios y Roles de Acceso</h3>
            <div className="divide-y divide-outline-variant/20 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">R</div>
                  <div>
                    <span className="font-bold text-on-surface block">Rodolfo</span>
                    <span className="text-outline">Director General · Acceso Total y Publicación de Cierres</span>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">Director</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">M</div>
                  <div>
                    <span className="font-bold text-on-surface block">Max</span>
                    <span className="text-outline">Jefe de Operaciones · Carga de Libros y Revisión de Pendientes</span>
                  </div>
                </div>
                <span className="bg-secondary/15 text-secondary text-xs font-bold px-2.5 py-1 rounded-full">Operador</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RESPALDO */}
      {activeTab === 'respaldo' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/30 flex flex-col gap-3">
            <h3 className="text-base font-bold text-on-surface">Respaldo Automático de Libros Excel</h3>
            <p className="text-xs text-on-surface-variant">
              Cada ejecución del motor genera una copia no destructiva preservando las fórmulas originales y las 57 celdas manuales blindadas.
            </p>
            <div className="pt-2">
              <button
                onClick={() => alert('Respaldo generado en servidor local con timestamp 20261028-1940.')}
                className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold hover:bg-surface-container-high cursor-pointer"
              >
                Crear copia de seguridad inmediata (.bak)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl border border-outline-variant/40 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-on-surface">Editar Sucursal: {editingBranch.name}</h4>
              <button onClick={() => setEditingBranch(null)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-outline font-bold uppercase block mb-1">Encargado de Tienda</label>
                <input
                  type="text"
                  defaultValue={editingBranch.manager}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-medium"
                />
              </div>
              <div>
                <label className="text-outline font-bold uppercase block mb-1">Cuota Fija Mensual (MXN)</label>
                <input
                  type="number"
                  defaultValue={editingBranch.fixedMonthlyFee}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingBranch(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-outline"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setEditingBranch(null);
                  handleSave();
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
              >
                Actualizar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
