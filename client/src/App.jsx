import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Using App.css for potential base styles
import './App.css';

function App() {
  return (
    <>
      {/* Global toast notification container */}
      <ToastContainer
        position="top-right"
        autoClose={3000} // Auto close toasts after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Use colored themes based on toast type
      />

      {/* Main navigation bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4"> {/* Added margin-bottom */}
        <Container>
          <Navbar.Brand as={Link} to="/">Issue Tracker</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/issues/new">Create Issue</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main content area where routed components render */}
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

export default App;