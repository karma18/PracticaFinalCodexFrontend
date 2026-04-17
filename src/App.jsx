import './App.css';

const highlights = [
  {
    title: 'Base moderna',
    description: 'Proyecto configurado con React y Vite para desarrollo rapido y local.'
  },
  {
    title: 'Frontend puro',
    description: 'La estructura esta enfocada solo en interfaz, sin backend ni librerias extra.'
  },
  {
    title: 'Listo para crecer',
    description: 'Incluye organizacion minima, scripts y prueba inicial para evolucionar con orden.'
  }
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">React + Vite</p>
        <h1>Aplicacion web lista para correr en local</h1>
        <p className="lead">
          Esta base de frontend fue creada desde cero para que puedas instalar dependencias,
          ejecutar el entorno local y comenzar a desarrollar sobre una estructura clara.
        </p>
      </section>

      <section className="highlights" aria-label="Caracteristicas principales">
        {highlights.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
