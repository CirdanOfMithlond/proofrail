(function () {
  "use strict";

  const DEMO = Object.freeze({
    evidenceSentence: "The sampled quarterly recovery exercise restored the service in 28 minutes against an approved 45-minute tolerance.",
    frozenHeading: "4.3 Evidence summary",
    originalConclusion: "The recovery control is effective because the quarterly exercise was completed on schedule.",
    approvedConclusion: "The recovery control is assessed as effective because restoration completed within the approved tolerance, reducing the likelihood that an interruption would exceed the service limit. Supporting evidence is recorded in §4.3.",
    documents: Object.freeze({
      original: Object.freeze({
        version: "ORIGINAL v1",
        sections: Object.freeze([
          Object.freeze({ id: "4.2", heading: "4.2 Control evaluation", body: "The recovery control is effective because the quarterly exercise was completed on schedule." }),
          Object.freeze({ id: "4.3", heading: "4.3 Evidence summary", body: "The sampled quarterly recovery exercise restored the service in 28 minutes against an approved 45-minute tolerance." })
        ])
      }),
      defective: Object.freeze({
        version: "DEFECTIVE v2",
        sections: Object.freeze([
          Object.freeze({ id: "4.2", heading: "4.2 Control evaluation", body: "The recovery control is effective. The sampled quarterly recovery exercise restored the service in 28 minutes against an approved 45-minute tolerance." }),
          Object.freeze({ id: "4.3", heading: "4.3 Test evidence", body: "The sampled quarterly recovery exercise restored the service in 28 minutes against an approved 45-minute tolerance." })
        ])
      })
    }),
    rules: Object.freeze([
      Object.freeze({ id: "R-01", title: "Reasoned effectiveness conclusion", type: "semantic", text: "An effectiveness conclusion must link the observed result to the controlled risk; completion alone is insufficient." }),
      Object.freeze({ id: "R-02", title: "Single evidence location", type: "content", text: "Substantive recovery evidence belongs in §4.3 and must not be duplicated in §4.2." }),
      Object.freeze({ id: "R-03", title: "Frozen evidence heading", type: "structure", text: "The heading “4.3 Evidence summary” is immutable during revision and repair." })
    ]),
    tests: Object.freeze([
      Object.freeze({ id: "T-01", title: "Reasoning link present", pending: "Checks conclusion → evidence → risk reasoning." }),
      Object.freeze({ id: "T-02", title: "No substantive duplication", pending: "Checks that evidence occurs in one controlled location." }),
      Object.freeze({ id: "T-03", title: "Frozen heading preserved", pending: "Checks the exact approved heading text." })
    ]),
    patch: Object.freeze({
      current: "The recovery control is effective because the quarterly exercise was completed on schedule.",
      replacement: "The recovery control is assessed as effective because restoration completed within the approved tolerance, reducing the likelihood that an interruption would exceed the service limit. Supporting evidence is recorded in §4.3.",
      reason: "Completion is not evidence of effectiveness. The replacement states the observed threshold, links it to interruption risk, and leaves the underlying evidence in its controlled section."
    })
  });

  const TEST_DETAILS = Object.freeze({
    "T-01": Object.freeze({
      pass: "Causal link connects tolerance performance to interruption risk.",
      fail: "Conclusion states effectiveness but omits the required causal reasoning."
    }),
    "T-02": Object.freeze({
      pass: "Substantive evidence appears once, in §4.3 only.",
      fail: "The same substantive evidence appears in both §4.2 and §4.3."
    }),
    "T-03": Object.freeze({
      pass: "Exact heading “4.3 Evidence summary” is preserved.",
      fail: "Frozen heading changed to “4.3 Test evidence”."
    })
  });

  const AUDIT_SEED = Object.freeze({
    time: "00:00",
    title: "Source loaded",
    detail: "Original v1 and reviewer correction registered.",
    tone: "neutral"
  });

  const elements = {};
  let repairTimer = null;
  let state = createInitialState();

  function createInitialState() {
    return {
      phase: "ready",
      compiled: false,
      document: cloneDocument(DEMO.documents.original),
      results: null,
      audit: [{ ...AUDIT_SEED }]
    };
  }

  function cloneDocument(document) {
    return {
      version: document.version,
      sections: document.sections.map((section) => ({ ...section }))
    };
  }

  function normalise(text) {
    return text.toLowerCase().replace(/[^a-z0-9§.]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function validateDocument(document) {
    const evaluation = document.sections.find((section) => section.id === "4.2");
    const evidence = document.sections.find((section) => section.id === "4.3");
    const evaluationText = normalise(evaluation ? evaluation.body : "");
    const allText = normalise(document.sections.map((section) => section.body).join(" | "));
    const evidenceNeedle = normalise(DEMO.evidenceSentence);
    const evidenceOccurrences = allText.split(evidenceNeedle).length - 1;

    return [
      {
        id: "T-01",
        passed: evaluationText.includes("because restoration completed within the approved tolerance") &&
          evaluationText.includes("reducing the likelihood that an interruption would exceed the service limit")
      },
      {
        id: "T-02",
        passed: evidenceOccurrences === 1 && Boolean(evidence) && normalise(evidence.body).includes(evidenceNeedle)
      },
      {
        id: "T-03",
        passed: Boolean(evidence) && evidence.heading === DEMO.frozenHeading
      }
    ];
  }

  function applyBoundedRepair(document, results) {
    const repaired = cloneDocument(document);
    const evaluation = repaired.sections.find((section) => section.id === "4.2");
    const evidence = repaired.sections.find((section) => section.id === "4.3");
    const failures = new Set(results.filter((result) => !result.passed).map((result) => result.id));

    if ((failures.has("T-01") || failures.has("T-02")) && evaluation) {
      evaluation.body = DEMO.approvedConclusion;
    }

    if (failures.has("T-03") && evidence) {
      evidence.heading = DEMO.frozenHeading;
    }

    repaired.version = "APPROVED v3";
    return repaired;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cacheElements() {
    [
      "stateBadge", "resetButton", "documentVersion", "approvalBadge", "documentSurface", "changeBoundary",
      "compileButton", "revisionButton", "testButton", "repairButton", "nextActionLabel", "nextActionText",
      "outcomeBanner", "outcomeTitle", "outcomeText", "outcomeCode", "ledgerCount", "ledgerContent",
      "ruleCount", "rulesContent", "testScore", "testsContent", "patchState", "patchContent",
      "auditCount", "auditTrail", "liveRegion"
    ].forEach((id) => {
      elements[id] = document.getElementById(id);
    });
    elements.steps = Array.from(document.querySelectorAll(".step"));
  }

  function bindEvents() {
    elements.compileButton.addEventListener("click", compileCorrection);
    elements.revisionButton.addEventListener("click", runRevision);
    elements.testButton.addEventListener("click", runRegressionTests);
    elements.repairButton.addEventListener("click", beginRepair);
    elements.resetButton.addEventListener("click", resetDemo);
  }

  function compileCorrection() {
    if (state.phase !== "ready") return;
    state.compiled = true;
    state.phase = "compiled";
    state.audit.push({
      time: "00:08",
      title: "Correction compiled",
      detail: "One decision, three rules, and three tests persisted.",
      tone: "neutral"
    });
    announce("Correction compiled. Three persistent constraints are ready.");
    render();
  }

  function runRevision() {
    if (state.phase !== "compiled") return;
    state.document = cloneDocument(DEMO.documents.defective);
    state.phase = "revision";
    state.results = null;
    state.audit.push({
      time: "00:17",
      title: "Defective revision generated",
      detail: "Reasoning omitted, evidence duplicated, heading altered.",
      tone: "neutral"
    });
    announce("Defective revision generated. Regression tests are ready to run.");
    render();
  }

  function runRegressionTests() {
    if (state.phase !== "revision") return;
    state.results = validateDocument(state.document);
    const failures = state.results.filter((result) => !result.passed).length;
    state.phase = failures === 0 ? "passed" : "failed";
    state.audit.push({
      time: "00:23",
      title: failures ? "Revision blocked" : "Revision approved",
      detail: failures ? `${failures} regression controls failed; approval gate closed.` : "All regression controls passed.",
      tone: failures ? "failed" : "passed"
    });
    announce(failures ? `Revision blocked. ${failures} regression tests failed.` : "All regression tests passed.");
    render();
  }

  function beginRepair() {
    if (state.phase !== "failed") return;
    state.phase = "repairing";
    announce("Bounded repair in progress.");
    render();

    repairTimer = window.setTimeout(() => {
      state.document = applyBoundedRepair(state.document, state.results);
      state.results = validateDocument(state.document);
      state.phase = state.results.every((result) => result.passed) ? "passed" : "failed";
      state.audit.push({
        time: "00:31",
        title: state.phase === "passed" ? "Bounded repair approved" : "Repair held",
        detail: state.phase === "passed"
          ? "Only failed elements changed; all 3 controls now pass."
          : "One or more controls still fail; approval remains blocked.",
        tone: state.phase === "passed" ? "passed" : "failed"
      });
      repairTimer = null;
      announce(state.phase === "passed" ? "Repair complete. Three of three tests passed. Final text approved." : "Repair complete but controls still fail.");
      render();
    }, 700);
  }

  function resetDemo() {
    if (repairTimer !== null) {
      window.clearTimeout(repairTimer);
      repairTimer = null;
    }
    state = createInitialState();
    announce("Demo reset. Source draft is ready.");
    render();
  }

  function render() {
    renderState();
    renderDocument();
    renderControls();
    renderOutcome();
    renderLedger();
    renderRules();
    renderTests();
    renderPatch();
    renderAudit();
    renderStepper();
  }

  function renderState() {
    const labels = {
      ready: "READY",
      compiled: "COMPILED",
      revision: "COMPILED",
      failed: "FAILED",
      repairing: "REPAIRING",
      passed: "3/3 TESTS PASSED"
    };
    const classes = {
      ready: "state-ready",
      compiled: "state-compiled",
      revision: "state-compiled",
      failed: "state-failed",
      repairing: "state-repairing",
      passed: "state-passed"
    };
    elements.stateBadge.textContent = labels[state.phase];
    elements.stateBadge.className = `state-badge ${classes[state.phase]}`;
  }

  function renderDocument() {
    const isDefective = state.phase === "revision" || state.phase === "failed" || state.phase === "repairing";
    const isRepaired = state.phase === "passed";
    elements.documentVersion.textContent = state.document.version;
    elements.documentSurface.innerHTML = state.document.sections.map((section, index) => {
      const headingChanged = isDefective && index === 1;
      const bodyChanged = isDefective || (isRepaired && index === 0);
      const repaired = isRepaired && (index === 0 || index === 1);
      const headingClass = headingChanged ? "changed" : repaired && index === 1 ? "repaired" : "";
      const bodyClass = bodyChanged ? (repaired ? "repaired" : "changed") : "";
      const chip = headingChanged ? "<span class=\"change-chip\">Frozen rule changed</span>" : repaired && index === 1 ? "<span class=\"change-chip\">Restored</span>" : "";
      return `<section aria-label="Section ${escapeHTML(section.id)}">
        <div class="document-heading ${headingClass}"><span>${escapeHTML(section.heading)}</span>${chip}</div>
        <p class="${bodyClass}">${escapeHTML(section.body)}</p>
      </section>`;
    }).join("");

    elements.changeBoundary.hidden = !(isDefective || isRepaired);
    elements.approvalBadge.className = "approval-badge";
    if (state.phase === "failed" || state.phase === "repairing") {
      elements.approvalBadge.textContent = state.phase === "repairing" ? "REPAIR IN PROGRESS" : "BLOCKED";
      elements.approvalBadge.classList.add("is-blocked");
    } else if (state.phase === "passed") {
      elements.approvalBadge.textContent = "APPROVED";
      elements.approvalBadge.classList.add("is-approved");
    } else {
      elements.approvalBadge.textContent = state.phase === "revision" ? "AWAITING TESTS" : "NOT ASSESSED";
      elements.approvalBadge.classList.add("is-neutral");
    }
  }

  function renderControls() {
    elements.compileButton.disabled = state.phase !== "ready";
    elements.revisionButton.disabled = state.phase !== "compiled";
    elements.testButton.disabled = state.phase !== "revision";
    elements.repairButton.disabled = state.phase !== "failed";

    const copy = {
      ready: ["NEXT CONTROL", "Compile the expert correction into durable controls."],
      compiled: ["CONTROLS PERSISTED", "Generate the deliberately defective revision."],
      revision: ["REVISION READY", "Run the compiled controls before approval."],
      failed: ["APPROVAL BLOCKED", "Repair only the three failed elements."],
      repairing: ["CHANGE BOUNDARY ACTIVE", "Applying the smallest permitted repair…"],
      passed: ["APPROVAL GATE OPEN", "Final text is approved; reset to replay the demo."]
    }[state.phase];
    elements.nextActionLabel.textContent = copy[0];
    elements.nextActionText.textContent = copy[1];
  }

  function renderOutcome() {
    const showFailure = state.phase === "failed";
    const showPass = state.phase === "passed";
    elements.outcomeBanner.hidden = !(showFailure || showPass);
    elements.outcomeBanner.classList.toggle("is-passed", showPass);
    if (showFailure) {
      elements.outcomeBanner.querySelector(".outcome-icon").textContent = "!";
      elements.outcomeTitle.textContent = "Revision blocked by persistent constraints";
      elements.outcomeText.textContent = "Reasoning is missing, evidence is duplicated, and a frozen heading has changed. No other content may be altered during repair.";
      elements.outcomeCode.textContent = "GATE CLOSED";
    } else if (showPass) {
      elements.outcomeBanner.querySelector(".outcome-icon").textContent = "✓";
      elements.outcomeTitle.textContent = "Approved final text";
      elements.outcomeText.textContent = "The bounded repair changed only the failed elements. The same three regression controls now pass.";
      elements.outcomeCode.textContent = "GATE OPEN";
    }
  }

  function renderLedger() {
    if (!state.compiled) {
      elements.ledgerCount.textContent = "0 DECISIONS";
      elements.ledgerContent.className = "empty-state";
      elements.ledgerContent.innerHTML = "<span aria-hidden=\"true\">◇</span><p>No persistent decisions compiled.</p>";
      return;
    }
    elements.ledgerCount.textContent = "1 DECISION";
    elements.ledgerContent.className = "ledger-record";
    elements.ledgerContent.innerHTML = `
      <div class="ledger-topline"><span class="decision-id">DECISION-A</span><span class="enforced-label">● ENFORCED</span></div>
      <div class="ledger-grid">
        <div class="ledger-field wide"><span class="ledger-label">Persistent decision rule</span><p>Effectiveness claims require causal reasoning; evidence remains singular and approved structure remains frozen.</p></div>
        <div class="ledger-field"><span class="ledger-label">Applies to</span><p>All subsequent revisions of §4.2–§4.3</p></div>
        <div class="ledger-field"><span class="ledger-label">Provenance</span><p>Expert correction · control run DEMO-A</p></div>
        <div class="ledger-field"><span class="ledger-label">Repair authority</span><p>Failed elements only</p></div>
        <div class="ledger-field"><span class="ledger-label">Frozen asset</span><p>“${escapeHTML(DEMO.frozenHeading)}”</p></div>
      </div>`;
  }

  function renderRules() {
    if (!state.compiled) {
      elements.ruleCount.textContent = "0 RULES";
      elements.rulesContent.className = "empty-state";
      elements.rulesContent.innerHTML = "<span aria-hidden=\"true\">{ }</span><p>Rules will appear after compilation.</p>";
      return;
    }
    elements.ruleCount.textContent = "3 RULES";
    elements.rulesContent.className = "";
    elements.rulesContent.innerHTML = `<ol class="rules-list">${DEMO.rules.map((rule) => `
      <li class="rule-item">
        <span class="rule-id">${escapeHTML(rule.id)}</span>
        <div><strong>${escapeHTML(rule.title)}</strong><p>${escapeHTML(rule.text)}</p></div>
        <span class="rule-type">${escapeHTML(rule.type)}</span>
      </li>`).join("")}</ol>`;
  }

  function renderTests() {
    const resultsById = new Map((state.results || []).map((result) => [result.id, result]));
    const passed = state.results ? state.results.filter((result) => result.passed).length : 0;
    elements.testScore.className = "test-score";
    if (!state.results) {
      elements.testScore.textContent = state.compiled ? "0/3 READY" : "0/3 PENDING";
      elements.testScore.classList.add("is-pending");
    } else if (passed === 3) {
      elements.testScore.textContent = "3/3 TESTS PASSED";
      elements.testScore.classList.add("is-passed");
    } else {
      elements.testScore.textContent = `${passed}/3 TESTS PASSED`;
      elements.testScore.classList.add("is-failed");
    }

    elements.testsContent.innerHTML = DEMO.tests.map((test) => {
      const result = resultsById.get(test.id);
      const rowClass = !result ? "is-pending" : result.passed ? "is-passed" : "is-failed";
      const indicator = !result ? "·" : result.passed ? "✓" : "×";
      const resultLabel = !result ? (state.compiled ? "READY" : "LOCKED") : result.passed ? "PASS" : "FAIL";
      const detail = !result ? test.pending : TEST_DETAILS[test.id][result.passed ? "pass" : "fail"];
      return `<div class="test-row ${rowClass}" data-test-id="${escapeHTML(test.id)}">
        <span class="test-indicator" aria-hidden="true">${indicator}</span>
        <span class="test-id">${escapeHTML(test.id)}</span>
        <div class="test-copy"><strong>${escapeHTML(test.title)}</strong><p>${escapeHTML(detail)}</p></div>
        <span class="test-result">${resultLabel}</span>
      </div>`;
    }).join("");
  }

  function renderPatch() {
    if (!state.compiled) {
      elements.patchState.textContent = "NOT COMPILED";
      elements.patchContent.className = "empty-state";
      elements.patchContent.innerHTML = "<span aria-hidden=\"true\">±</span><p>The traceable wording patch will appear here.</p>";
      return;
    }
    elements.patchState.textContent = state.phase === "passed" ? "APPLIED" : "CONTROLLED";
    elements.patchContent.className = "patch-content";
    elements.patchContent.innerHTML = `
      <div class="patch-block current"><span class="patch-label">Current wording</span><p>${escapeHTML(DEMO.patch.current)}</p></div>
      <div class="patch-block replacement"><span class="patch-label">Replacement wording</span><p>${escapeHTML(DEMO.patch.replacement)}</p></div>
      <div class="patch-block reason"><span class="patch-label">Reason</span><p>${escapeHTML(DEMO.patch.reason)}</p></div>`;
  }

  function renderAudit() {
    elements.auditCount.textContent = `${state.audit.length} ${state.audit.length === 1 ? "EVENT" : "EVENTS"}`;
    elements.auditTrail.innerHTML = state.audit.map((entry) => `
      <li class="audit-entry is-${escapeHTML(entry.tone)}">
        <span class="audit-dot" aria-hidden="true"></span>
        <div class="audit-copy"><span class="audit-time">${escapeHTML(entry.time)}</span><strong>${escapeHTML(entry.title)}</strong><span>${escapeHTML(entry.detail)}</span></div>
      </li>`).join("");
  }

  function renderStepper() {
    const activeByPhase = { ready: 1, compiled: 2, revision: 3, failed: 4, repairing: 5, passed: 5 };
    const active = activeByPhase[state.phase];
    elements.steps.forEach((step, index) => {
      const number = index + 1;
      step.classList.toggle("is-active", number === active);
      step.classList.toggle("is-complete", number < active || (state.phase === "passed" && number === 5));
    });
  }

  function announce(message) {
    elements.liveRegion.textContent = "";
    window.setTimeout(() => {
      elements.liveRegion.textContent = message;
    }, 20);
  }

  function initialise() {
    cacheElements();
    bindEvents();
    render();
    window.ProofRail = Object.freeze({
      demo: DEMO,
      validateDocument,
      applyBoundedRepair,
      getState: () => ({
        phase: state.phase,
        compiled: state.compiled,
        document: cloneDocument(state.document),
        results: state.results ? state.results.map((result) => ({ ...result })) : null
      })
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
}());
