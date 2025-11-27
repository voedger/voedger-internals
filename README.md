# Documentation

This repository contains the technical documentation for the Voedger Internals. The documentation is built using [Docusaurus](https://docusaurus.io/) and deployed to GitHub Pages.

## Quick Start

### Prerequisites

- Node.js 20.10 LTS or higher
- npm 10.0 or higher
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/voedger/voedger-internals.git
cd voedger-internals
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

To build the static site:

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve

To serve the built site locally:

```bash
npm run serve
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this documentation.

### Quick Overview

1. **Edit Documentation**: All documentation files are located in the `docs/` directory
2. **Test Locally**: Run `npm start` to preview your changes
3. **Submit Changes**: Create a pull request with your changes

### Content Structure

- `docs/` - Documentation content in markdown format
- `static/` - Static assets (images, files)
- `sidebars.js` - Navigation sidebar configuration
- `docusaurus.config.js` - Site configuration

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment is handled by GitHub Actions (see `.github/workflows/deploy.yml`).

### Manual Deployment

If needed, you can deploy manually:

```bash
npm run deploy
```

## Migration from GitBook

This documentation has been migrated from GitBook to Docusaurus. Migration scripts are available in the `scripts/` directory:

- `scripts/migrate-content.js` - Migrate content from GitBook export
- `scripts/format-content.js` - Format and optimize markdown content
- `scripts/validate-links.js` - Validate internal and external links

### Running Migration

```bash
node scripts/migrate-content.js <gitbook-export-path> <output-path>
```

### Validating Links

```bash
node scripts/validate-links.js docs/
```
