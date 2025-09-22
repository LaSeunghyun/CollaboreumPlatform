import { apiCall } from './base';

export const liveStreamAPI = {
  getLiveStreams: () => apiCall('/live-streams') as Promise<any>,
  getLiveStream: (streamId: string) =>
    apiCall(`/live-streams/${streamId}`) as Promise<any>,
  getScheduledStreams: () => apiCall('/live-streams/scheduled'),
  startStream: (data: any) =>
    apiCall('/live-streams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  endStream: (streamId: number) =>
    apiCall(`/live-streams/${streamId}/end`, {
      method: 'PUT',
    }),
};
