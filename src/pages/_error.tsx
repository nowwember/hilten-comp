import { NextPageContext } from 'next';
import Error from 'next/error';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          {statusCode ? `${statusCode}` : 'Ошибка'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {statusCode
            ? `Произошла ошибка ${statusCode} на сервере`
            : 'Произошла ошибка на клиенте'}
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;


