/**
 * ARCOX Memory Bank
 * Integrates with Google Cloud Firestore for enterprise persistent state,
 * agent memory across multi-session execution, and OpenTelemetry-compliant audit logs.
 */

import { Firestore } from '@google-cloud/firestore'

export class FirestoreMemoryBank {
  constructor({ projectId = process.env.GCP_PROJECT_ID, databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)' } = {}) {
    this.projectId = projectId
    this.databaseId = databaseId
    this.localState = new Map()
    this.localLogs = []
    this.isFirestoreAvailable = false

    if (this.projectId && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        this.firestore = new Firestore({ projectId: this.projectId, databaseId: this.databaseId })
        this.isFirestoreAvailable = true
      } catch (err) {
        console.warn('[MemoryBank] Firestore init fallback to local memory:', err.message)
      }
    }
  }

  /**
   * Save agent state (e.g. daily limit spent, current task, health status)
   */
  async saveAgentState(agentId, state) {
    const payload = {
      agentId,
      ...state,
      updatedAt: new Date().toISOString(),
    }

    this.localState.set(agentId, payload)

    if (this.isFirestoreAvailable) {
      try {
        await this.firestore.collection('agent_states').doc(agentId).set(payload, { merge: true })
      } catch (err) {
        console.warn(`[MemoryBank] Failed to save state to Firestore for ${agentId}:`, err.message)
      }
    }

    return payload
  }

  /**
   * Get agent state
   */
  async getAgentState(agentId) {
    if (this.isFirestoreAvailable) {
      try {
        const doc = await this.firestore.collection('agent_states').doc(agentId).get()
        if (doc.exists) return doc.data()
      } catch {
        // Fallback to local
      }
    }
    return this.localState.get(agentId) || null
  }

  /**
   * Record an audit log entry for enterprise governance
   */
  async recordAuditLog(entry) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    }

    this.localLogs.unshift(log)
    if (this.localLogs.length > 100) this.localLogs.pop()

    if (this.isFirestoreAvailable) {
      try {
        await this.firestore.collection('audit_logs').doc(log.id).set(log)
      } catch (err) {
        console.warn('[MemoryBank] Failed to write audit log to Firestore:', err.message)
      }
    }

    return log
  }

  /**
   * List recent audit logs
   */
  async listRecentLogs(limit = 10) {
    if (this.isFirestoreAvailable) {
      try {
        const snapshot = await this.firestore.collection('audit_logs').orderBy('timestamp', 'desc').limit(limit).get()
        return snapshot.docs.map(doc => doc.data())
      } catch {
        // Fallback to local
      }
    }
    return this.localLogs.slice(0, limit)
  }
}
