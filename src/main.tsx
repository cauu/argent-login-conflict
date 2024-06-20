import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@ethsign/ui'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import App from './App.tsx'
import './index.css'

const routerConfig = [
  {
    path: '/signin',
    async lazy() {
      const SignInPage = await import(/* webpackChunkName: "signin" */ './App.tsx');
      return { Component: SignInPage.default };
    }
  },
]

const router = createBrowserRouter(routerConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
        <ThemeProvider defaultTheme={'light'} storageKey={'theme'}>
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={router} />
    </DndProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
