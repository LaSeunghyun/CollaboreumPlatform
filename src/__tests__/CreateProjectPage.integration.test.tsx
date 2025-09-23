import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectPage } from '@/pages/projects/CreateProjectPage';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const requests: any[] = [];

const server = setupServer(
  http.post('*/funding/projects', async ({ request }) => {
    const body = await request.json();
    requests.push(body);
    return HttpResponse.json({ success: true, data: { id: 1 } });
  }),
);

describe('CreateProjectPage integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    requests.length = 0;
  });
  afterAll(() => server.close());

  it('submits funding mode and secret perks to the backend', async () => {
    const alertMock = jest
      .spyOn(window, 'alert')
      .mockImplementation(() => undefined);

    render(<CreateProjectPage />);

    await userEvent.type(
      screen.getByLabelText(/프로젝트 제목/),
      '테스트 프로젝트',
    );
    await userEvent.type(screen.getByLabelText(/프로젝트 설명/), '설명입니다');

    const categoryTrigger = screen.getByRole('combobox');
    await userEvent.click(categoryTrigger);
    await userEvent.click(await screen.findByText('음악'));

    await userEvent.type(screen.getByLabelText(/목표 금액/), '150000');
    await userEvent.type(screen.getByLabelText(/펀딩 기간/), '30');
    await userEvent.type(screen.getByLabelText(/수익 공유율/), '10');

    await userEvent.click(screen.getByText('Flexible Funding'));

    await userEvent.type(
      screen.getByLabelText('비밀 혜택 설명'),
      '첫 번째 혜택',
    );

    await userEvent.click(
      screen.getByRole('button', { name: '프로젝트 등록하기' }),
    );

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        '프로젝트가 성공적으로 등록되었습니다.',
      );
    });

    expect(requests[0].fundingMode).toBe('flexible');
    expect(requests[0].secretPerks).toEqual(['첫 번째 혜택']);

    alertMock.mockRestore();
  });
});
