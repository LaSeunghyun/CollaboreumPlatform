import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';

export const ArtworkManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Artwork management legacy view</CardTitle>
    </CardHeader>
    <CardContent>
      <p className='text-sm text-muted-foreground'>
        This legacy component has been deprecated. Please use the admin
        dashboard artwork section instead.
      </p>
    </CardContent>
  </Card>
);

export default ArtworkManagement;
