const video = document.querySelector('video');
const controls = document.querySelector('#controls');

async function loadHost(password) {
   password = sha256(password);
   const res = await fetch('/init', {
      method: 'POST',
      body: `password=${password}`,
      headers: { 'Content-type': 'application/x-www-form-urlencoded' }
   });
   const json = await res.json();
   if (!json.host) return false;
   json.playing;
   video.currentTime = json.position;
   controls.style.display = 'none';
   video.controls = true;
   const sendMessage = (type, data = {}) => {
      if (!type) throw 'type parameter is required';
      client.send(JSON.stringify({ password, type, ...data }));
   }
   video.onplay = () => {
      sendMessage(MESSAGES.PLAY, { position: video.currentTime });
   }
   video.onpause = () => {
      sendMessage(MESSAGES.PAUSE);
   }
   video.onseeked = (event) => {
      sendMessage(MESSAGES.SEEK, { position: video.currentTime });
   };
   return true;
}

function loadGuest() {
   const seekbarProgress = document.querySelector('.seekbar-progress');
   video.ontimeupdate = (event) => {
      seekbarProgress.style.transform = `translateX(-${(1 - video.currentTime / video.duration) * 100}%)`;
   }
}

const dialog = document.querySelector('.dialog');
const dialogContent = dialog.querySelector('.dialog-content');
function closeDialog() {
   dialog.style.opacity = '0';
   dialog.style.backdropFilter = 'blur(0)';
   dialog.addEventListener('transitionend', () => dialog.remove())
}
function handleDialogClick(type) {
   if (type === 'guest') {
      closeDialog();
      loadGuest();
   } else if (type === 'host') {
      dialogContent.innerHTML = `<form>
         <button type="button" onclick="drawStartDialogContent()" class="back-button">
         <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"></path></svg>
         </button>
         <input type="password" name="password"/>
         <button type="submit">Continue</button>
         <div class="error"></div>
      </form>`;
      const errorDiv = dialogContent.querySelector('.error');
      dialogContent.querySelector('form').addEventListener('submit', async (e) => {
         e.preventDefault();
         errorDiv.classList.add('visible');
         const password = dialogContent.querySelector('input').value;
         if (password) {
            const res = await loadHost(password);
            if (res) {
               closeDialog();
            } else {
               errorDiv.innerHTML = 'Wrong password';
               errorDiv.classList.add('visible');
            }
         }
      })
   } else {
      throw 'wrong type';
   }
}

function drawStartDialogContent() {
   dialogContent.innerHTML = `<button onclick="handleDialogClick('guest')">Guest</button>
   <button onclick="handleDialogClick('host')">Host</button>`;
}

function handleFullscreen() {
   if (document.fullscreenElement) {
      document.exitFullscreen()
   } else {
      document.body.requestFullscreen()
   }
}

let timeout;
document.onmousemove = () => {
   clearTimeout(timeout);
   controls.style.opacity = 1.0;
   timeout = setTimeout(() => {
      controls.style.opacity = 0.0;
   }, 1500);
}