import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/Tabs';
import { Search, ArrowLeft, User, Palette, Calendar, MessageSquare } from 'lucide-react';
import { interactionAPI } from '../../services/api';
import { format } from 'date-fns';

interface SearchResult {
    type: 'artist' | 'project' | 'event' | 'post';
    id: string;
    title: string;
    description?: string;
    author?: string;
    category?: string;
    createdAt?: string;
    image?: string;
    tags?: string[];
}

export const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    const performSearch = useCallback(async () => {
        if (!query.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await interactionAPI.search(query.trim());
            setResults(response as SearchResult[]);
        } catch (err) {
            console.error('검색 실패:', err);
            setError('검색 중 오류가 발생했습니다.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        if (query.trim()) {
            performSearch();
        }
    }, [query, performSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
            performSearch();
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const filteredResults = activeTab === 'all'
        ? results
        : results.filter(result => result.type === activeTab);

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'artist': return <User className="w-4 h-4" />;
            case 'project': return <Palette className="w-4 h-4" />;
            case 'event': return <Calendar className="w-4 h-4" />;
            case 'post': return <MessageSquare className="w-4 h-4" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    const getResultLink = (result: SearchResult) => {
        switch (result.type) {
            case 'artist': return `/artists/${result.id}`;
            case 'project': return `/projects/${result.id}`;
            case 'event': return `/events/${result.id}`;
            case 'post': return `/community/post/${result.id}`;
            default: return '#';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" onClick={handleBack} className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">검색 결과</h1>
                </div>

                <form onSubmit={handleSearch} className="max-w-2xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="검색어를 입력하세요..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">검색 중...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={performSearch} className="mt-4">다시 시도</Button>
                </div>
            ) : results.length === 0 && query ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-2">다른 검색어로 시도해보세요.</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="artist">아티스트</TabsTrigger>
                            <TabsTrigger value="project">프로젝트</TabsTrigger>
                            <TabsTrigger value="event">이벤트</TabsTrigger>
                            <TabsTrigger value="post">게시글</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            <div className="space-y-4">
                                {filteredResults.map((result) => (
                                    <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0">
                                                    {result.image ? (
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarImage src={result.image} />
                                                            <AvatarFallback>{getResultIcon(result.type)}</AvatarFallback>
                                                        </Avatar>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                            {getResultIcon(result.type)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer"
                                                            onClick={() => navigate(getResultLink(result))}>
                                                            {result.title}
                                                        </h3>
                                                        <Badge variant="outline">{result.type}</Badge>
                                                    </div>

                                                    {result.description && (
                                                        <p className="text-gray-600 mb-3 line-clamp-2">{result.description}</p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        {result.author && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-4 h-4" />
                                                                {result.author}
                                                            </div>
                                                        )}
                                                        {result.category && (
                                                            <Badge variant="secondary" className="text-xs">{result.category}</Badge>
                                                        )}
                                                        {result.createdAt && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {format(new Date(result.createdAt), 'MM/dd')}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {result.tags && result.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-3">
                                                            {result.tags.map((tag, index) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            ) : null}
        </div>
    );
};

export default SearchPage;
