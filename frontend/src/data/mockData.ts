import { 
  Applicant, 
  Purchaser, 
  Company, 
  Product, 
  Project, 
  ProductContract, 
  ServiceContract,
  ContractProduct,
  Unit,
  Payment
} from '../types';

// Generate some mock data for our application
export const applicants: Applicant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-123-4567',
    address: '123 Main St, Anytown, USA',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: '+1-555-987-6543',
    address: '456 Oak Ave, Somewhere, USA',
    createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-456-7890',
    address: '789 Pine Rd, Nowhere, USA',
    createdAt: new Date('2023-03-10')
  }
];

export const purchasers: Purchaser[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'procurement@acme.com',
    phone: '+1-555-111-2222',
    address: '1 Corporate Plaza, Business City, USA',
    createdAt: new Date('2023-01-05')
  },
  {
    id: '2',
    name: 'Global Industries',
    email: 'purchasing@globalind.com',
    phone: '+1-555-333-4444',
    address: '200 Industrial Park, Commerce Town, USA',
    createdAt: new Date('2023-02-10')
  },
  {
    id: '3',
    name: 'Tech Innovations',
    email: 'procurement@techinnovate.com',
    phone: '+1-555-555-6666',
    address: '300 Innovation Way, Tech Valley, USA',
    createdAt: new Date('2023-03-15')
  }
];

export const companies: Company[] = [
  {
    id: '1',
    name: 'Superior Solutions Inc',
    email: 'info@superiorsolutions.com',
    phone: '+1-555-777-8888',
    address: '100 Corporate Drive, Enterprise City, USA',
    website: 'www.superiorsolutions.com',
    createdAt: new Date('2023-01-10')
  },
  {
    id: '2',
    name: 'Elite Manufacturing Group',
    email: 'contact@elitemanufacturing.com',
    phone: '+1-555-999-0000',
    address: '250 Factory Lane, Production Town, USA',
    website: 'www.elitemanufacturing.com',
    createdAt: new Date('2023-02-15')
  },
  {
    id: '3',
    name: 'Strategic Services LLC',
    email: 'info@strategicservices.com',
    phone: '+1-555-222-3333',
    address: '500 Service Road, Consultancy Heights, USA',
    website: 'www.strategicservices.com',
    createdAt: new Date('2023-03-20')
  }
];

// Define mock units
const mockUnits: Unit[] = [
  {
    id: '1',
    name: 'Piece',
    abbreviation: 'pcs',
    createdAt: new Date('2023-01-10')
  },
  {
    id: '2',
    name: 'Kilogram',
    abbreviation: 'kg',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '3',
    name: 'Set',
    abbreviation: 'set',
    createdAt: new Date('2023-01-20')
  },
  {
    id: '4',
    name: 'Ton',
    abbreviation: 'ton',
    createdAt: new Date('2023-02-05')
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Industrial Generator',
    description: 'High-capacity industrial power generator',
    price: 15000.00,
    currency: 'USD',
    unitId: '1', // piece
    createdAt: new Date('2023-01-20')
  },
  {
    id: '2',
    name: 'Server Rack',
    description: '42U standard server rack with cooling',
    price: 3500.00,
    currency: 'USD',
    unitId: '1', // piece
    createdAt: new Date('2023-02-05')
  },
  {
    id: '3',
    name: 'Office Workstation',
    description: 'Complete office workstation with ergonomic features',
    price: 1200.00,
    currency: 'USD',
    unitId: '3', // set
    createdAt: new Date('2023-03-01')
  },
  {
    id: '4',
    name: 'Construction Materials',
    description: 'Bulk construction materials (steel, concrete, etc.)',
    price: 450.00,
    currency: 'USD',
    unitId: '4', // ton
    createdAt: new Date('2023-03-25')
  }
];

