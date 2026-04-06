import api from './api'

export type CategoryItem = {
  id: string
  organization_id: string
  name: string
}

export async function getCategories(orgId: string): Promise<CategoryItem[]> {
  const response = await api.get<CategoryItem[]>('/categories', {
    params: { org_id: orgId },
  })

  return response.data
}
