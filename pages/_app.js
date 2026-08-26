import '../styles/globals.css';
import Head from 'next/head';

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
      <Component {...pageProps} />
    </>
  );
}
