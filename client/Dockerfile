FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite inlines VITE_* env vars into the bundle at BUILD time.
# Railway exposes service variables as Docker build args, so declare it here
# and promote it to an env var before building.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
RUN npm install -g serve
# Railway routes the public domain to $PORT (8080) and injects PORT at runtime.
# Use shell form so $PORT expands; fall back to 3000 for local runs.
EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
