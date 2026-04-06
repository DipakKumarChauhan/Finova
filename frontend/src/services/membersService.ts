import api from './api'

export type MemberItem = {
  user_id: string
  email: string
  role: 'viewer' | 'analyst' | 'admin'
  joined_at: string
}

export type InviteMemberPayload = {
  email: string
  role: 'viewer' | 'analyst' | 'admin'
}

export async function getMembers(orgId: string): Promise<MemberItem[]> {
  const response = await api.get<MemberItem[]>(`/organizations/${orgId}/members`)
  return response.data
}

export async function updateMemberRole(
  orgId: string,
  email: string,
  role: MemberItem['role'],
): Promise<MemberItem> {
  const response = await api.patch<MemberItem>(`/organizations/${orgId}/members/${email}`, {
    role,
  })

  return response.data
}

export async function removeMember(orgId: string, email: string): Promise<void> {
  await api.delete(`/organizations/${orgId}/members/${email}`)
}

export async function inviteMember(
  orgId: string,
  payload: InviteMemberPayload,
): Promise<MemberItem> {
  const response = await api.post<MemberItem>(`/organizations/${orgId}/members`, payload)
  return response.data
}
