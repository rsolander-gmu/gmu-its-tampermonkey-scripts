// ==UserScript==
// @name         Canvas API Enroll (Courses/Sections)
// @version      2026-03-25
// @description  Will enroll via API rather than SIS, takes standard feed file varialbes, doesn't need active, only course,user, and role - Runs multithreadx6
// @author       Rob Solander
// @match        https://*.instructure.com/accounts/1/sis_import
// @match        https://canvas.*/accounts/1/sis_import
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instructure.com
// @downloadURL  https://mason.gmu.edu/~rsolande/Canvas API Enroll (Courses-Sections).user.js
// @updateURL    https://mason.gmu.edu/~rsolande/Canvas API Enroll (Courses-Sections).user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    (() => {
  // ======================================
  // RUN ONLY ON SIS ADMIN PAGES
  // ======================================
  if (!/\/accounts\/\d+\/sis_import/.test(location.pathname)) {
    console.warn("CSV API Enrollment: Not on SIS Admin page.");
    return;
  }
  const CONCURRENCY = 6; // Safe Canvas default
  const BASE_URL = location.origin;

  // ======================================
  // ROLE MAP
  // ======================================
  const roleMap = {
    student: "StudentEnrollment",
    teacher: "TeacherEnrollment",
    ta: "TaEnrollment",
    observer: "ObserverEnrollment"
  };

  // ======================================
  // STYLES
  // ======================================
  const style = document.createElement("style");
  style.textContent = `
    #csvApiEnrollMenu {
      position: fixed;
      top: 170px; /* 50px lower than before */
      right: -408px; /* 450px - tab width */
      width: 450px;
      background: #27323a;
      color: #fff;
      padding: 16px;
      z-index: 9999;
      border-radius: 10px 0 0 10px;
      transition: right .25s ease;
      font-family: Arial, sans-serif;
      box-shadow: -2px 2px 12px rgba(0,0,0,0.45);
    }

    #csvApiEnrollMenu:hover { right: 0; }

    #csvApiEnrollTab {
      position: absolute;
      left: -42px;
      top: 10px;
      width: 42px;
      height: 160px;
      background: #27323a;
      writing-mode: vertical-rl;
      text-align: center;
      font-weight: bold;
      cursor: pointer;
      border-radius: 10px 0 0 10px;
      line-height: 42px;
      letter-spacing: 1px;
    }

    #csvApiEnrollMenu h3 {
      margin-top: 0;
    }

    #csvApiEnrollMenu input,
    #csvApiEnrollMenu button {
      width: 100%;
      margin-top: 10px;
    }

    #csvApiEnrollLog {
      margin-top: 12px;
      max-height: 260px;
      overflow-y: auto;
      background: #1a2228;
      font-size: 12px;
      padding: 8px;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  // ======================================
  // HTML
  // ======================================
  const menu = document.createElement("div");
  menu.id = "csvApiEnrollMenu";
  menu.innerHTML = `
    <div id="csvApiEnrollTab">API Enroll</div>
    <h3>CSV API Enrollment</h3>
    <input type="file" id="csvFileInput" accept=".csv" />
    <button id="csvEnrollStart">Enroll Users</button>
    <div id="csvApiEnrollLog"></div>
  `;
  document.body.appendChild(menu);

  const log = (msg, ok = true) => {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.color = ok ? "#9be09b" : "#ff9b9b";
    const box = document.getElementById("csvApiEnrollLog");
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  };

  // ======================================
  // CSV PARSER
  // ======================================

function parseCSV(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  const headers = lines.shift().split(",").map(h => h.trim());

  const ci = headers.indexOf("course_id");
  const si = headers.indexOf("section_id");
  const ui = headers.indexOf("user_id");
  const ri = headers.indexOf("role");

  if (ui === -1 || ri === -1 || (ci === -1 && si === -1)) {
    alert("CSV must contain user_id, role, and either course_id or section_id.");
    return [];
  }

  return lines
    .map(line => {
      const cols = line.split(",");
      return {
        course_id: ci !== -1 ? cols[ci]?.trim() : null,
        section_id: si !== -1 ? cols[si]?.trim() : null,
        user_id: cols[ui]?.trim(),
        role: cols[ri]?.trim()
      };
    })
    .filter(r =>
      r.user_id &&
      r.role &&
      (r.section_id || r.course_id)
    );
}

  // ======================================
  // ENROLL VIA SIS USER ID
  // ======================================

async function enroll(row) {
  const { course_id, section_id, user_id: sisUserId, role } = row;

  try {
    // -------------------------------------
    // Resolve SIS user → Canvas user ID
    // -------------------------------------
    const userRes = await fetch(
      `${BASE_URL}/api/v1/users/sis_user_id:${encodeURIComponent(sisUserId)}`,
      { credentials: "same-origin" }
    );

    if (!userRes.ok) throw `User not found: ${sisUserId}`;
    const user = await userRes.json();

    // -------------------------------------
    // CSRF token (Canvas UI style)
    // -------------------------------------
    const csrfToken = decodeURIComponent(
      (document.cookie.match("(^|;)\\s*_csrf_token=([^;]*)") || [])[2] || ""
    );

    // -------------------------------------
    // Enrollment payload
    // -------------------------------------
    const payload = {
      enrollment: {
        user_id: user.id,
        enrollment_state: "active",
        reenroll: true,
        notify: false
      }
    };

    const roleType = roleMap[role.toLowerCase()];
    if (roleType) payload.enrollment.type = roleType;
    else payload.enrollment.role_id = role;

    // -------------------------------------
    // Choose endpoint (section preferred)
    // -------------------------------------
    const endpoint = section_id
      ? `${BASE_URL}/api/v1/sections/${section_id}/enrollments`
      : `${BASE_URL}/api/v1/courses/sis_course_id:${course_id}/enrollments`;

    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw err?.errors?.[0]?.message || JSON.stringify(err);
    }

    log(
      `✅ ${sisUserId} → ${section_id ? `section ${section_id}` : `course ${course_id}`} (${role})`
    );
  } catch (e) {
    log(
      `❌ ${sisUserId} / ${section_id || course_id}: ${e}`,
      false
    );
  }
}


  // ============================================================
  // CONCURRENT EXECUTOR
  // ============================================================
  async function runConcurrentEnrollments(rows, concurrency) {
    let index = 0;
    let active = 0;

    return new Promise(resolve => {
      function next() {
        if (index >= rows.length && active === 0) {
          resolve();
          return;
        }

        while (active < concurrency && index < rows.length) {
          const row = rows[index++];
          active++;
          enroll(row)
            .finally(() => {
              active--;
              next();
            });
        }
      }
      next();
    });
  }


  // ======================================
  // BUTTON HANDLER
  // ======================================
document.getElementById("csvEnrollStart").onclick = async () => {
  const file = document.getElementById("csvFileInput").files[0];
  if (!file) return alert("Select a CSV file.");

  const rows = parseCSV(await file.text());
  if (!rows.length) return;

  log(`🚀 Starting ${rows.length} enrollments (${CONCURRENCY} concurrent)…`);
  await runConcurrentEnrollments(rows, CONCURRENCY);
  log("🎉 Enrollment processing complete");
};

  console.log("✅ CSV API Enrollment (Concurrent) loaded");

})();


})();