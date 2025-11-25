// ==UserScript==
// @name         Canvas FeedBack Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script to Extract Feedback and Rubric Feedback for instructors.
// @author       Rob Solander
// @match        https://canvas.gmu.edu/courses/*/settings
// @match        https://gmu.beta.instructure.com/courses/*/settings
// @downloadURL  https://mason.gmu.edu/~rsolande/Canvas FeedBack Script.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/Canvas FeedBack Script.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gmu.edu
// @grant        none
// ==/UserScript==

(function() {


(function($) {
  // Create floating button dynamically using jQuery
  const $btn = $('<button>', {
    id: 'exportFeedbackBtn',
    text: 'Export Feedback CSV',
    css: {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      backgroundColor: '#0073e6',
      color: '#fff',
      border: 'none',
      padding: '12px 18px',
      fontSize: '16px',
      borderRadius: '6px',
      cursor: 'pointer',
      zIndex: '9999',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }
  }).appendTo('body');

  // Create "Please wait" popup (hidden by default)
  const $popup = $('<div>', {
    id: 'pleaseWaitPopup',
    text: 'Please wait...',
    css: {
      position: 'fixed',
      right: '20px',
      bottom: '70px', // just above the button
      backgroundColor: '#333',
      color: '#fff',
      padding: '10px 15px',
      borderRadius: '6px',
      fontSize: '14px',
      display: 'none',
      zIndex: '9999',
      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    }
  }).appendTo('body');

  // Hover effect
  $btn.hover(
    function() { $(this).css('backgroundColor', '#005bb5'); },
    function() { $(this).css('backgroundColor', '#0073e6'); }
  );

  // Click event
  $btn.on('click', async function() {
    const courseId = ENV.current_context['id'];
    $popup.show();
    $btn.prop('disabled', true).css('opacity', '0.6');
    await exportFeedbackCSV(courseId);
    $popup.hide();
    $btn.prop('disabled', false).css('opacity', '1');
  });

  async function exportFeedbackCSV(courseId) {
    const baseUrl = `/api/v1/courses/${courseId}`;
    const csvRows = ['"Full Name","Login ID","Assignment Name","Feedback","Rubric Feedback"'];

    try {
      const students = await fetchAllPages(`${baseUrl}/users?enrollment_type[]=student&per_page=50`);
      const studentMap = {};
      students.forEach(s => {
        studentMap[s.id] = {
          fullName: s.name || '',
          loginId: s.login_id || ''
        };
      });

      const assignments = await fetchAllPages(`${baseUrl}/assignments?per_page=50`);

      for (const assignment of assignments) {
        const rubricTitle = assignment.rubric_settings?.title || assignment.rubric?.title || '';
        if (rubricTitle === 'Unnamed Rubric') {
          console.log(`Skipping assignment "${assignment.name}" due to unnamed rubric.`);
          continue;
        }

        const submissions = await fetchAllPages(
          `${baseUrl}/assignments/${assignment.id}/submissions?include[]=submission_comments&include[]=rubric_assessment&include[]=user&per_page=50`
        );

        for (const sub of submissions) {
          const studentInfo = studentMap[sub.user_id] || { fullName: sub.user?.name || '', loginId: sub.user?.login_id || '' };
          const assignmentName = assignment.name;
          const feedback = sub.submission_comments?.map(c => c.comment).join(' | ') || '';

          // Build rubric feedback with rubric name and criterion names
          let rubric = '';
          if (sub.rubric_assessment && assignment.rubric) {
            const rubricParts = [];
            rubricParts.push(`Rubric: ${rubricTitle}`);
            for (const [criterionId, data] of Object.entries(sub.rubric_assessment)) {
              const criterion = assignment.rubric.find(r => r.id === criterionId);
              if (criterion) {
                const criterionName = criterion.description || criterionId;
                const earned = data.points ?? '';
                const possible = criterion.points ?? '';
                const comment = data.comments || '';
                rubricParts.push(`${criterionName}: ${comment} (${earned}/${possible})`);
              }
            }
            rubric = rubricParts.join(' | ');
          }

          const row = [
            `"${escapeCsv(studentInfo.fullName)}"`,
            `"${escapeCsv(studentInfo.loginId)}"`,
            `"${escapeCsv(assignmentName)}"`,
            `"${escapeCsv(feedback)}"`,
            `"${escapeCsv(rubric)}"`
          ].join(',');

          csvRows.push(row);
        }
      }

      // Download CSV
      let coursename = ENV.current_context['name'];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const $a = $('<a>', {
          href: url,
          download: `${coursename}_assignment_feedback.csv`
      }).appendTo('body');
      $a[0].click();
      $a.remove();

      console.log('CSV export completed successfully.');
    } catch (error) {
      console.error('Error exporting feedback:', error);
      alert('Failed to export feedback. Check console for details.');
    }
  }

  async function fetchAllPages(url) {
    let results = [];
    let nextUrl = url;

    while (nextUrl) {
      const res = await fetch(nextUrl);
      if (!res.ok) throw new Error(`API request failed: ${res.status} ${res.statusText}`);

      const data = await res.json();
      results = results.concat(data);

      const linkHeader = res.headers.get('Link');
      nextUrl = null;
      if (linkHeader) {
        const match = linkHeader.match(/<([^>]+)>; rel="next"/);
        if (match) nextUrl = match[1];
      }
    }

    return results;
  }

  function escapeCsv(value) {
    const stringValue = String(value || "");
    return stringValue.replace(/"/g, '""');
  }

})(jQuery);
})();