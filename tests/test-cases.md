# ProofRail regression test cases

These tests are compiled from the fictional expert correction in control run `DEMO-A`. They run against the in-memory revision whenever **Run Regression Tests** is selected and again automatically after a bounded repair.

## T-01 — Reasoning link present

**Purpose:** Prevent an effectiveness conclusion based on activity completion alone.

**Trigger condition:** Evaluate every revision containing the §4.2 control-effectiveness conclusion.

**Validation rule:** The §4.2 body must state that restoration completed within the approved tolerance **and** connect that result to a reduced likelihood that an interruption exceeds the service limit.

**Expected failure in defective revision:**

> The recovery control is effective.

The statement asserts the conclusion but provides no causal path from observed evidence to controlled risk.

**Passing condition:** §4.2 contains the approved reasoning chain: observed restoration within tolerance → reduced likelihood of exceeding the service limit.

**Bounded repair authority:** Replace the defective §4.2 conclusion. Do not alter the §4.3 evidence sentence or unrelated structure.

## T-02 — No substantive duplication

**Purpose:** Keep evidence traceable and prevent repeated substantive content from drifting across sections.

**Trigger condition:** Evaluate all §4.2 and §4.3 body text when either section changes.

**Validation rule:** The substantive sentence about the sampled quarterly recovery exercise must occur exactly once in the controlled document and that occurrence must be in §4.3.

**Expected failure in defective revision:** The identical 28-minute / 45-minute evidence sentence appears in both §4.2 and §4.3.

**Passing condition:** The evidence sentence occurs once in §4.3, while §4.2 refers to supporting evidence without reproducing it.

**Bounded repair authority:** Remove the duplicate from §4.2 by restoring the approved conclusion. Preserve the single §4.3 evidence sentence exactly.

## T-03 — Frozen heading preserved

**Purpose:** Protect an approved structural label from revision drift.

**Trigger condition:** Evaluate every revision or repair touching §4.3 or its neighbouring sections.

**Validation rule:** The §4.3 heading must exactly equal `4.3 Evidence summary`, including numbering, capitalisation, and spacing.

**Expected failure in defective revision:** The heading is changed to `4.3 Test evidence`.

**Passing condition:** The heading exactly matches `4.3 Evidence summary`.

**Bounded repair authority:** Restore only the heading string. Do not change the §4.3 evidence body.

## Expected end-to-end result

| Stage | T-01 | T-02 | T-03 | Approval |
|---|---|---|---|---|
| Defective revision before test | Not run | Not run | Not run | Awaiting tests |
| Defective revision after test | Fail | Fail | Fail | Blocked |
| Bounded repair after automatic re-test | Pass | Pass | Pass | Approved |

The approval gate opens only when all three results are `Pass`. A partial pass remains blocked.
