import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database helpers
vi.mock("./db", () => ({
  getBriefsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      productName: "Test Product",
      productDescription: "A test product description",
      industry: "SaaS",
      stage: "MVP",
      icpData: JSON.stringify({ profile: "Test ICP", demographics: "B2B", painPoints: ["pain1"], motivations: ["goal1"] }),
      positioningStatement: "Test positioning",
      valuePropositions: JSON.stringify([{ title: "VP1", description: "Desc1" }]),
      channelMessaging: JSON.stringify({ emailSubject: "Test subject" }),
      competitiveDiff: JSON.stringify([{ differentiator: "Diff1", description: "Desc", vsAlternative: "vs manual" }]),
      shareToken: null,
      isShared: false,
      pdfUrl: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ]),
  getBriefById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    productName: "Test Product",
    productDescription: "A test product description",
    industry: "SaaS",
    stage: "MVP",
    icpData: null,
    positioningStatement: "Test positioning",
    valuePropositions: null,
    channelMessaging: null,
    competitiveDiff: null,
    shareToken: null,
    isShared: false,
    pdfUrl: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }),
  getBriefByShareToken: vi.fn().mockResolvedValue({
    id: 2,
    userId: 1,
    productName: "Shared Product",
    productDescription: "A shared product",
    industry: null,
    stage: null,
    icpData: null,
    positioningStatement: "Shared positioning",
    valuePropositions: null,
    channelMessaging: null,
    competitiveDiff: null,
    shareToken: "test-token-123",
    isShared: true,
    pdfUrl: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }),
  createBrief: vi.fn().mockResolvedValue(42),
  updateBrief: vi.fn().mockResolvedValue(undefined),
  deleteBriefById: vi.fn().mockResolvedValue(undefined),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          productName: "Test Product",
          icp: { profile: "Test ICP", demographics: "B2B SaaS", painPoints: ["pain1"], motivations: ["goal1"] },
          positioningStatement: "For PMMs, Test Product is the tool that...",
          valuePropositions: [
            { title: "Fast", description: "10x faster" },
            { title: "Smart", description: "AI-powered" },
            { title: "Simple", description: "No setup needed" },
          ],
          channelMessaging: {
            emailSubject: "Test subject",
            emailBody: "Test body",
            linkedinAd: "Test LinkedIn",
            landingPageHero: "Test Hero",
            landingPageSubheadline: "Test subheadline",
            onboardingMessage: "Welcome!",
          },
          competitiveDiff: [
            { differentiator: "PMM-first", description: "Built for PMMs", vsAlternative: "vs ChatGPT" },
          ],
        }),
      },
    }],
  }),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/brief.json", key: "briefs/1/1-abc.json" }),
}));

function createAuthContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("briefs.list", () => {
  it("returns briefs for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.briefs.list();
    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe("Test Product");
  });

  it("throws for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.briefs.list()).rejects.toThrow();
  });
});

describe("briefs.getById", () => {
  it("returns brief for owner", async () => {
    const caller = appRouter.createCaller(createAuthContext(1));
    const result = await caller.briefs.getById({ id: 1 });
    expect(result.productName).toBe("Test Product");
    expect(result.positioningStatement).toBe("Test positioning");
  });

  it("throws access denied for non-owner", async () => {
    const caller = appRouter.createCaller(createAuthContext(99));
    await expect(caller.briefs.getById({ id: 1 })).rejects.toThrow("Access denied");
  });
});

describe("briefs.getByShareToken", () => {
  it("returns shared brief by token (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.briefs.getByShareToken({ token: "test-token-123" });
    expect(result.productName).toBe("Shared Product");
    expect(result.isShared).toBe(true);
  });
});

describe("briefs.generate", () => {
  it("generates a GTM brief and returns id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.briefs.generate({
      productDescription: "A B2B SaaS tool that helps product marketers generate GTM briefs using AI",
      industry: "SaaS",
      stage: "MVP",
    });
    expect(result.id).toBe(42);
    expect(result.productName).toBe("Test Product");
    expect(result.positioningStatement).toContain("PMMs");
  });

  it("rejects descriptions that are too short", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.briefs.generate({ productDescription: "short" })).rejects.toThrow();
  });
});

describe("briefs.delete", () => {
  it("deletes a brief for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.briefs.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("briefs.exportPdf", () => {
  it("exports brief and returns S3 URL", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.briefs.exportPdf({ id: 1 });
    expect(result.url).toContain("https://");
  });
});
