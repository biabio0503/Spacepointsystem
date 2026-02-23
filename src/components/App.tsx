import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="flex justify-center min-h-screen" style={{ background: '#C8CED8' }}>
        <div className="w-full max-w-[430px] min-h-screen relative shadow-2xl overflow-hidden" style={{ background: '#EEF1F8' }}>
          <RouterProvider router={router} />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;