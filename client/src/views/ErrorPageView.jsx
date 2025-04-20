// Generic error page for React Router
import React from 'react';
import { useRouteError } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';

function ErrorPageView() {
  const error = useRouteError(); // Hook to get routing errors
  console.error("Routing Error:", error); // Log the error for debugging

  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Oops! Something Went Wrong</Alert.Heading>
        <p>An unexpected error occurred while navigating.</p>
        {/* Display error status text or message */}
        <p><i>{error.statusText || error.message || 'Unknown error'}</i></p>
        {/* Optionally add a link back home */}
        {/* <Button as={Link} to="/" variant="primary">Go Home</Button> */}
      </Alert>
    </Container>
  );
}

export default ErrorPageView;