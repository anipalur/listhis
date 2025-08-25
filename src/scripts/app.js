/* eslint-disable max-len */
let answers = {};
let dynamicMap = {};

// Helper functions
function newElement(elementTag, elementClass) {
  const element = document.createElement(elementTag);
  if (elementClass) element.className = elementClass;
  return element;
}

function hideElement(element) {
  if (!element) return;
  element.innerHTML = '';
  element.style.display = 'none';
}

function addMultiEntry(container, qid, value, placeholder) {
  if (!Array.isArray(answers[qid])) answers[qid] = [];
  answers[qid].push(value || '');

  const entry = newElement('div', 'list-entry');

  const input = newElement('input');
  input.type = 'text';
  input.placeholder = placeholder || '';
  input.value = value || '';
  input.addEventListener('focusout', inputEvent => {
    const idx = Array.from(container.children).indexOf(entry);
    answers[qid][idx] = inputEvent.target.value;
  });

  const deleteIcon = newElement('div', 'icon-div multi-icon');
  deleteIcon.title = 'Delete Entry';
  deleteIcon.setAttribute('tabindex', '0');
  deleteIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  `;

  deleteIcon.addEventListener('click', () => {
    const idx = Array.from(container.children).indexOf(entry);
    answers[qid].splice(idx, 1);
    entry.remove();
  });

  entry.appendChild(input);
  entry.appendChild(deleteIcon);
  container.appendChild(entry);
}

function showMultiEntry(followup, target) {
  const label = newElement('label');
  label.textContent = followup.text;

  const listWrap = newElement('div');
  listWrap.dataset.qid = followup.id;

  const addIcon = newElement('div', 'icon-div multi-icon add-icon');
  addIcon.title = 'Add Entry';
  addIcon.setAttribute('tabindex', '0');
  addIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  `;
  addIcon.addEventListener('click', () => addMultiEntry(listWrap, followup.id, '', followup.placeholder));

  target.appendChild(label);
  target.appendChild(listWrap);
  target.appendChild(addIcon);

  const answerArray = Array.isArray(answers[followup.id]) ? answers[followup.id] : [];
  answerArray.forEach(value => addMultiEntry(listWrap, followup.id, value, followup.placeholder));
  if (answerArray.length === 0) addMultiEntry(listWrap, followup.id, '', followup.placeholder);
}

