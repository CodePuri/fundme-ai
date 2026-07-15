interface ClearableDemoRepository {
  clear(): void;
}

interface ReplaceableLocation {
  replace(url: string): void;
}

export function restartGrillDemo(
  repository: ClearableDemoRepository,
  location: ReplaceableLocation,
) {
  repository.clear();
  location.replace("/grill");
}
