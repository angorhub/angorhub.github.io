// DOM Content Loaded handler
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners to buttons
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  const checkStatusBtn = document.getElementById('checkStatusBtn');
  
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function() {
      location.reload();
    });
  }
  
  if (checkStatusBtn) {
    checkStatusBtn.addEventListener('click', checkStatus);
  }
  
  // Initialize network status
  updateNetworkStatus();
});

// Auto-reload when online
window.addEventListener('online', () => {
  setTimeout(() => {
    location.reload();
  }, 1000);
});

// Check status function
function checkStatus() {
  if (navigator.onLine) {
    location.reload();
  } else {
    updateStatusText('You appear to be offline. Please check your internet connection.');
  }
}

// Update status text
function updateStatusText(message) {
  const statusText = document.querySelector('.status-text');
  if (statusText) {
    statusText.textContent = message;
  }
}

// Periodic retry
setInterval(() => {
  if (navigator.onLine) {
    fetch(location.origin, { method: 'HEAD', cache: 'no-cache' })
      .then(() => {
        location.reload();
      })
      .catch(() => {
        // Server still unavailable
      });
  }
}, 30000); // Check every 30 seconds

// Display network status
function updateNetworkStatus() {
  if (navigator.onLine) {
    updateStatusText('You are online, but the server is not responding. Please try again in a moment.');
  } else {
    updateStatusText('You are offline. Please check your internet connection and try again.');
  }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
