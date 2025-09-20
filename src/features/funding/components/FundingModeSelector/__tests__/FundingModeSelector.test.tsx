import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FundingModeSelector } from '../FundingModeSelector';

describe('FundingModeSelector', () => {
  it('renders both funding mode options and allows selection', async () => {
    const onChange = jest.fn();
    render(<FundingModeSelector value="all-or-nothing" onChange={onChange} />);

    expect(screen.getByText('All-or-Nothing')).toBeInTheDocument();
    expect(screen.getByText('Flexible Funding')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Flexible Funding'));
    expect(onChange).toHaveBeenCalledWith('flexible');
  });

  it('marks the selected option as checked', () => {
    render(<FundingModeSelector value="flexible" onChange={jest.fn()} />);

    const flexibleOption = screen.getByLabelText('Flexible Funding') as HTMLInputElement;
    expect(flexibleOption.checked).toBe(true);
  });
});
