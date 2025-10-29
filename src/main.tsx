import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './config/router.tsx';
import {

  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GlobalUploadDialog } from './components/GlobalUploadPanel.tsx';
import { Toaster } from 'sonner';
import { UploadProgressDropdown } from './components/UploadProgressDropdown.tsx';


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient} >
      <ReactQueryDevtools initialIsOpen={false} />

      <Toaster
        richColors
        position="top-right"
      />
      <RouterProvider router={router} />

      



      <GlobalUploadDialog />

    </QueryClientProvider>

  </StrictMode>,
)
