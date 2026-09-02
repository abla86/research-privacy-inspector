# Research Privacy Inspector

Local-first Firefox WebExtension for research workflows.

## What it does

- Detects DOI and common scholarly metadata locally.
- Inspects basic privacy and accessibility signals.
- Separates metadata detection from bibliographic verification.
- Generates deterministic citation drafts without claiming source truth.
- Keeps Norwegian legal references separate from ordinary journal APA formatting.
- Uses a fail-closed model: incomplete metadata is not treated as a verified reference.

## Architecture

The `lib/` modules are pure ES modules with no DOM, browser, storage or network dependencies. The extension UI consumes the same deterministic logic that is tested independently.

Online lookup is intentionally not part of the local inspection step. Future DOI/Crossref verification can be introduced as a separate explicit action with its own disclosure and permissions.

## Firefox permissions

The extension currently requests only `activeTab` and `scripting`, used for user-initiated inspection of the active page.

## Quality gates

```text
npm test
npm run lint
npm run web-ext:lint
```

## Status

Prototype / MVP progressing toward a research-grade utility.

Not an official Mozilla product and not yet a Mozilla contribution.
