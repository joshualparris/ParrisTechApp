console.log("STARTING TEST");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf-8");
const appJs = fs.readFileSync("app.js", "utf-8");

const dom = new (require("jsdom")).JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });
const window = dom.window;
const document = window.document;

// Setup localStorage polyfill for JSDOM
let store = {};
window.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => store[k] = v,
  removeItem: (k) => delete store[k],
  clear: () => store = {}
};
window.HTMLElement.prototype.scrollIntoView = function() {};

// Evaluate app.js
const scriptEl = document.createElement("script");
scriptEl.textContent = appJs;
document.body.appendChild(scriptEl);

setTimeout(() => {
  try {
    console.log("--- PARRISTECHAPP RUNTIME TEST ---");
    
    // 1. Create a session
    const session = window.createSession({
      clientName: "Test Client",
      devices: ["windows"],
      goals: ["runs-faster"],
      sessionLength: 60
    });
    console.log("1. Created Session:", session.id);
    
    // 2. Select the session
    const activeSession = window.getActiveSession();
    console.log("2. Active Session Client:", activeSession.clientName);
    
    if (!activeSession.items || activeSession.items.length === 0) {
      throw new Error("No checklist items generated.");
    }
    
    // 3. Complete a step
    const item = activeSession.items[0];
    if (!item.step) throw new Error("checklist item has no step label");
    item.status = "done";
    console.log(`3. Marked step '${item.step}' as done.`);
    
    // 4. Billing/Invoice line
    item.invoice = { desc: 'Performance tune-up', amount: 89.99 };
    window.syncInvoiceLines && window.syncInvoiceLines(activeSession);
    console.log("4. Invoice line added.");
    
    // 5. Risk Acknowledgement
    if (window.captureClientAcknowledgement) {
      const ack = window.captureClientAcknowledgement(session.id, { clientName: 'Test Client', signatureText: 'Signed TS' });
      if (!ack || !ack.signedAt) throw new Error("acknowledgement did not record signedAt");
      console.log("5. Risk Acknowledgement Captured at", ack.signedAt);
    }

    // 6. JSON Export/Import
    const exportStr = window.exportAppState();
    if (typeof exportStr !== "string" || exportStr.length === 0) {
      throw new Error("exportAppState returned no data");
    }
    JSON.parse(exportStr); // throws if the export is not valid JSON
    console.log("6. Exported JSON Length:", exportStr.length);

    // 7. Malformed input must be rejected, not merely reported
    for (const junk of ['{"malformed":', "", "null", "[]", '{"sessions":"nope"}']) {
      const bad = window.importAppState(junk, { overwrite: false });
      if (!bad || bad.success !== false) {
        throw new Error(`importAppState accepted malformed payload: ${JSON.stringify(junk)}`);
      }
    }
    console.log("7. Malformed Import Result: REJECTED CORRECTLY (5 payloads)");

    // 8. A valid round-trip must be accepted
    const validResult = window.importAppState(exportStr, { overwrite: true });
    if (!validResult || validResult.success !== true) {
      throw new Error("importAppState rejected its own export");
    }
    console.log("8. Valid Import Result: ACCEPTED CORRECTLY");

    // 9. Analytics
    const metrics = window.getAnalyticsMetrics();
    console.log("9. Analytics Sessions:", metrics.totalSessions, "Total Billed: $", metrics.totalBilled);
    
    if (metrics.totalBilled !== 89.99) {
      throw new Error("Total billed analytics incorrect! Expected 89.99, got " + metrics.totalBilled);
    }
    if (metrics.totalSessions !== 1) {
      throw new Error("Expected 1 session, got " + metrics.totalSessions);
    }
    if (!Number.isFinite(metrics.avgDurationMins)) {
      throw new Error("avgDurationMins is not a number: " + metrics.avgDurationMins);
    }

    console.log("--- ALL RUNTIME TESTS PASSED ---");
    process.exit(0);
  } catch (e) {
    console.error("RUNTIME ERROR:", e);
    process.exit(1);
  }
}, 500);
