import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  agentRules: false,
  // Preserve the browser's loopback hostname for strict same-origin write checks.
  // Next's default proxy normalization changes 127.0.0.1 into localhost.
  skipProxyUrlNormalize: true,
};
export default config;
