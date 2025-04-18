
export interface SearchParams {
  searchBy?:string | undefined,
  searchValue?:string | undefined,
  page?:number,
  limit?:number,
  sortBy?:string | undefined,
  sortType?:string
}
export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  note?: string; // Added note field as optional
  createdAt: Date;
}

export interface Purchaser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unitId: string; // Changed from unit to unitId
  createdAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: Date;
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  createdAt: Date;
}

export interface BaseContract {
  id: string;
  projectId: string;
  applicantId: string;
  purchaserId: string;
  companyId: string;
  totalAmount: number;
  currency: string;
  secondCurrency: string;
  exchangeRate: number;
  paidAmount: number;
  signingDate: Date;
  expirationDate: Date;
  documentUrl: string | null;
  documentLink: string | null;
  createdAt: Date;
  // New fields
  realFinishedDate?: Date | null;
  overdueDays?: number;
  status?: 'draft' | 'active' | 'completed' | 'overdue' | 'cancelled';
  payments?: Payment[]; // Add payments array
}

export interface ProductContract extends BaseContract {
  type: 'product';
  contractProducts: ContractProduct[];
}

export interface ServiceContract extends BaseContract {
  type: 'service';
  description: string;
}

export interface ContractProduct {
  id: string;
  contractId: string;
  productId: string;
  quantity: number;
  deliveredQuantity: number;
  price: number;
  product: Product;
}

export interface ProductDelivery {
  id: string;
  contractProductId: string;
  quantity: number;
  date: Date;
  type: 'issue' | 'return';
  notes: string;
  createdAt: Date;
}

// New Payment interface
export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  giveDate: Date;
  note?: string;
  type: 'payment' | 'refund';
  createdAt: Date;
}

// New Link interface
export interface Link {
  id: string;
  projectId: string;
  status: 'active' | 'inactive' | 'expired';
  url: string;
  createdAt: Date;
}
