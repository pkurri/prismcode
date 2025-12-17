# Docker Development Environment

## Quick Start

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| app | 3000 | PrismCode API |
| redis | 6379 | Cache |
| postgres | 5432 | Database |

## Development

```bash
# Rebuild after code changes
docker-compose up -d --build app

# Shell into container
docker-compose exec app sh

# Run tests in container
docker-compose exec app npm test
```

## Production

```bash
docker build -t prismcode:latest .
docker run -p 3000:3000 prismcode:latest
```
