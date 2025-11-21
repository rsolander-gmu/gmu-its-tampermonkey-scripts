// ==UserScript==
// @name         Enroll Faculty and Student Incompletes
// @version      2025-07-25
// @description  Enrolls Users and handles incompletes with section creation and date validation
// @author       Rob Solander
// @match        https://gmu.beta.instructure.com/courses/*/users
// @match        https://canvas.gmu.edu/courses/*/users
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  if (ENV.CONCLUDED_SECTIONS.length === 0) return;

  const courseIdMatch = window.location.pathname.match(/courses\/(\d+)/);
  if (!courseIdMatch) {
    console.error("❌ Could not extract course ID from URL.");
    return;
  }
  const courseId = courseIdMatch[1];
  const defaultTermId = 1;
  let originalTermId, originalEndDate;

  function getCourseDetails(callback) {
    $.get(`/api/v1/courses/${courseId}`, function(data) {
      originalTermId = data.enrollment_term_id;
      originalEndDate = data.end_at;
      callback();
    }).fail(xhr => {
      console.error("❌ Failed to fetch course details:", xhr.responseText);
    });
  }

  function updateCourse(termId, endDate, callback) {
    $.ajax({
      type: "PUT",
      url: `/api/v1/courses/${courseId}`,
      contentType: "application/json",
      data: JSON.stringify({
        course: {
          enrollment_term_id: termId,
          end_at: endDate
        }
      }),
      success: () => callback(true),
      error: xhr => {
        console.error("❌ Failed to update course:", xhr.responseText);
        callback(false);
      }
    });
  }

  function enrollUser(userId, roleId, callback) {
    const roleMap = {
      4: "TeacherEnrollment",
      5: "TaEnrollment",
      6: "DesignerEnrollment"
    };
    const enrollmentType = roleMap[parseInt(roleId)];
    $.ajax({
      type: "POST",
      url: `/api/v1/courses/${courseId}/enrollments`,
      contentType: "application/json",
      data: JSON.stringify({
        enrollment: {
          user_id: "sis_login_id:" + userId,
          type: enrollmentType,
          role_id: parseInt(roleId),
          enrollment_state: "active"
        }
      }),
      success: () => callback(true),
      error: xhr => {
        console.error("❌ Failed to enroll user:", xhr.responseText);
        callback(false);
      }
    });
  }

  function createIncompleteSection(endDate, callback) {
    $.ajax({
      type: "POST",
      url: `/api/v1/courses/${courseId}/sections`,
      contentType: "application/json",
      data: JSON.stringify({
        course_section: {
          name: "Incompletes",
          end_at: endDate,
          restrict_enrollments_to_section_dates: true
        }
      }),
      success: function (data) {
        console.log("✅ Incompletes section created:", data);
        let sectionid = data.id;
        callback(data.id);
      },
      error: function (xhr) {
        console.error("❌ Failed to create incompletes section:", xhr.responseText);
        alert("Failed to create incompletes section.");
      }
    });
  }

  function enrollInSection(userId, sectionId) {
    $.ajax({
      type: "POST",
      url: `/api/v1/courses/${courseId}/enrollments`,
      contentType: "application/json",
      data: JSON.stringify({
        enrollment: {
          user_id: "sis_login_id:" + userId,
          type: "StudentEnrollment",
          enrollment_state: "active",
          course_section_id: sectionId
        }
      }),
      success: function () {
        console.log(`✅ ${userId} enrolled in incompletes section.`);
      },
      error: function (xhr) {
        alert(`❌ Failed to enroll ${userId}:`, xhr.responseText);
          incompletesInput.value = '';
          dateInput.value = '';
          updateCourse(originalTermId, originalEndDate, function () {
          });
          window.location.href = `/courses/${courseId}/settings#tab-sections`;
      }
    });
  }

  // Faculty Enroll UI
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '370px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.padding = '10px';
  container.style.backgroundColor = '#f9f9f9';
  container.style.border = '2px solid #0073e6';
  container.style.borderRadius = '6px';
  container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  container.style.width = '120px';
  container.style.transition = 'width 0.3s ease';

  container.addEventListener('mouseenter', () => container.style.width = '260px');
  container.addEventListener('mouseleave', () => container.style.width = '120px');

  const title = document.createElement('div');
  title.textContent = 'Faculty Enroll';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '6px';
  title.style.fontSize = '12px';
  title.style.color = '#0073e6';
  container.appendChild(title);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter NetID(s)';
  input.style.width = '100%';
  input.style.padding = '6px';
  input.style.fontSize = '13px';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '4px';
  input.style.boxSizing = 'border-box';
  input.style.marginBottom = '6px';
  container.appendChild(input);

  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.padding = '6px';
  select.style.fontSize = '13px';
  select.style.border = '1px solid #ccc';
  select.style.borderRadius = '4px';
  select.style.boxSizing = 'border-box';
  select.style.marginBottom = '6px';
  [{ name: 'Teacher', id: 4 }, { name: 'TA', id: 5 }, { name: 'Designer', id: 6 }].forEach(role => {
    const option = document.createElement('option');
    option.value = role.id;
    option.textContent = role.name;
    select.appendChild(option);
  });
  container.appendChild(select);

  const button = document.createElement('button');
  button.textContent = 'Submit';
  button.style.padding = '6px 12px';
  button.style.fontSize = '13px';
  button.style.backgroundColor = '#0073e6';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.width = '100%';
  container.appendChild(button);
  document.body.appendChild(container);

  button.addEventListener('click', enrollFaculty);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') enrollFaculty(); });

  function enrollFaculty() {
    const userIds = input.value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const roleId = select.value;
    if (userIds.length === 0) {
      alert("Please enter at least one valid NetID.");
      return;
    }
    getCourseDetails(() => {})
      updateCourse(defaultTermId, null, function (updateSuccess) {
        if (!updateSuccess) {
          alert("Failed to temporarily update course settings.");
          return;
        }
        let completed = 0;
        let anySuccess = false;
        userIds.forEach(userId => {
          enrollUser(userId, roleId, function (success) {
              if (success) {
                console.log(`✅ ${userId} enrolled successfully.`);
                anySuccess = true;
              } else {
                alert(`❌ Enrollment failed for ${userId}.`);
              }
            completed++;
            if (completed === userIds.length) {
              updateCourse(originalTermId, originalEndDate, function () {
                if (anySuccess) {
                  input.value = '';
                  location.reload();
                } else {
                  alert("All enrollments failed.");
                }
              });
            }
          });
        });
      });
  }

  // Incompletes UI
    // Student Incompletes UI
  const incompletesContainer = document.createElement('div');
  incompletesContainer.style.position = 'fixed';
  incompletesContainer.style.top = '220px';
  incompletesContainer.style.right = '20px';
  incompletesContainer.style.zIndex = '11';
  incompletesContainer.style.padding = '10px';
  incompletesContainer.style.backgroundColor = '#f9f9f9';
  incompletesContainer.style.border = '2px solid var(--ic-brand-button--primary-bgd-darkened-15)';
  incompletesContainer.style.borderRadius = '6px';
  incompletesContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  incompletesContainer.style.width = '120px';
  incompletesContainer.style.transition = 'width 0.3s ease';

  incompletesContainer.addEventListener('mouseenter', () => incompletesContainer.style.width = '240px');
  incompletesContainer.addEventListener('mouseleave', () => incompletesContainer.style.width = '120px');

  const incompletesTitle = document.createElement('div');
  incompletesTitle.textContent = 'Student Incompletes';
  incompletesTitle.style.fontWeight = 'bold';
  incompletesTitle.style.marginBottom = '6px';
  incompletesTitle.style.fontSize = '12px';
  incompletesTitle.style.color = 'var(--ic-brand-button--primary-bgd-darkened-15)';
  incompletesContainer.appendChild(incompletesTitle);

  const incompletesInput = document.createElement('input');
  incompletesInput.type = 'text';
  incompletesInput.placeholder = 'Enter NetID(s)';
  incompletesInput.style.width = '100%';
  incompletesInput.style.padding = '6px';
  incompletesInput.style.fontSize = '13px';
  incompletesInput.style.border = '1px solid #ccc';
  incompletesInput.style.borderRadius = '4px';
  incompletesInput.style.boxSizing = 'border-box';
  incompletesInput.style.marginBottom = '6px';
  incompletesContainer.appendChild(incompletesInput);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.style.width = '100%';
  dateInput.style.padding = '6px';
  dateInput.style.fontSize = '11px';
  dateInput.style.border = '1px solid #ccc';
  dateInput.style.borderRadius = '4px';
  dateInput.style.boxSizing = 'border-box';
  dateInput.style.marginBottom = '6px';
  incompletesContainer.appendChild(dateInput);

  const incompletesButton = document.createElement('button');
  incompletesButton.textContent = 'Enroll';
  incompletesButton.style.padding = '6px 12px';
  incompletesButton.style.fontSize = '11px';
  incompletesButton.style.backgroundColor = 'var(--ic-brand-button--primary-bgd-darkened-15)';
  incompletesButton.style.color = 'White';
  incompletesButton.style.border = 'none';
  incompletesButton.style.borderRadius = '4px';
  incompletesButton.style.cursor = 'pointer';
  incompletesButton.style.width = '100%';
  incompletesContainer.appendChild(incompletesButton);
  document.body.appendChild(incompletesContainer);

  incompletesButton.addEventListener('click', handleIncompletes);
  incompletesInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleIncompletes(); });
  dateInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleIncompletes(); });

  function handleIncompletes() {
    const userIds = incompletesInput.value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const endDate = dateInput.value;
    if (userIds.length === 0 || !endDate) {
      alert("Please enter NetIDs and a valid end date.");
      return;
    }

    if (new Date(endDate) < new Date()) {
      alert("End date cannot be in the past.");
      return;
    }
     getCourseDetails(() => {});
     updateCourse(defaultTermId, null, function (updateSuccess) {
        if (!updateSuccess) {
          alert("Failed to temporarily update course settings.");
          return;
        }
        let completed = 0;
        let anySuccess = false;}
     );
    createIncompleteSection(endDate, function (sectionId) {
      userIds.forEach(userId => {
        enrollInSection(userId, sectionId);
      });
      incompletesInput.value = '';
      dateInput.value = '';
         updateCourse(originalTermId, originalEndDate, function () {
          });
      window.location.href = `/courses/${courseId}/sections/${sectionId}`;
    });
  }
})();
