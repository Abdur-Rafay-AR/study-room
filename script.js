// -------------------------
// Timer Functionality
// -------------------------
let timerInterval;
let studyDuration = 25 * 60;       // default study time (in seconds)
let shortBreakDuration = 5 * 60;   // default short break (in seconds)
let longBreakDuration = 15 * 60;   // default long break (in seconds)
let timeLeft = studyDuration;
let isPaused = true;
let currentSession = 1;
let totalSessions = 0;
let timerMode = 'study'; // 'study', 'shortBreak', 'longBreak'

// Session tracking
let sessionData = {
  study: 0,
  shortBreak: 0,
  longBreak: 0,
  dailyGoal: 8
};

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').innerText = `${pad(minutes)}:${pad(seconds)}`;
  
  // Update progress bar
  const progressBar = document.getElementById('timer-progress');
  const totalTime = timerMode === 'study' ? studyDuration : 
                   timerMode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  
  // Update document title
  document.title = `${pad(minutes)}:${pad(seconds)} - Study Room`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function startTimer() {
  if (!isPaused) return;
  isPaused = false;
  
  timerInterval = setInterval(() => {
    if (!isPaused) {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        completeSession();
      }
    }
  }, 1000);
  
  updateTimerButtons();
  showNotification('Timer started!', 'success');
}

function pauseTimer() {
  isPaused = true;
  clearInterval(timerInterval);
  updateTimerButtons();
  showNotification('Timer paused', 'info');
}

function resetTimer() {
  isPaused = true;
  clearInterval(timerInterval);
  timeLeft = getCurrentModeDuration();
  updateTimerDisplay();
  updateTimerButtons();
  showNotification('Timer reset', 'info');
}

function completeSession() {
  clearInterval(timerInterval);
  isPaused = true;
  
  // Update session data
  sessionData[timerMode]++;
  totalSessions++;
  
  // Play sound notification
  playNotificationSound();
  
  // Show completion message and auto-transition
  if (timerMode === 'study') {
    showNotification('Study session complete! Time for a break.', 'success');
    if (currentSession % 4 === 0) {
      setLongBreak();
      showNotification('Long break time!', 'success');
    } else {
      setShortBreak();
      showNotification('Short break time!', 'success');
    }
    currentSession++;
  } else {
    showNotification('Break complete! Ready for next study session?', 'success');
    setStudyMode();
  }
  
  updateSessionDisplay();
  updateTimerButtons();
}

function getCurrentModeDuration() {
  return timerMode === 'study' ? studyDuration : 
         timerMode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
}

function setStudyMode() {
  timerMode = 'study';
  timeLeft = studyDuration;
  updateTimerDisplay();
  updateModeDisplay();
}

function setShortBreak() {
  timerMode = 'shortBreak';
  timeLeft = shortBreakDuration;
  updateTimerDisplay();
  updateModeDisplay();
}

function setLongBreak() {
  timerMode = 'longBreak';
  timeLeft = longBreakDuration;
  updateTimerDisplay();
  updateModeDisplay();
}

function updateModeDisplay() {
  const modeDisplay = document.getElementById('timer-mode');
  const modeNames = {
    study: 'Study Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };
  if (modeDisplay) {
    modeDisplay.textContent = modeNames[timerMode];
  }
  
  // Update mode button states
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => btn.classList.remove('active'));
  
  const activeMode = timerMode === 'study' ? 0 : timerMode === 'shortBreak' ? 1 : 2;
  if (modeButtons[activeMode]) {
    modeButtons[activeMode].classList.add('active');
  }
}

function updateTimerButtons() {
  const startBtn = document.querySelector('[onclick="startTimer()"]');
  const pauseBtn = document.querySelector('[onclick="pauseTimer()"]');
  
  if (startBtn) startBtn.disabled = !isPaused;
  if (pauseBtn) pauseBtn.disabled = isPaused;
}

function updateSessionDisplay() {
  const sessionDisplay = document.getElementById('session-counter');
  if (sessionDisplay) {
    sessionDisplay.textContent = `Session ${currentSession} | Completed: ${totalSessions}`;
  }
  
  const progressDisplay = document.getElementById('daily-progress');
  if (progressDisplay) {
    const progress = Math.min((sessionData.study / sessionData.dailyGoal) * 100, 100);
    progressDisplay.style.width = `${progress}%`;
  }
}

