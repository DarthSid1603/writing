import App from "../components/App";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";

export default () => (
  <App>
    <Head>
      <title>Nat? Nat. Nat! | Loading...</title>
    </Head>
    <Header />
    <article>
      Loading...
    </article>
    <Footer />
  </App>
);
