import { RouterProvider } from 'react-router';
import { router } from './router';
import { ToastContainer } from './components/shared/ToastContainer';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
