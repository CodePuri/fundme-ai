import type { IdentityProvider } from "../contracts";
import type { DemoAssessmentRepository } from "./repository";

export class AnonymousDemoIdentityProvider implements IdentityProvider {
  constructor(private readonly repository: DemoAssessmentRepository) {}

  async getIdentity() {
    const state = this.repository.load();
    if (!state) {
      throw new Error("Create a local demo session before starting analysis.");
    }
    return {
      kind: "anonymous_demo_session" as const,
      sessionId: state.sessionId,
    };
  }
}
