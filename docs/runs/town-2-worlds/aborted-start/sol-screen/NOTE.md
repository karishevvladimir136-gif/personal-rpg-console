# sol-screen — first start, set aside

Stopped at cycle 5 (250 events), $0.2825 by the stage ledger (kept in the stage total as «sol-screen aborted start»).

Why: The welfare judge (Haiku 5.5 via llmapi, aws-bedrock) answered a sporadic HTTP 400 invalid_request_error: Operation not allowed — the gateway's own routing fault, the same request goes through on a resend — and the harness treated every 400 as final, so the check counted as «not checked» and the reply was not acted on (TOWN_1's rule): 18 replies in sol-hall, 17 in sol-screen, in cycles 1–5. A harness fault, not data: stopped by the operator, the 400s made retryable, both worlds restarted from cycle 1.

The world started again from cycle 1 with the fix; nothing from this start is in the world's own folder.
