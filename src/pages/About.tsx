export default function About() {
  return (
    <main className="about">
      <header className="about__header">
        <h1>About Daily Picture</h1>
        <p className="about__intro">
          A fun portfolio project showcasing daily tournaments between adorable animal competitors.
        </p>
      </header>

      <section className="about__section">
        <h2>How It Works</h2>
        <p>
          Every day at 12:00 AM UTC, a new winner is crowned. One representative 
          from each of the 8 teams is randomly selected to compete in a bracket-style tournament. 
          The ultimate winner becomes the Daily Picture! Teams accumulate points based on how far 
          their representative advances:
        </p>
        <ul>
          <li><strong>Quarterfinals:</strong> 1 point</li>
          <li><strong>Semifinals:</strong> 4 points</li>
          <li><strong>Final:</strong> 8 points</li>
        </ul>
        <p>
          Match outcomes are determined randomly, ensuring each day&apos;s tournament is unique 
          and unpredictable. Check back daily to see which adorable competitor claims victory!
        </p>
      </section>

      <section className="about__section">
        <h2>Image Credits</h2>
        <p>
          All animal images are courtesy of the{" "}
          <a
            href="https://www.si.edu/collections"
            target="_blank"
            rel="noopener noreferrer"
          >
            Smithsonian Institution
          </a>
          , provided under their open access policy. Background images are from{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
          .
        </p>
        <p>
          This project is for educational and portfolio purposes only. All images remain the
          property of their respective copyright holders.
        </p>
      </section>

      <footer className="about__footer">
        <p>
          Built with React, TypeScript, Supabase, and Vite. View the source code and other
          projects on my portfolio.
        </p>
      </footer>
    </main>
  );
}