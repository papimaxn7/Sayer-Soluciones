import {
  PendingItem,
  RuleSummary,
  StoreProfitability,
  DailySaleRecord,
  StoreExpenseRecord,
  SayerPurchaseRecord,
  ProviderAccountRecord,
  HistoricalClosing,
  BranchConfig,
  UploadedFileRecord
} from '../types';

export const RULES_DATA: RuleSummary[] = [
  {
    id: 'r1',
    ruleNumber: 'Regla 01',
    title: 'Abonos Santander ↔ Venta Tarjeta',
    description: 'Cruce de lotes TPV Santander con registros de pago con tarjeta en resúmenes diarios.',
    matchedCount: 70,
    totalCount: 72,
    accuracyPercent: 97.2,
    pendingCount: 2,
    badgeType: 'high'
  },
  {
    id: 'r2',
    ruleNumber: 'Regla 02',
    title: 'Traspasos AFI ↔ Abonos Santander',
    description: 'Verificación de traspasos de afiliaciones terminal hacia cuenta maestra.',
    matchedCount: 58,
    totalCount: 60,
    accuracyPercent: 96.7,
    pendingCount: 2,
    badgeType: 'high'
  },
  {
    id: 'r3',
    ruleNumber: 'Regla 03',
    title: 'Depósitos AFI Banamex ↔ Traspasos',
    description: 'Reconciliación exacta entre traspasos de concentración y abonos en cuenta Banamex.',
    matchedCount: 58,
    totalCount: 58,
    accuracyPercent: 100.0,
    pendingCount: 0,
    badgeType: 'perfect'
  },
  {
    id: 'r4',
    ruleNumber: 'Regla 04',
    title: 'Transferencias Clientes ↔ Resúmenes',
    description: 'Asignación de transferencias bancarias directas de clientes contra notas emitidas.',
    matchedCount: 141,
    totalCount: 158,
    accuracyPercent: 89.2,
    pendingCount: 17,
    badgeType: 'attention'
  },
  {
    id: 'r5',
    ruleNumber: 'Regla 05',
    title: 'Depósitos Efectivo ↔ Ventas al Día',
    description: 'Comprobación de fichas de depósito bancario de efectivo contra corte de caja z.',
    matchedCount: 22,
    totalCount: 24,
    accuracyPercent: 91.7,
    pendingCount: 2,
    badgeType: 'high'
  },
  {
    id: 'r6',
    ruleNumber: 'Regla 06',
    title: 'Efectivo Tienda-Día (±$10)',
    description: 'Cuadre diario de efectivo físico de cajeros contra ventas reportadas con tolerancia.',
    matchedCount: 71,
    totalCount: 75,
    accuracyPercent: 94.7,
    pendingCount: 4,
    badgeType: 'high'
  },
  {
    id: 'r7',
    ruleNumber: 'Regla 07',
    title: 'Pagos a Sayer ↔ Banamex',
    description: 'Cálculo de Fórmula J de descuento comercial y pagos aplicados a planta Sayer.',
    matchedCount: 9,
    totalCount: 9,
    accuracyPercent: 100.0,
    pendingCount: 0,
    badgeType: 'perfect'
  },
  {
    id: 'r8',
    ruleNumber: 'Regla 08',
    title: 'Pagos Proveedores ↔ Banamex',
    description: 'Vinculación de cargos a terceros con facturas recibidas y autorizadas de insumos.',
    matchedCount: 31,
    totalCount: 34,
    accuracyPercent: 91.2,
    pendingCount: 3,
    badgeType: 'high'
  }
];

