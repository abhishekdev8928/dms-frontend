import React from 'react';
import { AlertCircle, Home, Search, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFoundPage() {
  const navigate = (path) => {
    window.location.href = path;
  };

  const handleGoHome = () => {
    navigate('/dashboard/home');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSearch = () => {
    navigate('/dashboard/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="text-9xl font-bold text-slate-200 dark:text-slate-800">
                404
              </div>
              <AlertCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-orange-500 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>What happened?</AlertTitle>
            <AlertDescription>
              The page you requested doesn't exist or may have been moved. Double-check the URL or try navigating from the home page.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={handleSearch} 
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              If you believe this is an error, please{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}