function showYesNoFollowups(container, followups) {
  if (!container) return;
  container.innerHTML = '';
  container.style.display = 'block';
  const label = newElement('span', 'suggestion-label');
  label.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
      <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
      <path d="M9.7 17l4.6 0" />
    </svg>
    Suggested follow-up questions:
  `;
  container.appendChild(label);

  followups.forEach(followup => {
    if (followup.multi) {
      showMultiEntry(followup, container);
    }
    else {
      const questionDiv = newElement('div', 'followup-question');
      const questionLabel = newElement('label');
      questionLabel.textContent = followup.text;
      const inputType = newElement(followup.type === 'text' ? 'input' : 'textarea');
      inputType.dataset.qid = followup.id;
      inputType.placeholder = followup.placeholder || '';
      inputType.value = answers[followup.id] || '';
      inputType.addEventListener('focusout', inputEvent => {
        answers[followup.id] = inputEvent.target.value;
      });
      questionDiv.appendChild(questionLabel);
      questionDiv.appendChild(inputType);
      container.appendChild(questionDiv);
    }
  });
}

function setYesNo(question, value, questionDiv) {
  answers[question.id] = value;
  questionDiv.querySelectorAll('.yesno button').forEach(button => {
    button.classList.toggle('active', button.textContent === value);
  });
  const local = questionDiv.querySelector('.followups');

  if (value === 'Yes' && Array.isArray(question.followups)) {
    showYesNoFollowups(local, question.followups);
  }
  else {
    hideElement(local);
    if (Array.isArray(question.followups)) {
      question.followups.forEach(fu => delete answers[fu.id]);
    }
  }

  // Followups for Immunisations should only appear if user selects No
  if (question.id === 'mh_immunisations') {
    if (value === 'No' && Array.isArray(question.followups)) {
      showYesNoFollowups(local, question.followups);
    }
    else {
      hideElement(local);
      if (Array.isArray(question.followups)) {
        question.followups.forEach(followup => delete answers[followup.id]);
      }
    }
  }
}

function showSuggestedFollowups(text, questionId) {
  // Remove all previously-shown follow-up questions
  Object.keys(dynamicMap).forEach(section => {
    const nodes = document.querySelectorAll(`.section-followups[data-section="${section}"]`);
    nodes.forEach(node => {
      node.innerHTML = '';
      node.style.display = 'none';
    });
  });
  dynamicMap = {};

  // Remove any checkmark indicating suggested questions shown
  const questionLabel = document.querySelector(`[data-qid="${questionId}"]`).previousSibling;
  const existingCheckmark = questionLabel.querySelector('.checkmark');
  if (existingCheckmark) existingCheckmark.style.display = 'none';

  // Show suggested questions based on chief complaint or associated symptoms
  if (!text) return;
  const lower = text.toLowerCase();
  for (const keywordGroup of KEYWORD_MAP) {
    for (const keyword of keywordGroup.aliases) {
      if (lower.includes(keyword)) {
        for (const suggestion of keywordGroup.suggestions) {
          const sections = suggestion.sections || ['History of Presenting Illness'];
          sections.forEach(section => {
            const targets = document.querySelectorAll(`.section-followups[data-section="${section}"]`);
            targets.forEach(target => {
              if (target.querySelector(`[data-qid="${suggestion.id}"]`)) return;
              target.style.display = 'block';
              if (!target.querySelector(`.suggestion-label.${keywordGroup.id}`)) {
                const label = newElement('span', `suggestion-label ${keywordGroup.id}`);
                label.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
                    <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
                    <path d="M9.7 17l4.6 0" />
                  </svg>
                  Suggested questions based on ${keywordGroup.keyword}:
                `;
                target.appendChild(label);
              }
              if (suggestion.multi) {
                showMultiEntry(suggestion, target);
              }
              else {
                const questionDiv = newElement('div', 'followup-question');
                const label = newElement('label');
                label.textContent = suggestion.text;
                const input = newElement(suggestion.type === 'text' ? 'input' : 'textarea');
                input.dataset.qid = suggestion.id;
                input.placeholder = suggestion.placeholder || '';
                input.value = answers[suggestion.id] || '';
                input.addEventListener('focusout', inputEvent => {
                  answers[suggestion.id] = inputEvent.target.value;
                });
                questionDiv.appendChild(label);
                questionDiv.appendChild(input);
                target.appendChild(questionDiv);
              }
              dynamicMap[section] ||= new Set();
              dynamicMap[section].add({
                followupId: suggestion.id,
                followupText: suggestion.text,
              });
            });
          });
        }

        // Show a checkmark indicating suggested questions shown
        if (existingCheckmark) {
          existingCheckmark.style.display = 'block';
        }
        else if (!questionLabel.textContent.includes('Suggested')) {
          questionLabel.innerHTML = `
            ${questionLabel.innerHTML}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon checkmark">
                <title>Suggested questions shown!</title>
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
                <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
                <path d="M9.7 17l4.6 0" />
              </svg>
          `;
        }
      }
    }
  }
}

