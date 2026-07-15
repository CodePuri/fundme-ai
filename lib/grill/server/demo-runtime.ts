import type { OptimizationEntitlementProvider } from "../contracts";
import { DeterministicGrillEngine } from "../engine";
import { LocalKnowledgeRetriever } from "../retrieval";
import type { DemoIdentity } from "../types";
import { grillKnowledgeCorpus } from "./corpus";
import { DemoArtifactProcessor } from "./pdf";

class DemoLockedEntitlementProvider implements OptimizationEntitlementProvider {
  async getEntitlement(_identity: DemoIdentity) {
    return {
      status: "locked" as const,
      label: "Coming in Early Access" as const,
    };
  }
}

export function createDemoServerProviders() {
  return {
    artifactProcessor: new DemoArtifactProcessor(),
    grillEngine: new DeterministicGrillEngine(),
    knowledgeRetriever: new LocalKnowledgeRetriever(grillKnowledgeCorpus),
    optimizationEntitlementProvider: new DemoLockedEntitlementProvider(),
  };
}
