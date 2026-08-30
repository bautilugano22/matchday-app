import '../styles/globals.css';
import Head from 'next/head';
import { Archivo_Narrow, Inter, IBM_Plex_Mono } from 'next/font/google';
 
const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
 
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
 
export default function App({ Component, pageProps }) {
  return (
    <>
      {ADSENSE_CLIENT && (
        <Head>
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        </Head>
      )}
      <main className={`${archivoNarrow.variable} ${inter.variable} ${plexMono.variable}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
 
