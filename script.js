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
    'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
    'https://images.pexels.com/photos/417142/pexels-photo-417142.jpeg',
    'https://images.pexels.com/photos/1529881/pexels-photo-1529881.jpeg',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    'https://images.unsplash.com/photo-1750173588233-8cd7ba259c15',
  
  ],
  abstract: [
    'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg',
    'https://images.pexels.com/photos/247600/pexels-photo-247600.jpeg',
    'https://images.pexels.com/photos/1907784/pexels-photo-1907784.jpeg',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=800&q=80',
  ],
  anime: [
    'https://get.wallhere.com/photo/landscape-digital-art-fantasy-art-sunset-night-anime-stars-evening-moonlight-atmosphere-Aurora-midnight-darkness-screenshot-computer-wallpaper-geological-phenomenon-52613.png',
    'https://wallpapercat.com/w/full/1/7/0/25940-3840x2160-desktop-4k-attack-on-titan-the-final-season-wallpaper-image.jpg',
    'https://i.pinimg.com/originals/7a/c7/1e/7ac71e72373b0fb270b3a6d72e44eea3.gif',
    'https://i.imgur.com/UmZUS1k.png',
    'https://images8.alphacoders.com/100/1005531.jpg',
    'https://images6.alphacoders.com/909/909547.jpg',
    'https://images3.alphacoders.com/823/823168.jpg',
    'https://images2.alphacoders.com/601/601705.jpg',
    'https://images.wallpapersden.com/image/download/your-name-anime-artwork_bWZqZ2mUmZqaraWkpJRmbmdlrWZlbWU.jpg',
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
      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'wallpaper-thumb-container';
      
      const thumb = document.createElement('img');
      thumb.src = url;
      thumb.className = 'wallpaper-thumb';
      thumb.alt = `${category} wallpaper ${index + 1}`;
      thumb.loading = 'lazy';
      
      thumb.onload = function() {
        thumbContainer.classList.add('loaded');
      };
      
      thumb.onclick = function() {
        // Add visual feedback
        document.querySelectorAll('.wallpaper-thumb-container').forEach(container => {
          container.classList.remove('selected');
        });
        thumbContainer.classList.add('selected');
        applyWallpaper(url);
      };
      
      thumb.onerror = function() {
        thumbContainer.innerHTML = `
          <div class="wallpaper-error">
            <span>⚠️</span>
            <small>Failed to load</small>
          </div>
        `;
        thumbContainer.classList.add('error');
      };
      
      thumbContainer.appendChild(thumb);
      previewContainer.appendChild(thumbContainer);
    });
  }, 300);
}

// -------------------------
// Background Blur Functionality
// -------------------------
function updateBackgroundBlur() {
  const blurSlider = document.getElementById('blur-slider');
  const blurValue = document.getElementById('blur-value');
  const blurIntensity = blurSlider.value;
  
  blurValue.textContent = `${blurIntensity}px`;
  
  if (blurIntensity > 0) {
    document.body.classList.add('background-blur');
    document.documentElement.style.setProperty('--bg-blur-intensity', `${blurIntensity}px`);
  } else {
    document.body.classList.remove('background-blur');
    document.documentElement.style.setProperty('--bg-blur-intensity', '0px');
  }
  
  // Save blur setting
  localStorage.setItem('backgroundBlur', blurIntensity);
  
  if (blurIntensity > 0) {
    showNotification(`Background blur set to ${blurIntensity}px`, 'success');
  }
}

function loadBackgroundBlur() {
  const savedBlur = localStorage.getItem('backgroundBlur');
  if (savedBlur !== null) {
    const blurSlider = document.getElementById('blur-slider');
    const blurValue = document.getElementById('blur-value');
    
    if (blurSlider) blurSlider.value = savedBlur;
    if (blurValue) blurValue.textContent = `${savedBlur}px`;
    
    if (savedBlur > 0) {
      document.body.classList.add('background-blur');
      document.documentElement.style.setProperty('--bg-blur-intensity', `${savedBlur}px`);
    }
  }
}

