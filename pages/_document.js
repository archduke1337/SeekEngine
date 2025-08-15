import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  render() {
    const setInitialTheme = `(function(){
      try {
        var theme = localStorage.getItem('theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (theme === 'system' && prefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
        // add a helper class to allow smooth transitions after initial paint
        document.documentElement.classList.add('theme-transition');
        // remove transition helper shortly after paint so future changes still transition
        window.setTimeout(function(){ document.documentElement.classList.remove('theme-transition'); }, 300);
      } catch (e) {
        // ignore
      }
    })();`;

    return (
      <Html>
        <Head>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
