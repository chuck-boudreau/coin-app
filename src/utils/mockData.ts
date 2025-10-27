import { COIN, AccessHistoryEntry } from '../types';

/**
 * Mock COIN data for UC-200 testing
 * These represent realistic business process diagrams
 */
export const MOCK_COINS: COIN[] = [
  {
    id: 'coin-001',
    name: 'Employee Onboarding',
    description: 'New hire onboarding process for all departments',
    projectId: 'proj-001',
    projectName: 'HR Transformation',
    status: 'approved',
    createdAt: '2025-09-15T10:30:00.000Z',
    updatedAt: '2025-10-20T14:22:00.000Z',
    lastAccessedAt: '2025-10-24T09:15:00.000Z',
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
    projectId: 'proj-002',
    projectName: 'Finance Process Redesign',
    status: 'review',
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2025-10-23T16:45:00.000Z',
    lastAccessedAt: '2025-10-23T16:45:00.000Z',
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
    name: 'Customer Support Escalation',
    description: 'How support tickets get escalated to engineering',
    projectId: 'proj-003',
    projectName: 'Support Process Improvement',
    status: 'draft',
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
    name: 'Quarterly Planning',
    description: 'Process for setting quarterly OKRs',
    projectId: 'proj-004',
    projectName: 'Leadership Workshop 2025',
    status: 'draft',
    createdAt: '2025-10-10T09:00:00.000Z',
    updatedAt: '2025-10-21T15:20:00.000Z',
    lastAccessedAt: '2025-10-21T15:20:00.000Z',
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
    projectId: 'proj-003',
    projectName: 'Support Process Improvement',
    status: 'approved',
    createdAt: '2025-09-20T13:45:00.000Z',
    updatedAt: '2025-10-19T11:00:00.000Z',
    lastAccessedAt: '2025-10-19T11:00:00.000Z',
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
    name: 'Product Launch Checklist',
    description: 'Coordinating go-to-market activities',
    projectId: 'proj-005',
    projectName: 'Product Launch Process',
    status: 'review',
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
    projectId: 'proj-002',
    projectName: 'Finance Process Redesign',
    status: 'draft',
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
    name: 'Performance Review Process',
    description: 'Annual performance review workflow',
    projectId: 'proj-001',
    projectName: 'HR Transformation',
    status: 'approved',
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
  }
];

/**
 * Mock access history - determines order in Recents view
 * Sorted by accessedAt (newest first)
 */
export const MOCK_ACCESS_HISTORY: AccessHistoryEntry[] = [
  { coinId: 'coin-001', accessedAt: '2025-10-24T09:15:00.000Z' },
  { coinId: 'coin-002', accessedAt: '2025-10-23T16:45:00.000Z' },
  { coinId: 'coin-003', accessedAt: '2025-10-22T10:30:00.000Z' },
  { coinId: 'coin-004', accessedAt: '2025-10-21T15:20:00.000Z' },
  { coinId: 'coin-005', accessedAt: '2025-10-19T11:00:00.000Z' },
  { coinId: 'coin-006', accessedAt: '2025-10-18T09:30:00.000Z' },
  { coinId: 'coin-007', accessedAt: '2025-10-15T14:20:00.000Z' },
  { coinId: 'coin-008', accessedAt: '2025-10-14T16:00:00.000Z' }
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
