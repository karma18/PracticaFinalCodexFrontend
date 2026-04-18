import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('muestra las pestanas de autenticacion', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registro/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recuperar contrasena/i })).toBeInTheDocument();
  });

  it('permite iniciar sesion y mostrar el CRUD de usuarios', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'admin@empresa.com' } });
    fireEvent.change(screen.getByLabelText(/contrasena/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    expect(await screen.findByText(/sesion activa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument();
  });
});
