import { Button } from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            icon={<Home className="w-4 h-4" />}
            onClick={() => (window.location.href = '/dashboard')}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        <div className="mt-12">
          <img
            src="https://illustrations.popsy.co/amber/page-not-found.svg"
            alt="404 illustration"
            className="w-96 max-w-full mx-auto opacity-50"
          />
        </div>
      </div>
    </div>
  );
};
