import type {
  ArtifactKind,
  ArtifactResult,
  DemoIdentity,
  GrillDossier,
  GrillIntake,
  GrillReport,
  OptimizationEntitlement,
  PersistedGrillState,
  RetrievedGuidance,
} from "./types";

export interface IdentityProvider {
  getIdentity(): Promise<DemoIdentity>;
}

export interface AssessmentRepository {
  load(): PersistedGrillState | null;
  create(intake: GrillIntake): PersistedGrillState;
  save(state: PersistedGrillState): void;
  clear(): void;
}

export interface ArtifactProcessor {
  process(file: File, kind: ArtifactKind): Promise<ArtifactResult>;
}

export interface GrillEngine {
  analyze(dossier: GrillDossier, guidance: RetrievedGuidance[]): GrillReport;
}

export interface KnowledgeRetriever {
  retrieve(dossier: GrillDossier, limit?: number): RetrievedGuidance[];
}

export interface OptimizationEntitlementProvider {
  getEntitlement(identity: DemoIdentity): Promise<OptimizationEntitlement>;
}

export type LiveIdentityContract = {
  provider: "clerk";
  requirement: "verified Clerk user mapped to a server-owned founder record";
};

export type LiveAssessmentRepositoryContract = {
  provider: "supabase";
  requirement: "RLS-protected founder, startup, artifact, assessment, and report records";
};

export type LiveArtifactProcessorContract = {
  provider: "supabase_storage_and_jobs";
  requirement: "private uploads, durable extraction jobs, bounded parser output, and explicit failure states";
};

export type LiveGrillContract = {
  provider: "fundme_rubric_plus_structured_ai";
  requirement: "deterministic score with schema-validated, evidence-cited generation";
};

export type LiveKnowledgeContract = {
  provider: "pgvector";
  requirement: "versioned corpus, embeddings, retrieval metadata, and evaluation gates";
};

export type LiveEntitlementContract = {
  provider: "razorpay";
  requirement: "server-verified payment webhook and durable entitlement";
};
