# Package Management Guide

## Overview

PrismCode uses npm for package management with strict version locking.

## Commands

```bash
# Install all dependencies
npm install

# Install production only
npm install --omit=dev

# Add a new package
npm install <package>

# Add dev dependency
npm install -D <package>

# Update packages
npm update

# Check outdated
npm outdated

# Audit security
npm audit

# Fix security issues
npm audit fix
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code |
| `npm run setup` | Environment validation |

## Version Policy

- **Major**: Breaking changes only with migration guide
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes only

## Lock File

Always commit `package-lock.json` to ensure reproducible builds.

```bash
# Force clean install
rm -rf node_modules package-lock.json
npm install
```

## Workspaces (Future)

For monorepo structure:
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```
