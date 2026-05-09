// Autenticação
export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  id: number;
  publicId: string;
  email: string;
  name: string;
  role: string;
  active?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Clientes
export interface Customer {
  id: string;
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDTO {
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Veículos
export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color?: string;
  year?: number;
  brand?: string;
  observations?: string;
  active?: boolean;
  customerPublicId?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDTO {
  plate: string;
  model: string;
  color?: string;
  year?: number;
  brand?: string;
  observations?: string;
  customerCpf: string; // backend recebe como customerCpf mas é o publicId UUID do cliente
}

export interface UpdateVehicleDTO {
  plate?: string;
  model?: string;
  color?: string;
  year?: number;
  brand?: string;
  observations?: string;
}

// Serviços
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}

// Produtos
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  quantityStock: number;
  minimumQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  quantityStock: number;
  minimumQuantity: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  sku?: string;
  unitPrice?: number;
  minimumQuantity?: number;
}

// Agendamentos
export type ScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Schedule {
  id: string;
  customerPublicId?: string;
  customerName?: string;
  vehiclePublicId?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  scheduledAt: string;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDTO {
  customerId: string;
  vehicleId: string;
  serviceId: string;
  scheduledAt: string;
  notes?: string;
}

// Pedidos / Ordens de Serviço
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  servicePublicId?: string;
  serviceName?: string;
  productPublicId?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  schedulePublicId?: string;
  customerPublicId?: string;
  customerName?: string;
  vehiclePublicId?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDTO {
  serviceId?: string;
  productId?: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderDTO {
  scheduleId?: string;
  customerId: string;
  vehicleId: string;
  items: CreateOrderItemDTO[];
  notes?: string;
}

// Empresa
export interface Company {
  id: number;
  publicId: string;
  slug: string;
  name: string;
  email: string;
  phone?: string;
  planType: string;
  active: boolean;
  schemaName?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagamentos
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';

export interface Payment {
  id: string;
  orderPublicId?: string;
  customerName?: string;
  orderFinalAmount?: number;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDTO {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
}

// Loyalty
export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerReal: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoyaltyProgramDTO {
  name: string;
  pointsPerReal: number;
}

export interface LoyaltyPoint {
  id: string;
  customerPublicId?: string;
  customerName?: string;
  customerCpf?: string;
  programPublicId?: string;
  programName?: string;
  pointsBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  transactionType: 'EARN' | 'REDEEM';
  pointsValue: number;
  description?: string;
  createdAt: string;
}

// Despesas
export type CategoryType = 'OPERACIONAL' | 'INFRAESTRUTURA';
export type ExpensePaymentMethod =
  | 'CARTAO_CREDITO'
  | 'PIX'
  | 'BOLETO'
  | 'TRANSFERENCIA'
  | 'DINHEIRO'
  | 'OUTRO';
export type ExpenseStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

export interface ExpenseCategory {
  id: string;
  name: string;
  type: CategoryType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryDTO {
  name: string;
  type: CategoryType;
}

export interface Expense {
  id: string;
  supplier: string;
  description?: string;
  expenseDate: string;
  dueDate?: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  paymentStatus: ExpenseStatus;
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  supplier: string;
  description?: string;
  expenseDate: string;
  dueDate?: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  paymentStatus: Exclude<ExpenseStatus, 'ATRASADO'>;
  categoryId: string;
}

export interface ExpensesByCategoryItem {
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  total: number;
  count: number;
}

export interface ExpensesByMonthItem {
  year: number;
  month: number;
  label: string;
  total: number;
  opex: number;
  infra: number;
}

// Reports / Analytics
export interface DashboardSummary {
  totalCustomers: number;
  totalVehicles: number;
  totalServices: number;
  totalProducts: number;
  totalSchedules: number;
  schedulesByStatus: Record<string, number>;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  averageServicePrice: number;
  maxServicePrice: number;
  minServicePrice: number;
  totalExpensesThisMonth: number;
  totalExpensesAllTime: number;
  totalOpexThisMonth: number;
  totalInfraThisMonth: number;
  pendingExpensesCount: number;
  overdueExpensesCount: number;
}

export interface RecentScheduleItem {
  id: string;
  customerName?: string;
  vehiclePlate?: string;
  serviceName?: string;
  servicePrice?: number;
  status: ScheduleStatus;
  scheduledAt: string;
}

export interface TopServiceItem {
  id: string;
  name: string;
  price: number;
  bookings: number;
  totalRevenue: number;
}

// Paginação
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Error
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Array<{
    field: string;
    message: string;
    rejectedValue?: unknown;
  }>;
}
