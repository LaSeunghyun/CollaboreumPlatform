import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { VirtualizedList } from './VirtualizedList';

const meta: Meta<typeof VirtualizedList> = {
    title: 'UI/VirtualizedList',
    component: VirtualizedList,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: '대용량 리스트를 효율적으로 렌더링하는 가상화 리스트 컴포넌트입니다.',
            },
        },
    },
    argTypes: {
        items: {
            control: false,
            description: '렌더링할 아이템 배열',
        },
        itemHeight: {
            control: { type: 'number', min: 20, max: 200, step: 10 },
            description: '각 아이템의 높이 (px)',
        },
        containerHeight: {
            control: { type: 'number', min: 200, max: 800, step: 50 },
            description: '컨테이너의 높이 (px)',
        },
        overscan: {
            control: { type: 'number', min: 0, max: 20, step: 1 },
            description: '화면 밖에 미리 렌더링할 아이템 수',
        },
        className: {
            control: 'text',
            description: '추가 CSS 클래스',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualizedList>;

// 샘플 데이터 생성
const generateItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        title: `아이템 ${i + 1}`,
        content: `이것은 ${i + 1}번째 아이템의 내용입니다.`,
        category: ['일반', '중요', '긴급'][i % 3],
        priority: ['낮음', '보통', '높음'][i % 3],
    }));

const renderItem = (item: any, index: number) => (
    <div
        key={item.id}
        className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ height: '100%' }}
    >
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
            </div>
            <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${item.category === '긴급' ? 'bg-red-100 text-red-800' :
                    item.category === '중요' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {item.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${item.priority === '높음' ? 'bg-red-100 text-red-800' :
                    item.priority === '보통' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {item.priority}
                </span>
            </div>
        </div>
    </div>
);

export const Default: Story = {
    args: {
        items: generateItems(1000),
        itemHeight: 80,
        containerHeight: 400,
        overscan: 5,
    },
    render: (args) => (
        <div className="w-full">
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};

export const SmallItems: Story = {
    args: {
        items: generateItems(500),
        itemHeight: 40,
        containerHeight: 300,
        overscan: 3,
    },
    render: (args) => (
        <div className="w-full">
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};

export const LargeItems: Story = {
    args: {
        items: generateItems(200),
        itemHeight: 120,
        containerHeight: 500,
        overscan: 2,
    },
    render: (args) => (
        <div className="w-full">
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};

export const EmptyList: Story = {
    args: {
        items: [],
        itemHeight: 80,
        containerHeight: 400,
        overscan: 5,
    },
    render: (args) => (
        <div className="w-full">
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};

export const WithCustomStyling: Story = {
    args: {
        items: generateItems(100),
        itemHeight: 60,
        containerHeight: 350,
        overscan: 4,
        className: 'border border-gray-300 rounded-lg shadow-sm',
    },
    render: (args) => (
        <div className="w-full">
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};

export const PerformanceTest: Story = {
    args: {
        items: generateItems(10000),
        itemHeight: 50,
        containerHeight: 400,
        overscan: 10,
    },
    render: (args) => (
        <div className="w-full">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">성능 테스트</h3>
                <p className="text-sm text-blue-700 mt-1">
                    10,000개 아이템을 렌더링하지만 실제로는 화면에 보이는 아이템만 렌더링됩니다.
                </p>
            </div>
            <VirtualizedList {...args} renderItem={renderItem} />
        </div>
    ),
};
