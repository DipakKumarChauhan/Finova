import api from './api'

export type NotificationItem = {
  id: string
  message: string
  created_at: string
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications')
  return response.data
}
