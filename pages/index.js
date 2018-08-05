import App from "../components/App";
import Header from "../components/Header";
import PostList from "../components/PostList";
import Head from "next/head";

export default () => (
  <App>
    <Head>
      <title>Nat? Nat. Nat!</title>
      <meta
        name="viewport"
        content="initial-scale=1.0, width=device-width"
        key="viewport"
      />
    </Head>
    <Header />
    <PostList />
  </App>
);
