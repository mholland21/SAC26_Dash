import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Picks & Results',
  description: 'Sports picks tracking and results',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <a href="/picks" style={{ marginRight: '2rem', textDecoration: 'none', color: '#0066cc' }}>
              Picks
            </a>
            <a href="/results" style={{ textDecoration: 'none', color: '#0066cc' }}>
              Results
            </a>
          </div>
        </nav>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
