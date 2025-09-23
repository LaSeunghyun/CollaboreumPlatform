import React from 'react';
import { Card, CardContent } from '@/shared/ui';
import { FundingModeSelector } from '@/features/funding/components';
import { FundingMode } from '../types';

interface ProjectFundingModeSectionProps {
  fundingMode: FundingMode;
  onChange: (mode: FundingMode) => void;
}

export const ProjectFundingModeSection: React.FC<ProjectFundingModeSectionProps> = ({
  fundingMode,
  onChange,
}) => (
  <Card>
    <CardContent>
      <FundingModeSelector value={fundingMode} onChange={onChange} />
    </CardContent>
  </Card>
);
