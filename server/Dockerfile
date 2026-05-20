# ─────────────────────────────────────────────────────────────────────────────
# AI Moodify — Node.js Express Backend Dockerfile
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code
COPY . .

EXPOSE 5000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "app.js"]
