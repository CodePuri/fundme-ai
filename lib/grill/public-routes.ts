export function isGrillPublicPath(pathname: string) {
  return (
    pathname === "/grill" ||
    pathname.startsWith("/grill/") ||
    pathname === "/api/grill" ||
    pathname.startsWith("/api/grill/")
  );
}
