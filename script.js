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
// Background Changer (Random)
// -------------------------
const backgrounds = [
'#7a96cc',
'#cc7ac8',
'#c24040',
'#6040c2',
];

function changeBackground() {
  const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  document.body.style.background = randomBg;
  if (randomBg.startsWith('url')) {
    document.body.style.backgroundSize = 'cover';
  }
}

// -------------------------
// Wallpaper Preview Functionality
// -------------------------
// An array of wallpapers (from Pexels)
const wallpapers = [
  'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg',
  'https://images.pexels.com/photos/34950/pexels-photo.jpg',
  'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg',
  'https://images.pexels.com/photos/247600/pexels-photo-247600.jpeg',
  'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg'
];

function loadWallpapers() {
  const previewContainer = document.getElementById('wallpaper-preview');
  previewContainer.innerHTML = '';
  wallpapers.forEach(url => {
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
// Initialize on DOM Load
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateTimerDisplay();
  loadWallpapers();
  document.getElementById('mode-toggle').addEventListener('change', () => {
    document.body.classList.add('transition-mode');
    setTimeout(() => {
      document.body.classList.remove('transition-mode');
    }, 500);
  });
});
