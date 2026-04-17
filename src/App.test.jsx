import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('muestra el titulo principal', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /aplicacion web lista para correr en local/i
      })
    ).toBeInTheDocument();
  });

  it('renderiza las tarjetas principales', () => {
    render(<App />);

    expect(screen.getByText(/base moderna/i)).toBeInTheDocument();
    expect(screen.getByText(/frontend puro/i)).toBeInTheDocument();
    expect(screen.getByText(/listo para crecer/i)).toBeInTheDocument();
  });
});
