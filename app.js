// LocalStorage helpers
function getSets() {
  return JSON.parse(localStorage.getItem('flashcard_sets') || '[]');
}
function saveSets(sets) {
  localStorage.setItem('flashcard_sets', JSON.stringify(sets));
}
// App State
let sets = getSets();
let currentView = 'list'; // 'list', 'edit', 'study', 'export', 'import'
let currentSet = null;
let studyIndex = 0;
let showBack = false;
let studyKnown = {};
// UI rendering
function render() {
  const c = document.getElementById('container');
  if (currentView === 'list') {
    c.innerHTML = `<div class="set-list">
        <h2>Your Flashcard Sets</h2>
        ${sets.length ? sets.map((set, i) => `
          <div class="set-item">
            <span class="set-title" onclick="openSet(${i})">${set.title}</span>
            <div class="set-actions">
              <button class="btn btn-secondary" onclick="studySet(${i})">Study</button>
              <button class="btn btn-secondary" onclick="editSet(${i})">Edit</button>
              <button class="btn btn-danger" onclick="deleteSet(${i})">Delete</button>
              <button class="btn btn-secondary" onclick="exportSet(${i})">Export</button>
            </div>
          </div>
        `).join('') : `<div>No sets yet. Create one!</div>`}
      </div>
      <button class="btn" onclick="newSet()">Create New Set</button>
      <button class="btn btn-secondary" onclick="importSet()">Import Set</button>`;
  } else if (currentView === 'edit') {
    c.innerHTML = `<div class="set-editor">
      <h2>${currentSet.edit ? 'Edit' : 'New'} Set</h2>
      <input class="input" id="setTitle" placeholder="Set Title" value="${currentSet.title || ''}" /><br><br>
      <div class="card-list">
        <h3>Cards</h3>
        ${currentSet.cards.length ? currentSet.cards.map((card, i) => `
          <div class="card-item">
            <b>Q:</b> <input class="input" id="q${i}" value="${card.q}" placeholder="Term" />
            <b>A:</b> <input class="input" id="a${i}" value="${card.a}" placeholder="Answer" />
            <b>Notes:</b> <textarea rows="2" id="n${i}" placeholder="Notes (optional)">${card.n || ''}</textarea>
            <div class="card-actions">
              <button class="btn btn-danger" onclick="removeCard(${i})">Delete Card</button>
            </div>
          </div>
        `).join('') : '<div>No cards yet.</div>'}
      </div>
      <button class="btn" onclick="addCard()">Add Card</button>
      <div style="margin-top:14px">
        <button class="btn" onclick="saveSet()">Save Set</button>
        <button class="btn btn-secondary" onclick="cancelEdit()">Cancel</button>
      </div>
    </div>`;
  } else if (currentView === 'study') {
    let set = currentSet;
    let card = set.cards[studyIndex];
    let status = studyKnown[studyIndex] || '';
    c.innerHTML = `<div style="margin-bottom:12px;"><button class="btn btn-secondary" onclick="backToList()">&larr; Back to Sets</button></div>
    <h2>Study: ${set.title}</h2>
    <div class="flashcard-view ${status}" onclick="flipStudyCard()">
      ${showBack ? card.a : card.q}
      <div class="flashcard-notes">${card.n || ''}</div>
    </div>
    <div class="study-controls">
      <button class="btn" onclick="markKnown(true)"><span class="status-dot status-known"></span>Known</button>
      <button class="btn" onclick="markKnown(false)"><span class="status-dot status-unknown"></span>Unknown</button>
      <button class="btn btn-secondary" onclick="prevCard()" ${studyIndex === 0 ? 'disabled' : ''}>&larr; Prev</button>
      <span>Card ${studyIndex + 1} of ${set.cards.length}</span>
      <button class="btn btn-secondary" onclick="nextCard()" ${studyIndex === set.cards.length - 1 ? 'disabled' : ''}>Next &rarr;</button>
    </div>
    <div style="margin-top:14px;">
      <button class="btn btn-secondary" onclick="resetProgress()">Reset Progress</button>
    </div>
    <div style="margin-top:14px;">
      <span>Progress: ${Object.values(studyKnown).filter(x=>x==='known').length} known, ${Object.values(studyKnown).filter(x=>x==='unknown').length} unknown</span>
    </div>`;
  } else if (currentView === 'export') {
    c.innerHTML = `<h2>Export Set: ${currentSet.title}</h2>
    <textarea class="input" rows="8" readonly>${JSON.stringify(currentSet)}</textarea>
    <div style="margin-top:10px;"><button class="btn btn-secondary" onclick="backToList()">Back</button></div>`;
  } else if (currentView === 'import') {
    c.innerHTML = `<h2>Import Flashcard Set</h2>
    <textarea class="input" id="importBox" rows="8" placeholder="Paste exported set JSON here"></textarea>
    <div style="margin-top:10px;">
      <button class="btn" onclick="doImportSet()">Import</button>
      <button class="btn btn-secondary" onclick="backToList()">Cancel</button>
    </div>`;
  }
}
// Set list actions
window.newSet = function() {
  currentSet = { title: '', cards: [], edit: false };
  currentView = 'edit';
  render();
};
window.editSet = function(i) {
  currentSet = JSON.parse(JSON.stringify(sets[i]));
  currentSet.edit = true;
  currentSet.idx = i;
  currentView = 'edit';
  render();
};
window.deleteSet = function(i) {
  if (confirm('Delete this set?')) {
    sets.splice(i, 1);
    saveSets(sets);
    render();
  }
};
window.openSet = function(i) {
  studySet(i);
};
window.exportSet = function(i) {
  currentSet = sets[i];
  currentView = 'export';
  render();
};
window.importSet = function() {
  currentView = 'import';
  render();
};
window.doImportSet = function() {
  let box = document.getElementById('importBox');
  try {
    let imported = JSON.parse(box.value);
    if (imported && imported.title && Array.isArray(imported.cards)) {
      sets.push(imported);
      saveSets(sets);
      currentView = 'list';
      render();
    } else {
      alert('Invalid format!');
    }
  } catch {
    alert('Not valid JSON!');
  }
};
// Edit view actions
window.addCard = function() {
  currentSet.cards.push({ q: '', a: '', n: '' });
  render();
};
window.removeCard = function(i) {
  currentSet.cards.splice(i, 1);
  render();
};
window.saveSet = function() {
  currentSet.title = document.getElementById('setTitle').value.trim();
  // Update card fields
  currentSet.cards = currentSet.cards.map((card, i) => ({
    q: document.getElementById('q'+i).value,
    a: document.getElementById('a'+i).value,
    n: document.getElementById('n'+i).value
  })).filter(card => card.q && card.a);
  if (!currentSet.title) return alert('Please enter a set title.');
  if (!currentSet.cards.length) return alert('Add at least one card!');
  if (currentSet.edit) {
    sets[currentSet.idx] = {
      title: currentSet.title,
      cards: currentSet.cards
    };
  } else {
    sets.push({ title: currentSet.title, cards: currentSet.cards });
  }
  saveSets(sets);
  currentView = 'list';
  render();
};
window.cancelEdit = function() {
  currentView = 'list';
  render();
};
// Study mode actions
window.studySet = function(i) {
  currentSet = sets[i];
  currentView = 'study';
  studyIndex = 0;
  showBack = false;
  studyKnown = JSON.parse(localStorage.getItem('flashcard_status_' + currentSet.title) || '{}');
  render();
};
window.flipStudyCard = function() {
  showBack = !showBack;
  render();
};
window.prevCard = function() {
  if (studyIndex > 0) { studyIndex--; showBack = false; render(); }
};
window.nextCard = function() {
  if (studyIndex < currentSet.cards.length - 1) { studyIndex++; showBack = false; render(); }
};
window.markKnown = function(known) {
  studyKnown[studyIndex] = known ? 'known' : 'unknown';
  localStorage.setItem('flashcard_status_' + currentSet.title, JSON.stringify(studyKnown));
  render();
};
window.resetProgress = function() {
  if (confirm('Reset progress for this set?')) {
    studyKnown = {};
    localStorage.removeItem('flashcard_status_' + currentSet.title);
    render();
  }
};
window.backToList = function() {
  currentView = 'list';
  render();
};
// Initial render
render();
