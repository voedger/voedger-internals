# Requirements Tracing Tool Specification

## Overview

This document defines the specifications for a command-line tool that traces requirements from Markdown files to their corresponding coverage in source files. The tool establishes traceability links between requirement identifiers and coverage tags, automatically generating footnotes that links requirement identifiers and coverage tags.

## Markdown elements

- **Footnote reference**: A reference to a footnote in the markdown text.
- **Footnote label**: A label that identifies a footnote.

Example:

```markdown
This is a footnote reference[^1].

[^1]: This is a footnote label.
```

## Input Files

`InputFiles`:

- `MarkdownFile`s
- `SourceFile`s (including `MarkdownFile`s).

The tool processes input text files and obtain list of requirements and coverage tags.

## Markdown Files

- `MarkdownFile` is a text file with `.md` extension.
- `RequirementIdentifier`s are located in `MarkdownFile`s only.
- Each `MarkdownFile` contains a single `PackageName` at the beginning and multiple `RequirementName` in the text.
- A `RequirementIdentifier` is build as: `PackageName/RequirementName`.

`PackageName` is specified as follows:

```markdown
---
reqmd.package: <package-name>
---
```

Where `<package-name>` is a placeholder for the actual package name. An example:

```markdown
---
reqmd.package: server.api.v2
---
```

`RequirementName` is specified as follows, an example:

```markdown
- APIv2 implementation shall provide a handler for POST requests. `~Post~`
```

`CoveredRequirementIdentifier` looks like:

```markdown
- APIv2 implementation shall provide a handler for POST requests. `~Post~`covered[^coverersN].
```

`CoveringNote` looks like:

```markdown
- APIv2 implementation shall provide a handler for POST requests. `~Post~`covered[^coverersN].

This is CoveringFootnote:

[^coverersN]: `[~server.api.v2~impl]`[folder/filename1:line1:impl](CoverageTagURL1), [folder/filename2:line2:test](CoverageTagURL2)...
```

CoverageTagURL is a URL that points to the location of the coverage tag in the source file, an example:

```text
https://github.com/voedger/voedger/blob/979d75b2c7da961f94396ce2b286e7389eb73d75/pkg/sys/sys.vsql#L4
```

## Coverage Tags

Each `InpitFile` contains multiple `CoverageTag` in the text.

`CoverageTag` is specified as explained in the following example:

```go
// [~server.api.v2/Post~impl]
func handlePostRequest(w http.ResponseWriter, r *http.Request) {
    // Implementation
}

// [~server.api.v2/Post~test]
func handlePostRequestTest(t *testing.T) {
    // Test
}
```

Breakdown of the `[~server.api.v2/Post~test]`:

- `server.api.v2` is the `PackageName`.
- `Post` is the `RequirementName`.
- `test` is the `CoverageType`.

## Processing requirements

## Tracing mechanism

### Concepts

RequirementIdentifierEntry:

- RequrementIdentifier
- Location

RequirementIdentifierEntry:

- RequrementIdentifier
- Location

Location

- Repository URL
- Path in Repository
- Hash

The tool follows these steps to establish traceability.

### Tracing

- Scan all `InputFile`s and identify `RequirementIdentifierEntry`s and `CoverageTagEntry`s


1. **Scans** all specified files to detect requirement identifiers and coverage tags.
2. For each **requirement identifier**:
   - Identifies all corresponding coverage tags.
   - Generates footnotes referencing each coverage.
   - Creates links within the footnotes pointing to the corresponding coverage locations.

## Output Format

The tool produces structured documentation with the following characteristics:

- Each requirement may have multiple footnotes.
- Each footnote corresponds to a single coverage tag.
- Footnotes contain clickable links to the respective coverage locations.

## EBNF

```ebnf
PackageName = Identifier { "." Identifier }
Identifier = Letter { Letter | Digit | "_" }
Letter = "a" | ... | "z" | "A" | ... | "Z"
Digit = "0" | ... | "9"

RequirementName = Identifier

RequirementIdentifier = PackageName "/" RequirementName

CoverageTag = "[~" RequirementIdentifier "~" CoverageType "]"

CoveringFootnote = 

```
