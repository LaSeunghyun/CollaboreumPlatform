import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Heart, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShareButton } from "./ShareButton";

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

export function ArtistCard({
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
}: ArtistCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onClick}>
            {/* Cover Image */}
            {coverImage && (
                <div className="aspect-[16/9] overflow-hidden">
                    <ImageWithFallback
                        src={coverImage}
                        alt={`${name} cover`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <CardContent className="p-4 space-y-4">
                {/* Artist Profile */}
                <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate">{name}</h3>
                            {isVerified && (
                                <div className="w-4 h-4 bg-sky rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-indigo/10 text-indigo text-xs">
                                {category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>{followers.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
                )}

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Featured Work */}
                {featuredWork && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">대표작</p>
                        <p className="text-sm">{featuredWork}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant={isFollowing ? "secondary" : "default"}
                        size="sm"
                        className={`flex-1 ${!isFollowing ? "bg-indigo hover:bg-indigo-hover hover-scale transition-button" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onFollow?.();
                        }}
                    >
                        {isFollowing ? "팔로잉" : "팔로우"}
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                        <Heart className="w-4 h-4" />
                    </Button>
                    <ShareButton
                        url={`/artist/${id}`}
                        title={name}
                        description={bio || `${name} 아티스트의 프로필을 확인해보세요`}
                        variant="outline"
                        size="sm"
                        className="px-3"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