export const INITIAL_PENDINGS: PendingItem[] = [
  {
    id: 'pend-01',
    code: 'PEN-001',
    category: 'Santander abono',
    date: '03/10/2026',
    amount: 9876.40,
    where: 'CTA FRIDA SANTANDER : 88',
    detail: 'AFIL.-9731294 (Cuautepec)',
    status: 'Pendiente',
    store: 'Cuautepec',
    ruleNumber: 'Regla 01',
    discrepancy: 120.40,
    suggestion: 'El corte de caja de Cuautepec del 02/10 registró $9,756.00 por TPV. Existe un cobro de tarjeta extemporáneo de $120.40 procesado a las 20:15 hrs tras el cierre del turno.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA SANTANDER : 88',
      date: '03/10/2026',
      concept: 'AFIL.-9731294 (Cuautepec)',
      amount: 9876.40
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Sucursal Cuautepec - Corte 02/10',
      date: '02/10/2026',
      breakdown: 'Terminal TPV 01 ($6,450.00) + TPV 02 ($3,306.00)',
      amount: 9756.00
    }
  },
  {
    id: 'pend-02',
    code: 'PEN-002',
    category: 'Depósito sin identificar',
    date: '07/10/2026',
    amount: 18450.00,
    where: 'CTA FRIDA BMEX : 212',
    detail: 'PAGO RECIBIDO CONSTRUCTORA EJEMPLO SA',
    status: 'Pendiente',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 04',
    discrepancy: 18450.00,
    suggestion: 'Abono SPEI de Constructora Ejemplo S.A. sin nota de remisión vinculada en el mes. Posible anticipo de impermeabilizante para obra.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '07/10/2026',
      concept: 'SPEI RECIBIDO 849201 BANORTE CONSTRUCTORA EJEMPLO',
      amount: 18450.00
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Sucursal Santa Rosa (Sin registro)',
      date: '07/10/2026',
      breakdown: 'No se encontró folio de cliente asociado en sistema local',
      amount: 0.00
    }
  },
  {
    id: 'pend-03',
    code: 'PEN-003',
    category: 'Transferencia con obs.',
    date: '12/10/2026',
    amount: 4320.00,
    where: 'CTA FRIDA BMEX : 212',
    detail: 'TRF JUAN PEREZ PINTURA ESMALTE',
    status: 'Pendiente',
    store: 'Tlalnepantla',
    ruleNumber: 'Regla 04',
    discrepancy: 80.00,
    suggestion: 'Nota de remisión folio 4821 por $4,400.00 en Tlalne. El cliente transfirió $4,320.00 deduciendo $80.00 por comisión de retiro no autorizada.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '12/10/2026',
      concept: 'TRANSFERENCIA BANCOMER JUAN PEREZ',
      amount: 4320.00
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Tlalnepantla - Folio 4821',
      date: '12/10/2026',
      breakdown: '4 Cubetas Esmalte Acuario Plus ($4,400.00)',
      amount: 4400.00
    }
  },
  {
    id: 'pend-04',
    code: 'PEN-004',
    category: 'Efectivo desbalanceado',
    date: '15/10/2026',
    amount: 1450.00,
    where: 'Ventas al Día : Santa Rosa',
    detail: 'Diferencia en arqueo turno vespertino',
    status: 'Pendiente',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 06',
    discrepancy: -1450.00,
    suggestion: 'El corte de caja reporta venta en efectivo de $24,150.00 pero la remesa en sobre depositada en caja fuerte sumó $22,700.00. Faltante de $1,450.00 sujeto a bitácora de cajero Pedro H.',
    sideA: {
      title: 'LADO A · Ventas al Día',
      account: 'Libro Sayer - Pestaña VENTAS AL DIA',
      date: '15/10/2026',
      concept: 'Corte Z-842 Santa Rosa Turno 2',
      amount: 24150.00
    },
    sideB: {
      title: 'LADO B · Físico / Ficha',
      reference: 'Sobre de Remesa #15-SR',
      date: '15/10/2026',
      breakdown: 'Billetes contados: $22,500 + Monedas: $200',
      amount: 22700.00
    }
  },
  {
    id: 'pend-05',
    code: 'PEN-005',
    category: 'Tarjeta sin abono',
    date: '31/10/2026',
    amount: 14230.00,
    where: 'Resumen Sta Rosa : S/F',
    detail: 'Terminal TPV BBVA lote cerrado noche',
    status: 'Pendiente',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 01',
    discrepancy: 14230.00,
    suggestion: 'Cierre de terminal bancaria realizado a las 21:05 hrs del sábado 31 de octubre. Por corte de fin de semana, el depósito bancario de Santander caerá con fecha valor 03/11/2026.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA SANTANDER : 88',
      date: '31/10/2026',
      concept: 'Sin abono en extracto de octubre (Traspaso pendiente)',
      amount: 0.00
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Corte Terminal #9731247 Santa Rosa',
      date: '31/10/2026',
      breakdown: 'Lote 118 - 24 transacciones con tarjeta',
      amount: 14230.00
    }
  },
  {
    id: 'pend-06',
    code: 'PEN-006',
    category: 'Cargo sin identificar',
    date: '21/10/2026',
    amount: 3480.00,
    where: 'CTA FRIDA BMEX : 401',
    detail: 'RETIRO SPEI CARGO NO RECONOCIDO',
    status: 'Pendiente',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 08',
    discrepancy: 3480.00,
    suggestion: 'Cargo automático en cuenta Banamex por seguro de flotilla no registrado previamente en la hoja de egresos.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 401',
      date: '21/10/2026',
      concept: 'CARGO DOMICILIADO SEGUROS ATLAS',
      amount: 3480.00
    },
    sideB: {
      title: 'LADO B · Egresos',
      reference: 'Egresos Sucursales (Sin captura)',
      date: '21/10/2026',
      breakdown: 'Póliza pendiente de comprobación contable',
      amount: 0.00
    }
  },
  {
    id: 'pend-07',
    code: 'PEN-007',
    category: 'Proveedor sin cargo',
    date: '04/10/2026',
    amount: 12800.00,
    where: 'PROVEDORES : 94',
    detail: 'Factura 8820 Pinturas del Centro',
    status: 'Revisado',
    store: 'Cuautepec',
    ruleNumber: 'Regla 08',
    discrepancy: 0.00,
    suggestion: 'Factura pagada mediante cheque de caja expedido el 30/09 y cobrado hasta el 06/10.',
    reviewedBy: 'Rodolfo (Director)',
    reviewedDate: '23/10/2026',
    notes: 'Aclarado con gerencia: se cobró la semana siguiente. Todo en orden.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '06/10/2026',
      concept: 'CHEQUE COBRADO #4012 PINTURAS DEL CENTRO',
      amount: 12800.00
    },
    sideB: {
      title: 'LADO B · Factura',
      reference: 'PROVEDORES : Renglón 94',
      date: '04/10/2026',
      breakdown: 'Factura 8820 Insumos y Thinner',
      amount: 12800.00
    }
  },
  {
    id: 'pend-08',
    code: 'PEN-008',
    category: 'Transferencia con obs.',
    date: '18/10/2026',
    amount: 6200.00,
    where: 'CTA FRIDA BMEX : 212',
    detail: 'TRF TALLER MECANICO LOPEZ',
    status: 'Pendiente',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 04',
    discrepancy: 0.00,
    suggestion: 'Transferencia cliente con referencia incompleta. Coincide con nota 1192 por volumen de pintura poliuretano.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '18/10/2026',
      concept: 'SPEI RECIBIDO TALLER LOPEZ',
      amount: 6200.00
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Santa Rosa - Nota 1192',
      date: '18/10/2026',
      breakdown: 'Acabados Automotrices Sayer',
      amount: 6200.00
    }
  },
  {
    id: 'pend-09',
    code: 'PEN-009',
    category: 'Efectivo desbalanceado',
    date: '22/10/2026',
    amount: 450.00,
    where: 'Ventas al Día : Cuautepec',
    detail: 'Sobrante en caja chica turno 1',
    status: 'Pendiente',
    store: 'Cuautepec',
    ruleNumber: 'Regla 06',
    discrepancy: 450.00,
    suggestion: 'Sobrante no reclamado en caja. Excede la tolerancia autorizada de ±$10.00.',
    sideA: {
      title: 'LADO A · Ventas al Día',
      account: 'Ventas Cuautepec 22/10',
      date: '22/10/2026',
      concept: 'Venta registrada efectivo',
      amount: 15200.00
    },
    sideB: {
      title: 'LADO B · Físico',
      reference: 'Arqueo Físico',
      date: '22/10/2026',
      breakdown: 'Conteo de efectivo entregado',
      amount: 15650.00
    }
  },
  {
    id: 'pend-10',
    code: 'PEN-010',
    category: 'Depósito sin identificar',
    date: '25/10/2026',
    amount: 7890.00,
    where: 'CTA FRIDA BMEX : 212',
    detail: 'DEPOSITO EFECTIVO EN PRACTICAJA',
    status: 'Pendiente',
    store: 'Tlalnepantla',
    ruleNumber: 'Regla 05',
    discrepancy: 7890.00,
    suggestion: 'Depósito de efectivo dominical en cajero inteligente Banamex. Falta vincular con número de tienda.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '25/10/2026',
      concept: 'DEP PRACTICAJA SUC 0418',
      amount: 7890.00
    },
    sideB: {
      title: 'LADO B · Resumen',
      reference: 'Tlalnepantla',
      date: '25/10/2026',
      breakdown: 'Sin desglose registrado en hoja de turno',
      amount: 0.00
    }
  },
  {
    id: 'pend-11',
    code: 'PEN-011',
    category: 'Proveedor sin cargo',
    date: '10/10/2026',
    amount: 8400.00,
    where: 'PROVEDORES : 102',
    detail: 'Factura 1104 Lijas y Abrasivos de México',
    status: 'Revisado',
    store: 'Santa Rosa',
    ruleNumber: 'Regla 08',
    discrepancy: 0.00,
    suggestion: 'Programado para pago el primer viernes de noviembre.',
    reviewedBy: 'Max (Operador)',
    reviewedDate: '24/10/2026',
    notes: 'Plazo de crédito acordado a 30 días.',
    sideA: {
      title: 'LADO A · Banco',
      account: 'CTA FRIDA BMEX : 212',
      date: '31/10/2026',
      concept: 'Pago diferido a noviembre',
      amount: 0.00
    },
    sideB: {
      title: 'LADO B · Factura',
      reference: 'PROVEDORES : 102',
      date: '10/10/2026',
      breakdown: 'Factura 1104',
      amount: 8400.00
    }
  },
  {
    id: 'pend-12',
    code: 'PEN-012',
    category: 'Otras',
    date: '28/10/2026',
    amount: 1100.00,
    where: 'Gastos Menores : Tlalne',
    detail: 'Reposición cerradura bodega',
    status: 'Revisado',
    store: 'Tlalnepantla',
    ruleNumber: 'Regla 06',
    discrepancy: 0.00,
    suggestion: 'Gasto de emergencia con recibo simple validado por gerencia.',
    reviewedBy: 'Rodolfo (Director)',
    reviewedDate: '29/10/2026',
    notes: 'Se aprobó ticket ferretero por cambio de chapa de seguridad.',
    sideA: {
      title: 'LADO A · Caja Chica',
      account: 'Fondo Fijo Tlalne',
      date: '28/10/2026',
      concept: 'Salida de efectivo autorizada',
      amount: 1100.00
    },
    sideB: {
      title: 'LADO B · Comprobante',
      reference: 'Ticket Ferretería El Candado',
      date: '28/10/2026',
      breakdown: 'Cerradura Phillips mod 715',
      amount: 1100.00
    }
  }
];

