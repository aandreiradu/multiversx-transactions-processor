FROM node:18

RUN echo "Watcher Dockerfile"

# Install PNPM
RUN corepack enable
RUN corepack prepare pnpm@8.2.0 --activate

WORKDIR /usr/src/app

COPY package*.json ./

# Fetch packages from lockfile (https://pnpm.io/cli/fetch#usage-scenario)
RUN pnpm install

# Add everything to the working directory
COPY . .

# Install packages from virtual store
RUN pnpm build watcher

CMD [ "node","dist/apps/watcher/main.js" ]

