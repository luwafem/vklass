 // SAFETY NET: Prevent corrupted Supabase tokens from crashing the app
try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    // Supabase stores its token under a key based on your project URL
    const projectId = new URL(supabaseUrl).hostname.split('.')[0];
    const authKey = `sb-${projectId}-auth-token`;
    const storedItem = localStorage.getItem(authKey);
    
    if (storedItem) {
      JSON.parse(storedItem); // Try to parse it
    }
  }
} catch (e) {
  console.warn("Corrupted Supabase token detected. Clearing local storage.");
  // If parsing fails, it's corrupted. Wipe all Supabase keys.
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  });
}
// --- END SAFETY NET ---

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)