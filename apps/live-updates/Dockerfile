FROM node:18

RUN echo "Live-Updates Dockerfile"

# Install PNPM
RUN corepack enable
RUN corepack prepare pnpm@8.2.0 --activate

WORKDIR /usr/src/app

COPY package*.json ./

# Fetch packages from lockfile (https://pnpm.io/cli/fetch#usage-scenario)
RUN pnpm install

# Add everything to the working directory
COPY . .

RUN ECHO  "RUNNING GENENRATE"

RUN pnpm prisma generate

RUN ECHO  "FINISHED GENENRATE"

# Install packages from virtual store
RUN pnpm build live-updates

CMD [ "node","dist/apps/live-updates/main.js" ]