export const STORE_PROFITABILITY_DATA: StoreProfitability[] = [
  {
    store: 'Santa Rosa',
    type: 'Sucursal Matriz',
    sales: 820000,
    sharePercent: 44.3,
    salaries: 34200,
    rent: 8000,
    opExpenses: 13560,
    ownExpenses: 55760,
    expToSalesRatio: 6.8,
    assignedMerchandise: 639600,
    netProfit: 124640,
    marginPercent: 15.2,
    isPositive: true
  },
  {
    store: 'Cuautepec',
    type: 'Sucursal Periférica',
    sales: 560000,
    sharePercent: 30.3,
    salaries: 28000,
    rent: 9500,
    opExpenses: 10900,
    ownExpenses: 48400,
    expToSalesRatio: 8.6,
    assignedMerchandise: 436800,
    netProfit: 74800,
    marginPercent: 13.4,
    isPositive: true
  },
  {
    store: 'Tlalnepantla',
    type: 'Sucursal Industrial',
    sales: 470000,
    sharePercent: 25.4,
    salaries: 31000,
    rent: 14000,
    opExpenses: 9080,
    ownExpenses: 54080,
    expToSalesRatio: 11.5,
    assignedMerchandise: 366600,
    netProfit: 49320,
    marginPercent: 10.5,
    isPositive: true
  }
];

