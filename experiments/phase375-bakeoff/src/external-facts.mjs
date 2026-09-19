// Public documentation retrieval only; no model request or account inspection.
export const EXTERNAL_FACTS = {
  retrievedAtUTC: '2026-09-19T19:03:41Z',
  directPublicFetchesUTC: { providerListing: '2026-09-19T19:03:18.6868831Z', modelPage: '2026-09-19T19:03:41.8389150Z' },
  sources: {
    jev: 'https://vercel.com/ai-gateway/models/jev',
    provider: 'https://vercel.com/ai-gateway/models/providers/typesafe-ai',
    evaluation: 'https://vercel.com/docs/ai-gateway/modalities/evaluation',
    training: 'https://vercel.com/docs/ai-gateway/security-and-compliance/disallow-prompt-training',
    routing: 'https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering',
    astra: 'https://vercel.com/ai-gateway/models/gpt-6-astra',
    announcement: 'https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway',
    budgets: 'https://vercel.com/docs/ai-gateway/observability-and-spend/budgets',
  },
  jev: {
    model: 'typesafe-ai/jev', provider: 'typesafe-ai', api: 'experimental_evaluate',
    displayedInputUSDPerMillion: 0.04, embeddedInputUSDPerMillion: 0.042,
    embeddedOutputUSDPerMillion: 0,
    priceBasis: 'Use paid embedded rate, not promotion; recheck immediately before any approved live run.',
    providerListingPrivacy: { zdr: 'NOT_LISTED', noTraining: 'NOT_LISTED' },
    conflictingEvidence: 'The directly fetched model page still contained promotional text and positive zeroDataRetention/disallowPromptTraining metadata; the announcement also claims privacy support. The current provider listing displays neither privacy indicator and its paid embedded input rate is 0.042. These official sources conflict; exact-route privacy support is unverified, not positively established or proved absent.',
    productionPrivacyEligibility: 'NOT_ELIGIBLE',
    reason: 'Privacy eligibility not established for real campaign/private/source inputs; synthetic quality cannot promote this result.',
  },
  astra: { model: 'openai/gpt-6-astra', provider: 'openai', inputUSDPerMillion: 10, outputUSDPerMillion: 50 },
  syntheticPolicy: 'Fixtures authored in this repository only. No ZDR or no-training guarantee is requested or claimed. Hard provider pin and no fallback remain mandatory. No subscription upgrade is required for this synthetic policy.',
};
