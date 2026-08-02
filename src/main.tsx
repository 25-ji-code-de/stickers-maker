// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import AuthCallback from './components/auth/AuthCallback'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

// Simple routing: check if we're on the OAuth callback path
const isCallbackRoute = window.location.pathname === '/callback'

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {isCallbackRoute ? <AuthCallback /> : <App />}
  </React.StrictMode>,
)
