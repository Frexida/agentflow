/**
 * AgentFlow Gateway Client
 * WebSocket RPC client for OpenClaw Gateway
 */
class GatewayClient extends EventTarget {
  constructor() {
    super();
    this.ws = null;
    this.token = '';
    this.url = '';
    this.connected = false;
    this.reqId = 0;
    this.pending = new Map(); // id → {resolve, reject, timeout}
    this.sessions = [];
    this.pollTimer = null;
  }

  async connect(url, token) {
    if (this.ws) this.disconnect();
    this.url = url;
    this.token = token;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
      } catch (e) {
        reject(new Error('Invalid WebSocket URL'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
        this.disconnect();
      }, 10000);

      this.ws.onopen = () => {
        // Wait for connect.challenge, then send connect
      };

      this.ws.onmessage = (evt) => {
        let msg;
        try { msg = JSON.parse(evt.data); } catch { return; }

        // Handle connect.challenge
        if (msg.type === 'event' && msg.event === 'connect.challenge') {
          this._sendConnect();
          return;
        }

        // Handle connect response
        if (msg.type === 'res' && msg.payload?.type === 'hello-ok') {
          clearTimeout(timeout);
          this.connected = true;
          this._emit('connected');
          resolve();
          return;
        }

        // Handle RPC responses
        if (msg.type === 'res' && msg.id) {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            clearTimeout(p.timeout);
            if (msg.ok) {
              p.resolve(msg.payload);
            } else {
              p.reject(new Error(msg.error?.message || 'RPC error'));
            }
          }
          return;
        }

        // Handle events (chat, session updates, etc.)
        if (msg.type === 'event') {
          this._emit('gateway-event', msg);
          
          // Chat events for live message flow
          if (msg.event === 'chat') {
            this._emit('chat-event', msg.payload);
          }
        }

        // Handle connect errors
        if (msg.type === 'res' && !msg.ok) {
          clearTimeout(timeout);
          reject(new Error(msg.error?.message || 'Connection failed'));
          this.disconnect();
        }
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onclose = (evt) => {
        clearTimeout(timeout);
        this.connected = false;
        this._emit('disconnected', { code: evt.code, reason: evt.reason });
        if (!this.connected) {
          reject(new Error(evt.reason || 'Connection closed'));
        }
      };
    });
  }

  _sendConnect() {
    const connectMsg = {
      type: 'req',
      id: this._nextId(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'agentflow',
          version: '1.0.0',
          platform: 'web',
          mode: 'operator'
        },
        role: 'operator',
        scopes: ['operator.read'],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: this.token },
        locale: navigator.language || 'en-US',
        userAgent: 'AgentFlow/1.0.0'
      }
    };
    this.ws.send(JSON.stringify(connectMsg));
  }

  _nextId() {
    return `af-${++this.reqId}`;
  }

  _emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async rpc(method, params = {}) {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected');
    }
    const id = this._nextId();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC timeout: ${method}`));
      }, 15000);

      this.pending.set(id, { resolve, reject, timeout });
      this.ws.send(JSON.stringify({
        type: 'req',
        id,
        method,
        params
      }));
    });
  }

  async getSessions() {
    const result = await this.rpc('sessions.list');
    this.sessions = result?.sessions || result || [];
    return this.sessions;
  }

  async getChatHistory(sessionKey, limit = 30) {
    return await this.rpc('chat.history', { sessionKey, limit });
  }

  async sendMessage(sessionKey, message) {
    return await this.rpc('chat.send', { sessionKey, message });
  }

  startPolling(intervalMs = 5000) {
    this.stopPolling();
    this.pollTimer = setInterval(async () => {
      try {
        await this.getSessions();
        this._emit('sessions-updated', this.sessions);
      } catch (e) {
        console.warn('Poll failed:', e.message);
      }
    }, intervalMs);
    // Initial fetch
    this.getSessions().then(s => this._emit('sessions-updated', s)).catch(() => {});
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  disconnect() {
    this.stopPolling();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.pending.forEach(p => {
      clearTimeout(p.timeout);
      p.reject(new Error('Disconnected'));
    });
    this.pending.clear();
  }
}

// Export as global
window.GatewayClient = GatewayClient;
