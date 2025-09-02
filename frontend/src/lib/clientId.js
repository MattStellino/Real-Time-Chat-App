// Generate unique client-side IDs for message deduplication
export function makeClientId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}

// Generate unique local ID for attachments
export function makeLocalId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 12);
  return `local-${timestamp}-${random}`;
}
