// ==UserScript==
// @name         BBHighlightCurrentYear-Enrollments
// @namespace    https://mason.gmu.edu/~rsolande/
// @version      1.4
// @description  Highlightes enrollments for current year
// @author       Rob Solander / slackoverflow
// @match        https://mymasonportal.gmu.edu/webapps/blackboard/execute/userEnrollment?*
// @match        https://mymasonportal.gmu.edu/webapps/blackboard/execute/courseManager?sourceType=COURSES*
// @match        https://canvas.gmu.edu/accounts/1/users/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gmu.edu
// @downloadURL  https://mason.gmu.edu/~rsolande/BBHighlightCurrentYear-Enrollments.user.js
// @updateURL    https://mason.gmu.edu/~rsolande/BBHighlightCurrentYear-Enrollments.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
/**
 * Highlight keywords inside a DOM element
 * @param {string} elem Element to search for keywords in
 * @param {string[]} keywords Keywords to highlight
 * @param {boolean} caseSensitive Differenciate between capital and lowercase letters
 * @param {string} cls Class to apply to the highlighted keyword
 */
var dateobj = new Date();
// Year from the above object
// is being fetched using getFullYear()
var dateObject = dateobj.getFullYear();
var monthObject = dateobj.getMonth();

function highlight(elem, keywords, caseSensitive = false, cls = 'highlight') {
  const flags = caseSensitive ? 'gi' : 'g';
  // Sort longer matches first to avoid
  // highlighting keywords within keywords.
  keywords.sort((a, b) => b.length - a.length);
  Array.from(elem.childNodes).forEach(child => {
    const keywordRegex = RegExp(keywords.join('|'), flags);
    if (child.nodeType !== 3) { // not a text node
      highlight(child, keywords, caseSensitive, cls);
    } else if (keywordRegex.test(child.textContent)) {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      child.textContent.replace(keywordRegex, (match, idx) => {
        const part = document.createTextNode(child.textContent.slice(lastIdx, idx));
        const highlighted = document.createElement('mark');
        highlighted.textContent = match;
        highlighted.classList.add(cls);
        frag.appendChild(part);
        frag.appendChild(highlighted);
        lastIdx = idx + match.length;
      });
      const end = document.createTextNode(child.textContent.slice(lastIdx));
      frag.appendChild(end);
      child.parentNode.replaceChild(frag, child);
    }
  });
}

// Highlight all keywords found in the page

if (monthObject >= 9) {//Highlight next year if October or later
    highlight(document.body, [dateObject+1]);
    highlight(document.body, ["Fall " + dateObject]);
}
else
{
    highlight(document.body, [dateObject]);
}
})();