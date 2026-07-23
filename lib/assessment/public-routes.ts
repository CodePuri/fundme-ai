export function isClerkIndependentPublicPath(pathname: string): boolean {
  return pathname === "/"
    || pathname === "/assessment"
    || pathname.startsWith("/assessment/");
}
