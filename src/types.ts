export type NavigationTab = 
  | 'inicio' 
  | 'cierre-del-mes' 
  | 'pendientes' 
  | 'tablero' 
  | 'historial' 
  | 'configuracion';

export type CierreStep = 1 | 2 | 3 | 4;

export type TableroSubTab = 
  | 'resumen' 
  | 'ventas' 
  | 'egresos' 
  | 'rentabilidad' 
  | 'efectivo' 
  | 'compras' 
  | 'proveedores';

export type ConfigSubTab = 
  | 'tiendas' 
  | 'cuentas' 
  | 'catalogo' 
  | 'reglas' 
  | 'usuarios' 
  | 'respaldo';

export type StoreName = 'Santa Rosa' | 'Cuautepec' | 'Tlalnepantla';
export type UserRole = 'Director' | 'Operador';

export interface PendingItem {
  id: string;
  code: string;
  category: 
    | 'Santander abono' 
    | 'Depósito sin identificar' 
    | 'Transferencia con obs.' 
    | 'Tarjeta sin abono' 
    | 'Efectivo desbalanceado' 
    | 'Cargo sin identificar' 
    | 'Proveedor sin cargo' 
    | 'Otras';
  date: string;
  amount: number;
  where: string;
  detail: string;
  status: 'Pendiente' | 'Revisado';
  store: StoreName;
  sideA: {
    title: string;
    account: string;
    date: string;
    concept: string;
    amount: number;
  };
  sideB: {
    title: string;
    reference: string;
    date: string;
    breakdown: string;
    amount: number;
  };
  discrepancy: number;
  ruleNumber: string;
  suggestion: string;
  reviewedBy?: string;
  reviewedDate?: string;
  notes?: string;
}

export interface RuleSummary {
  id: string;
  ruleNumber: string;
  title: string;
  description: string;
  matchedCount: number;
  totalCount: number;
  accuracyPercent: number;
  pendingCount: number;
  badgeType: 'perfect' | 'high' | 'attention';
}

export interface StoreProfitability {
  store: StoreName;
  type: string;
  sales: number;
  sharePercent: number;
  salaries: number;
  rent: number;
  opExpenses: number;
  ownExpenses: number;
  expToSalesRatio: number;
  assignedMerchandise: number;
  netProfit: number;
  marginPercent: number;
  isPositive: boolean;
}

export interface DailySaleRecord {
  date: string;
  dayName: string;
  santaRosa: number;
  cuautepec: number;
  tlalne: number;
  total: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  ticketsCount: number;
}

export interface StoreExpenseRecord {
  id: string;
  store: StoreName;
  category: string;
  concept: string;
  amount: number;
  date: string;
  folio: string;
  approvedBy: string;
  status: 'Autorizado' | 'En Revisión' | 'Excedente';
  notes?: string;
}

export interface SayerPurchaseRecord {
  id: string;
  date: string;
  invoice: string;
  description: string;
  grossAmount: number;
  formulaJDiscount: number;
  netAmount: number;
  paymentStatus: 'Conciliado Banamex' | 'Pendiente Conciliación';
  matchedDate?: string;
}

export interface ProviderAccountRecord {
  id: string;
  provider: string;
  concept: string;
  invoice: string;
  amount: number;
  dueDate: string;
  bankAccount: string;
  status: 'Conciliado' | 'En Proceso' | 'Diferencia';
}

export interface HistoricalClosing {
  id: string;
  month: string;
  periodRange: string;
  totalSales: number;
  totalProfit: number;
  marginPercent: number;
  accuracyPercent: number;
  pendingCount: number;
  resolvedPendingCount: number;
  operator: string;
  status: 'Mes Cerrado Definitivo' | 'Periodo Parcial' | 'En Conciliación';
  publishedAt: string;
}

export interface BranchConfig {
  id: string;
  name: StoreName;
  type: string;
  color: string;
  excelAliases: string[];
  affiliations: { code: string; label: string; active: boolean }[];
  salesSummaryActive: boolean;
  fixedMonthlyFee: number;
  manager: string;
}

export type SourceFileRole = 
  | 'libro_principal'
  | 'resumen_santa_rosa'
  | 'resumen_cuautepec'
  | 'resumen_tlalne'
  | 'extracto_bancario'
  | 'otro';

export interface UploadedFileRecord {
  id: string;
  name: string;
  sizeBytes: number;
  role: SourceFileRole;
  roleLabel: string;
  branch?: StoreName | 'Matriz y Sucursales' | 'Santander CTA 88' | 'Banamex CTA 212';
  status: 'Verificado' | 'En proceso' | 'Advertencia' | 'Incompleto';
  period: string;
  details: string;
  sheetNames: string[];
  rowCount: number;
  uploadedAt: string;
  isRealFile?: boolean;
  sheetData?: Record<string, any[]>;
  rawWorkbook?: any;
}

export interface SayerDiagnostics {
  totalSales: number;
  netProfit: number;
  marginPercent: number;
  sayerNetPurchases: number;
  otherMerchandise: number;
  storeOperatingExpenses: number;
  centralExpenses: number;
  servicesExpenses: number;
  storeOwnExpensePercentages: Record<StoreName, number>;
  storeOwnExpenseFlags: Record<StoreName, 'verde' | 'AMARILLO'>;
  errorCancellationsAmount: number;
  errorCancellationsPercent: number;
  errorCancellationsFlag: 'verde' | 'AMARILLO';
  cashDifference: number;
  cashDifferenceFlag: 'verde' | 'AMARILLO';
  sayerAverageDiscountPercent: number;
  sayerAveragePaymentDays: number;
  uncategorizedExpenseCount: number;
  uncategorizedExpenseSample: string[];
}

export interface CashAuditRow {
  tienda: StoreName;
  fecha: string;
  efectivoEntregar: number;
  ventasAlDia: number;
  diferencia: number;
  estatus: 'OK' | 'Revisar';
  filas: string;
  notas: string;
}

export interface SayerAuditRow {
  descripcion: string;
  fechaPago: string;
  facturasCount: number;
  sumaFacturas: number;
  descuentoK: number;
  notasCredito: number;
  esperado: number;
  pagadoJ: number;
  diferencia: number;
  filaBanamex: string;
}

export interface FullReconciliationResult {
  periodLabel: string;
  rulesSummary: RuleSummary[];
  pendingItems: PendingItem[];
  cashAuditRows: CashAuditRow[];
  sayerAuditRows: SayerAuditRow[];
  diagnostics: SayerDiagnostics;
  storeProfitability: StoreProfitability[];
  dailySales: DailySaleRecord[];
  storeExpenses: StoreExpenseRecord[];
  sayerPurchases: SayerPurchaseRecord[];
  providerAccounts: ProviderAccountRecord[];
  controlSummary: {
    ruleTitle: string;
    matched: number;
    total: number;
    percent: number;
  }[];
}
