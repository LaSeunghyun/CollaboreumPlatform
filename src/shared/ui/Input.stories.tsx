// import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: any = {
    title: 'UI/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: '다양한 size와 tone을 지원하는 Input 컴포넌트입니다.',
            },
        },
    },
    argTypes: {
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg'],
            description: '입력 필드의 크기',
        },
        tone: {
            control: { type: 'select' },
            options: ['default', 'success', 'warning', 'danger'],
            description: '입력 필드의 상태 색상',
        },
        type: {
            control: { type: 'select' },
            options: ['text', 'email', 'password', 'number', 'tel', 'url'],
            description: '입력 필드의 타입',
        },
        placeholder: {
            control: { type: 'text' },
            description: '플레이스홀더 텍스트',
        },
        disabled: {
            control: { type: 'boolean' },
            description: '입력 필드 비활성화 상태',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = any;

// 기본 입력 필드
export const Default: Story = {
    args: {
        placeholder: '입력하세요...',
    },
};

// Sizes
export const Small: Story = {
    args: {
        size: 'sm',
        placeholder: 'Small input',
    },
};

export const Medium: Story = {
    args: {
        size: 'md',
        placeholder: 'Medium input',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        placeholder: 'Large input',
    },
};

// Tones
export const Success: Story = {
    args: {
        tone: 'success',
        placeholder: 'Success input',
        defaultValue: 'Valid input',
    },
};

export const Warning: Story = {
    args: {
        tone: 'warning',
        placeholder: 'Warning input',
        defaultValue: 'Warning input',
    },
};

export const Danger: Story = {
    args: {
        tone: 'danger',
        placeholder: 'Error input',
        defaultValue: 'Invalid input',
    },
};

// Types
export const Email: Story = {
    args: {
        type: 'email',
        placeholder: '이메일을 입력하세요',
    },
};

export const Password: Story = {
    args: {
        type: 'password',
        placeholder: '비밀번호를 입력하세요',
    },
};

export const Number: Story = {
    args: {
        type: 'number',
        placeholder: '숫자를 입력하세요',
    },
};

// States
export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled input',
        defaultValue: 'Cannot edit',
    },
};

// All Sizes
export const AllSizes: Story = {
    render: () => (
        <div className="space-y-4 w-80">
            <Input placeholder="Small input" />
            <Input placeholder="Medium input" />
            <Input placeholder="Large input" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: '모든 크기 옵션을 비교할 수 있습니다.',
            },
        },
    },
};

// All Tones
export const AllTones: Story = {
    render: () => (
        <div className="space-y-4 w-80">
            <Input placeholder="Default input" />
            <Input placeholder="Success input" defaultValue="Valid input" />
            <Input placeholder="Warning input" defaultValue="Warning input" />
            <Input placeholder="Danger input" defaultValue="Invalid input" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: '모든 tone 옵션을 비교할 수 있습니다.',
            },
        },
    },
};
