// 프로젝트 관련 타입 정의

export interface Project {
    id: number;
    title: string;
    description: string;
    artistId: number;
    artistName: string;
    category: string;
    status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
    targetAmount: number;
    currentAmount: number;
    backers: number;
    startDate: string;
    endDate: string;
    image?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProjectDetail extends Project {
    story: string;
    risks: string;
    rewards: Reward[];
    updates: ProjectUpdate[];
    faqs: FAQ[];
    team: TeamMember[];
    gallery: string[];
    documents: Document[];
}

export interface Reward {
    id: number;
    title: string;
    description: string;
    amount: number;
    estimatedDelivery: string;
    backers: number;
    maxBackers?: number;
    isLimited: boolean;
}

export interface ProjectUpdate {
    id: number;
    title: string;
    content: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface FAQ {
    id: number;
    question: string;
    answer: string;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio: string;
    avatar?: string;
    socialLinks?: Record<string, string>;
}

export interface Document {
    id: number;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
}

// 프로젝트 생성/수정 요청 타입
export interface CreateProjectRequest {
    title: string;
    description: string;
    category: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
    story: string;
    risks: string;
    rewards: Omit<Reward, 'id' | 'backers'>[];
    tags?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
    id: number;
}

// 프로젝트 필터링/정렬 타입
export interface ProjectFilters {
    category?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    tags?: string[];
}

export interface ProjectSortOptions {
    sortBy: 'date' | 'amount' | 'popularity' | 'deadline';
    order: 'asc' | 'desc';
}

// 프로젝트 페이징 타입
export interface ProjectPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// 프로젝트 목록 응답 타입
export interface ProjectListResponse {
    projects: Project[];
    pagination: ProjectPagination;
    filters: ProjectFilters;
}
