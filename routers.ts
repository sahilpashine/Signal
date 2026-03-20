import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createBrief, updateBrief, getBriefsByUserId, getBriefById,
  getBriefByShareToken, deleteBriefById
} from "./db";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";

// ─── GTM Brief JSON Schema ────────────────────────────────────────────────────
const GTM_BRIEF_SCHEMA = {
  type: "object",
  properties: {
    productName: { type: "string", description: "Short, clean product name extracted or inferred from the description" },
    icp: {
      type: "object",
      properties: {
        profile: { type: "string", description: "2-3 sentence description of the ideal customer profile" },
        demographics: { type: "string", description: "Key demographic/firmographic signals (role, company size, industry, etc.)" },
        painPoints: { type: "array", items: { type: "string" }, description: "Top 3 pain points this customer has" },
        motivations: { type: "array", items: { type: "string" }, description: "Top 3 motivations/goals this customer has" },
      },
      required: ["profile", "demographics", "painPoints", "motivations"],
      additionalProperties: false,
    },
    positioningStatement: { type: "string", description: "One crisp sentence: For [ICP], [Product] is the [category] that [key benefit] because [reason to believe]" },
    valuePropositions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short, punchy headline (5-8 words)" },
          description: { type: "string", description: "1-2 sentence explanation of the value" },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
      description: "Exactly 3 value propositions",
    },
    channelMessaging: {
      type: "object",
      properties: {
        emailSubject: { type: "string", description: "Compelling email subject line (under 60 chars)" },
        emailBody: { type: "string", description: "2-3 sentence email opening that hooks the reader" },
        linkedinAd: { type: "string", description: "LinkedIn ad copy (under 150 chars, punchy and direct)" },
        landingPageHero: { type: "string", description: "Landing page hero headline (under 10 words, bold and clear)" },
        landingPageSubheadline: { type: "string", description: "Landing page subheadline (1-2 sentences expanding on the hero)" },
        onboardingMessage: { type: "string", description: "First onboarding message to new users (friendly, value-focused, 2-3 sentences)" },
      },
      required: ["emailSubject", "emailBody", "linkedinAd", "landingPageHero", "landingPageSubheadline", "onboardingMessage"],
      additionalProperties: false,
    },
    competitiveDiff: {
      type: "array",
      items: {
        type: "object",
        properties: {
          differentiator: { type: "string", description: "Short differentiator label (3-6 words)" },
          description: { type: "string", description: "1-2 sentence explanation of why this is a real differentiator" },
          vsAlternative: { type: "string", description: "What the alternative/status quo is (e.g., 'vs. doing it manually', 'vs. ChatGPT')" },
        },
        required: ["differentiator", "description", "vsAlternative"],
        additionalProperties: false,
      },
      description: "Top 3-4 competitive differentiators",
    },
  },
  required: ["productName", "icp", "positioningStatement", "valuePropositions", "channelMessaging", "competitiveDiff"],
  additionalProperties: false,
};

