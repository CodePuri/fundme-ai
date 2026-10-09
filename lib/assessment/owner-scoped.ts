export function forOwner<T extends { ownerId: string }>(
  record: T | null,
  currentUserId: string | null | undefined,
): T | null {
  return currentUserId && record?.ownerId === currentUserId ? record : null;
}

export function localReportForViewer<T>(
  report: T | null,
  isSignedIn: boolean,
  reportOwnerId?: string | null,
): T | null {
  return isSignedIn || reportOwnerId ? null : report;
}

export function reportForViewer<T>(
  report: T | null,
  reportOwnerId: string | null | undefined,
  currentUserId: string | null | undefined,
): T | null {
  return (reportOwnerId || null) === (currentUserId || null) ? report : null;
}
