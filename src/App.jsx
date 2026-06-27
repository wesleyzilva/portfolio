import React from 'react';

const panels = [
  {
    id: 'about',
    title: 'About',
    body: 'I am Wesley Zilva, a delivery and product leader helping teams ship with clarity, focus, and measurable outcomes.',
  },
  {
    id: 'work',
    title: 'Work',
    body: 'I build resilient delivery systems, align stakeholders, and guide teams through complexity with pragmatic leadership.',
  },
  {
    id: 'contact',
    title: 'Contact',
    body: 'Email: wesley.zilva@gmail.com. LinkedIn: https://www.linkedin.com/in/wesleyzilva/',
  },
];

function App() {
  const [activePanel, setActivePanel] = React.useState(0);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setActivePanel((current) => (current + 1) % panels.length);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActivePanel((current) => (current - 1 + panels.length) % panels.length);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        setActivePanel(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        setActivePanel(panels.length - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <main className="app-shell" aria-label="Portfolio overview">
      <header className="hero">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Wesley Zilva</h1>
          <p className="lead">Delivery and product leadership with a focus on execution, alignment, and momentum.</p>
        </div>
        <nav className="panel-nav" aria-label="Portfolio sections">
          {panels.map((panel, index) => (
            <button
              key={panel.id}
              className={index === activePanel ? 'nav-button active' : 'nav-button'}
              onClick={() => setActivePanel(index)}
              aria-pressed={index === activePanel}
            >
              {panel.title}
            </button>
          ))}
        </nav>
      </header>

      <section className="panel-grid" aria-live="polite">
        <article className="panel panel-main" role="region" aria-labelledby="panel-title">
          <h2 id="panel-title">{panels[activePanel].title}</h2>
          <p>{panels[activePanel].body}</p>
        </article>

        <aside className="panel panel-side" aria-label="Video and contact details">
          <h3>Featured introduction</h3>
          <div className="loom-wrapper">
            <iframe
              src="https://www.loom.com/embed/3d9412b9affd42d4b438aa9bb0d58c21"
              title="Wesley Zilva introduction video"
              allowFullScreen
            />
          </div>
          <div className="contact-block">
            <h3>Contact</h3>
            <p>Email: <a href="mailto:wesley.zilva@gmail.com">wesley.zilva@gmail.com</a></p>
            <p>LinkedIn: <a href="https://www.linkedin.com/in/wesleyzilva/" target="_blank" rel="noreferrer">wesleyzilva</a></p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;
