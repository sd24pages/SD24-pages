// Session Manager - Auto-logout after 15 minutes of inactivity
// Include this file in all pages that require authentication

class SessionManager {
  constructor(options = {}) {
    this.inactivityTimeout = options.inactivityTimeout || 15 * 60 * 1000; // 15 minutes in milliseconds
    this.warningTimeout = options.warningTimeout || 13 * 60 * 1000; // Show warning at 13 minutes
    this.showWarning = options.showWarning !== false; // Show warning by default
    
    this.inactivityTimer = null;
    this.warningTimer = null;
    this.lastActivityTime = Date.now();
    this.isWarningShown = false;
    
    this.init();
  }

  /**
   * Initialize session manager
   */
  init() {
    // Check if user is logged in
    if (!this.isUserLoggedIn()) {
      return;
    }

    // Track user activity
    this.setupActivityListeners();
    
    // Start the inactivity check
    this.startInactivityTimer();
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Setup activity listeners
   */
  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(), true);
    });

    console.log('✓ Session manager initialized - Auto-logout in 15 minutes of inactivity');
  }

  /**
   * Reset the inactivity timer
   */
  resetInactivityTimer() {
    this.lastActivityTime = Date.now();
    this.isWarningShown = false;

    // Clear existing timers
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Hide warning if shown
    this.hideWarning();

    // Start new timer
    this.startInactivityTimer();
  }

  /**
   * Start the inactivity timer
   */
  startInactivityTimer() {
    // Set warning timer
    this.warningTimer = setTimeout(() => {
      if (this.isUserLoggedIn()) {
        this.showWarningMessage();
      }
    }, this.warningTimeout);

    // Set logout timer
    this.inactivityTimer = setTimeout(() => {
      if (this.isUserLoggedIn()) {
        this.logout();
      }
    }, this.inactivityTimeout);
  }

  /**
   * Show inactivity warning
   */
  showWarningMessage() {
    if (this.isWarningShown || !this.showWarning) return;

    this.isWarningShown = true;
    const remainingTime = Math.round((this.inactivityTimeout - this.warningTimeout) / 1000);

    // Create warning element
    const warning = document.createElement('div');
    warning.id = 'session-warning';
    warning.className = 'session-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <div class="warning-icon">⏱️</div>
        <div class="warning-text">
          <p class="warning-title">Session Timeout Warning</p>
          <p class="warning-message">You will be automatically logged out in <strong>${remainingTime} minutes</strong> due to inactivity.</p>
        </div>
        <div class="warning-actions">
          <button class="btn-stay-logged-in" onclick="sessionManager.resetInactivityTimer()">Stay Logged In</button>
          <button class="btn-logout-now" onclick="sessionManager.logout()">Logout Now</button>
        </div>
      </div>
    `;

    document.body.appendChild(warning);
    
    // Auto remove warning after timeout if user is still inactive
    setTimeout(() => {
      if (this.isWarningShown && this.isUserLoggedIn()) {
        warning.remove();
      }
    }, this.inactivityTimeout - this.warningTimeout);
  }

  /**
   * Hide warning message
   */
  hideWarning() {
    const warning = document.getElementById('session-warning');
    if (warning) {
      warning.remove();
    }
  }

  /**
   * Logout user
   */
  logout() {
    console.log('⏱️ Session expired - Auto-logout due to inactivity');

    // Clear session data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');

    // Sign out from Firebase
    if (typeof firebase !== 'undefined' && firebase.auth()) {
      firebase.auth().signOut().catch(err => console.error('Error signing out:', err));
    }

    // Show logout message
    this.showLogoutNotification();

    // Redirect to login page
    setTimeout(() => {
      window.location.href = 'auth.html?reason=session-timeout';
    }, 2000);
  }

  /**
   * Show logout notification
   */
  showLogoutNotification() {
    const notification = document.createElement('div');
    notification.className = 'logout-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">✓</div>
        <div class="notification-text">
          <p class="notification-title">Session Ended</p>
          <p class="notification-message">You have been logged out due to inactivity (15 minutes).</p>
          <p class="notification-subtitle">Redirecting to login page...</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);
  }

  /**
   * Get remaining time until logout
   */
  getRemainingTime() {
    const elapsed = Date.now() - this.lastActivityTime;
    const remaining = Math.max(0, this.inactivityTimeout - elapsed);
    return Math.round(remaining / 1000); // Return in seconds
  }

  /**
   * Get remaining time until warning
   */
  getRemainingTimeUntilWarning() {
    const elapsed = Date.now() - this.lastActivityTime;
    const remaining = Math.max(0, this.warningTimeout - elapsed);
    return Math.round(remaining / 1000); // Return in seconds
  }

  /**
   * Extend session (keeps user logged in)
   */
  extendSession() {
    this.resetInactivityTimer();
    console.log('✓ Session extended');
  }

  /**
   * Destroy session manager
   */
  destroy() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    console.log('✓ Session manager destroyed');
  }
}

// Create global instance
let sessionManager;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  sessionManager = new SessionManager({
    inactivityTimeout: 15 * 60 * 1000, // 15 minutes
    warningTimeout: 13 * 60 * 1000,    // Show warning at 13 minutes
    showWarning: true                  // Show warning dialog
  });
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (sessionManager) {
    sessionManager.destroy();
  }
});
