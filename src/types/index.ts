/**
 * Core COIN data model
 * Represents a single Circle of Interaction diagram
 */
export interface COIN {
  id: string;                    // UUID
  name: string;                  // Display name
  description?: string;          // Optional description
  projectId?: string;            // Optional: which project this belongs to
  projectName?: string;          // Denormalized for display
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  lastAccessedAt?: string;      // ISO 8601 - when user last opened it
  thumbnailUrl?: string;        // Optional: path to thumbnail image

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
  showCreatedDate?: boolean;  // If true, show createdAt instead of lastAccessedAt
}

/**
 * Props for EmptyRecentsState component
 */
export interface EmptyRecentsStateProps {
  hasAnyCOINs: boolean;        // Determines which message variant
  onCreateCOIN: () => void;
  onBrowseProjects: () => void;
}