export const projects: Project[] = [
  {
    id: '1',
    name: 'Office Building Renovation',
    description: 'Complete renovation of the headquarters building',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2023-08-30'),
    status: 'active',
    createdAt: new Date('2023-02-15')
  },
  {
    id: '2',
    name: 'IT Infrastructure Upgrade',
    description: 'Company-wide upgrade of servers and network equipment',
    startDate: new Date('2023-04-15'),
    endDate: new Date('2023-07-15'),
    status: 'active',
    createdAt: new Date('2023-03-10')
  },
  {
    id: '3',
    name: 'Employee Training Program',
    description: 'Professional development program for all staff',
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-11-30'),
    status: 'active',
    createdAt: new Date('2023-04-05')
  }
];

// Add unit info to contract products
export const contractProducts: ContractProduct[] = [
  {
    id: '1',
    contractId: '1',
    productId: '1',
    quantity: 2,
    deliveredQuantity: 1,
    price: 15000.00,
    product: products[0]
  },
  {
    id: '2',
    contractId: '1',
    productId: '2',
    quantity: 10,
    deliveredQuantity: 5,
    price: 3500.00,
    product: products[1]
  },
  {
    id: '3',
    contractId: '2',
    productId: '3',
    quantity: 50,
    deliveredQuantity: 20,
    price: 1200.00,
    product: products[2]
  }
];

// Mock payment data
export const contractPayments: Payment[] = [
  {
    id: '1',
    contractId: '1', // IT Infrastructure Upgrade, product contract
    amount: 20000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-04-25'),
    note: 'Initial payment',
    type: 'payment',
    createdAt: new Date('2023-04-25')
  },
  {
    id: '2',
    contractId: '1', // IT Infrastructure Upgrade, product contract
    amount: 10000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-05-15'),
    note: 'Second installment',
    type: 'payment',
    createdAt: new Date('2023-05-15')
  },
  {
    id: '3',
    contractId: '2', // Office Building Renovation, product contract
    amount: 20000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-03-10'),
    note: 'Initial payment',
    type: 'payment',
    createdAt: new Date('2023-03-10')
  },
  {
    id: '4',
    contractId: '1', // IT Infrastructure Upgrade, product contract
    amount: 5000.00,
    currency: 'EUR',
    exchangeRate: 1.1,
    giveDate: new Date('2023-06-05'),
    note: 'Additional payment in EUR',
    type: 'payment',
    createdAt: new Date('2023-06-05')
  },
  {
    id: '5',
    contractId: '3', // Employee Training Program, service contract
    amount: 15000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-05-12'),
    note: 'Initial payment for training services',
    type: 'payment',
    createdAt: new Date('2023-05-12')
  },
  // New payment for consulting services contract
  {
    id: '6',
    contractId: '4', // Management Consulting contract
    amount: 10000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-06-01'),
    note: 'Initial consulting retainer',
    type: 'payment',
    createdAt: new Date('2023-06-01')
  },
  // New payment for maintenance contract 
  {
    id: '7',
    contractId: '5', // IT Systems Maintenance contract
    amount: 5000.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-07-05'),
    note: 'First quarterly maintenance payment',
    type: 'payment',
    createdAt: new Date('2023-07-05')
  },
  // New payment for legal services
  {
    id: '8',
    contractId: '6', // Legal Services contract
    amount: 7500.00,
    currency: 'USD',
    exchangeRate: 1.0,
    giveDate: new Date('2023-06-10'),
    note: 'Retainer for legal services',
    type: 'payment',
    createdAt: new Date('2023-06-10')
  }
];

