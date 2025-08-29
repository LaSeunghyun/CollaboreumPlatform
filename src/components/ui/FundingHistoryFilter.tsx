import { FundingHistoryFilter as FilterType } from '../../types/funding';
import { STATUS_OPTIONS, CATEGORY_OPTIONS, SORT_OPTIONS } from '../../types/funding';

interface FundingHistoryFilterProps {
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export function FundingHistoryFilter({ filter, onFilterChange }: FundingHistoryFilterProps) {
    const handleFilterChange = (key: keyof FilterType, value: string) => {
        onFilterChange({
            ...filter,
            [key]: value
        });
    };

    return (
        <div className="flex flex-wrap gap-3">
            <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <select
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <select
                value={filter.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
