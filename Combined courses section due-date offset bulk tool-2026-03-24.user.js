// ==UserScript==
// @name         Combined courses section due-date offset bulk tool
// @version      2026-03-24
// @description  This will create section specific due dates based on the due date, or edit existing section specific due dates to match Hour offsets of courses requested -- from a defined base value.
// @author       Rob Solander +AI
// @match        https://*/courses/*/assignments
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instructure.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* eslint-disable no-console */
// Canvas LMS — Right-side floating UI to compute/apply per-section due date offsets for all assignments.
// - No access token; uses current browser session. Attempts CSRF via meta or cookies.
// - Panel shows ONLY on pages like: https://{your-canvas-domain}/courses/{courseId}/assignments
// - NEW: Only renders if the course has MULTIPLE sections (>1)
// - Preview button = dry-run (no writes). Run button = apply (writes).
// - Panel doubles width on hover; header controls aligned to the right.
// - Idempotent calculation, pagination, and basic 429/5xx retry logic.

(function () {
  // Require jQuery (Canvas typically includes it)
  if (typeof window.jQuery === "undefined") {
    console.error("jQuery is required. On most Canvas pages it's already loaded.");
    return;
  }
  const $ = window.jQuery;

  // --- Route guard: only on /courses/:id/assignments (and subpaths) ---------
  const onAssignmentsPage = /^\/courses\/\d+\/assignments(\/|$)/.test(window.location.pathname);
  if (!onAssignmentsPage) {
    console.info("Due Offsets panel only appears on /courses/:id/assignments pages.");
    return;
  }

  // --- CONFIG ---------------------------------------------------------------
  const CONFIG = {
    baseUrl: window.location.origin,
    courseId: (function () {
      const m = window.location.pathname.match(/\/courses\/(\d+)/);
      return m ? m[1] : "";
    })(),
    writeDelayMs: 100,    // delay between write ops (gentle on rate limiting)
    panelWidth: 380,      // base width; doubles on hover
    collapsedOffset: 44,  // visible tab when collapsed
  };

  if (!CONFIG.courseId) {
    console.warn("Could not detect courseId from URL. Open a /courses/:id page.");
    return;
  }

  // --- Minimal CSS (double width on hover + right-aligned header controls) ---
  const EXPANDED_WIDTH = CONFIG.panelWidth * 2;
  const styles = `
#dueOffsetsPanel {
  position: fixed;
  top: 80px;
  right: -${CONFIG.panelWidth - CONFIG.collapsedOffset}px;
  width: ${CONFIG.panelWidth}px;
  height: 70vh;
  background: #fff;
  color: #263238;
  border: 1px solid #cfd8dc;
  border-right: none;
  border-radius: 6px 0 0 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.16);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  z-index: 2147483647;
  transition: right 160ms ease-in-out, width 160ms ease-in-out;
  display: flex;
  flex-direction: column;
}
#dueOffsetsPanel:hover {
  right: 0;
  width: ${EXPANDED_WIDTH}px; /* double the base width when hovered */
}

#dueOffsetsPanel .handle {
  position: absolute;
  left: -${CONFIG.collapsedOffset}px;
  top: 20px;
  width: ${CONFIG.collapsedOffset}px;
  height: 120px;
  background: #1976d2;
  color: #fff;
  border-radius: 6px 0 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  user-select: none;
}

#dueOffsetsPanel header {
  padding: 10px 16px 6px 16px; /* extra padding to keep content in view */
  border-bottom: 1px solid #eceff1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
#dueOffsetsPanel header .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
#dueOffsetsPanel header .row.right { justify-content: flex-end; }
#dueOffsetsPanel header .title { font-weight: 600; color: #263238; }
#dueOffsetsPanel header label { font-size: 12px; color: #546e7a; }
#dueOffsetsPanel .btn {
  background: #1976d2; color: #fff; border: none; border-radius: 4px;
  padding: 6px 10px; font-size: 12px; cursor: pointer;
}
#dueOffsetsPanel .btn.secondary { background: #546e7a; }
#dueOffsetsPanel .btn.flat { background: #eceff1; color: #37474f; }

#dueOffsetsPanel .body { flex: 1 1 auto; overflow: auto; padding: 8px 12px; }
#dueOffsetsPanel .section-row {
  display: grid;
  grid-template-columns: 1fr 110px 40px;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #eceff1;
}
#dueOffsetsPanel .section-row .name { font-size: 13px; }
#dueOffsetsPanel .section-row input[type="number"] {
  width: 108px; padding: 4px 6px; border: 1px solid #cfd8dc; border-radius: 4px;
}
#dueOffsetsPanel .section-row input[type="checkbox"] { margin-right: 6px; }
#dueOffsetsPanel .section-row .base-mark {
  font-size: 11px; color: #1976d2; font-weight: 600; text-align: right;
}

#dueOffsetsPanel footer {
  padding: 8px 12px;
  border-top: 1px solid #eceff1;
  display: flex; flex-direction: column; gap: 8px;
}
#dueOffsetsPanel .log {
  background: #fafafa; border: 1px solid #eceff1; border-radius: 4px;
  padding: 6px 8px; height: 120px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px; white-space: pre-wrap;
}
#dueOffsetsPanel .progress { height: 6px; background: #eceff1; border-radius: 3px; overflow: hidden; }
#dueOffsetsPanel .progress > div { height: 100%; width: 0; background: #1976d2; transition: width 120ms linear; }
`;

  // --- Utilities: sleep, CSRF, logging, progress ----------------------------
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  function getCookie(name) {
    return document.cookie
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.startsWith(name + "="))
      .map((s) => decodeURIComponent(s.split("=").slice(1).join("=")))[0] || null;
  }
  function getCsrfToken() {
    const meta = $('meta[name="csrf-token"]').attr("content") || $('meta[name="csrf-token"]')[0]?.content;
    if (meta) return meta;
    return getCookie("_csrf_token") || getCookie("csrf_token") || null;
  }
  function toCanvasISO(date) {
    const z = date.toISOString();
    return z.replace(".000Z", "Z");
  }
  function parseCanvasISO(isoStr) {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) throw new Error("Invalid ISO datetime: " + isoStr);
    return d;
  }
  function log(msg, isError = false) {
    const $log = $("#logBox");
    const stamp = new Date().toLocaleTimeString();
    $log.append(document.createTextNode(`[${stamp}] ${msg}\n`));
    $log.scrollTop($log[0].scrollHeight);
    if (isError) console.error(msg); else console.log(msg);
  }
  function setProgress(pct) {
    $("#progressBar").css("width", `${Math.max(0, Math.min(100, pct))}%`);
  }
  function setSummary(text) {
    $("#summaryText").text(text || "");
  }

  // --- AJAX with retries using session cookies; CSRF if available -----------
  async function ajaxWithRetry(opts, maxRetries = 3) {
    const csrf = getCsrfToken();
    const needsCsrf = (opts.method || "GET").toUpperCase() !== "GET";
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const out = await new Promise((resolve, reject) => {
          $.ajax({
            method: opts.method || "GET",
            url: opts.url,
            data: opts.data,
            dataType: opts.dataType || "json",
            headers: {
              Accept: "application/json",
              ...(opts.headers || {}),
              ...(needsCsrf && csrf ? { "X-CSRF-Token": csrf } : {}),
            },
            xhrFields: { withCredentials: true },
          })
            .done((resp, textStatus, jqXHR) => resolve({ resp, jqXHR }))
            .fail((jqXHR, textStatus, errorThrown) => reject({ jqXHR, textStatus, errorThrown }));
        });
        return out;
      } catch (e) {
        const status = e?.jqXHR?.status;
        if (status === 429) {
          const retryAfter = parseInt(e.jqXHR.getResponseHeader("Retry-After") || "1", 10);
          const delay = Math.max(1000, retryAfter * 1000);
          console.warn(`429 rate-limited. Waiting ${delay} ms then retrying...`);
          await sleep(delay);
          continue;
        }
        if (status >= 500 && status < 600 && attempt < maxRetries) {
          const backoff = 1000 * Math.pow(2, attempt);
          console.warn(`Server error ${status}. Backing off ${backoff} ms (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(backoff);
          continue;
        }
        throw e;
      }
    }
    throw new Error("Exhausted retries");
  }

  // --- Canvas API helpers (pagination) --------------------------------------
  const apiUrl = (path) => `${CONFIG.baseUrl.replace(/\/$/, "")}${path}`;

  async function getAllPages(url, query) {
    const results = [];
    let nextUrl = url;
    let first = true;
    while (nextUrl) {
      const { resp, jqXHR } = await ajaxWithRetry({
        method: "GET",
        url: first && query ? `${nextUrl}${nextUrl.includes("?") ? "&" : "?"}${$.param(query)}` : nextUrl,
      });
      first = false;

      if (Array.isArray(resp)) {
        results.push(...resp);
      } else if (resp && Array.isArray(resp.items)) {
        results.push(...resp.items);
      } else {
        results.push(...(resp || []));
      }

      const link = jqXHR.getResponseHeader("Link");
      nextUrl = null;
      if (link) {
        const parts = link.split(",").map((s) => s.trim());
        for (const part of parts) {
          const m = part.match(/<([^>]+)>\s*;\s*rel="next"/);
          if (m) { nextUrl = m[1]; break; }
        }
      }
    }
    return results;
  }

  const getCourseSections = (courseId) =>
    getAllPages(apiUrl(`/api/v1/courses/${courseId}/sections`), { per_page: 100 });

  const getCourseAssignments = (courseId) =>
    getAllPages(apiUrl(`/api/v1/courses/${courseId}/assignments`), {
      per_page: 100,
      "include[]": "all_dates",
    });

  const getAssignmentOverrides = (courseId, assignmentId) =>
    getAllPages(apiUrl(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides`), { per_page: 100 });

  async function createAssignmentOverride(courseId, assignmentId, courseSectionId, dueAtIso) {
    const { resp } = await ajaxWithRetry({
      method: "POST",
      url: apiUrl(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides`),
      data: {
        "assignment_override[course_section_id]": courseSectionId,
        "assignment_override[due_at]": dueAtIso,
      },
      dataType: "json",
    });
    return resp;
  }

  async function updateAssignmentOverride(courseId, assignmentId, overrideId, dueAtIso) {
    const { resp } = await ajaxWithRetry({
      method: "PUT",
      url: apiUrl(`/api/v1/courses/${courseId}/assignments/${assignmentId}/overrides/${overrideId}`),
      data: { "assignment_override[due_at]": dueAtIso },
      dataType: "json",
    });
    return resp;
  }

  // --- Core logic ------------------------------------------------------------
  function determineBaseDueAt(assignment, overridesBySectionId, baseSectionId) {
    const baseOverride = overridesBySectionId.get(baseSectionId);
    if (baseOverride?.due_at) return baseOverride.due_at;
    return assignment.due_at || null;
  }

  // --- UI CSS & HTML injection ----------------------------------------------
  function ensurePanel() {
    if (!document.getElementById("dueOffsetsStyles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "dueOffsetsStyles";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    if (document.getElementById("dueOffsetsPanel")) return;

    const panel = $(`
      <aside id="dueOffsetsPanel" aria-label="Per-section due date offsets">
        <div class="handle" title="Hover to expand">Due Offsets</div>
        <header>
          <!-- Title row aligned further right -->
          <div class="row right">
            <span class="title">Per-section offsets</span>
          </div>
          <!-- Base selection row aligned further right -->
          <div class="row right">
            <label for="baseSectionSelect">Base section:</label>
            <select id="baseSectionSelect"></select>
            <button class="btn secondary" id="reloadSections" title="Reload sections">Reload</button>
          </div>
          <!-- Actions row -->
          <div class="row">
            <button class="btn" id="previewBtn" title="Dry-run (no changes)">Preview</button>
            <button class="btn" id="runBtn" title="Apply changes">Run</button>
            <span id="summaryText" style="margin-left:auto; font-size:12px; color:#455a64;"></span>
          </div>
        </header>
        <div class="body">
          <div id="sectionsContainer"></div>
        </div>
        <footer>
          <div class="progress"><div id="progressBar"></div></div>
          <div class="log" id="logBox" aria-live="polite"></div>
        </footer>
      </aside>
    `);
    $("body").append(panel);
  }

  // --- UI helpers ------------------------------------------------------------
  function renderSectionRows(sections) {
    const $container = $("#sectionsContainer").empty();
    const $baseSelect = $("#baseSectionSelect").empty();

    sections.forEach((s) => {
      $baseSelect.append(`<option value="${s.id}">${escapeHtml(s.name)}</option>`);
    });

    sections.forEach((s) => {
      const row = $(`
        <div class="section-row" data-section-id="${s.id}">
          <div class="name">
            <label><input type="checkbox" class="include" checked> ${escapeHtml(s.name)}</label>
          </div>
          <input type="number" class="offset" step="1" value="0" title="Offset hours relative to base section">
          <div class="base-mark"></div>
        </div>
      `);
      $container.append(row);
    });

    const markBase = () => {
      const baseId = $("#baseSectionSelect").val();
      $(".section-row .base-mark").text("");
      $(`.section-row[data-section-id="${baseId}"] .base-mark`).text("BASE");
    };
    $("#baseSectionSelect").off("change").on("change", markBase);
    markBase();
  }

  function getOffsetsFromUI() {
    const offsets = new Map();
    $(".section-row").each(function () {
      const secId = parseInt($(this).attr("data-section-id"), 10);
      const include = $(this).find(".include").prop("checked");
      const offset = parseFloat($(this).find(".offset").val());
      if (include) offsets.set(secId, isNaN(offset) ? 0 : offset);
    });
    const baseSectionId = parseInt($("#baseSectionSelect").val(), 10);
    return { offsets, baseSectionId };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  // --- Orchestration ---------------------------------------------------------
  async function initAndBind() {
    // 1) Pre-check: only render if there are MULTIPLE sections
    let sections = [];
    try {
      sections = await getCourseSections(CONFIG.courseId);
    } catch (e) {
      console.error("Could not load sections:", e);
      return;
    }
    if (!Array.isArray(sections) || sections.length <= 1) {
      console.info("Course has one or zero sections; Due Offsets panel will not be shown.");
      return;
    }

    // 2) Now that we know there are multiple sections, render the panel
    ensurePanel();

    // 3) Populate UI and wire up events
    log(`Loaded ${sections.length} sections.`);
    renderSectionRows(sections);

    $("#reloadSections").on("click", async function () {
      try {
        $(this).prop("disabled", true);
        const secs = await getCourseSections(CONFIG.courseId);
        renderSectionRows(secs);
        log(`Reloaded ${secs.length} sections.`);
      } finally { $(this).prop("disabled", false); }
    });

    // Buttons: Preview = dry-run; Run = apply (writes)
    $("#previewBtn").on("click", () => runOffsets(true));
    $("#runBtn").on("click", () => runOffsets(false));
  }

  /**
   * Run offsets across all assignments.
   * @param {boolean} dryRun - if true, simulate only; if false, perform writes
   */
  async function runOffsets(dryRun) {
    setProgress(0);
    const $logBox = $("#logBox");
    if ($logBox.length) $logBox.empty();

    const { offsets, baseSectionId } = getOffsetsFromUI();
    if (!baseSectionId) {
      log("Select a base section first.", true);
      return;
    }
    if (offsets.size === 0) {
      log("No sections selected.", true);
      return;
    }

    setSummary(dryRun ? "Previewing (dry-run)…" : "Applying changes…");

    log(`Fetching assignments…`);
    const assignments = await getCourseAssignments(CONFIG.courseId);
    log(`Assignments: ${assignments.length}`);

    let updatedOps = 0;
    let skippedNoBase = 0;
    let examined = 0;

    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      const assignmentId = a.id;
      const assignmentName = a.name;

      const overrides = await getAssignmentOverrides(CONFIG.courseId, assignmentId);
      const overridesBySectionId = new Map();
      const overridesById = new Map();
      for (const o of overrides) {
        if (o?.id != null) overridesById.set(o.id, o);
        if (o?.course_section_id != null) overridesBySectionId.set(o.course_section_id, o);
      }

      const baseDue = determineBaseDueAt(a, overridesBySectionId, baseSectionId);
      if (!baseDue) {
        log(`[SKIP] "${assignmentName}" has no base due_at`);
        skippedNoBase++;
        examined++;
        setProgress(((i + 1) / assignments.length) * 100);
        continue;
      }

      let baseDate;
      try { baseDate = parseCanvasISO(baseDue); }
      catch (e) {
        log(`[SKIP] "${assignmentName}" invalid base due_at: ${e.message}`);
        skippedNoBase++;
        examined++;
        setProgress(((i + 1) / assignments.length) * 100);
        continue;
      }

      log(`\nAssignment: ${assignmentName} (id=${assignmentId})`);
      log(`  Base due_at (section ${baseSectionId}): ${baseDue}`);

      for (const [secId, offsetHours] of offsets.entries()) {
        const targetDate = new Date(baseDate.getTime() + offsetHours * 60 * 60 * 1000);
        const targetIso = toCanvasISO(targetDate);
        const existing = overridesBySectionId.get(secId);
        const existingDue = existing?.due_at || null;

        let same = false;
        if (existingDue) {
          try { same = parseCanvasISO(existingDue).getTime() === parseCanvasISO(targetIso).getTime(); }
          catch { same = false; }
        }

        if (same) {
          log(`    = section ${secId}: already ${existingDue} (no change)`);
          continue;
        }

        if (dryRun) {
          log(`    WOULD ${existing ? "UPDATE" : "CREATE"}: section ${secId} -> due_at ${targetIso} (offset +${offsetHours}h)`);
        } else {
          try {
            if (existing) {
              await updateAssignmentOverride(CONFIG.courseId, assignmentId, existing.id, targetIso);
              log(`    UPDATED: section ${secId} -> due_at ${targetIso} (offset +${offsetHours}h)`);
            } else {
              await createAssignmentOverride(CONFIG.courseId, assignmentId, secId, targetIso);
              log(`    CREATED: section ${secId} -> due_at ${targetIso} (offset +${offsetHours}h)`);
            }
            updatedOps++;
            if (CONFIG.writeDelayMs) await sleep(CONFIG.writeDelayMs);
          } catch (err) {
            const status = err?.jqXHR?.status;
            log(`    FAILED ${existing ? "UPDATE" : "CREATE"} for section ${secId} (status ${status || "?"})`, true);
            if (status === 401 || status === 403) {
              log("    Tip: your Canvas may require CSRF. Run from the Assignments page and ensure you're logged in.", true);
            }
          }
        }
      }

      examined++;
      setProgress(((i + 1) / assignments.length) * 100);
    }

    log(`\n=== Summary ===`);
    log(`Assignments examined: ${examined}`);
    log(`Assignments skipped (no base due date): ${skippedNoBase}`);
    log(dryRun ? "Dry-run complete. No changes were saved." : `Done. Overrides created/updated: ${updatedOps}`);
    setSummary(dryRun ? "Preview complete" : "Apply complete");
  }

  // --- Start ---------------------------------------------------------------
  (async () => {
    try {
      await initAndBind(); // initAndBind will decide whether to render panel based on sections count
    } catch (err) {
      if (err?.jqXHR) {
        console.error("Request failed:", err.textStatus, err.errorThrown, err.jqXHR.responseText);
      } else {
        console.error(err);
      }
    }
  })();
})();
})();