# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# yarn
yarn build
```

Locally preview production build:

```bash
# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Docker Stuff

Create a postgres container for development:

```
docker run -d -p 6543:5432 --name mkti-postgres -e POSTGRES_USER=mkti -e POSTGRES_DB=mkti_development -e POSTGRES_PASSWORD="mkti" postgres:15.3-alpine
```

Connect to the database using psql:

```
psql postgres://mkti:mkti@localhost:6543/mkti_development
```

Create a redis container for development:

```
docker run -p 6379:6379 --name mkti-redis -d redis
```

Connect to the redis server using redis-cli:

```
redis-cli -h localhost -p 6379
```
