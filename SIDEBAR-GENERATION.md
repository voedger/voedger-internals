# Sidebar Generation from SUMMARY.md

This project uses a custom script to generate the Docusaurus sidebar from `docs/SUMMARY.md`.

## How it works

The `generate-sidebar.js` script parses the GitBook-style `docs/SUMMARY.md` file and converts it into a Docusaurus-compatible `sidebars.js` file.

## Usage

### Manual Generation

To regenerate the sidebar after editing `docs/SUMMARY.md`, run:

```bash
npm run generate-sidebar
```

Or directly:

```bash
node generate-sidebar.js
```

### Automatic Generation (Watch Mode)

For automatic regeneration during development, run the watch script:

```bash
npm run watch-sidebar
```

This will:
- Generate the sidebar immediately
- Watch `docs/SUMMARY.md` for changes
- Automatically regenerate the sidebar whenever you save changes to `SUMMARY.md`
- Keep running until you press `Ctrl+C`

**Tip**: Run this in a separate terminal while editing your documentation.

## SUMMARY.md Format

The script supports the following GitBook-style syntax:

- **Section headers**: `## Section Name` - Used as visual separators (not added to sidebar)
- **Links**: `- [Label](path/to/file.md)` - Creates a doc item
- **Folders**: `- 📁Folder Name` - Creates a category
- **Indentation**: Use 2 spaces per level for nesting

### Example

```markdown
# Table of contents

- [Introduction](README.md)

## 💡Concepts

- [Event Sourcing & CQRS](concepts/evsrc/README.md)
- 📁Editions
  - [Community Edition](concepts/editions/ce.md)
  - [Standard Edition](concepts/editions/se.md)
```

## Path Conversion

The script automatically converts paths:
- `README.md` → `intro`
- `path/README.md` → `path/index`
- `path/file.md` → `path/file`

## Notes

- The generated `sidebars.js` file should not be edited manually
- Always edit `docs/SUMMARY.md` and regenerate the sidebar
- Run `npm run generate-sidebar` before building or deploying

