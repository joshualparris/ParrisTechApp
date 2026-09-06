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
      console.log("5. Risk Acknowledgement Captured at", ack.signedAt);
    }
    
    // 6. JSON Export/Import
    const exportStr = window.exportAppState();
    console.log("6. Exported JSON Length:", exportStr.length);
    
    // Mess with it to test malformed handling
    const result = window.importAppState('{"malformed":', { overwrite: false });
    console.log("7. Malformed Import Result:", result.success === false ? "REJECTED CORRECTLY" : "ACCEPTED (BUG)");
    
    // Import valid
    const validResult = window.importAppState(exportStr, { overwrite: true });
    console.log("8. Valid Import Result:", validResult.success ? "ACCEPTED CORRECTLY" : "REJECTED (BUG)");

    // 9. Analytics
    const metrics = window.getAnalyticsMetrics();
    console.log("9. Analytics Sessions:", metrics.totalSessions, "Total Billed: $", metrics.totalBilled);
    
    if (metrics.totalBilled !== 89.99) {
      throw new Error("Total billed analytics incorrect! Expected 89.99, got " + metrics.totalBilled);
    }

    console.log("--- ALL RUNTIME TESTS PASSED ---");
    process.exit(0);
  } catch (e) {
    console.error("RUNTIME ERROR:", e);
    process.exit(1);
  }
}, 500);
