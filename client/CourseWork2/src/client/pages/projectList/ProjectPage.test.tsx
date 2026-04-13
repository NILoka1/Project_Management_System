import { useProject } from './useProjects';
import { ProjectList } from './ProjectPage';
import { useAuthStore } from '../../store/authStore';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

jest.mock('./useProjects');
jest.mock('../../store/authStore');

const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('Страница проектов', () => {
  it('Должна отображать текст для пустого списка проектов', () => {
    (useProject as jest.Mock).mockReturnValue({
      projects: [],
      setProjects: jest.fn(),
      loading: false,
      error: null,
    });
    mockedUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'MANAGER',
      },
    });
    render(
      <MantineProvider>
        <MemoryRouter>
          <ProjectList />
        </MemoryRouter>
      </MantineProvider>,
    );

    expect(screen.getByTestId('zero-lenght-projects')).toBeInTheDocument();
  });
});