function renderChecklist() {
  const container = document.getElementById('checklist');
  container.innerHTML = '';

  Object.entries(DEFAULT_QUESTIONS).forEach(([historySection, historyQuestions]) => {
    const section = newElement('div', 'section');
    const header = newElement('div', 'section-header clickable');
    const title = newElement('h2', 'section-title');
    const body = newElement('div', 'section-body');
    section.appendChild(header);
    header.appendChild(title);
    title.textContent = historySection;
    body.style.display = 'block';

    // Collapse icon for sections other than Patient Information
    const toggleSectionIcon = newElement('div', 'icon-div toggle-section-icon');
    toggleSectionIcon.title = 'Collapse Section';
    toggleSectionIcon.setAttribute('tabindex', '0');
    toggleSectionIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
        <path d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z" />
      </svg>
    `;
    header.appendChild(toggleSectionIcon);
    header.addEventListener('click', () => {
      const sectionBody = section.querySelector('.section-body');
      if (!sectionBody) return;
      if (sectionBody.style.display === 'none') {
        sectionBody.style.display = 'block';
        toggleSectionIcon.title = 'Collapse Section';
        toggleSectionIcon.setAttribute('tabindex', '0');
        toggleSectionIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z" />
          </svg>
        `;
      }
      else {
        sectionBody.style.display = 'none';
        toggleSectionIcon.title = 'Expand Section';
        toggleSectionIcon.setAttribute('tabindex', '0');
        toggleSectionIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z" />
          </svg>
        `;
      }
    });

    historyQuestions.forEach(question => {
      const questionId = question.id;
      const questionDiv = newElement('div', 'question');
      const questionLabel = newElement('label');
      questionDiv.appendChild(questionLabel);
      questionLabel.textContent = question.text;

      if (question.type === 'yesno') {
        const yesNoDiv = newElement('div', 'yesno');
        const yesButton = newElement('button');
        const noButton = newElement('button');
        questionDiv.appendChild(yesNoDiv);
        yesNoDiv.appendChild(yesButton);
        yesNoDiv.appendChild(noButton);
        yesButton.textContent = 'Yes';
        noButton.textContent = 'No';
        yesButton.addEventListener('click', () => {
          setYesNo(question, 'Yes', questionDiv);
        });
        noButton.addEventListener('click', () => {
          setYesNo(question, 'No', questionDiv);
        });
      }
      else if (question.type === 'textarea') {
        const textArea = newElement('textarea');
        textArea.dataset.qid = questionId;
        textArea.placeholder = question.placeholder || '';
        textArea.value = answers[questionId] || '';
        textArea.addEventListener('focusout', inputEvent => {
          answers[questionId] = inputEvent.target.value;
          if (questionId === 'chief_complaint') {
            showSuggestedFollowups(inputEvent.target.value + answers['hopi_associated'], questionId);
          }
          else if (questionId === 'hopi_associated') {
            showSuggestedFollowups(inputEvent.target.value + answers['chief_complaint'], questionId);
          }
        });
        questionDiv.appendChild(textArea);
      }
      else {
        const input = newElement('input');
        input.type = question.type || 'text';
        input.placeholder = question.placeholder || '';
        input.dataset.qid = questionId;
        input.value = answers[questionId] || '';
        input.addEventListener('focusout', inputEvent => {
          answers[questionId] = inputEvent.target.value;
        });
        questionDiv.appendChild(input);
      }

      const localFollow = newElement('div', 'followups');
      localFollow.dataset.parent = questionId;
      localFollow.style.display = 'none';
      questionDiv.appendChild(localFollow);
      body.appendChild(questionDiv);
    });

    const endFollow = newElement('div', 'followups section-followups');
    endFollow.dataset.section = historySection;
    endFollow.style.display = 'none';
    body.appendChild(endFollow);
    section.appendChild(body);
    container.appendChild(section);
  });

  const genderBox = document.getElementById('pi_gender');
  if (genderBox) {
    genderBox.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('#pi_gender button').forEach(genderButton => genderButton.classList.remove('active'));
        button.classList.add('active');
        answers['pi_gender'] = button.dataset.val;
      });
    });
  }
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  if (months < 0 || (months === 0 && days < 0)) {
    years -= 1;
    months += 12;
  }
  if (days < 0) {
    const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayOfPrevMonth;
    months -= 1;
  }
  const weeks = Math.floor(days / 7);

  return `${years} year(s) ${months} month(s) ${weeks} week(s)`;
}

// Initialisation
renderChecklist();

// Prevent user from entering DOB from future
const dobInput = document.getElementById('pi_dob');
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const formattedToday = `${year}-${month}-${day}`;
dobInput.setAttribute('max', formattedToday);

// Calculate patient's age from entered DOB
dobInput.addEventListener('change', () => {
  const dobValue = dobInput.value;
  const ageOutput = document.getElementById('pi_age');
  if (dobValue) {
    const age = calculateAge(dobValue);
    ageOutput.value = age;
  }
  else {
    ageOutput.value = '';
  }
});

const exportPDF = document.getElementById('exportPDF');
exportPDF.addEventListener('click', () => {
  const exportPDFText = document.getElementById('exportPDFText');
  exportPDFText.textContent = 'Exporting...';
  const { jsPDF: JSPDF } = window.jspdf;
  const pdfDocument = new JSPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 14;
  const NORMAL_INDENT = 14;
  const MULTI_INDENT = 20;
  const LINE_HEIGHT = 6;
  const LINE_SPACE = 12;
  const SMALL_SPACE = 2;
  const TITLE_SIZE = 12;
  const HEADING_SIZE = 10;
  const TEXT_SIZE = 8;
  const NORMAL_COLOUR = 0;
  const ACCENT_COLOUR = [17, 166, 166];
  const pageWidth = pdfDocument.internal.pageSize.getWidth();
  const pageHeight = pdfDocument.internal.pageSize.getHeight();
  const currentDate = new Date().toISOString();

  function formatHeading(text) {
    y += LINE_SPACE;
    pdfDocument.setTextColor(...ACCENT_COLOUR);
    pdfDocument.setFontSize(HEADING_SIZE);
    pdfDocument.setFont('Helvetica', 'Bold');
    pdfDocument.text(text, NORMAL_INDENT, y);
    y += SMALL_SPACE;
    pdfDocument.setDrawColor(...ACCENT_COLOUR);
    pdfDocument.line(NORMAL_INDENT, y, pageWidth - NORMAL_INDENT, y);
  }

  function formatText(text, indent = NORMAL_INDENT) {
    y += LINE_HEIGHT;
    pdfDocument.setTextColor(NORMAL_COLOUR);
    pdfDocument.setFontSize(TEXT_SIZE);
    pdfDocument.setFont('Helvetica', '');
    pdfDocument.text(text, indent, y);
  }

  pdfDocument.setTextColor(...ACCENT_COLOUR);
  pdfDocument.setFontSize(TITLE_SIZE);
  pdfDocument.setFont('Helvetica', 'Bold');
  pdfDocument.text('Patient History', NORMAL_INDENT, y);
  y += SMALL_SPACE;
  pdfDocument.setDrawColor(...ACCENT_COLOUR);
  pdfDocument.line(NORMAL_INDENT, y, pageWidth - NORMAL_INDENT, y);
  y += LINE_HEIGHT;
  pdfDocument.setTextColor(NORMAL_COLOUR);
  pdfDocument.setFontSize(TEXT_SIZE);
  pdfDocument.setFont('Helvetica', '');
  pdfDocument.textWithLink('Generated by ListHis - https://listhis.pages.dev', NORMAL_INDENT, y, { url: 'https://listhis.pages.dev' });

  const piFullName = document.getElementById('pi_fullname').value || 'Unknown';
  const piDOB = document.getElementById('pi_dob').value || 'Unknown';
  const piAge = document.getElementById('pi_age').value || 'Unknown';
  const piGender = answers['pi_gender'] || 'Unknown';
  const piRace = document.getElementById('pi_race').value || 'Unknown';
  const piNationality = document.getElementById('pi_nationality').value || 'Unknown';
  const piMRN = document.getElementById('pi_mrn').value || 'Unknown';
  const piDateAdmission = document.getElementById('pi_date_admission').value || 'Unknown';
  const piLocation = document.getElementById('pi_location').value || 'Unknown';

  formatHeading('Patient Details');
  formatText(`- Name: ${piFullName}`);
  formatText(`- Date of Birth: ${piDOB}`);
  formatText(`- Age: ${piAge}`);
  formatText(`- Gender: ${piGender}`);
  formatText(`- Race: ${piRace}`);
  formatText(`- Nationality: ${piNationality}`);
  formatText(`- MRN: ${piMRN}`);
  formatText(`- Date of Admission: ${piDateAdmission}`);
  formatText(`- Location of Clerking: ${piLocation}`);
  formatText(`- Date of Clerking: ${currentDate.slice(0, 10)}`);
  formatText(`- Time of Clerking: ${currentDate.slice(11, 16)} GMT+0`);

  for (const [section, questions] of Object.entries(DEFAULT_QUESTIONS)) {
    formatHeading(section);
    for (const question of questions) {
      const answer = answers[question.id];
      let textAnswer = 'Unknown';
      if (answer !== undefined && answer !== '') textAnswer = Array.isArray(answer) ? answer.join('; ') : answer;
      const lines = pdfDocument.splitTextToSize(`- ${question.text}: ${textAnswer}`, 180);
      formatText(lines);
      if (y > 270) {
        pdfDocument.addPage();
        y = 14;
      }

      if (question.type === 'yesno' && answers[question.id] === 'Yes' && Array.isArray(question.followups)) {
        for (const followup of question.followups) {
          if (followup.multi) {
            const answerArray = answers[followup.id] || [];
            if (answerArray.length === 0) {
              const multiLines = pdfDocument.splitTextToSize(`- ${followup.text}: Unknown`, 180);
              formatText(multiLines, MULTI_INDENT);
            }
            else {
              for (const item of answerArray) {
                const multiLines = pdfDocument.splitTextToSize(`- ${followup.text}: ${item || 'Unknown'}`, 180);
                formatText(multiLines, MULTI_INDENT);
              }
            }
          }
          else {
            const value = answers[followup.id] || 'Unknown';
            const followupLines = pdfDocument.splitTextToSize(`- ${followup.text}: ${value}`, 180);
            formatText(followupLines, MULTI_INDENT);
          }

          if (y > 270) {
            pdfDocument.addPage();
            y = 14;
          }
        }
      }
    }

    if (dynamicMap[section]) {
      for (const dynamicQuestion of dynamicMap[section]) {
        const answer = answers[dynamicQuestion.followupId];
        let text = 'Unknown';
        if (answer !== undefined && answer !== '') text = Array.isArray(answer) ? answer.join('; ') : answer;
        const dynamicLines = pdfDocument.splitTextToSize(`- ${dynamicQuestion.followupText}: ${text}`, 180);
        formatText(dynamicLines);
        if (y > 270) {
          pdfDocument.addPage();
          y = 14;
        }
      }
    }

    if (y > 270) {
      pdfDocument.addPage();
      y = 14;
    }
  }

  // Add page number to bottom of each page
  const pageCount = pdfDocument.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdfDocument.setPage(page);
    pdfDocument.text(`Page ${page} of ${pageCount}`, pageWidth / 2, pageHeight - LINE_HEIGHT, { align: 'center' });
  }

  const pdfName = `${piFullName === 'Unknown' ? '' : `${piFullName}'s `}Patient History - ${currentDate.slice(0, 10)}`;
  pdfDocument.setLanguage('en-GB');
  pdfDocument.setProperties({
    title: pdfName,
    subject: 'Patient History',
    author: 'ListHis',
    keywords: 'ListHis, History-taking, Medicine',
    creator: 'ListHis',
  });
  pdfDocument.save(`${pdfName}.pdf`);
  exportPDFText.textContent = 'Export as PDF';
});

document.getElementById('resetButton').addEventListener('click', () => {
  const userResponse = confirm('Are you sure you want to reset all questions?');
  if (userResponse) {
    answers = {};
    document.querySelectorAll('input, textarea').forEach(element => {
      if (element.type === 'radio' || element.type === 'checkbox') element.checked = false;
      else element.value = '';
    });
    document.querySelectorAll('.yesno button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll('.followups').forEach(followup => followup.remove());
    renderChecklist();
  }
});

// Warn user before navigating off checklist if any data entered
window.addEventListener('beforeunload', event => {
  let hasNoChanges = true;
  if (Object.keys(answers).length > 0) {
    for (const qid in answers) {
      if (answers[qid] !== '') hasNoChanges = false;
    }
  }
  if (!hasNoChanges) event.preventDefault();
});
