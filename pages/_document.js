import { Html, Head, Main, NextScript } from 'next/document'



export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,200;0,300;0,400;0,700;0,900;1,200;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body data-scroll-container>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}