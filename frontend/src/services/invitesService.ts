import api from './api'

export type InviteItem = {
  id: string
  organization_id: string
  email: string
  role: 'viewer' | 'analyst' | 'admin'
  status: string
  created_at: string
}

export type InviteAction = 'accept' | 'reject'

export async function getInvites(): Promise<InviteItem[]> {
  const response = await api.get<InviteItem[]>('/invites')
  return response.data
}

export async function respondToInvite(inviteId: string, action: InviteAction): Promise<unknown> {
  const response = await api.post(`/invites/${inviteId}`, { action })
  return response.data
}
