# ProofRail two-minute demo script

Target duration: **1 minute 50 seconds**. Start with the page freshly loaded at `READY`.

| Time | Visual action | Spoken script |
|---|---|---|
| 0:00–0:13 | Point to **Source Draft** and **Expert Correction**. | “Professional documents change repeatedly, but expert corrections are usually trapped in comments or memory. ProofRail makes each correction a permanent, testable constraint.” |
| 0:13–0:27 | Indicate §4.2, §4.3, and the correction. | “This fictional assessment concludes that a recovery control is effective. The reviewer requires real causal reasoning, says the evidence must appear only once, and freezes the approved evidence heading.” |
| 0:27–0:45 | Select **Compile Correction**. Point to **Decision Ledger**, **Compiled Rules**, **Regression Tests**, then **Controlled Patch**. | “One click compiles that correction into a persistent ledger decision, three scoped rules, three regression tests, and a traceable patch containing the current wording, replacement wording, and reason.” |
| 0:45–0:57 | Select **Run Revision**. Point to the red-marked conclusion, duplicated evidence, and changed heading. | “Now I generate a deliberately defective revision. It drops the reasoning, repeats substantive evidence, and changes a frozen structural rule.” |
| 0:57–1:12 | Select **Run Regression Tests**. Point to `FAILED`, the three failed rows, and `GATE CLOSED`. | “The same controls run before approval. All three defects are detected, the revision is blocked, and ProofRail records exactly why it failed.” |
| 1:12–1:29 | Select **Apply Bounded Repair**. Briefly point to `REPAIRING` and the repair-boundary note. | “The repair is bounded by those failures. It may restore the missing reasoning, remove the duplicate, and reinstate the frozen heading—nothing else.” |
| 1:29–1:43 | Point to `3/3 TESTS PASSED`, `APPROVED v3`, the green final wording, and `GATE OPEN`. | “ProofRail re-runs the identical tests. Three of three pass, the final wording is approved, and the audit trail shows the complete control path.” |
| 1:43–1:50 | Point to **Reset Demo**; optionally select it after the closing line. | “Every correction becomes a permanent constraint—and every future revision has to prove it still complies.” |

## Presenter checks

- Keep the browser wide enough for the two-column source view.
- Pause briefly after **Apply Bounded Repair** so the `REPAIRING` state is visible.
- Do not scroll past the current point until the referenced panel is on screen.
- If rehearsing again, select **Reset Demo** and confirm `READY` before restarting.
