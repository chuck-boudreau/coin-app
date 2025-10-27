/**
 * Color mapping for COIN status badges
 */
export const STATUS_COLORS = {
  draft: {
    background: '#007AFF',  // iOS Blue
    text: '#FFFFFF'
  },
  review: {
    background: '#FF9500',  // iOS Orange
    text: '#FFFFFF'
  },
  approved: {
    background: '#34C759',  // iOS Green
    text: '#FFFFFF'
  },
  archived: {
    background: '#8E8E93',  // iOS Gray
    text: '#FFFFFF'
  }
} as const;

export function getStatusColor(status: 'draft' | 'review' | 'approved' | 'archived') {
  return STATUS_COLORS[status];
}
