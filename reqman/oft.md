# OpenFastTrace user guide

## Overview

OpenFastTrace (OFT) is a requirements tracing tool that ensures all defined requirements are covered in your code and helps identify outdated code. The basic workflow is:

1. Write requirements in Markdown with OFT-readable specification items
2. Add tags in source code to mark requirement coverage
3. Use OFT to trace requirements through to implementation

## Getting started

### Setting up OFT

System requirements:

- Java Runtime Environment (JRE) 11 or higher

Install OFT by downloading the latest release JAR file from the [releases page](https://github.com/itsallcode/openfasttrace/releases).

### Basic concepts

#### Specification items

A specification item is a requirement fragment that can exist in different forms:

- Requirements in documents
- Coverage markers in code
- Test cases
- Design documents

Each specification item has a unique ID with three parts:

- Artifact type (e.g., feat, req, dsn, impl)
- Name
- Revision number

Example ID: `req~html-export~1`

#### Coverage

Coverage shows relationships between specification items that require implementation/verification and the items providing that coverage. An item is covered when all required artifact types have at least one covering item.

### Writing specifications

Create Markdown files with specification items following this format:

```markdown
### Login requirement
`req~login-system~1`

The system must provide secure user authentication.

Needs: dsn, impl, utest
```

### Adding code coverage

Add coverage tags in source code comments:

```java
// [impl->req~login-system~1]
public void authenticate(String username, String password) {
    // Implementation
}
```

### Running traces

Basic trace command:

```bash
oft trace doc src/main/java src/test/java
```

Common options:

- `-o html` - Generate HTML report
- `-v minimal` - Show only summary
- `-f output.html` - Specify output file

## Advanced features

### Tag filtering

Filter specifications by component:

```bash
oft convert -t AuthProvider,UserMgmt import/req/
```

### Requirement delegation

Forward requirements directly:

```markdown
arch --> dsn : req~logging-format~1
```

## Integration

Build system plugins available for:

- Maven
- Gradle

### API usage

Basic Java integration:

```java
Oft oft = Oft.create();
List<SpecificationItem> items = oft.importItems(settings);
List<LinkedSpecificationItem> linked = oft.link(items);
Trace trace = oft.trace(linked);
oft.reportToStdOut(trace);
```

## Reference

### Exit codes

- 0: Success
- 1: OFT error
- 2: Command line error

See [full documentation](https://github.com/itsallcode/openfasttrace/blob/main/doc/user_guide.md) for complete details.
