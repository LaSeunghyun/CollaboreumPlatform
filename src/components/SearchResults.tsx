import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, ArrowLeft, Star, Users, Calendar, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { interactionAPI } from '../services/api';

interface SearchResultsProps {
    query: string;
    onBack: () => void;
}

export function SearchResults({ query, onBack }: SearchResultsProps) {
    const [results, setResults] = useState<any>({
        artists: [],
        projects: [],
        events: [],
        posts: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const performSearch = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await interactionAPI.search(query) as any;

                if (response.success && response.data) {
                    setResults(response.data);
                } else {
                    setError('검색 결과를 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('검색 실패:', error);
                setError('검색 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (query.trim()) {
            performSearch();
        }
    }, [query]);

    const getTotalResults = () => {
        return (results.artists?.length || 0) +
            (results.projects?.length || 0) +
            (results.events?.length || 0) +
            (results.posts?.length || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">검색 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={onBack}>돌아가기</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">
                            "{query}" 검색 결과
                        </h1>
                        <p className="text-gray-600 mt-2">
                            총 {getTotalResults()}개의 결과를 찾았습니다
                        </p>
                    </div>
                </div>

                {/* Search Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">전체 ({getTotalResults()})</TabsTrigger>
                        <TabsTrigger value="artists">아티스트 ({results.artists?.length || 0})</TabsTrigger>
                        <TabsTrigger value="projects">프로젝트 ({results.projects?.length || 0})</TabsTrigger>
                        <TabsTrigger value="events">이벤트 ({results.events?.length || 0})</TabsTrigger>
                        <TabsTrigger value="posts">게시글 ({results.posts?.length || 0})</TabsTrigger>
                    </TabsList>

                    {/* All Results */}
                    <TabsContent value="all" className="mt-6">
                        <div className="space-y-6">
                            {/* Artists */}
                            {results.artists && results.artists.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">아티스트</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.artists.map((artist: any) => (
                                            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarImage src={artist.avatar} alt={artist.username} />
                                                            <AvatarFallback>{artist.username.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900">{artist.username}</h3>
                                                            <p className="text-sm text-gray-600">{artist.category}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                <span className="text-xs text-gray-600">{artist.rating}</span>
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs text-gray-600">{artist.followers}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {results.projects && results.projects.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">프로젝트</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.projects.map((project: any) => (
                                            <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                                <div className="relative aspect-video">
                                                    <ImageWithFallback
                                                        src={project.image}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800">
                                                        {project.category}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>by {project.artist}</span>
                                                        <span>₩{project.currentAmount?.toLocaleString()}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Events */}
                            {results.events && results.events.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">이벤트</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.events.map((event: any) => (
                                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                                <div className="relative aspect-video">
                                                    <ImageWithFallback
                                                        src={event.image}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-800">
                                                        {event.category}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{event.location}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Posts */}
                            {results.posts && results.posts.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">게시글</h2>
                                    <div className="space-y-4">
                                        {results.posts.map((post: any) => (
                                            <Card key={post.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={post.author.avatar} alt={post.author.username} />
                                                            <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                                                            <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span>{post.author.username}</span>
                                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                                <span>좋아요 {post.likes}</span>
                                                                <span>댓글 {post.commentCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Individual Tab Results */}
                    <TabsContent value="artists" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.artists?.map((artist: any) => (
                                <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={artist.avatar} alt={artist.username} />
                                                <AvatarFallback>{artist.username.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{artist.username}</h3>
                                                <p className="text-sm text-gray-600">{artist.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-xs text-gray-600">{artist.rating}</span>
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-600">{artist.followers}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="projects" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.projects?.map((project: any) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <div className="relative aspect-video">
                                        <ImageWithFallback
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800">
                                            {project.category}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>by {project.artist}</span>
                                            <span>₩{project.currentAmount?.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="events" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.events?.map((event: any) => (
                                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                    <div className="relative aspect-video">
                                        <ImageWithFallback
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-800">
                                            {event.category}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="posts" className="mt-6">
                        <div className="space-y-4">
                            {results.posts?.map((post: any) => (
                                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                                                <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>{post.author.username}</span>
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    <span>좋아요 {post.likes}</span>
                                                    <span>댓글 {post.commentCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* No Results */}
                {getTotalResults() === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-gray-600">다른 검색어를 시도해보세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}