function playNotificationSound() {
  const audio = document.getElementById('timer-alert-sound');
  if (audio) {
    audio.play().catch(e => console.log('Audio play failed:', e));
  }
}

// -------------------------
// Notification System
// -------------------------
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// -------------------------
// Background Color Picker Functionality
// -------------------------
function updateBackgroundColor() {
  const color = document.getElementById('bg-color-picker').value;
  document.body.style.background = color;

  const hslColor = hexToHsl(color);
  if (hslColor) {
    const hueSlider = document.getElementById('theme-hue-slider');
    const saturationSlider = document.getElementById('theme-saturation-slider');
    const lightnessSlider = document.getElementById('theme-lightness-slider');
    
    if (hueSlider) hueSlider.value = Math.round(hslColor.h);
    if (saturationSlider) saturationSlider.value = Math.round(hslColor.s);
    if (lightnessSlider) lightnessSlider.value = Math.round(hslColor.l);
    
    // Update CSS properties
    document.documentElement.style.setProperty('--primary-hue', Math.round(hslColor.h));
    document.documentElement.style.setProperty('--primary-saturation', `${Math.round(hslColor.s)}%`);
    document.documentElement.style.setProperty('--primary-lightness', `${Math.round(hslColor.l)}%`);
    
    const huePreview = document.getElementById('hue-preview');
    if (huePreview) {
      huePreview.style.backgroundColor = color;
    }
  }
}

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  } else {
    return null;
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// -------------------------
// Wallpaper Preview Functionality
// -------------------------
const wallpaperCategories = {
  nature: [
    'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg',
    'https://images.pexels.com/photos/34950/pexels-photo.jpg',
    'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg',
  ],
  abstract: [
    'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg',
    'https://images.pexels.com/photos/247600/pexels-photo-247600.jpeg',
    'https://images.pexels.com/photos/1907784/pexels-photo-1907784.jpeg',
  ],
  anime: [
    'https://get.wallhere.com/photo/landscape-digital-art-fantasy-art-sunset-night-anime-stars-evening-moonlight-atmosphere-Aurora-midnight-darkness-screenshot-computer-wallpaper-geological-phenomenon-52613.png',
    'https://wallpapercat.com/w/full/1/7/0/25940-3840x2160-desktop-4k-attack-on-titan-the-final-season-wallpaper-image.jpg',
    'https://i.pinimg.com/originals/7a/c7/1e/7ac71e72373b0fb270b3a6d72e44eea3.gif',
  ],
};

function loadWallpapers() {
  const previewContainer = document.getElementById('wallpaper-preview');
  const categorySelect = document.getElementById('wallpaper-category');
  const category = categorySelect.value;
  const selectedWallpapers = wallpaperCategories[category] || [];

  previewContainer.innerHTML = '<div class="loading">Loading wallpapers...</div>';

  setTimeout(() => {
    previewContainer.innerHTML = '';
    selectedWallpapers.forEach((url, index) => {
      const thumb = document.createElement('img');
      thumb.src = url + '?auto=compress&cs=tinysrgb&dpr=2&w=200';
      thumb.className = 'wallpaper-thumb';
      thumb.alt = `${category} wallpaper ${index + 1}`;
      thumb.onclick = function() {
        applyWallpaper(url);
      };
      thumb.onerror = function() {
        this.style.display = 'none';
      };
      previewContainer.appendChild(thumb);
    });
  }, 500);
}

function applyWallpaper(url) {
  document.body.style.background = `url('${url}') no-repeat center center fixed`;
  document.body.style.backgroundSize = 'cover';
  document.body.classList.add('wallpaper-applied');
  showNotification('Wallpaper applied successfully!', 'success');
}

// -------------------------
// To-Do List Functionality
// -------------------------
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
  const input = document.getElementById('todo-input');
  const task = input.value.trim();
  if (task === '') {
    showNotification('Please enter a task', 'error');
    return;
  }

  const todo = {
    id: Date.now(),
    text: task,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  saveTodos();
  renderTodos();
  input.value = '';
  showNotification('Task added!', 'success');
}

function toggleTodo(id) {
  todos = todos.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
  showNotification('Task removed', 'info');
}

function renderTodos() {
  const todosList = document.getElementById('todo-items');
  todosList.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';
    li.innerHTML = `
      <span onclick="toggleTodo(${todo.id})">${todo.text}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">×</button>
    `;
    todosList.appendChild(li);
  });
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// -------------------------
// Notes Functionality
// -------------------------
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function addNote() {
  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim();
  if (noteText === '') {
    showNotification('Please enter a note', 'error');
    return;
  }

  const note = {
    id: Date.now(),
    text: noteText,
    createdAt: new Date().toISOString()
  };

  notes.push(note);
  saveNotes();
  renderNotes();
  noteInput.value = '';
  showNotification('Note saved!', 'success');
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  renderNotes();
  showNotification('Note deleted', 'info');
}

