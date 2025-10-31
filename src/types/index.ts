/**
 * Project status type
 * UC-201: Projects can be in various states
 */
export type ProjectStatus = 'active' | 'onHold' | 'completed' | 'archived';

/**
 * Project interface
 * UC-201: Hierarchical organization of COINs
 */
export interface Project {
  // ===== IDENTITY =====
  id: string;                          // UUID v4
  name: string;                        // Project name, max 100 chars
  description?: string;                // Optional description, max 500 chars

  // ===== ORGANIZATIONAL METADATA =====
  clientOrDepartment?: string;         // e.g., "HR", "Operations", max 100 chars
  status: ProjectStatus;               // active | onHold | completed | archived
  colorTag: string;                    // Hex color for visual identification
  tags?: string[];                     // Optional tags for filtering

  // ===== DATES =====
  createdDate: string;                 // ISO 8601 timestamp
  lastModifiedDate: string;            // ISO 8601 timestamp
  startDate?: string;                  // Optional project start date
  endDate?: string;                    // Optional project end date

  // ===== RELATIONSHIPS =====
  coinCount: number;                   // Computed: number of COINs in this project

  // ===== USER METADATA =====
  owner: string;                       // User ID (Phase 1: single user, always same)

  // Phase 2+ fields (nullable in Phase 1)
  budget?: number;
  customFields?: Record<string, any>;
}

/**
 * Process state type
 * UC-201: Distinguishes current state vs future state business processes
 */
export type ProcessState = 'current' | 'future';

/**
 * Core COIN data model
 * Represents a single Circle of Interaction diagram
 */
export interface COIN {
  id: string;                    // UUID
  name: string;                  // Display name
  description?: string;          // Optional description
  projectIds: string[];          // Array of Project IDs (multi-project support, Phase 1: max 1)
                                 // Empty array = root-level COIN (no project)
  projectName?: string;          // Denormalized for display (first project name)
                                 // Optional: may be undefined for root-level COINs
  status: 'draft' | 'review' | 'approved' | 'archived';
  processState: ProcessState;    // UC-201: 'current' or 'future' - for process evolution tracking
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  lastAccessedAt?: string;      // ISO 8601 - when user last opened it
  thumbnailUrl?: string;        // Optional: path to thumbnail image
  isFavorite?: boolean;         // UC-202: true when user favorites this COIN

  // Canvas data (minimal for Phase 1)
  circles: Circle[];
  participants: Participant[];
  interactions: Interaction[];
}

export interface Circle {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
}

export interface Participant {
  id: string;
  name: string;
  role?: string;
  x: number;
  y: number;
}

export interface Interaction {
  id: string;
  number: number;              // The numbered arrow
  fromParticipantId: string;
  toParticipantId: string;
  description: string;
  products?: string[];         // Deliverables produced
}

/**
 * Tracks when user accessed each COIN
 * Stored separately in AsyncStorage
 */
export interface AccessHistoryEntry {
  coinId: string;              // Foreign key to COIN.id
  accessedAt: string;          // ISO 8601 timestamp
  thumbnailUrl?: string;       // Cached thumbnail path
}

export interface AccessHistory {
  userId: string;              // "local_user" for Phase 1
  entries: AccessHistoryEntry[];
  maxEntries: number;          // Default: 50
  lastUpdated: string;         // ISO 8601
}

/**
 * Props for COINCard component
 */
export interface COINCardProps {
  coin: COIN;
  onPress: (coinId: string) => void;
  onRemove: (coinId: string) => void;
  onToggleFavorite?: (coinId: string) => void;  // UC-202: Optional handler for favorite toggle
  onDuplicate?: (coinId: string) => void;       // UC-201: Optional handler for duplicate action
  onShare?: (coinId: string) => void;           // UC-201: Optional handler for share action
}

/**
 * Props for EmptyRecentsState component
 */
export interface EmptyRecentsStateProps {
  hasAnyCOINs: boolean;        // Determines which message variant
  onCreateCOIN: () => void;
  onBrowseProjects: () => void;
}
