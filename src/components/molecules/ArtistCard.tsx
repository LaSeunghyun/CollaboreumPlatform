import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Heart, Users } from 'lucide-react';
import { ImageWithFallback } from '../atoms/ImageWithFallback';
import { ShareButton } from '../atoms/ShareButton';

interface ArtistCardProps {
    id: string;
    name: string;
    avatar: string;
    coverImage?: string;
    category: string;
    tags: string[];
    featuredWork?: string;
    followers: number;
    isFollowing?: boolean;
    isVerified?: boolean;
    bio?: string;
    onFollow?: () => void;
    onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
    id,
    name,
    avatar,
    coverImage,
    category,
    tags,
    featuredWork,
    followers,
    isFollowing,
    isVerified,
    bio,
    onFollow,
    onClick
}) => {
    return (
        <Card className="overflow-hidden hover:shadow-apple-lg transition-all duration-300 cursor-pointer group border-border/50 rounded-3xl" onClick={onClick}>
            {/* Cover Image */}
            {coverImage && (
                <div className="relative h-36">
                    <ImageWithFallback
                        src={coverImage}
                        alt={`${name} cover`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            )}

            <CardContent className="p-6 space-y-4">
                {/* Artist Profile */}
                <div className="relative px-6 pb-6">
                    {/* Profile Image */}
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-apple">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>{name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Artist Info */}
                    <div className="pt-16">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{name}</h3>
                                <p className="text-muted-foreground font-medium">{category}</p>
                                {isVerified && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-4 h-4 bg-sky rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-muted-foreground">인증됨</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                                <Users className="w-4 h-4 text-primary mr-1" />
                                <span className="text-sm font-medium text-primary">{followers.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {bio && (
                    <p className="text-foreground/80 text-sm mb-4 line-clamp-2 leading-relaxed">{bio}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {(Array.isArray(tags) ? tags : []).slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-secondary/60 text-foreground rounded-lg px-2 py-1">
                            {tag}
                        </Badge>
                    ))}
                    {Array.isArray(tags) && tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-secondary/60 text-foreground rounded-lg px-2 py-1">
                            +{tags.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Featured Work */}
                {featuredWork && (
                    <div className="space-y-2 mb-4">
                        <p className="text-xs text-muted-foreground">대표작</p>
                        <p className="text-sm text-foreground">{featuredWork}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant={isFollowing ? "secondary" : "default"}
                        size="sm"
                        className={`flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl ${!isFollowing ? "hover:scale-105 transition-transform" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onFollow?.();
                        }}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        {isFollowing ? "팔로잉" : "팔로우"}
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/50 rounded-xl px-3">
                        <Heart className="w-4 h-4" />
                    </Button>
                    <ShareButton
                        url={`/artists/${id}`}
                        title={name}
                        description={bio || `${name} 아티스트의 프로필을 확인해보세요`}
                        variant="outline"
                        size="sm"
                        className="border-border hover:bg-secondary/50 rounded-xl px-3"
                    />
                </div>
            </CardContent>
        </Card>
    );
};
