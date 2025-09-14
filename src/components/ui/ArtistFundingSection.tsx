import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ArtistFundingHistory } from '../../types/funding';
import { FundingProjectCard } from './FundingProjectCard';
import { getFirstChar, getUsername, getAvatarUrl } from '../../utils/typeGuards';

interface ArtistFundingSectionProps {
    artist: ArtistFundingHistory;
    onViewProjectDetails: (projectId: string) => void;
}

export function ArtistFundingSection({ artist, onViewProjectDetails }: ArtistFundingSectionProps) {
    return (
        <Card key={artist.artistId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={artist.artistAvatar} alt={artist.artistName} />
                        <AvatarFallback className="text-xl">{getFirstChar(artist.artistName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl text-gray-900">{artist.artistName}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 text-blue-800">{artist.artistCategory}</Badge>
                            <span className="text-sm text-gray-600">총 {artist.projects.length}개 프로젝트</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artist.projects.map((project) => (
                        <FundingProjectCard
                            key={project.id}
                            project={project}
                            onViewDetails={onViewProjectDetails}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
