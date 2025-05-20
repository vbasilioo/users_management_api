FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN rm -rf dist || true
RUN pnpm build

RUN ls -la dist || echo "Build failed - dist directory not created"

EXPOSE 3000

CMD ["pnpm", "start:prod"] 