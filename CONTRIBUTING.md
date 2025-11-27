# Contributing to Voedger Internals Documentation

Thank you for contributing to the Voedger Internals documentation! This guide will help you get started.

## Quick Start for Tech Writers

### Prerequisites

- Node.js 20.10 LTS or higher
- Git

### Setup

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

The documentation site will open in your browser at http://localhost:3000

## Making Changes

### Editing Documentation

1. All documentation files are in the `docs/` directory
2. Files are written in Markdown format
3. Edit files using your preferred text editor
4. Changes will be reflected immediately in the browser (hot reload)

### Adding a New Page

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add front matter at the top:
   ```markdown
   ---
   title: Your Page Title
   ---
   
   # Your Page Title
   
   Your content here...
   ```

3. Update `sidebars.js` to include the new page in navigation

### Adding Images

1. Place images in `static/img/` directory
2. Reference them in markdown:
   ```markdown
   ![Alt text](/img/your-image.png)
   ```

### Internal Links

Link to other documentation pages:
```markdown
[Link text](./other-page)
[Link to section](./other-page#section-name)
```

## Markdown Features

### Basic Formatting

```markdown
**Bold text**
*Italic text*
`Code`
[Link](https://example.com)
![Image](/img/example.png)
```

### Headings

```markdown
# H1 - Page Title
## H2 - Section
### H3 - Subsection
```

### Lists

```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item
```

### Code Blocks

````markdown
```javascript
const example = "code";
```
````

### Admonitions (Callouts)

```markdown
:::note
This is a note
:::

:::tip
This is a tip
:::

:::info
This is info
:::

:::warning
This is a warning
:::

:::danger
This is danger
:::
```

### Tables

```markdown
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

## Testing Your Changes

### Local Preview

```bash
npm start
```

### Build Test

Before submitting, test that the site builds successfully:

```bash
npm run build
```

### Link Validation

Validate all links in your documentation:

```bash
node scripts/validate-links.js docs/
```

## Submitting Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

5. Wait for review and approval

6. Once merged to main, changes will be automatically deployed to GitHub Pages

## Best Practices

### Writing Style

- Use clear, concise language
- Write in present tense
- Use active voice
- Break up long paragraphs
- Use headings to organize content

### File Organization

- Keep related content together
- Use descriptive file names (lowercase, hyphen-separated)
- Follow the existing directory structure

### Images

- Use descriptive file names
- Optimize images for web (compress large images)
- Always include alt text for accessibility

### Links

- Use relative links for internal documentation
- Verify external links are working
- Use descriptive link text (avoid "click here")

## Getting Help

- Check the [Docusaurus documentation](https://docusaurus.io/docs)
- Review existing documentation for examples
- Ask questions in pull request comments

## Translation

For translators:

1. Translations will be added in future iterations
2. Follow the same process as above
3. Translated files will be organized by locale

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear the cache: `npm run clear`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check for broken links or invalid markdown syntax

### Development Server Issues

If the development server doesn't start:

1. Check that port 3000 is not in use
2. Try `npm run clear` and restart
3. Check Node.js version: `node --version` (should be 20.10+)

## Questions?

If you have questions or need help, please:

- Open an issue on GitHub
- Contact the documentation team
- Review the README.md for additional information