export const DAILY_SALES_OCTOBER: DailySaleRecord[] = [
  { date: '01/10/2026', dayName: 'Jue', santaRosa: 28400, cuautepec: 18200, tlalne: 15600, total: 62200, cashAmount: 26000, cardAmount: 24200, transferAmount: 12000, ticketsCount: 48 },
  { date: '02/10/2026', dayName: 'Vie', santaRosa: 34100, cuautepec: 22400, tlalne: 19800, total: 76300, cashAmount: 32000, cardAmount: 29500, transferAmount: 14800, ticketsCount: 62 },
  { date: '03/10/2026', dayName: 'Sáb', santaRosa: 41200, cuautepec: 29100, tlalne: 24500, total: 94800, cashAmount: 48000, cardAmount: 36800, transferAmount: 10000, ticketsCount: 78 },
  { date: '05/10/2026', dayName: 'Lun', santaRosa: 26500, cuautepec: 17800, tlalne: 14900, total: 59200, cashAmount: 22000, cardAmount: 21200, transferAmount: 16000, ticketsCount: 42 },
  { date: '06/10/2026', dayName: 'Mar', santaRosa: 29800, cuautepec: 19500, tlalne: 16200, total: 65500, cashAmount: 24500, cardAmount: 26000, transferAmount: 15000, ticketsCount: 51 },
  { date: '07/10/2026', dayName: 'Mié', santaRosa: 31200, cuautepec: 21000, tlalne: 17400, total: 69600, cashAmount: 27000, cardAmount: 24600, transferAmount: 18000, ticketsCount: 55 },
  { date: '08/10/2026', dayName: 'Jue', santaRosa: 28900, cuautepec: 19100, tlalne: 16800, total: 64800, cashAmount: 25000, cardAmount: 25800, transferAmount: 14000, ticketsCount: 49 },
  { date: '09/10/2026', dayName: 'Vie', santaRosa: 36500, cuautepec: 24200, tlalne: 20100, total: 80800, cashAmount: 33500, cardAmount: 31300, transferAmount: 16000, ticketsCount: 65 },
  { date: '10/10/2026', dayName: 'Sáb', santaRosa: 43800, cuautepec: 31500, tlalne: 26200, total: 101500, cashAmount: 52000, cardAmount: 39500, transferAmount: 10000, ticketsCount: 84 },
  { date: '12/10/2026', dayName: 'Lun', santaRosa: 27100, cuautepec: 18400, tlalne: 15300, total: 60800, cashAmount: 23000, cardAmount: 22800, transferAmount: 15000, ticketsCount: 46 },
  { date: '15/10/2026', dayName: 'Jue', santaRosa: 32400, cuautepec: 21900, tlalne: 18200, total: 72500, cashAmount: 28000, cardAmount: 27500, transferAmount: 17000, ticketsCount: 57 },
  { date: '17/10/2026', dayName: 'Sáb', santaRosa: 46200, cuautepec: 33100, tlalne: 27800, total: 107100, cashAmount: 55000, cardAmount: 41100, transferAmount: 11000, ticketsCount: 91 },
  { date: '20/10/2026', dayName: 'Mar', santaRosa: 30100, cuautepec: 20500, tlalne: 17100, total: 67700, cashAmount: 25500, cardAmount: 26200, transferAmount: 16000, ticketsCount: 52 },
  { date: '24/10/2026', dayName: 'Sáb', santaRosa: 48900, cuautepec: 34200, tlalne: 28900, total: 112000, cashAmount: 58000, cardAmount: 42000, transferAmount: 12000, ticketsCount: 96 },
  { date: '28/10/2026', dayName: 'Mié', santaRosa: 33400, cuautepec: 22800, tlalne: 19100, total: 75300, cashAmount: 29000, cardAmount: 29300, transferAmount: 17000, ticketsCount: 60 },
  { date: '31/10/2026', dayName: 'Sáb', santaRosa: 51200, cuautepec: 36200, tlalne: 30900, total: 118300, cashAmount: 62000, cardAmount: 44300, transferAmount: 12000, ticketsCount: 104 }
];

