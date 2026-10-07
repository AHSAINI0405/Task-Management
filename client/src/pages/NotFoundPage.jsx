import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand-600 dark:text-brand-400">404</h1>
      <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4">Page not found</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
}
