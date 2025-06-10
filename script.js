// -------------------------
// Timer Functionality
// -------------------------
let timerInterval;
let studyDuration = 25 * 60;       // default study time (in seconds)
let shortBreakDuration = 5 * 60;   // default short break (in seconds)
let longBreakDuration = 15 * 60;   // default long break (in seconds)
let timeLeft = studyDuration;
let isPaused = true;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').innerText = `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function startTimer() {
  if (!isPaused) return; // timer already running
  isPaused = false;
  timerInterval = setInterval(() => {
    if (!isPaused) {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        alert("Time's up! Take a break.");
      }
    }
  }, 1000);
  document.getElementById('timer').classList.add('active');
}

function pauseTimer() {
  isPaused = true;
  clearInterval(timerInterval);
  document.getElementById('timer').classList.remove('active');
}

function resetTimer() {
  isPaused = true;
  clearInterval(timerInterval);
  timeLeft = studyDuration;
  updateTimerDisplay();
  document.getElementById('timer').classList.remove('active');
}

function setShortBreak() {
  isPaused = true;
  clearInterval(timerInterval);
  timeLeft = shortBreakDuration;
  updateTimerDisplay();
}

function setLongBreak() {
  isPaused = true;
  clearInterval(timerInterval);
  timeLeft = longBreakDuration;
  updateTimerDisplay();
}

// -------------------------
// Background Color Picker Functionality
// -------------------------
function updateBackgroundColor() {
  const color = document.getElementById('bg-color-picker').value;
  document.body.style.background = color;

  // Update theme hue based on selected background color
  const hslColor = hexToHsl(color);
  if (hslColor) {
    const newHue = Math.round(hslColor.h);
    document.documentElement.style.setProperty('--primary-hue', newHue);
    
    const hueSlider = document.getElementById('theme-hue-slider');
    if (hueSlider) {
      hueSlider.value = newHue;
    }
    
    const huePreview = document.getElementById('hue-preview');
    if (huePreview) {
      huePreview.style.backgroundColor = `hsl(${newHue}, var(--primary-saturation), var(--primary-lightness))`;
    }
  }
}

// Helper function to convert HEX to HSL
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
    return null; // Invalid hex color
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
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
// An array of wallpapers (from Pexels)
const wallpaperCategories = {
  nature: [
    'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg',
    'https://images.pexels.com/photos/34950/pexels-photo.jpg',
    'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg',
    // ...add more nature URLs...
  ],
  abstract: [
    'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg',
    'https://images.pexels.com/photos/247600/pexels-photo-247600.jpeg',
    'https://images.pexels.com/photos/1907784/pexels-photo-1907784.jpeg',
    // ...add more abstract URLs...
  ],
  anime: [
    'https://get.wallhere.com/photo/landscape-digital-art-fantasy-art-sunset-night-anime-stars-evening-moonlight-atmosphere-Aurora-midnight-darkness-screenshot-computer-wallpaper-geological-phenomenon-52613.png',
    'https://wallpapercat.com/w/full/1/7/0/25940-3840x2160-desktop-4k-attack-on-titan-the-final-season-wallpaper-image.jpg',
    'https://i.pinimg.com/originals/7a/c7/1e/7ac71e72373b0fb270b3a6d72e44eea3.gif',
    'https://wallpapercat.com/w/full/0/4/7/1563647-3840x2160-desktop-4k-tokyo-ghoul-background.jpg',
    'https://get.wallhere.com/photo/World-of-Warcraft-Battle-for-Azeroth-World-of-Warcraft-video-games-fire-2217642.jpg',
    // ...add more anime URLs...
  ],
};

function loadWallpapers() {
  const previewContainer = document.getElementById('wallpaper-preview');
  previewContainer.innerHTML = '';
  const categorySelect = document.getElementById('wallpaper-category');
  const category = categorySelect.value;
  const selectedWallpapers = wallpaperCategories[category] || [];

  selectedWallpapers.forEach(url => {
    const thumb = document.createElement('img');
    // Adding query parameters to get a compressed thumbnail
    thumb.src = url + '?auto=compress&cs=tinysrgb&dpr=2&w=200';
    thumb.className = 'wallpaper-thumb';
    thumb.onclick = function() {
      applyWallpaper(url);
    };
    previewContainer.appendChild(thumb);
  });
}

