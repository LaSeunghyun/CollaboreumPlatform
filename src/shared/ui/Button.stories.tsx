// import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: any = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: '다양한 variant, size, tone을 지원하는 Button 컴포넌트입니다.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['solid', 'outline', 'ghost', 'link'],
            description: '버튼의 스타일 variant',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'icon'],
            description: '버튼의 크기',
        },
        tone: {
            control: { type: 'select' },
            options: ['default', 'success', 'warning', 'danger'],
            description: '버튼의 의미적 색상',
        },
        disabled: {
            control: { type: 'boolean' },
            description: '버튼 비활성화 상태',
        },
        children: {
            control: { type: 'text' },
            description: '버튼 내부 텍스트',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = any;

// 기본 버튼
export const Default: Story = {
    args: {
        children: 'Button',
    },
};

// Variants
export const Solid: Story = {
    args: {
        variant: 'solid',
        children: 'Solid Button',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline Button',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link Button',
    },
};

// Sizes
export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small Button',
    },
};

export const Medium: Story = {
    args: {
        size: 'md',
        children: 'Medium Button',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large Button',
    },
};

export const Icon: Story = {
    args: {
        size: 'icon',
        children: '🚀',
    },
};

// Tones
export const Success: Story = {
    args: {
        tone: 'success',
        children: 'Success Button',
    },
};

export const Warning: Story = {
    args: {
        tone: 'warning',
        children: 'Warning Button',
    },
};

export const Danger: Story = {
    args: {
        tone: 'danger',
        children: 'Danger Button',
    },
};

// States
export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled Button',
    },
};

// Combinations
export const SuccessOutline: Story = {
    args: {
        variant: 'outline',
        tone: 'success',
        children: 'Success Outline',
    },
};

export const DangerGhost: Story = {
    args: {
        variant: 'ghost',
        tone: 'danger',
        children: 'Danger Ghost',
    },
};

export const WarningLarge: Story = {
    args: {
        tone: 'warning',
        size: 'lg',
        children: 'Warning Large',
    },
};

// All Variants
export const AllVariants: Story = {
    render: () => (
        <div className="space-y-4">
            <div className="space-x-2">
                <Button variant="solid">Solid</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
            </div>
            <div className="space-x-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
            </div>
            <div className="space-x-2">
                <Button tone="default">Default</Button>
                <Button tone="success">Success</Button>
                <Button tone="warning">Warning</Button>
                <Button tone="danger">Danger</Button>
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: '모든 variant, size, tone 조합을 한 번에 볼 수 있습니다.',
            },
        },
    },
};
