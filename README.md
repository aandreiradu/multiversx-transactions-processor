<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

REST API to track and retrieve transaction amounts for specific coins (EGLD or ESDT) on the MultiversX Blockchain.
Uses <a href="https://github.com/multiversx/mx-sdk-transaction-processor" target="_blank">sdk-transaction-processfor</a> from MultiversX

## Local Development Environment

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

### Environment Setup

```sh
# Install Node 18
nvm install lts/hydrogen
nvm use lts/hydrogen

# Install pnpm using Corepack
corepack enable
```

If you do not have `corepack` installed locally you can use `npm` or `yarn` to install `pnpm`:

```sh
npm install pnpm -g
# or
yarn install pnpm -g
```

For alternative methods of installing `pnpm`, you can refer to the [official `pnpm` documentation](https://pnpm.io/installation).

To install dependencies, execute:

```sh
pnpm i
```

### Environment Variables

In order for the local playground to function, it is necessary to configure the environment variables appropriately. You must duplicate the example environment file, `.env.example`, into your local environment file, `.env`.

Navigate to the project's root directory and enter the following command:

```sh
cp .env.example  .env.env
```

### Local Playground

Navigate to the project's root directory and execute:

```sh
pnpm dev
```

Upon executing the above command, the following will be available

- live-updates
- watcher at [http://localhost:3001](http://localhost:3003) with the following routes available:
  - GET /balances/coins/:coin/received?walletId={walletId} (Return received amounts for the authenticated user's wallet)
  - GET /balances/coins/:coin/sent?walletId={walletId} (Return sent amounts for the authenticated user's wallet)
    Replace ":coin" with EGLD or ESDT Identifier depending on the coin.
