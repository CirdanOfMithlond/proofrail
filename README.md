# ProofRail

**Every correction becomes a permanent constraint.**

ProofRail is a static, interactive MVP for regression-proof professional-document workflows. It converts one expert correction into a persistent decision rule, executable regression tests, and a traceable wording patch. It then proves the controls work by blocking a deliberately defective revision and applying a bounded repair.

The demonstration uses only fictional, anonymised content. It runs entirely in the browser with no API key, backend, package installation, build step, telemetry, or external dependency.

## The documented problem

Professional documents are revised repeatedly. A reviewer may correct a weak conclusion, remove duplicated evidence, or protect an approved heading, yet that decision often survives only as a comment or in one person's memory. A later revision can silently reintroduce the same defect.

This creates three related risks:

- reviewer intent is not retained as an enforceable rule;
- revisions are checked broadly and inconsistently rather than against the precise correction;
- repairs can cause collateral changes outside the reviewer-approved scope.

## The ProofRail solution

ProofRail treats an expert correction as control input. The MVP compiles the correction into:

1. a persistent decision in the **Decision Ledger**;
2. three explicit rules in **Compiled Rules**;
3. three deterministic checks in **Regression Tests**; and
4. a **Controlled Patch** recording current wording, replacement wording, and reason.

When a revision fails, the approval gate closes. The bounded repair function receives the failed test results and changes only the corresponding elements. The same validators then run again before the final wording is approved.

## Product workflow

The included scenario concerns a fictional recovery-control assessment:

1. **Source** — Review an original §4.2 conclusion and the supporting evidence in §4.3.
2. **Correction** — Require causal reasoning, a single evidence location, and the exact frozen §4.3 heading.
3. **Compile** — Persist one ledger decision, three rules, three tests, and a traceable patch.
4. **Revise** — Generate a deliberately defective revision that omits reasoning, duplicates evidence, and renames the frozen heading.
5. **Test** — Run real JavaScript validators. All three fail and approval is blocked.
6. **Repair** — Replace the failed conclusion, remove the duplicate by restoring the controlled wording, and restore the frozen heading. Unfailed content is left untouched.
7. **Approve** — Re-run the same validators and show `3/3 TESTS PASSED` with approved final text.

## Implementation with GPT-5.6 Sol and OpenAI Work/Codex

GPT-5.6 Sol was used as the reasoning and implementation model within the OpenAI Work/Codex agent workflow. The agent translated the product brief into a deterministic state machine, authored the dependency-free HTML/CSS/JavaScript interface, encoded the correction as executable validators, created the supporting documentation and sample data, and exercised the complete interaction sequence before committing it.

The model is not called by the application at runtime. All demo content and control logic are bundled in the repository, so the MVP remains inspectable, reproducible, and usable offline.

## Installation

No installation is required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

The application uses relative local file references and works from a `file://` URL. It does not need a local server.

## Testing

### Interactive acceptance test

Starting from a fresh page or after selecting **Reset Demo**:

1. Confirm the state is `READY`.
2. Select **Compile Correction** and confirm `COMPILED`, one ledger decision, three rules, three ready tests, and the controlled patch.
3. Select **Run Revision** and inspect the three highlighted defects.
4. Select **Run Regression Tests** and confirm `FAILED`, three failed rows, `GATE CLOSED`, and a disabled revision approval state.
5. Select **Apply Bounded Repair** and observe `REPAIRING`.
6. Confirm the final state is `3/3 TESTS PASSED`, `GATE OPEN`, and `APPROVED v3`.
7. Select **Reset Demo** and confirm that the original source and `READY` state return.

The detailed validator contract is in [`tests/test-cases.md`](tests/test-cases.md). The two-minute presentation sequence is in [`docs/demo-script.md`](docs/demo-script.md).

### Lightweight technical checks

Because the application has no dependencies, testing can also be performed with built-in tools:

```text
node --check app.js
```

Then open `index.html` directly and run the interactive acceptance test above. The validation and repair functions are exposed read-only as `window.ProofRail.validateDocument` and `window.ProofRail.applyBoundedRepair` for inspection from browser developer tools.

## Repository contents

```text
index.html                 Interface and semantic structure
styles.css                 Responsive professional visual system
app.js                     State machine, validators, repair, and rendering
README.md                  Product and operating documentation
docs/demo-script.md        Sub-two-minute spoken and visual demo
tests/test-cases.md        Regression-test definitions
sample-data/example.json   Machine-readable fictional scenario
```

## Limitations

- This is a deterministic single-scenario MVP, not a general document parser.
- Corrections and documents are embedded demo data; the interface does not yet accept uploads or free-form authoring.
- Rules are evaluated with explicit JavaScript predicates rather than semantic model calls.
- Persistence lasts for the displayed workflow only; there is no database, account system, collaboration layer, document-version store, or cryptographic audit log.
- The bounded repair is purpose-built for the three compiled controls and is not a substitute for professional review.
- Browser support assumes a current standards-based desktop or mobile browser.

## Privacy and anonymisation

The scenario, wording, measurements, document sections, reviewer role, and identifiers are fictional and anonymised. The repository contains no real people, organisations, regulators, case numbers, email addresses, private conversations, or confidential material.

The application performs no network requests, stores no personal data, and sends no content outside the browser. Refreshing or resetting clears the in-memory workflow state.

## Build Week demo sequence

For a concise Build Week demonstration:

1. establish the reviewer-memory problem on the original draft;
2. compile the expert correction and point to the ledger, rules, tests, and patch;
3. generate the intentional three-defect revision;
4. run tests and show the approval gate closing;
5. apply the bounded repair;
6. finish on `3/3 TESTS PASSED` and the approved final text.

The timed script in [`docs/demo-script.md`](docs/demo-script.md) completes this sequence in approximately 1 minute 50 seconds.
