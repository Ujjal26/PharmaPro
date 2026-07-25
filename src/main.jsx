/**
 * File: main.jsx
 * Description: Entry point for the React application. It initializes the React DOM,
 * configures Redux store Provider, and wraps the app with the Authentication Provider.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.jsx'
import './index.css'
import { store } from './slices/store.js'
import { AuthProvider } from './user auth/AuthContext.jsx'

// Create root and render the application within React StrictMode for development warnings
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Provider for global state management */}
    <Provider store={store}>
      {/* AuthProvider for global authentication context */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
