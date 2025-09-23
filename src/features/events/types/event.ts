export interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  role: string;
  joinedAt: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface EventOrganizer {
  id: string;
  username: string;
  role: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  organizer: EventOrganizer;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFormState {
  title: string;
  description: string;
  category: string;
  tags: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
}

export interface EventCategoryOption {
  id: string;
  label: string;
}
