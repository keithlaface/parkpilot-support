---
name: verify
description: Verify the Park Pilot support site before opening or updating the support-landing pull request.
---

# Verify Park Pilot support

From the repository root:

```bash
node --test scripts/verify.mjs
```

The script checks that `privacy.html` matches its pinned hash (update the pin deliberately when the policy changes), that the support home is not a redirect, that every contact address is the one already published on `privacy.html`, that the copy matches the wait provider and cache rules in `privacy.html`, that the required topics, ThemeParks.wiki credit and unofficial disclaimer are present, and that the color pairs used for text and controls meet WCAG 2.1 AA.

## Steps that cannot run

This repository is static HTML, CSS, and JavaScript served by GitHub Pages. It has no package manifest, no TypeScript, no linter configuration, and no build.

- Clean install: cannot run. There is nothing to install, and this change does not add a package manager.
- Typecheck: cannot run. There is no TypeScript or other typed toolchain.
- Lint: cannot run as a separate linter. `scripts/verify.mjs` is the check that exists.
- Tests: `node --test scripts/verify.mjs`
- Build: cannot run. The site is the source files. Do not add a build or a Pages workflow. Merging to `main` is the public deploy.

If install, typecheck, lint, or build could not run, prefix the pull request title with `[unverified]` and say which steps had no command to run.