function applyWallpaper(url) {
  document.body.style.background = `url('${url}') no-repeat center center fixed`;
  document.body.style.backgroundSize = 'cover';
  document.body.classList.add('wallpaper-applied');
}

// -------------------------
// To-Do List Functionality
// -------------------------
function addTodo() {
  const input = document.getElementById('todo-input');
  const task = input.value.trim();
  if (task === '') return;

  const li = document.createElement('li');
  li.innerText = task;

  // Toggle completion on click
  li.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  document.getElementById('todo-items').appendChild(li);
  input.value = '';
}

// -------------------------
// Notes Functionality
// -------------------------
function addNote() {
  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim();
  if (noteText === '') return;

  const li = document.createElement('li');
  li.innerText = noteText;
  
  // Optionally, click to remove the note
  li.addEventListener('click', () => {
    li.remove();
  });

  document.getElementById('notes-list').appendChild(li);
  noteInput.value = '';
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

  // Update durations (convert minutes to seconds)
  studyDuration = parseInt(studyInput, 10) * 60 || studyDuration;
  shortBreakDuration = parseInt(shortInput, 10) * 60 || shortBreakDuration;
  longBreakDuration = parseInt(longInput, 10) * 60 || longBreakDuration;

  // Optionally, reset timer to new study duration
  resetTimer();
  alert("Settings saved!");
}

// -------------------------
// Light/Dark Mode Toggle
// -------------------------
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  const modeLabel = document.getElementById('mode-label');
  if(document.body.classList.contains('dark-mode')) {
    modeLabel.innerText = "Dark Mode";
  } else {
    modeLabel.innerText = "Light Mode";
  }
  document.querySelector('.footer').classList.toggle('dark-mode');
}

// -------------------------
// Play YouTube Video
// -------------------------
function playVideoFromUrl() {
  const urlInput = document.getElementById('video-url-input').value.trim();
  if (urlInput === '') return;

  const videoId = urlInput.split('v=')[1];
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }

  const iframe = document.getElementById('video-player-iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
}

// -------------------------
// Initialize on DOM Load
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateTimerDisplay();
  loadWallpapers();

  // Theme Hue Slider Functionality
  const hueSlider = document.getElementById('theme-hue-slider');
  const huePreview = document.getElementById('hue-preview');

  function updateThemeHue(hueValue) {
    document.documentElement.style.setProperty('--primary-hue', hueValue);
    if (huePreview) {
      // Use the CSS variables for saturation and lightness for the preview
      const saturation = getComputedStyle(document.documentElement).getPropertyValue('--primary-saturation').trim();
      const lightness = getComputedStyle(document.documentElement).getPropertyValue('--primary-lightness').trim();
      huePreview.style.backgroundColor = `hsl(${hueValue}, ${saturation}, ${lightness})`;
    }
  }

  if (hueSlider) {
    // Initialize preview
    updateThemeHue(hueSlider.value);

    hueSlider.addEventListener('input', (event) => {
      updateThemeHue(event.target.value);
    });
  }
  
  // Initialize background color picker to potentially set initial hue
  // if a default color is set in HTML that's not black/white
  const bgColorPicker = document.getElementById('bg-color-picker');
  if (bgColorPicker.value !== '#000000' && bgColorPicker.value !== '#ffffff') {
      // Call updateBackgroundColor to sync theme hue if a color is pre-selected
      // However, this might override the slider's default if not careful.
      // For now, let slider be the master on load, and picker updates it on change.
  }


  document.getElementById('mode-toggle').addEventListener('change', () => {
    document.body.classList.add('transition-mode');
    setTimeout(() => {
      document.body.classList.remove('transition-mode');
    }, 500);
  });
  document.getElementById('video-url-button').addEventListener('click', playVideoFromUrl);
  document.getElementById('wallpaper-category').addEventListener('change', loadWallpapers);
});

function playVideoFromUrl() {
  const urlInput = document.getElementById('video-url-input').value.trim();
  if (urlInput === '') return;

  let videoId = urlInput.split('v=')[1];
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }

  const iframe = document.getElementById('video-player-iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
}

// -------------------------
// Focus Mode Functionality
// -------------------------
function toggleFocusMode() {
  document.body.classList.toggle('focus-mode');
  const focusButton = document.getElementById('focus-toggle');
  const isFocusMode = document.body.classList.contains('focus-mode');
  
  focusButton.textContent = isFocusMode ? 'Show All' : 'Focus Mode';
  
  // Reset timer position
  if (!isFocusMode) {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }
}