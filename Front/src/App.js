import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-center"
          containerStyle={{
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '16px',
              padding: '16px 24px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
