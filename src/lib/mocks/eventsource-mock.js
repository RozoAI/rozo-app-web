/**
 * Mock EventSource for React Native
 * This provides a minimal implementation that prevents the Stellar SDK from crashing
 */

class EventSourceMock {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.readyState = 0; // CONNECTING
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSED = 2;
    
    // Mock event handlers
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = this.OPEN;
      if (this.onopen) {
        this.onopen({ type: 'open' });
      }
    }, 100);
  }

  addEventListener(type, listener) {
    switch (type) {
      case 'open':
        this.onopen = listener;
        break;
      case 'message':
        this.onmessage = listener;
        break;
      case 'error':
        this.onerror = listener;
        break;
      case 'close':
        this.onclose = listener;
        break;
    }
  }

  removeEventListener(type, listener) {
    // Mock implementation - no-op
  }

  close() {
    this.readyState = this.CLOSED;
    if (this.onclose) {
      this.onclose({ type: 'close' });
    }
  }

  dispatchEvent(event) {
    // Mock implementation - no-op
    return true;
  }
}

// Export the mock
module.exports = EventSourceMock;
module.exports.default = EventSourceMock;
