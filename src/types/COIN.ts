export interface COIN {
  id: string;              // UUID generated on creation
  name: string;            // User-entered name
  version: number;         // Always 1 for new COIN
  createdAt: string;       // ISO date string
  createdBy: string;       // User ID (device ID in Phase 1)
  lastModifiedBy: string;  // User ID (same as createdBy initially)
  lastModifiedAt: string;  // ISO date string
  // Phase 2 fields (include but don't use yet)
  syncStatus?: 'local' | 'synced' | 'conflict';
  serverVersion?: number;  // Not used in Phase 1
}

export interface COINListItem {
  id: string;
  name: string;
  createdAt: Date;         // Parsed for display
  lastModifiedAt: Date;    // Parsed for display
}
