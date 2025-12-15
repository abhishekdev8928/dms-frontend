// frontend/src/pages/Common/UnauthorizedPage.tsx

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-xl mt-4">Unauthorized Access</p>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this page
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}