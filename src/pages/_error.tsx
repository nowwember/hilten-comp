import Error from 'next/error';

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return <Error statusCode={statusCode ?? 500} />;
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};


