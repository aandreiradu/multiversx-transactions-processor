FROM node:18.7-alpine

# Install PNPM
RUN corepack enable
RUN corepack prepare pnpm@8.2.0 --activate

WORKDIR /usr/src/app

COPY package*.json ./

# Fetch packages from lockfile (https://pnpm.io/cli/fetch#usage-scenario)
RUN pnpm install

# Generate Prisma Client
RUN pnpm prisma generate

RUN echo "FINISHED TO GENERATE PRISMA CLIENT"

# Copy the generated Prisma Client files
# COPY ./node_modules/.prisma/client ./node_modules/.prisma/client

# Add everything to the working directory
COPY . .


# Install packages from virtual store
RUN pnpm build watcher
RUN pnpm build live-updates

CMD [ "node","dist/apps/live-updates/main.js","node", "dist/apps/watcher/main.js" ]

