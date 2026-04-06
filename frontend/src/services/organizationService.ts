import api from './api'

export type Organization = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export async function getOrganizations(): Promise<Organization[]> {
  const response = await api.get<Organization[]>('/organizations')
  return response.data
}

export async function createOrganization(name: string): Promise<Organization> {
  const response = await api.post<Organization>('/organizations', { name })
  return response.data
}