export const STORE_EXPENSES: StoreExpenseRecord[] = [
  { id: 'exp-1', store: 'Santa Rosa', category: 'Sueldos y Comisiones', concept: 'Nómina Quincenal Operativa', amount: 34200, date: '15/10/2026', folio: 'NOM-SR-1026', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-2', store: 'Santa Rosa', category: 'Renta', concept: 'Arrendamiento Local Matriz', amount: 8000, date: '05/10/2026', folio: 'REC-084', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-3', store: 'Santa Rosa', category: 'Gastos Operativos', concept: 'Empaque, Thinner de limpieza y bolsas', amount: 4850, date: '11/10/2026', folio: 'GTO-SR-441', approvedBy: 'Max', status: 'Autorizado' },
  { id: 'exp-4', store: 'Santa Rosa', category: 'Gastos Operativos', concept: 'Servicio Mantenimiento Compresor de Color', amount: 5200, date: '21/10/2026', folio: 'MAN-SR-092', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-5', store: 'Cuautepec', category: 'Sueldos y Comisiones', concept: 'Nómina 2 Empleados de mostrador', amount: 28000, date: '15/10/2026', folio: 'NOM-CP-1026', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-6', store: 'Cuautepec', category: 'Renta', concept: 'Arrendamiento Local Av. Morelos', amount: 9500, date: '04/10/2026', folio: 'REC-119', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-7', store: 'Cuautepec', category: 'Gastos Operativos', concept: 'Luz CFE y Agua Bimestral', amount: 6200, date: '19/10/2026', folio: 'CFE-8841', approvedBy: 'Max', status: 'Autorizado' },
  { id: 'exp-8', store: 'Tlalnepantla', category: 'Sueldos y Comisiones', concept: 'Nómina Encargado + Ayudante General', amount: 31000, date: '15/10/2026', folio: 'NOM-TL-1026', approvedBy: 'Rodolfo', status: 'Autorizado' },
  { id: 'exp-9', store: 'Tlalnepantla', category: 'Renta', concept: 'Renta Bodega y Mostrador Vía Gustavo Baz', amount: 14000, date: '02/10/2026', folio: 'FAC-7412', approvedBy: 'Rodolfo', status: 'Excedente', notes: 'Renta con incremento anual no presupuestado (+12%)' },
  { id: 'exp-10', store: 'Tlalnepantla', category: 'Gastos Operativos', concept: 'Flete Urgente de Tambos de Solvente', amount: 3450, date: '23/10/2026', folio: 'FLT-033', approvedBy: 'Max', status: 'En Revisión' }
];

export const SAYER_PURCHASES: SayerPurchaseRecord[] = [
  { id: 'say-1', date: '03/10/2026', invoice: 'FAC-SAYER-98214', description: 'Esmalte 100 Brillante 200L + Primer', grossAmount: 184500, formulaJDiscount: 18450, netAmount: 166050, paymentStatus: 'Conciliado Banamex', matchedDate: '05/10/2026' },
  { id: 'say-2', date: '09/10/2026', invoice: 'FAC-SAYER-98550', description: 'Vinílica Ultra Clean Cubetas 19L', grossAmount: 215400, formulaJDiscount: 23694, netAmount: 191706, paymentStatus: 'Conciliado Banamex', matchedDate: '12/10/2026' },
  { id: 'say-3', date: '16/10/2026', invoice: 'FAC-SAYER-98892', description: 'Impermeabilizante ImperSayer 5 y 7 años', grossAmount: 198200, formulaJDiscount: 21802, netAmount: 176398, paymentStatus: 'Conciliado Banamex', matchedDate: '19/10/2026' },
  { id: 'say-4', date: '23/10/2026', invoice: 'FAC-SAYER-99120', description: 'Barniz y Tintas Polyform para Madera', grossAmount: 164000, formulaJDiscount: 16400, netAmount: 147600, paymentStatus: 'Conciliado Banamex', matchedDate: '26/10/2026' },
  { id: 'say-5', date: '30/10/2026', invoice: 'FAC-SAYER-99411', description: 'Solventes, Reductores y Accesorios', grossAmount: 252100, formulaJDiscount: 27731, netAmount: 224369, paymentStatus: 'Conciliado Banamex', matchedDate: '31/10/2026' }
];

export const PROVIDERS_ACCOUNTS: ProviderAccountRecord[] = [
  { id: 'prov-1', provider: 'Pinturas del Centro S.A. de C.V.', concept: 'Thinner estándar y aguarrás sintético', invoice: 'FAC-8820', amount: 12800, dueDate: '30/10/2026', bankAccount: 'Banamex 212', status: 'Conciliado' },
  { id: 'prov-2', provider: 'Lijas y Abrasivos de México', concept: 'Rollos de lija de agua grano 120-400', invoice: 'FAC-1104', amount: 8400, dueDate: '05/11/2026', bankAccount: 'Banamex 212', status: 'En Proceso' },
  { id: 'prov-3', provider: 'Brochas y Rodillos Éxito', concept: 'Brochas cerda natural 2", 3", 4"', invoice: 'FAC-3941', amount: 16500, dueDate: '28/10/2026', bankAccount: 'Banamex 212', status: 'Conciliado' },
  { id: 'prov-4', provider: 'Cintas y Adhesivos Industriales', concept: 'Masking tape azul pintor 3M', invoice: 'FAC-9012', amount: 9200, dueDate: '02/11/2026', bankAccount: 'Banamex 212', status: 'En Proceso' },
  { id: 'prov-5', provider: 'Comercializadora de Envases Metálicos', concept: 'Galones y botes vacíos con tapa', invoice: 'FAC-2240', amount: 14700, dueDate: '24/10/2026', bankAccount: 'Banamex 212', status: 'Diferencia' }
];

export const HISTORICAL_CLOSINGS: HistoricalClosing[] = [
  {
    id: 'close-2026-10',
    month: 'Octubre 2026',
    periodRange: '01/10/2026 a 31/10/2026',
    totalSales: 1850000,
    totalProfit: 248760,
    marginPercent: 13.4,
    accuracyPercent: 94.8,
    pendingCount: 38,
    resolvedPendingCount: 12,
    operator: 'Max (Operador) · Autorizado por Rodolfo',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '28/10/2026 16:40'
  },
  {
    id: 'close-2026-09',
    month: 'Septiembre 2026',
    periodRange: '01/09/2026 a 30/09/2026',
    totalSales: 1775000,
    totalProfit: 234300,
    marginPercent: 13.2,
    accuracyPercent: 96.1,
    pendingCount: 42,
    resolvedPendingCount: 41,
    operator: 'Max (Operador)',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '03/10/2026 18:22'
  },
  {
    id: 'close-2026-08',
    month: 'Agosto 2026',
    periodRange: '01/08/2026 a 31/08/2026',
    totalSales: 1820000,
    totalProfit: 245700,
    marginPercent: 13.5,
    accuracyPercent: 97.4,
    pendingCount: 31,
    resolvedPendingCount: 31,
    operator: 'Rodolfo (Director)',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '02/09/2026 14:15'
  },
  {
    id: 'close-2026-07',
    month: 'Julio 2026',
    periodRange: '01/07/2026 a 31/07/2026',
    totalSales: 1690000,
    totalProfit: 216320,
    marginPercent: 12.8,
    accuracyPercent: 93.9,
    pendingCount: 49,
    resolvedPendingCount: 47,
    operator: 'Max (Operador)',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '04/08/2026 19:40'
  },
  {
    id: 'close-2026-06',
    month: 'Junio 2026',
    periodRange: '01/06/2026 a 30/06/2026',
    totalSales: 1640000,
    totalProfit: 211560,
    marginPercent: 12.9,
    accuracyPercent: 95.0,
    pendingCount: 36,
    resolvedPendingCount: 36,
    operator: 'Max (Operador)',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '03/07/2026 17:05'
  },
  {
    id: 'close-2026-05',
    month: 'Mayo 2026',
    periodRange: '01/05/2026 a 31/05/2026',
    totalSales: 1720000,
    totalProfit: 227040,
    marginPercent: 13.2,
    accuracyPercent: 98.2,
    pendingCount: 28,
    resolvedPendingCount: 28,
    operator: 'Rodolfo (Director)',
    status: 'Mes Cerrado Definitivo',
    publishedAt: '02/06/2026 15:30'
  }
];

export const BRANCH_CONFIGS: BranchConfig[] = [
  {
    id: 'b-sr',
    name: 'Santa Rosa',
    type: 'Sucursal Matriz',
    color: '#67E100',
    excelAliases: ['SantaRosa', 'SR', 'STA_ROSA', 'Matriz'],
    affiliations: [
      { code: '9731247', label: 'Histórica TPV Santander', active: false },
      { code: '8581544', label: 'Activa (Sem 42, 2026+)', active: true }
    ],
    salesSummaryActive: true,
    fixedMonthlyFee: 200.00,
    manager: 'Carlos Mendoza'
  },
  {
    id: 'b-cp',
    name: 'Cuautepec',
    type: 'Sucursal Periférica',
    color: '#FCA800',
    excelAliases: ['Cuautepec', 'CP', 'CUAU', 'Tienda 2'],
    affiliations: [
      { code: '9731294', label: 'TPV Santander Activa', active: true }
    ],
    salesSummaryActive: true,
    fixedMonthlyFee: 200.00,
    manager: 'Laura Sánchez'
  },
  {
    id: 'b-tl',
    name: 'Tlalnepantla',
    type: 'Sucursal Industrial',
    color: '#F72800',
    excelAliases: ['Tlalne', 'TL', 'TLALNEPANTLA', 'Tienda 3'],
    affiliations: [
      { code: '9731308', label: 'TPV Santander Activa', active: true }
    ],
    salesSummaryActive: true,
    fixedMonthlyFee: 200.00,
    manager: 'Ignacio Vega'
  }
];

export const PRODUCT_FAMILIES = [
  { name: 'Esmaltes y Primarios Sayer', sales: 684500, share: 37.0, growth: '+6.2%', color: '#156bf9' },
  { name: 'Vinílicas Acrílicas (Ultra/Max)', sales: 518000, share: 28.0, growth: '+3.8%', color: '#0054cc' },
  { name: 'Impermeabilizantes ImperSayer', sales: 333000, share: 18.0, growth: '+8.1%', color: '#365bad' },
  { name: 'Polyform y Tintas Madera', sales: 185000, share: 10.0, growth: '+1.4%', color: '#326ee6' },
  { name: 'Solventes y Thinner a Granel', sales: 83250, share: 4.5, growth: '-0.5%', color: '#84a6fd' },
  { name: 'Brochas, Lijas y Complementos', sales: 46250, share: 2.5, growth: '+2.1%', color: '#dbe3f4' }
];

export const LOGO_URL = '/assets/aistudio/Logo_Sayer_Soluciones_-_General_a25d2f77.png';

export const DEFAULT_DEMO_FILES: UploadedFileRecord[] = [
  {
    id: 'file-demo-1',
    name: 'SAYER_VENTAS_2026.xlsx',
    sizeBytes: 4823449,
    role: 'libro_principal',
    roleLabel: 'Libro Principal',
    branch: 'Matriz y Sucursales',
    status: 'Verificado',
    period: '01/10/2026 a 31/10/2026',
    details: '5 de 5 pestañas encontradas: VENTAS AL DIA, SAYER FRIDA PAGOS, PROVEDORES, CTA FRIDA BMEX, CTA FRIDA SANTANDER',
    sheetNames: ['VENTAS AL DIA', 'SAYER FRIDA PAGOS', 'PROVEDORES', 'CTA FRIDA BMEX', 'CTA FRIDA SANTANDER'],
    rowCount: 1420,
    uploadedAt: '03/11/2026 10:14 hrs'
  },
  {
    id: 'file-demo-2',
    name: 'ResumenSantaRosa_Oct.xlsx',
    sizeBytes: 842100,
    role: 'resumen_santa_rosa',
    roleLabel: 'Resumen de Venta',
    branch: 'Santa Rosa',
    status: 'Verificado',
    period: '01/10/2026 a 31/10/2026',
    details: 'Corte mensual de turnos consecutivos Santa Rosa (72 turnos, 118 lotes TPV).',
    sheetNames: ['Resumen Venta Oct', 'Detalle Tarjetas', 'Arqueo Efectivo'],
    rowCount: 410,
    uploadedAt: '03/11/2026 10:14 hrs'
  },
  {
    id: 'file-demo-3',
    name: 'ResumenCuautepec_Oct.xlsx',
    sizeBytes: 712000,
    role: 'resumen_cuautepec',
    roleLabel: 'Resumen de Venta',
    branch: 'Cuautepec',
    status: 'Verificado',
    period: '01/10/2026 a 31/10/2026',
    details: 'Verificado contra reporte de terminal TPV Afiliación 9731294 (60 turnos).',
    sheetNames: ['Resumen Cuautepec', 'Cortes Diario'],
    rowCount: 320,
    uploadedAt: '03/11/2026 10:14 hrs'
  },
  {
    id: 'file-demo-4',
    name: 'ResumenTlalne_Oct.xlsx',
    sizeBytes: 654000,
    role: 'resumen_tlalne',
    roleLabel: 'Resumen de Venta',
    branch: 'Tlalnepantla',
    status: 'Verificado',
    period: '01/10/2026 a 31/10/2026',
    details: 'Cortes diarios Tlalnepantla, créditos talleres y TPV Afiliación 9731308.',
    sheetNames: ['Resumen Tlalne Oct', 'Turnos y Gastos'],
    rowCount: 295,
    uploadedAt: '03/11/2026 10:14 hrs'
  },
  {
    id: 'file-demo-5',
    name: 'Extracto_Santander_Oct2026.xlsx',
    sizeBytes: 1150000,
    role: 'extracto_bancario',
    roleLabel: 'Extracto Bancario',
    branch: 'Santander CTA 88',
    status: 'Verificado',
    period: '01/10/2026 a 31/10/2026',
    details: 'Concentradora Santander con 60 lotes de traspaso y comisiones.',
    sheetNames: ['Movimientos Cuenta 88'],
    rowCount: 180,
    uploadedAt: '03/11/2026 10:14 hrs'
  }
];
