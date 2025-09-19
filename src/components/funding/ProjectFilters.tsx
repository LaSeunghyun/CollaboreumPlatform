import { Search } from 'lucide-react';
import { SORT_OPTIONS } from '@/constants/funding';
import { Input, Select } from '@/shared/ui';

interface ProjectFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    categories: string[];
}

export const ProjectFilters = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories
}: ProjectFiltersProps) => (
    <div className='mb-12 flex flex-col gap-4 lg:flex-row'>
        <div className='flex-1'>
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                <Input
                    placeholder='프로젝트명이나 아티스트 이름으로 검색...'
                    className='h-10 rounded-lg border border-border bg-background pl-10'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label='프로젝트 검색'
                />
            </div>
        </div>
        <div className='flex gap-3'>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className='h-10 w-24 rounded-lg border border-border bg-background'>
                    <SelectValue aria-label='카테고리 선택' />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='h-10 w-24 rounded-lg border border-border bg-background'>
                    <SelectValue aria-label='정렬 기준 선택' />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
);
