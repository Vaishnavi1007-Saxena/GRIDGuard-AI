const API_BASE = '/api';

export const api = {
  async createProject(requirement) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to initialize project');
    }
    return res.json();
  },

  async getProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!res.ok) throw new Error('Project not found');
    return res.json();
  },

  async getTelemetry(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return res.json();
  },

  async getDemoStages(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/demo-stages`);
    if (!res.ok) throw new Error('Failed to fetch demo stages');
    return res.json();
  },

  async getMessages(projectId) {
    const res = await fetch(`${API_BASE}/workflow/${projectId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch workflow messages');
    return res.json();
  },

  async sendChat(projectId, message, mode = 'copilot', liveTelemetry = null) {
    const res = await fetch(`${API_BASE}/workflow/${projectId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        mode,
        live_telemetry: liveTelemetry,
        session_id: 'gridguard_live_session'
      }),
    });
    if (!res.ok) throw new Error('Failed to communicate with GRIDGUARD AI Bot');
    return res.json();
  },

  async predictML(telemetry) {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry || {}),
    });
    if (!res.ok) throw new Error('Failed to get ML prediction');
    return res.json();
  },

  async getMLMetrics() {
    const res = await fetch(`${API_BASE}/ml/metrics`);
    if (!res.ok) throw new Error('Failed to fetch ML model metrics');
    return res.json();
  }
};

