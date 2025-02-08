# Requirements Tracing Tool Specification

## Overview

This document defines the specifications for a command-line tool that traces requirements from Markdown files to their corresponding implementations in source files. The tool establishes traceability links between requirement identifiers and implementation identifiers, automatically generating documentation through footnotes.

## Core Functionality

The tool scans both Markdown and source files to establish relationships between requirements and their implementations. It automatically generates footnotes within requirement documents, linking each requirement to its corresponding implementation locations.

## Detailed Requirements

### Input Files

Input files:

- **Markdown files**
- **Source files** (including Markdown files).

The tool processes input text files and obtain list of requirements and implementation identifiers.

### Requirement Identifiers

- `RequirementIdentifiers` are located in `MarkdownFile`s only.
- Each `MarkdownFile` contains a single `PackageName` at the beginning and multiple `RequirementName` in the text.
- A `RequirementIdentifier` is a combination: `PackageName/RequirementName`.

PackageName is specified as follows:

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

```ebnf
PackageName = Identifier { "." Identifier }
Identifier = Letter { Letter | Digit | "_" }
Letter = "a" | ... | "z" | "A" | ... | "Z"
Digit = "0" | ... | "9"

RequirementName = Identifier

RequirementIdentifier = PackageName "/" RequirementName
```

### Implementation Identifiers

Each `InpitFile` contains multiple `ImplementationIdentifier` in the text.

ImplementationIdentifier is specified as follows:

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

### Tracing Mechanism

The tool follows these steps to establish traceability:

1. **Scans** all specified files to detect requirement and implementation identifiers.
2. For each **requirement identifier**:
   - Identifies all corresponding implementation identifiers.
   - Generates footnotes referencing each implementation.
   - Creates links within the footnotes pointing to the corresponding implementation locations.

### Output Format

The tool produces structured documentation with the following characteristics:

- Each requirement may have multiple footnotes.
- Each footnote corresponds to a single implementation identifier.
- Footnotes contain clickable links to the respective implementation locations.