export const productContracts: ProductContract[] = [
  {
    id: '1',
    projectId: '2',
    applicantId: '1',
    purchaserId: '1',
    companyId: '2',
    totalAmount: 65000.00,
    currency: 'USD',
    secondCurrency: 'EUR',
    exchangeRate: 1.0,
    paidAmount: 30000.00,
    signingDate: new Date('2023-04-20'),
    expirationDate: new Date('2023-07-10'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/IT-001.pdf',
    type: 'product',
    contractProducts: [contractProducts[0], contractProducts[1]],
    createdAt: new Date('2023-04-20'),
    // New fields
    realFinishedDate: null,
    overdueDays: 0,
    status: 'active',
    payments: contractPayments.filter(p => p.contractId === '1')
  },
  {
    id: '2',
    projectId: '1',
    applicantId: '2',
    purchaserId: '3',
    companyId: '1',
    totalAmount: 60000.00,
    currency: 'USD',
    secondCurrency: 'GBP',
    exchangeRate: 1.0,
    paidAmount: 20000.00,
    signingDate: new Date('2023-03-05'),
    expirationDate: new Date('2023-08-15'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/REV-001.pdf',
    type: 'product',
    contractProducts: [contractProducts[2]],
    createdAt: new Date('2023-03-05'),
    // New fields
    realFinishedDate: new Date('2023-07-30'),
    overdueDays: 0,
    status: 'completed',
    payments: contractPayments.filter(p => p.contractId === '2')
  }
];

export const serviceContracts: ServiceContract[] = [
  {
    id: '1',
    projectId: '3',
    applicantId: '3',
    purchaserId: '2',
    companyId: '3',
    totalAmount: 45000.00,
    currency: 'USD',
    secondCurrency: 'RUB',
    exchangeRate: 1.0,
    paidAmount: 15000.00,
    signingDate: new Date('2023-05-10'),
    expirationDate: new Date('2023-11-15'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/TRAIN-001.pdf',
    type: 'service',
    description: 'Professional training services for all departments',
    createdAt: new Date('2023-05-10'),
    // New fields
    realFinishedDate: null,
    overdueDays: 15,
    status: 'overdue',
    payments: contractPayments.filter(p => p.contractId === '3')
  },
  // New consulting service contract
  {
    id: '4',
    projectId: '1', // Office Building Renovation project
    applicantId: '1',
    purchaserId: '3',
    companyId: '3',
    totalAmount: 25000.00,
    currency: 'USD',
    secondCurrency: 'EUR',
    exchangeRate: 1.05,
    paidAmount: 10000.00,
    signingDate: new Date('2023-06-01'),
    expirationDate: new Date('2023-09-30'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/CONSULT-001.pdf',
    type: 'service',
    description: 'Management consulting services for the renovation project, including project management oversight, resource allocation planning, and risk assessment.',
    createdAt: new Date('2023-06-01'),
    realFinishedDate: null,
    overdueDays: 0,
    status: 'active',
    payments: contractPayments.filter(p => p.contractId === '4')
  },
  // New maintenance service contract
  {
    id: '5',
    projectId: '2', // IT Infrastructure Upgrade project
    applicantId: '2',
    purchaserId: '1',
    companyId: '1',
    totalAmount: 18000.00,
    currency: 'USD',
    secondCurrency: 'GBP',
    exchangeRate: 0.78,
    paidAmount: 5000.00,
    signingDate: new Date('2023-07-01'),
    expirationDate: new Date('2024-06-30'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/MAINT-001.pdf',
    type: 'service',
    description: 'Annual IT systems maintenance services including quarterly system checks, security updates, and 24/7 technical support for critical infrastructure.',
    createdAt: new Date('2023-07-01'),
    realFinishedDate: null,
    overdueDays: 0,
    status: 'active',
    payments: contractPayments.filter(p => p.contractId === '5')
  },
  // New legal services contract
  {
    id: '6',
    projectId: '1', // Office Building Renovation project
    applicantId: '1',
    purchaserId: '2',
    companyId: '2',
    totalAmount: 15000.00,
    currency: 'USD',
    secondCurrency: 'EUR',
    exchangeRate: 1.05,
    paidAmount: 7500.00,
    signingDate: new Date('2023-06-10'),
    expirationDate: new Date('2023-12-31'),
    documentUrl: null,
    documentLink: 'https://company-drive.example.com/contracts/LEGAL-001.pdf',
    type: 'service',
    description: 'Legal services for the renovation project including contract review, regulatory compliance assessment, and dispute resolution assistance.',
    createdAt: new Date('2023-06-10'),
    realFinishedDate: null,
    overdueDays: 0,
    status: 'active',
    payments: contractPayments.filter(p => p.contractId === '6')
  }
];

// Export units for use in other components
export const units = mockUnits;
