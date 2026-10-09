export function forOwner<T extends { ownerId: string }>(
  record: T | null,
  currentUserId: string | null | undefined,
): T | null {
  return currentUserId && record?.ownerId === currentUserId ? record : null;
}

export function localReportForViewer<T>(report: T | null, isSignedIn: boolean): T | null {
  return isSignedIn ? null : report;
}
