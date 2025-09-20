import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecretPerksEditor } from '../SecretPerksEditor';

describe('SecretPerksEditor', () => {
  it('renders textarea with initial value and fires change handler', async () => {
    const handleChange = jest.fn();
    render(
      <SecretPerksEditor
        value="initial perks"
        onChange={handleChange}
        onSubmit={jest.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText('예: 일정 금액 이상 후원자에게만 공개되는 한정판 굿즈 제공');
    await userEvent.type(textarea, ' updated');
    expect(handleChange).toHaveBeenCalled();
  });

  it('submits the trimmed value when form is submitted', async () => {
    const handleSubmit = jest.fn();
    render(
      <SecretPerksEditor
        value="  new perk  "
        onChange={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '비밀 혜택 저장' }));
    expect(handleSubmit).toHaveBeenCalledWith('new perk');
  });
});