// -------------------------
// Glass Mode Functionality
// -------------------------
function toggleGlassMode() {
  const glassModeToggle = document.getElementById('glass-mode-toggle');
  const glassModeLabel = document.getElementById('glass-mode-label');
  const isGlassMode = glassModeToggle.checked;
  
  if (isGlassMode) {
    document.body.classList.add('glass-mode');
    glassModeLabel.textContent = 'Enabled';
    showNotification('Glass mode enabled', 'success');
  } else {
    document.body.classList.remove('glass-mode');
    glassModeLabel.textContent = 'Disabled';
    showNotification('Glass mode disabled', 'info');
  }
  
  // Save glass mode setting
  localStorage.setItem('glassMode', isGlassMode);
}

function loadGlassMode() {
  const savedGlassMode = localStorage.getItem('glassMode') === 'true';
  const glassModeToggle = document.getElementById('glass-mode-toggle');
  const glassModeLabel = document.getElementById('glass-mode-label');
  
  if (savedGlassMode) {
    document.body.classList.add('glass-mode');
    if (glassModeToggle) glassModeToggle.checked = true;
    if (glassModeLabel) glassModeLabel.textContent = 'Enabled';
  }
}

// -------------------------
// Enhanced Wallpaper Application
// -------------------------
function applyWallpaper(url) {
  document.body.style.background = `url('${url}') no-repeat center center fixed`;
  document.body.style.backgroundSize = 'cover';
  document.body.classList.add('wallpaper-applied');
  
  // If glass mode is enabled, the wallpaper will show through the glass effect
  const isGlassMode = document.body.classList.contains('glass-mode');
  if (isGlassMode) {
    showNotification('Wallpaper applied with glass effect!', 'success');
  } else {
    showNotification('Wallpaper applied successfully!', 'success');
  }
  
  // Save wallpaper setting
  localStorage.setItem('currentWallpaper', url);
}

