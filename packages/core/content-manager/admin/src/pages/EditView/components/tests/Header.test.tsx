import { render as renderRTL, screen, waitFor } from '@tests/utils';
import { Route, Routes } from 'react-router-dom';

import { Header, HeaderProps } from '../Header';

jest.mock('@strapi/admin/strapi-admin', () => ({
  ...jest.requireActual('@strapi/admin/strapi-admin'),
  useStrapiApp: jest.fn((name, getter) =>
    getter({
      plugins: {
        'content-manager': {
          initializer: jest.fn(),
          injectionZones: {},
          isReady: true,
          name: 'content-manager',
          pluginId: 'content-manager',
          injectComponent: jest.fn(),
          getInjectedComponents: jest.fn(),
          apis: {
            getDocumentActions: () => [],
            getHeaderActions: () => [],
          },
        },
      },
    })
  ),
}));

describe('Header', () => {
  const render = (props?: Partial<HeaderProps>) =>
    renderRTL(<Header {...props} />, {
      initialEntries: ['/content-manager/collection-types/api::address.address/create'],
      renderOptions: {
        wrapper({ children }) {
          return (
            <Routes>
              <Route path="/content-manager/:collectionType/:slug/:id" element={children} />
            </Routes>
          );
        },
      },
    });

  it('should render the create entry title when isCreating is true', async () => {
    const { rerender } = render({ isCreating: true, status: 'draft' });

    expect(screen.getByRole('heading', { name: 'Create an entry' })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    rerender(<Header />);

    expect(screen.getByRole('heading', { name: 'Untitled' })).toBeInTheDocument();

    rerender(<Header title="Richmond AFC appoint new manager" />);

    expect(
      screen.getByRole('heading', { name: 'Richmond AFC appoint new manager' })
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'More actions' })).toBeDisabled()
    );
  });

  it('should display the status of the document', async () => {
    const { rerender } = render({ status: 'draft' });

    expect(screen.getByText('Draft')).toBeInTheDocument();

    rerender(<Header status="published" />);

    expect(screen.getByText('Published')).toBeInTheDocument();

    rerender(<Header status="modified" />);

    expect(screen.getByText('Modified')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'More actions' })).toBeDisabled()
    );
  });

  it('should not render any status if there is no prop', async () => {
    render();

    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
    expect(screen.queryByText('Modified')).not.toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'More actions' })).toBeDisabled()
    );
  });

  it.todo('should display a back button');
});