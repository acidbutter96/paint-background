import './globals.css';
import BackgroundClient from '../components/BackgroundClient';

export const metadata = {
  title: 'Background App',
  description: 'App with WebGL background',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <BackgroundClient />
        {children}
      </body>
    </html>
  );
}
