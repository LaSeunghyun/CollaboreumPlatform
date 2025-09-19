import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/Select";
import { CreateCommunityPostData } from "../types";
import { Plus, X, Image as ImageIcon } from "lucide-react";

interface PostFormProps {
    onSubmit?: (data: CreateCommunityPostData) => void;
    onCancel?: () => void;
    initialData?: Partial<CreateCommunityPostData>;
    isLoading?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateCommunityPostData>({
        title: initialData?.title || "",
        content: initialData?.content || "",
        category: initialData?.category || "",
        tags: initialData?.tags || [],
        images: initialData?.images || [],
        status: initialData?.status || "published"
    });

    const [tagInput, setTagInput] = useState("");
    const [imageInput, setImageInput] = useState("");

    const handleInputChange = (field: keyof CreateCommunityPostData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAddImage = () => {
        if (imageInput.trim() && !formData.images?.includes(imageInput.trim())) {
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), imageInput.trim()]
            }));
            setImageInput("");
        }
    };

    const handleRemoveImage = (imageToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter(image => image !== imageToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    const isFormValid = formData.title.trim() && formData.content.trim() && formData.category;

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">새 게시글 작성</h2>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700">
                            제목 *
                        </label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            placeholder="게시글 제목을 입력하세요"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium text-gray-700">
                            카테고리 *
                        </label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange("category", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">일반</SelectItem>
                                <SelectItem value="question">질문</SelectItem>
                                <SelectItem value="discussion">토론</SelectItem>
                                <SelectItem value="announcement">공지</SelectItem>
                                <SelectItem value="collaboration">협업</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium text-gray-700">
                            내용 *
                        </label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => handleInputChange("content", e.target.value)}
                            placeholder="게시글 내용을 입력하세요"
                            rows={6}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="tags" className="text-sm font-medium text-gray-700">
                            태그
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="태그를 입력하세요"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm"
                                    >
                                        <span>#{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-primary-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="images" className="text-sm font-medium text-gray-700">
                            이미지 URL
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                value={imageInput}
                                onChange={(e) => setImageInput(e.target.value)}
                                placeholder="이미지 URL을 입력하세요"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddImage();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddImage}
                                disabled={!imageInput.trim()}
                            >
                                <ImageIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.images && formData.images.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {formData.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                                    >
                                        <span className="text-sm text-gray-600 truncate flex-1">
                                            {image}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(image)}
                                            className="text-gray-400 hover:text-gray-600 ml-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                취소
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            loading={isLoading}
                        >
                            {isLoading ? "게시 중..." : "게시하기"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PostForm;