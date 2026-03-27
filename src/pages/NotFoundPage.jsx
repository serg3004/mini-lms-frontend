import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="h-20 w-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
        <GraduationCap className="h-10 w-10 text-gray-300" />
      </div>
      <h1 className="text-7xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
      <p className="text-gray-500 text-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/courses" className="btn-secondary">Browse Courses</Link>
      </div>
    </div>
  );
}
