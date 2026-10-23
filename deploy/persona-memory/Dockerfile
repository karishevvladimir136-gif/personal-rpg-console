# Persona memory — the memory server as a container, for Fly.io (docs/PERSONA_MEMORY.md, «The alternative: Fly.io»).
# Build context: the repository root. Only the server's own files go in: the memory library, the token estimator it
# uses, the server script and the production packages. The store is the volume at /data; the token comes from a Fly
# secret as PERSONA_MEMORY_TOKEN.
FROM node:24-bookworm-slim
WORKDIR /app
RUN npm install -g pnpm@10 && npm cache clean --force
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY src/lib/persona-memory ./src/lib/persona-memory
COPY src/lib/gameplay/dm-loop/tokens.ts ./src/lib/gameplay/dm-loop/tokens.ts
COPY scripts/persona-memory/server.mjs ./scripts/persona-memory/server.mjs
ENV NODE_ENV=production PERSONA_MEMORY_DIR=/data
EXPOSE 8787
CMD ["node", "scripts/persona-memory/server.mjs", "--http", "--host", "0.0.0.0", "--port", "8787"]
