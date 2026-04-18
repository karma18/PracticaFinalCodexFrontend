import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input, init = {}) => {
      const url = String(input);
      const method = init.method || 'GET';

      if (url.endsWith('/') && method === 'GET') {
        return Promise.resolve(
          createJsonResponse(200, {
            app: 'PracticaFinalCodexBackend',
            message: 'Backend Node.js ejecutandose correctamente.'
          })
        );
      }

      if (url.endsWith('/api/health') && method === 'GET') {
        return Promise.resolve(
          createJsonResponse(200, {
            status: 'ok',
            timestamp: new Date().toISOString()
          })
        );
      }

      if (url.endsWith('/api/auth/login') && method === 'POST') {
        return Promise.resolve(
          createJsonResponse(200, {
            message: 'Inicio de sesion exitoso.',
            user: {
              id: 1,
              fullName: 'Ana Torres',
              email: 'ana@empresa.com',
              role: 'Admin'
            }
          })
        );
      }

      if (url.endsWith('/api/users') && method === 'GET') {
        return Promise.resolve(
          createJsonResponse(200, {
            items: [
              { id: 1, fullName: 'Ana Torres', email: 'ana@empresa.com', role: 'Admin' },
              { id: 2, fullName: 'Luis Diaz', email: 'luis@empresa.com', role: 'Editor' }
            ]
          })
        );
      }

      return Promise.reject(new Error(`Unhandled request: ${method} ${url}`));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra las pestanas de autenticacion', async () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registro/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recuperar contrasena/i })).toBeInTheDocument();
    expect(await screen.findByText(/backend node\.js ejecutandose correctamente/i)).toBeInTheDocument();
  });

  it('permite iniciar sesion y mostrar el CRUD de usuarios', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'ana@empresa.com' } });
    fireEvent.change(screen.getByLabelText(/contrasena/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    expect(await screen.findByText(/sesion activa/i)).toBeInTheDocument();
    expect(await screen.findByText(/ana torres/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument();
  });

  it('muestra mensaje cuando el backend no esta disponible', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network error')));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/backend no disponible/i)).toBeInTheDocument();
    });
  });
});

function createJsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => 'application/json; charset=utf-8'
    },
    json: async () => payload
  };
}
