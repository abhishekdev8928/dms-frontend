import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './config/router.tsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { GlobalUploadProgress } from "@/components/custom/GlobalUploadProgress";

export const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>

     <QueryClientProvider client={queryClient} >
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}

      <GlobalUploadProgress />
      <Toaster
      position="top-right"   
      richColors
      expand
      toastOptions={{
        style: {
          borderRadius: '10px',
          padding: '10px 16px',
        },
      }}
    />
    <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
