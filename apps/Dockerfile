FROM node:18

RUN echo "MVX TRANSACTION DOCKERFILE"

# Install PNPM
RUN corepack enable
RUN corepack prepare pnpm@8.2.0 --activate

WORKDIR /usr/src/app

# Copy lockfile, NVM and NPM configuration to the working directory
COPY pnpm-lock.yaml ./

# Fetch packages from lockfile (https://pnpm.io/cli/fetch#usage-scenario)
RUN pnpm fetch

# Add everything to the working directory
COPY . ./

# Install packages from virtual store
RUN pnpm install -r --offline

RUN pnpm db:gen

RUN pnpm dev