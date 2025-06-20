// DOM Elements
const nameInput = document.getElementById('name');
const paraInput = document.getElementById('para');
const photoInput = document.getElementById('photoInput');
const fileName = document.getElementById('fileName');
const addButton = document.getElementById('addBtn');
const list = document.getElementById('list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const entryCount = document.getElementById('entryCount');
const clearAllBtn = document.getElementById('clearAll');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const editNameInput = document.getElementById('editName');
const editParaInput = document.getElementById('editPara');
const editPhotoInput = document.getElementById('editPhotoInput');
const editFileName = document.getElementById('editFileName');
const saveEditBtn = document.getElementById('saveEdit');
const toast = document.getElementById('toast');

// Application State
let entries = JSON.parse(localStorage.getItem('crudData')) || [];
let currentEditId = null;
let currentEditImage = '';

// Initialize the application
function init() {
  renderList();
  updateEntryCount();
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  // Add entry button
  addButton.addEventListener('click', addEntry);
  
  // Search functionality
  searchInput.addEventListener('input', renderList);
  
  // Sort functionality
  sortSelect.addEventListener('change', renderList);
  
  // Clear all entries
  clearAllBtn.addEventListener('click', clearAllEntries);
  
  // Modal controls
  closeModal.addEventListener('click', closeEditModal);
  saveEditBtn.addEventListener('click', saveEdit);
  window.addEventListener('click', outsideModalClick);
  
  // File input changes
  photoInput.addEventListener('change', (e) => {
    fileName.textContent = e.target.files[0]?.name || 'No file chosen';
  });
  
  editPhotoInput.addEventListener('change', (e) => {
    editFileName.textContent = e.target.files[0]?.name || 'Keep current image';
  });
  
  // Submit on Enter key
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEntry();
  });
  
  paraInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEntry();
  });
}

// Save data to localStorage
function saveToLocalStorage() {
  localStorage.setItem('crudData', JSON.stringify(entries));
  updateEntryCount();
}

// Update the entry count display
function updateEntryCount() {
  const count = entries.length;
  entryCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
  
  // Show/hide empty state
  emptyState.style.display = count === 0 ? 'block' : 'none';
  list.style.display = count === 0 ? 'none' : 'block';
}

// Add a new entry
function addEntry() {
  const name = nameInput.value.trim();
  const para = paraInput.value.trim();
  const file = photoInput.files[0];

  if (!name) {
    showToast('Please enter a name', 'warning');
    nameInput.focus();
    return;
  }
  
  if (!para) {
    showToast('Please enter a description', 'warning');
    paraInput.focus();
    return;
  }

  const newEntry = {
    id: Date.now(),
    name,
    para,
    image: '',
    createdAt: new Date().toISOString()
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newEntry.image = e.target.result;
      entries.unshift(newEntry);
      saveToLocalStorage();
      renderList();
      resetForm();
      showToast('Entry added successfully!', 'success');
    };
    reader.onerror = () => showToast('Error reading image file', 'danger');
    reader.readAsDataURL(file);
  } else {
    entries.unshift(newEntry);
    saveToLocalStorage();
    renderList();
    resetForm();
    showToast('Entry added successfully!', 'success');
  }
}

// Reset the form after submission
function resetForm() {
  nameInput.value = '';
  paraInput.value = '';
  photoInput.value = '';
  fileName.textContent = 'No file chosen';
  nameInput.focus();
}

// Render the list of entries
function renderList() {
  list.innerHTML = '';

  let filteredEntries = filterEntries();
  sortEntries(filteredEntries);

  if (filteredEntries.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'empty-state';
    noResults.innerHTML = `
      <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 15px;"></i>
      <h3>No matching entries found</h3>
      <p>Try adjusting your search or add a new entry</p>
    `;
    list.appendChild(noResults);
    return;
  }

  filteredEntries.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('data-id', entry.id);

    const img = document.createElement('img');
    img.src = entry.image || 'https://via.placeholder.com/120?text=No+Image';
    img.alt = entry.name;
    img.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'item-content';

    const h2 = document.createElement('h2');
    h2.textContent = entry.name;

    const p = document.createElement('p');
    p.textContent = entry.para;

    const date = document.createElement('small');
    date.className = 'entry-date';
    date.textContent = formatDate(entry.createdAt);

    content.appendChild(h2);
    content.appendChild(p);
    content.appendChild(date);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.className = 'edit';
    editBtn.onclick = () => openEditModal(entry);

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Remove';
    removeBtn.className = 'remove';
    removeBtn.onclick = () => removeEntry(entry.id);

    buttons.appendChild(editBtn);
    buttons.appendChild(removeBtn);

    item.appendChild(img);
    item.appendChild(content);
    item.appendChild(buttons);

    list.appendChild(item);
  });
}

// Filter entries based on search input
function filterEntries() {
  const searchTerm = searchInput.value.toLowerCase();
  return entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm) || 
    entry.para.toLowerCase().includes(searchTerm)
  );
}

// Sort entries based on selected option
function sortEntries(entriesToSort) {
  switch (sortSelect.value) {
    case 'az':
      entriesToSort.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za':
      entriesToSort.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'oldest':
      entriesToSort.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    default: // 'newest'
      entriesToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Remove an entry
function removeEntry(id) {
  if (confirm('Are you sure you want to delete this entry?')) {
    entries = entries.filter(entry => entry.id !== id);
    saveToLocalStorage();
    renderList();
    showToast('Entry deleted', 'danger');
  }
}

// Clear all entries
function clearAllEntries() {
  if (entries.length === 0) {
    showToast('No entries to clear', 'warning');
    return;
  }

  if (confirm('Are you sure you want to delete ALL entries? This cannot be undone.')) {
    entries = [];
    saveToLocalStorage();
    renderList();
    showToast('All entries cleared', 'danger');
  }
}

// Open edit modal
function openEditModal(entry) {
  currentEditId = entry.id;
  currentEditImage = entry.image;
  editNameInput.value = entry.name;
  editParaInput.value = entry.para;
  editFileName.textContent = 'Keep current image';
  editPhotoInput.value = '';
  modal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
  modal.style.display = 'none';
}

// Save edited entry
function saveEdit() {
  const name = editNameInput.value.trim();
  const para = editParaInput.value.trim();
  const file = editPhotoInput.files[0];

  if (!name) {
    showToast('Please enter a name', 'warning');
    editNameInput.focus();
    return;
  }
  
  if (!para) {
    showToast('Please enter a description', 'warning');
    editParaInput.focus();
    return;
  }

  const entryIndex = entries.findIndex(entry => entry.id === currentEditId);
  if (entryIndex === -1) return;

  entries[entryIndex].name = name;
  entries[entryIndex].para = para;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      entries[entryIndex].image = e.target.result;
      saveToLocalStorage();
      renderList();
      closeEditModal();
      showToast('Entry updated successfully!', 'success');
    };
    reader.onerror = () => showToast('Error reading image file', 'danger');
    reader.readAsDataURL(file);
  } else {
    saveToLocalStorage();
    renderList();
    closeEditModal();
    showToast('Entry updated successfully!', 'success');
  }
}

// Close modal when clicking outside
function outsideModalClick(e) {
  if (e.target === modal) {
    closeEditModal();
  }
}

// Show toast notification
function showToast(message, type) {
  toast.textContent = message;
  toast.className = 'toast show';
  toast.classList.add(type);
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);