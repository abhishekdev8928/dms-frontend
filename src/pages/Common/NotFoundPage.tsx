
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate("/dashboard/department")

  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* 404 Header */}
        <div className="text-center space-y-4">
          <h1 className="text-9xl font-bold text-slate-900 tracking-tight">
            404
          </h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-slate-700">
              Page Not Found
            </h2>
            <p className="text-slate-600 text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>
        </div>

        {/* Alert */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Lost your way?</AlertTitle>
          <AlertDescription className="text-amber-800">
            The page you're trying to access might have been moved, deleted, or never existed.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={handleGoHome}
            size="lg"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-slate-500">
          <p>
            If you believe this is a mistake, please{' '}
            <a href="#" className="text-slate-700 hover:text-slate-900 underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}