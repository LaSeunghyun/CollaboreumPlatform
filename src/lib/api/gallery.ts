import { useQuery } from '@tanstack/react-query';
import { galleryAPI } from '../../services/api';

export interface Artwork {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    artist: string | { name: string };
    category: string;
    type: 'audio' | 'video' | 'image' | 'text';
    date: string;
    duration?: string;
    dimensions?: string;
    wordCount?: string;
    plays?: number;
    views?: number;
    likes: number;
}

export interface Category {
    id: string;
    label: string;
    icon?: string;
}

interface GalleryAPIResponse {
    data?: {
        artworks?: Artwork[];
    };
    artworks?: Artwork[];
}

interface CategoriesAPIResponse {
    data?: Category[];
}

export const useGalleryArtworks = () => {
    return useQuery<Artwork[]>({
        queryKey: ['gallery', 'artworks'],
        queryFn: async () => {
            const response = await galleryAPI.getAllArtworks() as GalleryAPIResponse;
            return response?.data?.artworks || response?.artworks || [];
        },
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
};

export const useGalleryCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['gallery', 'categories'],
        queryFn: async () => {
            const response = await galleryAPI.getGalleryCategories() as CategoriesAPIResponse;
            return response?.data || [];
        },
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
};
