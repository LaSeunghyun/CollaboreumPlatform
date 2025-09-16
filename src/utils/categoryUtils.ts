import { Category } from '../lib/api/useCategories';

export const getCategoryInfo = (category: string, categories: Category[]) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    return categoryInfo || {
        value: category,
        label: category,
        color: "bg-gray-100 text-gray-700"
    };
};

export const getCategoryColor = (category: string, categories: Category[]) => {
    return getCategoryInfo(category, categories).color;
};

export const getCategoryLabel = (category: string, categories: Category[]) => {
    return getCategoryInfo(category, categories).label;
};
