import { COIN, Project, AccessHistoryEntry } from '../types';

/**
 * Mock COIN data for UC-200 testing
 * These represent realistic business process diagrams
 */
export const MOCK_COINS: COIN[] = [
  {
    id: 'coin-001',
    name: 'Employee Onboarding',
    description: 'New hire onboarding process for all departments',
    projectIds: ['proj-001'],
    projectName: 'Employee Onboarding Redesign',
    status: 'approved',
    processState: 'current',
    createdAt: '2025-09-15T10:30:00.000Z',
    updatedAt: '2025-10-20T14:22:00.000Z',
    lastAccessedAt: '2025-10-24T09:15:00.000Z',
    isFavorite: true,
    circles: [
      { id: 'c1', name: 'Onboarding', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'HR Manager', role: 'Manager', x: 300, y: 250 },
      { id: 'p2', name: 'New Hire', role: 'Employee', x: 500, y: 250 },
      { id: 'p3', name: 'IT Support', role: 'Support', x: 400, y: 550 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Send welcome email',
        products: ['Welcome package', 'First day schedule']
      },
      {
        id: 'i2',
        number: 2,
        fromParticipantId: 'p2',
        toParticipantId: 'p3',
        description: 'Request equipment',
        products: ['Equipment list']
      }
    ]
  },
  {
    id: 'coin-002',
    name: 'Purchase Order Approval',
    description: 'Standard approval workflow for purchase orders under $10K',
    projectIds: ['proj-002'],
    projectName: 'Supply Chain Optimization',
    status: 'review',
    processState: 'future',
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2025-10-23T16:45:00.000Z',
    lastAccessedAt: '2025-10-23T16:45:00.000Z',
    isFavorite: true,
    circles: [
      { id: 'c1', name: 'Approval Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Requestor', role: 'Employee', x: 300, y: 250 },
      { id: 'p2', name: 'Manager', role: 'Manager', x: 500, y: 250 },
      { id: 'p3', name: 'Finance', role: 'Approver', x: 400, y: 550 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Submit PO request',
        products: ['Purchase order form']
      }
    ]
  },
  {
    id: 'coin-003',
    name: 'Supercalifragilisticexpialidocious Customer Support Escalation Process',
    description: 'How support tickets get escalated to engineering',
    projectIds: ['proj-003'],
    projectName: 'Customer Support Portal',
    status: 'draft',
    processState: 'current',
    createdAt: '2025-10-18T11:20:00.000Z',
    updatedAt: '2025-10-22T10:30:00.000Z',
    lastAccessedAt: '2025-10-22T10:30:00.000Z',
    circles: [
      { id: 'c1', name: 'Escalation', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Support Agent', role: 'Tier 1', x: 300, y: 250 },
      { id: 'p2', name: 'Engineering', role: 'Technical', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-004',
    name: 'Quarterly Planning for Cross-Functional Enterprise-Wide Strategic Initiatives and Objectives',
    description: 'Process for setting quarterly OKRs',
    projectIds: [],
    projectName: undefined,
    status: 'draft',
    processState: 'current',
    createdAt: '2023-06-15T09:00:00.000Z',
    updatedAt: '2023-09-22T15:20:00.000Z',
    lastAccessedAt: '2023-09-22T15:20:00.000Z',
    circles: [
      { id: 'c1', name: 'Planning Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Leadership Team', role: 'Executives', x: 400, y: 300 }
    ],
    interactions: []
  },
  {
    id: 'coin-005',
    name: 'Security Incident Response',
    description: 'Steps for responding to security incidents',
    projectIds: ['proj-004'],
    projectName: 'IT Security Audit Process',
    status: 'approved',
    processState: 'current',
    createdAt: '2024-03-10T13:45:00.000Z',
    updatedAt: '2024-08-15T11:00:00.000Z',
    lastAccessedAt: '2024-08-15T11:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Incident Response', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Security Team', role: 'Responder', x: 300, y: 250 },
      { id: 'p2', name: 'IT Operations', role: 'Support', x: 500, y: 250 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Alert of incident',
        products: ['Incident report']
      }
    ]
  },
  {
    id: 'coin-006',
    name: 'Comprehensive Multi-Department Product Launch Coordination and Go-To-Market Strategy Checklist',
    description: 'Coordinating go-to-market activities',
    projectIds: ['proj-005'],
    projectName: 'Sales Pipeline Automation',
    status: 'review',
    processState: 'current',
    createdAt: '2025-10-05T14:00:00.000Z',
    updatedAt: '2025-10-18T09:30:00.000Z',
    lastAccessedAt: '2025-10-18T09:30:00.000Z',
    circles: [
      { id: 'c1', name: 'Launch Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Product Manager', role: 'Owner', x: 300, y: 250 },
      { id: 'p2', name: 'Marketing', role: 'Promoter', x: 500, y: 250 },
      { id: 'p3', name: 'Sales', role: 'Seller', x: 400, y: 550 }
    ],
    interactions: []
  },
  {
    id: 'coin-007',
    name: 'Invoice Processing',
    description: 'AP workflow for vendor invoices',
    projectIds: ['proj-002'],
    projectName: 'Supply Chain Optimization',
    status: 'draft',
    processState: 'current',
    createdAt: '2025-10-12T10:15:00.000Z',
    updatedAt: '2025-10-15T14:20:00.000Z',
    lastAccessedAt: '2025-10-15T14:20:00.000Z',
    circles: [
      { id: 'c1', name: 'AP Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Vendor', role: 'Supplier', x: 300, y: 250 },
      { id: 'p2', name: 'AP Clerk', role: 'Processor', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-008',
    name: 'Annual 360-Degree Multi-Stakeholder Performance Review and Professional Development Planning Process',
    description: 'Annual performance review workflow',
    projectIds: ['proj-001'],
    projectName: 'Employee Onboarding Redesign',
    status: 'approved',
    processState: 'current',
    createdAt: '2025-09-01T08:30:00.000Z',
    updatedAt: '2025-10-14T16:00:00.000Z',
    lastAccessedAt: '2025-10-14T16:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Review Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Manager', role: 'Reviewer', x: 300, y: 250 },
      { id: 'p2', name: 'Employee', role: 'Reviewee', x: 500, y: 250 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Schedule review meeting',
        products: ['Meeting invite']
      }
    ]
  },
  // Additional COINs to reach 18 total (UC-201)
  {
    id: 'coin-009',
    name: 'Employee Benefits Enrollment',
    description: 'Annual benefits enrollment process for HR',
    projectIds: ['proj-001'],
    projectName: 'Employee Onboarding Redesign',
    status: 'review',
    processState: 'current',
    createdAt: '2025-09-25T11:00:00.000Z',
    updatedAt: '2025-10-12T10:00:00.000Z',
    lastAccessedAt: '2025-10-12T10:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Benefits Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'HR Benefits', role: 'Administrator', x: 300, y: 250 },
      { id: 'p2', name: 'Employee', role: 'Enrollee', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-010',
    name: 'Vendor Onboarding',
    description: 'Process for onboarding new suppliers',
    projectIds: ['proj-002'],
    projectName: 'Supply Chain Optimization',
    status: 'draft',
    processState: 'current',
    createdAt: '2025-10-08T09:00:00.000Z',
    updatedAt: '2025-10-11T14:00:00.000Z',
    lastAccessedAt: '2025-10-11T14:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Vendor Setup', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Procurement', role: 'Buyer', x: 300, y: 250 },
      { id: 'p2', name: 'Vendor', role: 'Supplier', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-011',
    name: 'Inventory Management',
    description: 'Stock replenishment and tracking',
    projectIds: ['proj-002'],
    projectName: 'Supply Chain Optimization',
    status: 'approved',
    processState: 'current',
    createdAt: '2025-09-10T08:30:00.000Z',
    updatedAt: '2025-10-10T15:00:00.000Z',
    lastAccessedAt: '2025-10-10T15:00:00.000Z',
    isFavorite: true,
    circles: [
      { id: 'c1', name: 'Inventory Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Warehouse', role: 'Manager', x: 300, y: 250 },
      { id: 'p2', name: 'Purchasing', role: 'Buyer', x: 500, y: 250 }
    ],
    interactions: [
      {
        id: 'i1',
        number: 1,
        fromParticipantId: 'p1',
        toParticipantId: 'p2',
        description: 'Request reorder',
        products: ['Reorder request']
      }
    ]
  },
  {
    id: 'coin-012',
    name: 'Customer Refund Process',
    description: 'Handling customer refund requests',
    projectIds: ['proj-003'],
    projectName: 'Customer Support Portal',
    status: 'review',
    processState: 'current',
    createdAt: '2025-10-15T10:00:00.000Z',
    updatedAt: '2025-10-20T11:30:00.000Z',
    lastAccessedAt: '2025-10-20T11:30:00.000Z',
    circles: [
      { id: 'c1', name: 'Refund Process', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Support Agent', role: 'Agent', x: 300, y: 250 },
      { id: 'p2', name: 'Finance', role: 'Approver', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-013',
    name: 'Data Backup and Recovery',
    description: 'IT backup procedures and disaster recovery',
    projectIds: ['proj-004'],
    projectName: 'IT Security Audit Process',
    status: 'approved',
    processState: 'current',
    createdAt: '2025-09-05T09:00:00.000Z',
    updatedAt: '2025-10-08T12:00:00.000Z',
    lastAccessedAt: '2025-10-08T12:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Backup Cycle', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'IT Operations', role: 'Administrator', x: 300, y: 250 },
      { id: 'p2', name: 'Security Team', role: 'Auditor', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-014',
    name: 'Lead Qualification',
    description: 'Sales process for qualifying inbound leads',
    projectIds: ['proj-005'],
    projectName: 'Sales Pipeline Automation',
    status: 'draft',
    processState: 'current',
    createdAt: '2025-10-20T13:00:00.000Z',
    updatedAt: '2025-10-25T09:00:00.000Z',
    lastAccessedAt: '2025-10-25T09:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Qualification', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'SDR', role: 'Qualifier', x: 300, y: 250 },
      { id: 'p2', name: 'AE', role: 'Closer', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-015',
    name: 'Contract Negotiation',
    description: 'Sales contract review and approval',
    projectIds: ['proj-005'],
    projectName: 'Sales Pipeline Automation',
    status: 'review',
    processState: 'current',
    createdAt: '2025-10-18T14:30:00.000Z',
    updatedAt: '2025-10-27T10:00:00.000Z',
    lastAccessedAt: '2025-10-27T10:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Negotiation', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Sales Rep', role: 'Seller', x: 300, y: 250 },
      { id: 'p2', name: 'Legal', role: 'Reviewer', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-016',
    name: 'Customer Onboarding for Enterprise Sales',
    description: 'Post-sale onboarding for new enterprise customers',
    projectIds: ['proj-005'],
    projectName: 'Sales Pipeline Automation',
    status: 'approved',
    processState: 'current',
    createdAt: '2025-09-28T11:00:00.000Z',
    updatedAt: '2025-10-26T14:00:00.000Z',
    lastAccessedAt: '2025-10-26T14:00:00.000Z',
    isFavorite: true,
    circles: [
      { id: 'c1', name: 'Customer Onboarding', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Success Manager', role: 'Owner', x: 300, y: 250 },
      { id: 'p2', name: 'Customer', role: 'Client', x: 500, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-017',
    name: 'Office Space Planning',
    description: 'Facility planning and space allocation',
    projectIds: [],
    projectName: undefined,
    status: 'draft',
    processState: 'current',
    createdAt: '2025-10-22T15:00:00.000Z',
    updatedAt: '2025-10-28T10:00:00.000Z',
    lastAccessedAt: '2025-10-28T10:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Space Planning', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Facilities', role: 'Manager', x: 300, y: 250 }
    ],
    interactions: []
  },
  {
    id: 'coin-018',
    name: 'Corporate Training Program',
    description: 'Company-wide training and development',
    projectIds: [],
    projectName: undefined,
    status: 'review',
    processState: 'current',
    createdAt: '2025-10-16T09:30:00.000Z',
    updatedAt: '2025-10-29T11:00:00.000Z',
    lastAccessedAt: '2025-10-29T11:00:00.000Z',
    circles: [
      { id: 'c1', name: 'Training', x: 400, y: 400, radius: 250 }
    ],
    participants: [
      { id: 'p1', name: 'Learning & Development', role: 'Trainer', x: 300, y: 250 },
      { id: 'p2', name: 'Employees', role: 'Trainees', x: 500, y: 250 }
    ],
    interactions: []
  }
];

/**
 * Mock Project data for UC-201 testing
 * Represents realistic BA project organization
 */
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Employee Onboarding Redesign',
    description: 'Streamline the employee onboarding process for HR department',
    clientOrDepartment: 'Human Resources',
    status: 'active',
    colorTag: '#007AFF',  // Blue
    tags: ['HR', 'Process Improvement'],
    createdDate: '2024-09-15T10:00:00.000Z',
    lastModifiedDate: '2025-10-25T14:30:00.000Z',
    startDate: '2024-09-15',
    endDate: '2025-03-31',
    coinCount: 3,
    owner: 'user-001',
  },
  {
    id: 'proj-002',
    name: 'Supply Chain Optimization',
    description: 'Improve supply chain efficiency and reduce costs',
    clientOrDepartment: 'Operations',
    status: 'active',
    colorTag: '#34C759',  // Green
    tags: ['Operations', 'Cost Reduction'],
    createdDate: '2024-08-01T09:00:00.000Z',
    lastModifiedDate: '2025-10-28T16:00:00.000Z',
    startDate: '2024-08-01',
    endDate: '2025-06-30',
    coinCount: 4,
    owner: 'user-001',
  },
  {
    id: 'proj-003',
    name: 'Customer Support Portal',
    description: 'Design new self-service customer support portal',
    clientOrDepartment: 'Customer Service',
    status: 'onHold',
    colorTag: '#FF9500',  // Orange
    tags: ['Customer Service', 'Digital Transformation'],
    createdDate: '2024-07-10T11:00:00.000Z',
    lastModifiedDate: '2025-09-15T10:00:00.000Z',
    startDate: '2024-07-10',
    coinCount: 2,
    owner: 'user-001',
  },
  {
    id: 'proj-004',
    name: 'IT Security Audit Process',
    description: 'Define security audit workflow and compliance checks',
    clientOrDepartment: 'IT Security',
    status: 'completed',
    colorTag: '#FF3B30',  // Red
    tags: ['Security', 'Compliance'],
    createdDate: '2024-06-01T08:00:00.000Z',
    lastModifiedDate: '2025-08-30T17:00:00.000Z',
    startDate: '2024-06-01',
    endDate: '2024-12-15',
    coinCount: 2,
    owner: 'user-001',
  },
  {
    id: 'proj-005',
    name: 'Sales Pipeline Automation',
    description: 'Automate lead qualification and follow-up processes',
    clientOrDepartment: 'Sales',
    status: 'active',
    colorTag: '#5856D6',  // Purple
    tags: ['Sales', 'Automation'],
    createdDate: '2024-10-01T09:30:00.000Z',
    lastModifiedDate: '2025-10-29T11:00:00.000Z',
    startDate: '2024-10-01',
    endDate: '2025-04-30',
    coinCount: 4,
    owner: 'user-001',
  },
];

/**
 * Mock access history - determines order in Recents view
 * Sorted by accessedAt (newest first)
 */
export const MOCK_ACCESS_HISTORY: AccessHistoryEntry[] = [
  { coinId: 'coin-018', accessedAt: '2025-10-29T11:00:00.000Z' },
  { coinId: 'coin-017', accessedAt: '2025-10-28T10:00:00.000Z' },
  { coinId: 'coin-015', accessedAt: '2025-10-27T10:00:00.000Z' },
  { coinId: 'coin-016', accessedAt: '2025-10-26T14:00:00.000Z' },
  { coinId: 'coin-014', accessedAt: '2025-10-25T09:00:00.000Z' },
  { coinId: 'coin-001', accessedAt: '2025-10-24T09:15:00.000Z' },
  { coinId: 'coin-002', accessedAt: '2025-10-23T16:45:00.000Z' },
  { coinId: 'coin-003', accessedAt: '2025-10-22T10:30:00.000Z' },
  { coinId: 'coin-004', accessedAt: '2025-10-21T15:20:00.000Z' },
  { coinId: 'coin-012', accessedAt: '2025-10-20T11:30:00.000Z' },
  { coinId: 'coin-005', accessedAt: '2025-10-19T11:00:00.000Z' },
  { coinId: 'coin-006', accessedAt: '2025-10-18T09:30:00.000Z' },
  { coinId: 'coin-009', accessedAt: '2025-10-12T10:00:00.000Z' },
  { coinId: 'coin-010', accessedAt: '2025-10-11T14:00:00.000Z' },
  { coinId: 'coin-011', accessedAt: '2025-10-10T15:00:00.000Z' },
  { coinId: 'coin-007', accessedAt: '2025-10-15T14:20:00.000Z' },
  { coinId: 'coin-008', accessedAt: '2025-10-14T16:00:00.000Z' },
  { coinId: 'coin-013', accessedAt: '2025-10-08T12:00:00.000Z' }
];

/**
 * Get COINs sorted by recent access
 * This is the core data for RecentsScreen
 */
export function getRecentCOINs(limit: number = 20): COIN[] {
  // Sort access history by timestamp (newest first)
  const sortedHistory = [...MOCK_ACCESS_HISTORY].sort(
    (a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
  );

  // Map to COINs and take limit
  return sortedHistory
    .slice(0, limit)
    .map(entry => MOCK_COINS.find(coin => coin.id === entry.coinId))
    .filter((coin): coin is COIN => coin !== undefined);
}
