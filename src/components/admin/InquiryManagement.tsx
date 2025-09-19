import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';

export const InquiryManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Inquiry management legacy view</CardTitle>
    </CardHeader>
    <CardContent>
      <p className='text-sm text-muted-foreground'>Legacy inquiry management is no longer in use. Refer to the admin dashboard modules for the updated experience.</p>
    </CardContent>
  </Card>
);

export default InquiryManagement;
