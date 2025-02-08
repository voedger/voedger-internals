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

## Input files

Input files are markdown files and source files.

The tool processes input text files and obtain list of requirements and coverage tags.

## Markdown files

`MarkdownFile` is a text file with `.md` extension. Markdown file contains a header and a body.

```ebnf
MarkdownFile = MarkdownHeader MarkdownBody
```

`MarkdownHeader` specifies `PackageName, an example:

```markdown
---
reqmd.package: <package-name>
---
```

Where `<package-name>` is a placeholder for the actual package name.

```ebnf
(* Identifiers and their basic parts follow the provided definitions. *)
Identifier        = Letter { Letter | Digit | "_" }

(* A package name is a sequence of one or more identifiers separated by dots. *)
PackageName       = Identifier { "." Identifier }

(* A Markdown file consists of a header and a body. *)
MarkdownHeader  = HeaderDelimiter NewLine HeaderBody HeaderDelimiter NewLine

(* The header delimiter is three dashes. *)
HeaderDelimiter = "---"

(* The body is zero or more header lines. *)
HeaderBody      = { HeaderLine NewLine }

(* A header line is either a field line (such as the reqmd.package field)
   or any other line of text. *)
HeaderLine      = FieldLine | OtherLine

(* A header line is either a field line (such as the reqmd.package field)
   or any other line of text. *)
HeaderLine      = FieldLine | OtherLine

(* The reqmd.package field line uses a fixed key, a colon, optional whitespace,
   and a package field value (the package name enclosed in "<" and ">"). *)
FieldLine       = "reqmd.package:" PackageName

```

Markdown body is a sequence if text elements, some of them are RequirementID, some CoveringFootnotes.

RequirementID:

- Not covered: `~Post~`.
- Covered: `~Post~`coverers[^coverersN].

CoveringFootnote:

```markdown
[^coverersN]: `[~server.api.v2~impl]`[folder/filename1:line1:impl](CoverageTagURL1), [folder/filename2:line2:test](CoverageTagURL2)...

```ebnf
(* A MarkdownBody is a sequence of text elements. *)
MarkdownBody      = { TextElement }

(* A TextElement is either a RequirementID, a CoveringFootnote on its own, or any other text. *)
TextElement       = RequirementID | CoveringFootnote | OtherText

(* A RequirementID is an inline requirement element that may optionally be annotated
   with coverage information. *)
RequirementID      = InlineReqID [ CoverageAnnotation ]

(* The inline part of a RequirementID is written as a code element that begins with 
   a tilde, contains a requirement name, and ends with a tilde. *)
InlineReqID        = "`" "~" Identifier "~" "`"

(* A covered RequirementID is marked by the literal "coverers" immediately following the inline code, followed by a CoveringFootnote. *)
CoverageAnnotation = "coverers" FootnoteReference

FootnoteReference = FootnoteLabel

FootnoteLabel = "[^" CoverersID "]"

CoverersID = "coverers" NUMBER

(* A CoveringFootnote is a footnote marker followed by a CoverageTag and a FileCoverageList. *)
CoveringFootnote  = FootnoteMarker "`" CoverageTag "`" ":" FileCoverageList

FootnoteMarker    = FootnoteLabel ":"



OtherText          ::= { AnyChar } 

```

- `RequirementIdentifier`s are located in `MarkdownFile`s only.
- Each `MarkdownFile` contains a single `PackageName` at the beginning and multiple `RequirementName` in the text.
- A `RequirementIdentifier` is build as: `PackageName/RequirementName`.

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
- APIv2 implementation shall provide a handler for POST requests. `~Post~`coverers[^coverersN].
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

## Inpit Files

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

Core:

```ebnf


(* A requirement identifier is a package name, a literal slash, and a requirement name. *)
RequirementIdentifier = PackageName "/" RequirementName

RequirementName   = Identifier
```

Coverage

```ebnf


CoverageTag       = "[~" RequirementIdentifier "~" CoverageType "]"

CoverageType      = Identifier

(* A list of file coverage entries is one or more FileCoverage items separated by commas. *)
FileCoverageList  = FileCoverage { "," FileCoverage }

(* Each file coverage entry consists of a file reference immediately followed by a coverage URL. *)
FileCoverage      = CoverageLabel CoverageURL

(* The file reference is enclosed in square brackets and has the form: 
   file path, colon, line specification, colon, a coverage type. *)
CoverageLabel     = "[" FilePath ":" Line ":" CoverageType "]"

(* A file path is given as one or more path components (identifiers) separated by a slash. *)
FilePath          = Identifier { "/" Identifier }

(* A line specification begins with the literal "line" followed by one or more digits. *)
Line              = "line" Digit { Digit }

(* The coverage URL is provided in parentheses. (This production may be adapted
   to a fuller URL grammar as needed.) *)
CoverageURL       = "(" URL ")"
```