async function generateGTMBrief(productDescription: string, industry?: string, stage?: string) {
  const contextInfo = [
    industry ? `Industry: ${industry}` : "",
    stage ? `Company/Product Stage: ${stage}` : "",
  ].filter(Boolean).join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a world-class Product Marketing Manager (PMM) with 15+ years of experience at top SaaS companies. 
You think strategically about go-to-market strategy, not just write copy. 
Your GTM briefs are precise, actionable, and immediately usable by marketing teams.
Always be specific — avoid generic marketing language. Use concrete, differentiated language that actually reflects the product.
Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: "user",
        content: `Generate a comprehensive GTM brief for the following product:

${productDescription}
${contextInfo ? `\nAdditional context:\n${contextInfo}` : ""}

Think deeply about:
1. WHO specifically would buy this (not just "businesses" — be specific about role, company size, situation)
2. HOW to position it uniquely (not generic benefits — what makes it genuinely different)
3. WHAT messaging will resonate (channel-specific, not one-size-fits-all)
4. WHY customers should choose this over alternatives (specific, defensible differentiators)

Generate the complete GTM brief now.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "gtm_brief",
        strict: true,
        schema: GTM_BRIEF_SCHEMA,
      },
    },
  });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : null;
    if (!content) throw new Error("No content returned from LLM");
    return JSON.parse(content);
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  briefs: router({
    // List user's briefs
    list: protectedProcedure.query(async ({ ctx }) => {
      return getBriefsByUserId(ctx.user.id);
    }),

    // Get single brief (own or shared)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const brief = await getBriefById(input.id);
        if (!brief) throw new Error("Brief not found");
        if (brief.userId !== ctx.user.id) throw new Error("Access denied");
        return brief;
      }),

    // Get brief by share token (public)
    getByShareToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const brief = await getBriefByShareToken(input.token);
        if (!brief) throw new Error("Brief not found or sharing disabled");
        return brief;
      }),

    // Generate a new GTM brief using LLM
    generate: protectedProcedure
      .input(z.object({
        productDescription: z.string().min(20, "Please describe your product in at least 20 characters"),
        industry: z.string().optional(),
        stage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create a placeholder brief first
        const briefId = await createBrief({
          userId: ctx.user.id,
          productName: "Generating...",
          productDescription: input.productDescription,
          industry: input.industry,
          stage: input.stage,
        });

        try {
          // Generate with LLM
          const result = await generateGTMBrief(input.productDescription, input.industry, input.stage);

          // Update with generated content
          await updateBrief(briefId, {
            productName: result.productName,
            icpData: JSON.stringify(result.icp),
            positioningStatement: result.positioningStatement,
            valuePropositions: JSON.stringify(result.valuePropositions),
            channelMessaging: JSON.stringify(result.channelMessaging),
            competitiveDiff: JSON.stringify(result.competitiveDiff),
          });

          return { id: briefId, ...result };
        } catch (error) {
          // Clean up failed brief
          await deleteBriefById(briefId, ctx.user.id);
          throw error;
        }
      }),

    // Enable/disable sharing
    toggleShare: protectedProcedure
      .input(z.object({ id: z.number(), share: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const brief = await getBriefById(input.id);
        if (!brief || brief.userId !== ctx.user.id) throw new Error("Brief not found");

        let shareToken = brief.shareToken;
        if (input.share && !shareToken) {
          shareToken = nanoid(16);
        }

        await updateBrief(input.id, {
          isShared: input.share,
          shareToken: shareToken ?? undefined,
        });

        return { shareToken: input.share ? shareToken : null };
      }),

    // Delete a brief
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteBriefById(input.id, ctx.user.id);
        return { success: true };
      }),

    // Export brief as PDF (store in S3)
    exportPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const brief = await getBriefById(input.id);
        if (!brief || brief.userId !== ctx.user.id) throw new Error("Brief not found");

        // If already exported, return existing URL
        if (brief.pdfUrl) return { url: brief.pdfUrl };

        // Generate PDF content as HTML string (will be rendered client-side)
        // Store a JSON representation in S3 for now
        const exportData = {
          productName: brief.productName,
          productDescription: brief.productDescription,
          industry: brief.industry,
          stage: brief.stage,
          icp: brief.icpData ? JSON.parse(brief.icpData) : null,
          positioningStatement: brief.positioningStatement,
          valuePropositions: brief.valuePropositions ? JSON.parse(brief.valuePropositions) : [],
          channelMessaging: brief.channelMessaging ? JSON.parse(brief.channelMessaging) : {},
          competitiveDiff: brief.competitiveDiff ? JSON.parse(brief.competitiveDiff) : [],
          generatedAt: brief.createdAt,
        };

        const fileKey = `briefs/${ctx.user.id}/${brief.id}-${nanoid(8)}.json`;
        const { url } = await storagePut(fileKey, JSON.stringify(exportData, null, 2), "application/json");

        await updateBrief(input.id, { pdfUrl: url });
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