function renderNotes() {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';

  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${note.text}</span>
      <small>${new Date(note.createdAt).toLocaleDateString()}</small>
      <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
    `;
    notesList.appendChild(li);
  });
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// -------------------------
// Settings Functionality
// -------------------------
function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  panel.classList.toggle('hidden');
}

function saveSettings() {
  const studyInput = document.getElementById('study-duration').value;
  const shortInput = document.getElementById('short-break-duration').value;
  const longInput = document.getElementById('long-break-duration').value;
  const dailyGoalInput = document.getElementById('daily-goal').value;

  studyDuration = parseInt(studyInput, 10) * 60 || studyDuration;
  shortBreakDuration = parseInt(shortInput, 10) * 60 || shortBreakDuration;
  longBreakDuration = parseInt(longInput, 10) * 60 || longBreakDuration;
  sessionData.dailyGoal = parseInt(dailyGoalInput, 10) || sessionData.dailyGoal;

  resetTimer();
  updateSessionDisplay();
  showNotification('Settings saved successfully!', 'success');
  
  // Save to localStorage
  localStorage.setItem('studySettings', JSON.stringify({
    studyDuration: studyDuration / 60,
    shortBreakDuration: shortBreakDuration / 60,
    longBreakDuration: longBreakDuration / 60,
    dailyGoal: sessionData.dailyGoal
  }));
}

function loadSettings() {
  const savedSettings = JSON.parse(localStorage.getItem('studySettings'));
  if (savedSettings) {
    studyDuration = savedSettings.studyDuration * 60;
    shortBreakDuration = savedSettings.shortBreakDuration * 60;
    longBreakDuration = savedSettings.longBreakDuration * 60;
    sessionData.dailyGoal = savedSettings.dailyGoal;
    
    // Update UI
    document.getElementById('study-duration').value = savedSettings.studyDuration;
    document.getElementById('short-break-duration').value = savedSettings.shortBreakDuration;
    document.getElementById('long-break-duration').value = savedSettings.longBreakDuration;
    document.getElementById('daily-goal').value = savedSettings.dailyGoal;
  }
}

// -------------------------
// Light/Dark Mode Toggle
// -------------------------
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  const modeLabel = document.getElementById('mode-label');
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  modeLabel.innerText = isDarkMode ? "Dark Mode" : "Light Mode";
  
  // Force update all elements that might not sync automatically
  updateDarkModeElements(isDarkMode);
  
  // Save preference
  localStorage.setItem('darkMode', isDarkMode);
}

function updateDarkModeElements(isDarkMode) {
  // The new CSS handles dark mode automatically via CSS variables
  // This function can be simplified or removed as the new design 
  // uses CSS custom properties for theming
  
  // Update any remaining elements that need manual JS control
  const elementsToUpdate = document.querySelectorAll('input, textarea, select');
  elementsToUpdate.forEach(element => {
    // The CSS handles styling, but we can add focus states here if needed
  });
}

// -------------------------
// YouTube Video Player
// -------------------------
function playVideoFromUrl() {
  const urlInput = document.getElementById('video-url-input').value.trim();
  if (urlInput === '') {
    showNotification('Please enter a YouTube URL', 'error');
    return;
  }

  try {
    let videoId = extractVideoId(urlInput);
    if (!videoId) {
      showNotification('Invalid YouTube URL', 'error');
      return;
    }

    const iframe = document.getElementById('video-player-iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    showNotification('Video loaded successfully!', 'success');
  } catch (error) {
    showNotification('Error loading video', 'error');
  }
}

function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// -------------------------
// Focus Mode Functionality
// -------------------------
function toggleFocusMode() {
  document.body.classList.toggle('focus-mode');
  const focusButton = document.getElementById('focus-toggle');
  const isFocusMode = document.body.classList.contains('focus-mode');
  
  focusButton.textContent = isFocusMode ? 'Show All' : 'Focus Mode';
  
  if (!isFocusMode) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }
}

// -------------------------
// Keyboard Shortcuts
// -------------------------
function handleKeyboardShortcuts(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        isPaused ? startTimer() : pauseTimer();
        break;
      case 'r':
        event.preventDefault();
        resetTimer();
        break;
      case 'f':
        event.preventDefault();
        toggleFocusMode();
        break;
    }
  }
}

// -------------------------
// Initialize on DOM Load
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Load saved data
  loadSettings();
  renderTodos();
  renderNotes();
  
  // Load saved theme and apply it properly
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('mode-toggle').checked = true;
    document.getElementById('mode-label').innerText = 'Dark Mode';
    
    // Force update all elements to ensure proper dark mode sync
    setTimeout(() => {
      updateDarkModeElements(true);
    }, 100);
  }
  
  // Initialize timer
  updateTimerDisplay();
  updateModeDisplay();
  updateSessionDisplay();
  updateTimerButtons();
  
  // Load wallpapers
  loadWallpapers();

  // Enhanced Theme Controls with full color range support
  const hueSlider = document.getElementById('theme-hue-slider');
  const saturationSlider = document.getElementById('theme-saturation-slider');
  const lightnessSlider = document.getElementById('theme-lightness-slider');
  const huePreview = document.getElementById('hue-preview');

  function updateThemeColor() {
    const hue = hueSlider ? hueSlider.value : 210;
    const saturation = saturationSlider ? saturationSlider.value : 70;
    const lightness = lightnessSlider ? lightnessSlider.value : 55;
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--primary-hue', hue);
    document.documentElement.style.setProperty('--primary-saturation', `${saturation}%`);
    document.documentElement.style.setProperty('--primary-lightness', `${lightness}%`);
    
    // Update preview
    if (huePreview) {
      huePreview.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Update saturation slider background
    if (saturationSlider) {
      const baseColor = `hsl(${hue}, 100%, ${lightness}%)`;
      const grayColor = `hsl(${hue}, 0%, ${lightness}%)`;
      saturationSlider.style.background = `linear-gradient(90deg, ${grayColor}, ${baseColor})`;
    }
    
    // Save theme settings
    localStorage.setItem('themeSettings', JSON.stringify({
      hue: parseInt(hue),
      saturation: parseInt(saturation),
      lightness: parseInt(lightness)
    }));
  }

  function loadThemeSettings() {
    const savedTheme = JSON.parse(localStorage.getItem('themeSettings'));
    if (savedTheme) {
      if (hueSlider) hueSlider.value = savedTheme.hue || 210;
      if (saturationSlider) saturationSlider.value = savedTheme.saturation || 70;
      if (lightnessSlider) lightnessSlider.value = savedTheme.lightness || 55;
      updateThemeColor();
    } else {
      // Initialize with default values
      updateThemeColor();
    }
  }

  // Initialize theme controls
  loadThemeSettings();

  // Add event listeners for theme controls
  if (hueSlider) {
    hueSlider.addEventListener('input', updateThemeColor);
  }
  if (saturationSlider) {
    saturationSlider.addEventListener('input', updateThemeColor);
  }
  if (lightnessSlider) {
    lightnessSlider.addEventListener('input', updateThemeColor);
  }

  // Event listeners
  document.addEventListener('keydown', handleKeyboardShortcuts);
  document.getElementById('wallpaper-category').addEventListener('change', loadWallpapers);
  
  // Add Enter key support for inputs
  document.getElementById('todo-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  document.getElementById('note-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) addNote();
  });
  
  document.getElementById('video-url-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') playVideoFromUrl();
  });
  
  // Auto-save session data
  setInterval(() => {
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }, 30000);
  
  // Add transition class for smooth mode switching
  document.getElementById('mode-toggle').addEventListener('change', () => {
    document.body.classList.add('transition-mode');
    setTimeout(() => {
      document.body.classList.remove('transition-mode');
    }, 500);
  });
  
  // Initialize mode button states
  updateModeDisplay();
  
  // Add enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return; // Don't override input focus
    
    switch(e.key) {
      case '1':
        setStudyMode();
        break;
      case '2':
        setShortBreak();
        break;
      case '3':
        setLongBreak();
        break;
    }
  });
  
  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Enhanced focus management
  const focusableElements = document.querySelectorAll(
    'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  // Add visual feedback for keyboard navigation
  focusableElements.forEach(element => {
    element.addEventListener('focus', () => {
      element.style.outline = `2px solid var(--primary-color)`;
      element.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', () => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    });
  });
});
