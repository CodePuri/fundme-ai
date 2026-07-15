export function isGrillPublicPath(pathname: string) {
  return (
    pathname === "/grill" ||
    pathname.startsWith("/grill/") ||
    pathname === "/api/grill" ||
    pathname.startsWith("/api/grill/")
  );
}

export function isClerkIndependentPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/search" ||
    pathname.startsWith("/search/") ||
    pathname === "/explore" ||
    pathname.startsWith("/explore/") ||
    isGrillPublicPath(pathname)
  );
}