function loadWallpaper() {
  const savedWallpaper = localStorage.getItem('currentWallpaper');
  if (savedWallpaper) {
    document.body.style.background = `url('${savedWallpaper}') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
    document.body.classList.add('wallpaper-applied');
  }
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

  // Sort todos: incomplete tasks first, completed tasks at bottom
  const sortedTodos = todos.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  sortedTodos.forEach(todo => {
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
function getNotes() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

function saveNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}

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

  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
  renderNotes();
  noteInput.value = '';
  showNotification('Note saved!', 'success');
}

function deleteNote(id) {
  let notes = getNotes();
  notes = notes.filter(note => note.id !== id);
  saveNotes(notes);
  renderNotes();
  showNotification('Note deleted', 'info');
}

function renderNotes() {
  const notesList = document.getElementById('notes-list');
  if (!notesList) {
    return;
  }
  const notes = getNotes();
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

  // Save timer settings
  localStorage.setItem('studySettings', JSON.stringify({
    studyDuration: studyDuration / 60,
    shortBreakDuration: shortBreakDuration / 60,
    longBreakDuration: longBreakDuration / 60,
    dailyGoal: sessionData.dailyGoal
  }));

  // Save current theme settings from sliders
  const hueSlider = document.getElementById('theme-hue-slider');
  const saturationSlider = document.getElementById('theme-saturation-slider');
  const lightnessSlider = document.getElementById('theme-lightness-slider');
  
  if (hueSlider && saturationSlider && lightnessSlider) {
    const themeSettings = {
      hue: parseInt(hueSlider.value),
      saturation: parseInt(saturationSlider.value),
      lightness: parseInt(lightnessSlider.value)
    };
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
  }

  // Apply theme immediately
  loadThemeSettings();
  
  // Reset timer if on timer page
  if (typeof resetTimer === 'function') {
    resetTimer();
  }
  
  // Update session display if on timer page
  if (typeof updateSessionDisplay === 'function') {
    updateSessionDisplay();
  }
  
  showNotification('All settings saved successfully!', 'success');
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
  
  if (modeLabel) {
    modeLabel.innerText = isDarkMode ? "Dark Mode" : "Light Mode";
  }
  
  // Force update all elements that might not sync automatically
  updateDarkModeElements(isDarkMode);
  
  // Save preference
  localStorage.setItem('darkMode', isDarkMode);
}

function initializeDarkMode() {
  // Default to light mode if no preference is set
  const savedDarkMode = localStorage.getItem('darkMode');
  const isDarkMode = savedDarkMode === 'true';
  const modeToggle = document.getElementById('mode-toggle');
  const modeLabel = document.getElementById('mode-label');

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (modeToggle) {
      modeToggle.checked = true;
    }
    if (modeLabel) {
      modeLabel.innerText = 'Dark Mode';
    }
    updateDarkModeElements(true);
  } else {
    // Ensure light mode is properly set (default)
    document.body.classList.remove('dark-mode');
    if (modeToggle) {
      modeToggle.checked = false;
    }
    if (modeLabel) {
      modeLabel.innerText = 'Light Mode';
    }
    updateDarkModeElements(false);
    
    // Set default preference if not already set
    if (savedDarkMode === null) {
      localStorage.setItem('darkMode', 'false');
    }
  }
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
// Navbar Functionality
// -------------------------
function toggleNavbar() {
  const navbar = document.getElementById('navbar');
  const overlay = document.getElementById('navbar-overlay');
  const isOpen = navbar.classList.contains('open');
  
  if (isOpen) {
    navbar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.classList.remove('navbar-open');
  } else {
    navbar.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('navbar-open');
  }
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

function initializeNavbar() {
  const navbar = document.getElementById('navbar');
  const overlay = document.getElementById('navbar-overlay');
  
  // Only ensure classes are correct, don't override CSS with inline styles
  if (navbar) {
    navbar.classList.remove('open');
    // Remove any inline styles that might interfere
    navbar.style.left = '';
    navbar.style.visibility = '';
    navbar.style.opacity = '';
  }
  
  // Ensure overlay is hidden
  if (overlay) {
    overlay.classList.remove('active');
  }
  
  // Ensure body doesn't have navbar-open class
  document.body.classList.remove('navbar-open');
}

// -------------------------
// Initialize on DOM Load - SINGLE CONSOLIDATED VERSION
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  // STEP 0: Initialize navbar FIRST to ensure it's hidden
  initializeNavbar();
  
  // STEP 1: Initialize dark mode FIRST before anything else
  initializeDarkMode();
  
  // STEP 1.5: Load theme settings IMMEDIATELY after dark mode
  loadThemeSettings();
  
  // STEP 2: Set active nav link on page load
  setActiveNavLink();
  
  // STEP 3: Load saved data (only for elements that exist)
  try {
    loadSettings();
  } catch (e) {
    console.log('Settings not available on this page');
  }
  
  if (document.getElementById('todo-items')) {
    renderTodos();
  }
  
  if (document.getElementById('notes-list')) {
    renderNotes();
  }
  
  // STEP 4: Load customization settings
  loadBackgroundBlur();
  loadGlassMode();
  loadWallpaper();
  
  // STEP 5: Initialize timer elements (only if they exist)
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    updateTimerDisplay();
    updateModeDisplay();
    updateSessionDisplay();
    updateTimerButtons();
  }
  
  // STEP 6: Load wallpapers (only if element exists)
  const wallpaperCategory = document.getElementById('wallpaper-category');
  if (wallpaperCategory) {
    loadWallpapers();
    wallpaperCategory.addEventListener('change', loadWallpapers);
  }

  // STEP 7: Enhanced Theme Controls with full color range support
  const hueSlider = document.getElementById('theme-hue-slider');
  const saturationSlider = document.getElementById('theme-saturation-slider');
  const lightnessSlider = document.getElementById('theme-lightness-slider');
  const huePreview = document.getElementById('hue-preview');

  function updateThemeColor() {
    const hue = hueSlider ? hueSlider.value : getStoredThemeValue('hue', 210);
    const saturation = saturationSlider ? saturationSlider.value : getStoredThemeValue('saturation', 70);
    const lightness = lightnessSlider ? lightnessSlider.value : getStoredThemeValue('lightness', 55);
    
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
    
    // Save theme settings IMMEDIATELY
    saveThemeSettings(hue, saturation, lightness);
  }

  function getStoredThemeValue(property, defaultValue) {
    const savedTheme = JSON.parse(localStorage.getItem('themeSettings'));
    return savedTheme ? (savedTheme[property] || defaultValue) : defaultValue;
  }

  function saveThemeSettings(hue, saturation, lightness) {
    const themeSettings = {
      hue: parseInt(hue),
      saturation: parseInt(saturation),
      lightness: parseInt(lightness)
    };
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    
    // Show notification only if on settings page
    if (window.location.pathname.includes('settings.html')) {
      showNotification('Theme updated!', 'success');
    }
  }

  // Initialize theme controls
  if (hueSlider || saturationSlider || lightnessSlider) {
    // Only load slider values if we're on settings page
    loadThemeSettingsForSliders();
  }

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

  // STEP 8: Event listeners
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Add Enter key support for inputs (only if they exist)
  const todoInput = document.getElementById('todo-input');
  if (todoInput) {
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  }
  
  const noteInput = document.getElementById('note-input');
  if (noteInput) {
    noteInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) addNote();
    });
  }
  
  const videoUrlInput = document.getElementById('video-url-input');
  if (videoUrlInput) {
    videoUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') playVideoFromUrl();
    });
  }
  
  // STEP 9: Auto-save session data
  setInterval(() => {
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
  }, 30000);
  
  // STEP 10: Add transition class for smooth mode switching
  const modeToggle = document.getElementById('mode-toggle');
  if (modeToggle) {
    modeToggle.addEventListener('change', () => {
      document.body.classList.add('transition-mode');
      setTimeout(() => {
        document.body.classList.remove('transition-mode');
      }, 500);
    });
  }
  
  // STEP 11: Add enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return; // Don't override input focus
    
    switch(e.key) {
      case '1':
        if (typeof setStudyMode === 'function') setStudyMode();
        break;
      case '2':
        if (typeof setShortBreak === 'function') setShortBreak();
        break;
      case '3':
        if (typeof setLongBreak === 'function') setLongBreak();
        break;
    }
  });
  
  // STEP 12: Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // STEP 13: Enhanced focus management
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
  
  // STEP 14: Auto-save customization settings
  setInterval(() => {
    saveCustomizationSettings();
  }, 30000);

  // STEP 15: Add navbar link event listeners
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Close navbar on mobile after clicking
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          toggleNavbar();
        }, 100);
      }
    });
  });

  // STEP 16: Close navbar on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const navbar = document.getElementById('navbar');
      if (navbar && navbar.classList.contains('open')) {
        toggleNavbar();
      }
    }
  });
});

// -------------------------
// Global Theme Functions (called on all pages)
// -------------------------
function loadThemeSettings() {
  const savedTheme = JSON.parse(localStorage.getItem('themeSettings'));
  if (savedTheme) {
    // Apply theme to CSS custom properties immediately
    document.documentElement.style.setProperty('--primary-hue', savedTheme.hue || 210);
    document.documentElement.style.setProperty('--primary-saturation', `${savedTheme.saturation || 70}%`);
    document.documentElement.style.setProperty('--primary-lightness', `${savedTheme.lightness || 55}%`);
    
    // Update preview if it exists
    const huePreview = document.getElementById('hue-preview');
    if (huePreview) {
      huePreview.style.backgroundColor = `hsl(${savedTheme.hue || 210}, ${savedTheme.saturation || 70}%, ${savedTheme.lightness || 55}%)`;
    }
  } else {
    // Set default theme values
    document.documentElement.style.setProperty('--primary-hue', 210);
    document.documentElement.style.setProperty('--primary-saturation', '70%');
    document.documentElement.style.setProperty('--primary-lightness', '55%');
  }
}

function loadThemeSettingsForSliders() {
  const savedTheme = JSON.parse(localStorage.getItem('themeSettings'));
  const hueSlider = document.getElementById('theme-hue-slider');
  const saturationSlider = document.getElementById('theme-saturation-slider');
  const lightnessSlider = document.getElementById('theme-lightness-slider');
  
  if (savedTheme) {
    if (hueSlider) hueSlider.value = savedTheme.hue || 210;
    if (saturationSlider) saturationSlider.value = savedTheme.saturation || 70;
    if (lightnessSlider) lightnessSlider.value = savedTheme.lightness || 55;
  } else {
    // Set default values
    if (hueSlider) hueSlider.value = 210;
    if (saturationSlider) saturationSlider.value = 70;
    if (lightnessSlider) lightnessSlider.value = 55;
  }
  
  // Update saturation slider background
  if (saturationSlider) {
    const hue = hueSlider ? hueSlider.value : 210;
    const lightness = lightnessSlider ? lightnessSlider.value : 55;
    const baseColor = `hsl(${hue}, 100%, ${lightness}%)`;
    const grayColor = `hsl(${hue}, 0%, ${lightness}%)`;
    saturationSlider.style.background = `linear-gradient(90deg, ${grayColor}, ${baseColor})`;
  }
}

// -------------------------
// Customization Settings
// -------------------------
function saveCustomizationSettings() {
  const settings = {
    backgroundBlur: document.getElementById('blur-slider')?.value || '0',
    glassMode: document.getElementById('glass-mode-toggle')?.checked || false,
    currentWallpaper: localStorage.getItem('currentWallpaper') || null,
    backgroundColor: document.getElementById('bg-color-picker')?.value || '#ffffff'
  };
  
  localStorage.setItem('customizationSettings', JSON.stringify(settings));
}

function loadCustomizationSettings() {
  const savedSettings = JSON.parse(localStorage.getItem('customizationSettings'));
  if (savedSettings) {
    // Load blur settings
    if (savedSettings.backgroundBlur) {
      const blurSlider = document.getElementById('blur-slider');
      if (blurSlider) {
        blurSlider.value = savedSettings.backgroundBlur;
        updateBackgroundBlur();
      }
    }
    
    // Load glass mode
    if (savedSettings.glassMode) {
      const glassModeToggle = document.getElementById('glass-mode-toggle');
      if (glassModeToggle) {
        glassModeToggle.checked = savedSettings.glassMode;
        toggleGlassMode();
      }
    }
    
    // Load background color
    if (savedSettings.backgroundColor) {
      const bgColorPicker = document.getElementById('bg-color-picker');
      if (bgColorPicker) {
        bgColorPicker.value = savedSettings.backgroundColor;
        updateBackgroundColor();
      }
    }
  }
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
// Data Export Functionality
// -------------------------
function exportAllData() {
  try {
    // Get current date and time for the export
    const now = new Date();
    const exportDate = now.toLocaleString();
    
    // Collect all data from localStorage
    const exportData = {
      exportInfo: {
        date: exportDate,
        version: '1.0',
        description: 'Personal Study Room Data Export'
      },
      todos: JSON.parse(localStorage.getItem('todos') || '[]'),
      notes: JSON.parse(localStorage.getItem('notes') || '[]'),
      sessionData: JSON.parse(localStorage.getItem('sessionData') || '{}'),
      studySettings: JSON.parse(localStorage.getItem('studySettings') || '{}'),
      themeSettings: JSON.parse(localStorage.getItem('themeSettings') || '{}'),
      customizationSettings: JSON.parse(localStorage.getItem('customizationSettings') || '{}'),
      preferences: {
        darkMode: localStorage.getItem('darkMode') || 'false',
        glassMode: localStorage.getItem('glassMode') || 'false',
        backgroundBlur: localStorage.getItem('backgroundBlur') || '0',
        currentWallpaper: localStorage.getItem('currentWallpaper') || null
      }
    };
    
    // Format data as readable text
    const formattedData = formatDataForExport(exportData);
    
    // Create and download file
    downloadTextFile(formattedData, `StudyRoom_Data_${now.toISOString().split('T')[0]}.txt`);
    
    showNotification('Data exported successfully!', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    showNotification('Failed to export data', 'error');
  }
}

function formatDataForExport(data) {
  let output = '';
  
  // Header
  output += '='.repeat(60) + '\n';
  output += '           PERSONAL STUDY ROOM - DATA EXPORT\n';
  output += '='.repeat(60) + '\n';
  output += `Export Date: ${data.exportInfo.date}\n`;
  output += `Version: ${data.exportInfo.version}\n`;
  output += '\n';
  
  // Tasks Section
  output += '📋 TASKS\n';
  output += '-'.repeat(30) + '\n';
  if (data.todos && data.todos.length > 0) {
    data.todos.forEach((todo, index) => {
      const status = todo.completed ? '✅' : '⏳';
      const createdDate = new Date(todo.createdAt).toLocaleDateString();
      output += `${index + 1}. ${status} ${todo.text}\n`;
      output += `   Created: ${createdDate}\n\n`;
    });
  } else {
    output += 'No tasks found.\n\n';
  }
  
  // Notes Section
  output += '📝 NOTES\n';
  output += '-'.repeat(30) + '\n';
  if (data.notes && data.notes.length > 0) {
    data.notes.forEach((note, index) => {
      const createdDate = new Date(note.createdAt).toLocaleDateString();
      output += `${index + 1}. ${note.text}\n`;
      output += `   Created: ${createdDate}\n\n`;
    });
  } else {
    output += 'No notes found.\n\n';
  }
  
  // Session Statistics
  output += '📊 SESSION STATISTICS\n';
  output += '-'.repeat(30) + '\n';
  if (data.sessionData && Object.keys(data.sessionData).length > 0) {
    output += `Study Sessions Completed: ${data.sessionData.study || 0}\n`;
    output += `Short Breaks Completed: ${data.sessionData.shortBreak || 0}\n`;
    output += `Long Breaks Completed: ${data.sessionData.longBreak || 0}\n`;
    output += `Daily Goal: ${data.sessionData.dailyGoal || 8} sessions\n\n`;
  } else {
    output += 'No session data found.\n\n';
  }
  
  // Timer Settings
  output += '⏰ TIMER SETTINGS\n';
  output += '-'.repeat(30) + '\n';
  if (data.studySettings && Object.keys(data.studySettings).length > 0) {
    output += `Study Duration: ${data.studySettings.studyDuration || 25} minutes\n`;
    output += `Short Break Duration: ${data.studySettings.shortBreakDuration || 5} minutes\n`;
    output += `Long Break Duration: ${data.studySettings.longBreakDuration || 15} minutes\n`;
    output += `Daily Goal: ${data.studySettings.dailyGoal || 8} sessions\n\n`;
  } else {
    output += 'Using default timer settings.\n\n';
  }
  
  // Theme Settings
  output += '🎨 THEME SETTINGS\n';
  output += '-'.repeat(30) + '\n';
  if (data.themeSettings && Object.keys(data.themeSettings).length > 0) {
    output += `Theme Hue: ${data.themeSettings.hue || 210}\n`;
    output += `Theme Saturation: ${data.themeSettings.saturation || 70}%\n`;
    output += `Theme Lightness: ${data.themeSettings.lightness || 55}%\n\n`;
  } else {
    output += 'Using default theme settings.\n\n';
  }
  
  // Customization Settings
  output += '✨ CUSTOMIZATION SETTINGS\n';
  output += '-'.repeat(30) + '\n';
  output += `Dark Mode: ${data.preferences.darkMode === 'true' ? 'Enabled' : 'Disabled'}\n`;
  output += `Glass Mode: ${data.preferences.glassMode === 'true' ? 'Enabled' : 'Disabled'}\n`;
  output += `Background Blur: ${data.preferences.backgroundBlur || 0}px\n`;
  if (data.preferences.currentWallpaper) {
    output += `Current Wallpaper: ${data.preferences.currentWallpaper}\n`;
  } else {
    output += 'Current Wallpaper: None\n';
  }
  output += '\n';
  
  // Footer
  output += '='.repeat(60) + '\n';
  output += 'End of Export - Personal Study Room\n';
  output += `Generated on ${data.exportInfo.date}\n`;
  output += '='.repeat(60) + '\n';
  
  return output;
}

function downloadTextFile(content, filename) {
  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(link.href);
}

// -------------------------
// Data Import Functionality (Enhanced)
// -------------------------
function importData() {
  // Create file input for importing data
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.json';
  input.style.display = 'none';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (file) {
      showNotification('Reading file...', 'info');
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const content = e.target.result;
          
          // Try to parse as JSON first (for future JSON imports)
          if (file.name.endsWith('.json')) {
            try {
              const jsonData = JSON.parse(content);
              importJsonData(jsonData);
              return;
            } catch (jsonError) {
              showNotification('Invalid JSON file format', 'error');
              return;
            }
          }
          
          // For now, show the content preview (placeholder for full import)
          showImportPreview(content, file.name);
          
        } catch (error) {
          console.error('Import error:', error);
          showNotification('Failed to read file', 'error');
        }
      };
      
      reader.onerror = function() {
        showNotification('Error reading file', 'error');
      };
      
      reader.readAsText(file);
    }
    document.body.removeChild(input);
  };
  
  document.body.appendChild(input);
  input.click();
}

function showImportPreview(content, filename) {
  // Create a modal-like preview
  const preview = document.createElement('div');
  preview.className = 'import-preview-modal';
  preview.innerHTML = `
    <div class="import-preview-content">
      <div class="import-preview-header">
        <h3>Import Preview: ${filename}</h3>
        <button onclick="closeImportPreview()" class="close-preview-btn">×</button>
      </div>
      <div class="import-preview-body">
        <p>File content preview (first 500 characters):</p>
        <pre class="import-preview-text">${content.substring(0, 500)}${content.length > 500 ? '...' : ''}</pre>
        <div class="import-preview-actions">
          <button onclick="closeImportPreview()" class="preview-action-btn secondary">Cancel</button>
          <button onclick="confirmImport('${filename}')" class="preview-action-btn primary">Import Feature Coming Soon!</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(preview);
  
  // Add styles dynamically
  if (!document.getElementById('import-preview-styles')) {
    const styles = document.createElement('style');
    styles.id = 'import-preview-styles';
    styles.textContent = `
      .import-preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        backdrop-filter: blur(5px);
      }
      
      .import-preview-content {
        background: var(--bg-primary);
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-xl);
        max-width: 600px;
        max-height: 80vh;
        width: 90%;
        overflow: hidden;
      }
      
      .glass-mode .import-preview-content {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .glass-mode.dark-mode .import-preview-content {
        background: rgba(17, 24, 39, 0.3);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .import-preview-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-secondary);
      }
      
      .glass-mode .import-preview-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }
      
      .glass-mode.dark-mode .import-preview-header {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .import-preview-header h3 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.125rem;
      }
      
      .close-preview-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--border-radius);
        transition: var(--transition);
      }
      
      .close-preview-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      
      .import-preview-body {
        padding: var(--spacing-lg);
        overflow-y: auto;
        max-height: 60vh;
      }
      
      .import-preview-text {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        white-space: pre-wrap;
        overflow-x: auto;
        color: var(--text-primary);
        margin: var(--spacing-md) 0;
      }
      
      .glass-mode .import-preview-text {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .glass-mode.dark-mode .import-preview-text {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .import-preview-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;
        margin-top: var(--spacing-lg);
      }
      
      .preview-action-btn {
        padding: var(--spacing-sm) var(--spacing-lg);
        border: none;
        border-radius: var(--border-radius);
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
      }
      
      .preview-action-btn.primary {
        background: var(--primary-color);
        color: white;
      }
      
      .preview-action-btn.primary:hover {
        background: var(--primary-color-darker);
      }
      
      .preview-action-btn.secondary {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
      
      .preview-action-btn.secondary:hover {
        background: var(--bg-secondary);
      }
    `;
    document.head.appendChild(styles);
  }
}

function closeImportPreview() {
  const modal = document.querySelector('.import-preview-modal');
  if (modal) {
    modal.remove();
  }
}

function confirmImport(filename) {
  closeImportPreview();
  showNotification('Import feature will be available in a future update!', 'info');
}

function importJsonData(data) {
  // Placeholder for future JSON import functionality
  showNotification('JSON import feature coming soon!', 'info');
}

// Music Player Popup Functions
function toggleMusicPlayer() {
  const popup = document.getElementById('music-popup');
  const overlay = document.getElementById('music-popup-overlay');
  const isActive = popup.classList.contains('active');
  
  if (isActive) {
    // Close popup
    popup.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    // Open popup
    popup.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Function to play video from URL
function playVideoFromUrl() {
  const urlInput = document.getElementById('video-url-input');
  const iframe = document.getElementById('video-player-iframe');
  const url = urlInput.value.trim();
  
  if (!url) {
    alert('Please enter a YouTube URL');
    return;
  }
  
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  // Standard YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }
  
  if (videoId) {
    // Update iframe src with new video ID
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    urlInput.value = ''; // Clear input
    
    // Show success feedback
    const button = document.getElementById('video-url-button');
    const originalText = button.textContent;
    button.textContent = 'Loaded!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  } else {
    alert('Please enter a valid YouTube URL');
  }
}

// Close popup when pressing Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const popup = document.getElementById('music-popup');
    if (popup && popup.classList.contains('active')) {
      toggleMusicPlayer();
    }
  }
});

// Prevent popup from closing when clicking inside the popup content
document.addEventListener('DOMContentLoaded', function() {
  const popupContent = document.querySelector('.music-popup-content');
  if (popupContent) {
    popupContent.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
});
