// Entry point and router setup
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

// Import global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Assuming index.css exists for base styles

// Import view components
import App from './App.jsx'; // Root layout component
import DashboardView from './views/DashboardView.jsx';
import IssueDetailView from './views/IssueDetailView.jsx';
import CreateIssueView from './views/CreateIssueView.jsx';
import EditIssueView from './views/EditIssueView.jsx';
import ErrorPageView from './views/ErrorPageView.jsx'; // Generic error page

// Define the application routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Root layout wraps all child routes
    errorElement: <ErrorPageView />, // Default error page for this route tree
    children: [ // Child routes render inside App's <Outlet />
      {
        index: true, // Makes DashboardView the default for "/"
        element: <DashboardView />,
      },
      {
        path: "issues/new",
        element: <CreateIssueView />,
      },
      {
        path: "issues/:id", // Route with a dynamic ID parameter
        element: <IssueDetailView />,
      },
      {
        path: "issues/:id/edit", // Route for editing a specific issue
        element: <EditIssueView />,
      },
      // A catch-all route could be added here for more specific 404 handling
    ],
  },
]);

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);