// View for displaying a single issue's details
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getIssueById, deleteIssue } from '../api/axiosClient';
import { Container, Card, Button, Spinner, Alert, Row, Col, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

// Utility to format date strings
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
};

// Helper to get Bootstrap badge variant based on type and value
const getBadgeVariant = (type, value) => {
    if (type === 'priority') {
        switch (value) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'secondary';
        }
    }
    if (type === 'status') {
         switch (value) {
            case 'Open': return 'primary';
            case 'In Progress': return 'info';
            case 'Closed': return 'dark';
            default: return 'secondary';
        }
    }
    return 'secondary'; // Default badge
};

function IssueDetailView() {
  const { id } = useParams(); // Get issue ID from URL
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For load or delete errors
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // Tracks delete operation progress
  const navigate = useNavigate();

  // --- Modal Control Functions ---
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => {
      setError(null); // Clear previous errors before showing modal
      setShowDeleteModal(true);
  };

  // --- Fetch issue details ---
  useEffect(() => {
    let isMounted = true;
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIssueById(id);
         if (isMounted) {
            setIssue(data);
         }
      } catch (err) {
         if (isMounted) {
             // Handle not found specifically
             if (err.message && (err.status === 404 || err.message.includes('404') || err.message.includes('not found'))) {
                 setIssue(null); // Set issue to null if not found
                 setError(`Issue #${id} not found.`);
             } else {
                setError(err.message || `Failed to load issue #${id}.`);
             }
         }
      } finally {
         if (isMounted) {
            setLoading(false);
         }
      }
    };
    fetchIssueDetails();
    // Cleanup to avoid state updates if component unmounts during fetch
    return () => { isMounted = false; };
  }, [id]);

  // --- Delete issue handler ---
  const confirmDelete = async () => {
      handleCloseDeleteModal(); // Close modal first
      setIsDeleting(true);
      setError(null);
      try {
          await deleteIssue(id);
          toast.success(`Issue #${id} deleted successfully!`);
          navigate('/'); // Redirect to dashboard on successful delete
      } catch (err) {
          toast.error(err.message || `Failed to delete issue #${id}.`);
          setError(err.message || `Failed to delete issue #${id}.`); // Show error inline too
          setIsDeleting(false); // Reset deleting state on error
      }
      // No finally needed here as we navigate away on success
  };

  // --- Conditional Rendering ---

  // Show loading spinner only if not currently deleting
  if (loading && !isDeleting) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading Issue #{id}...</p>
      </Container>
    );
  }

  // Show error if initial loading failed (and not deleting)
  if (error && !issue && !isDeleting) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Issue</Alert.Heading>
          <p>{error}</p>
          <Button as={Link} to="/" variant="secondary">Back to Dashboard</Button>
        </Alert>
      </Container>
    );
  }

   // Handle issue not found case
  if (!issue) {
       return (
          <Container className="mt-5">
            <Alert variant="warning">
              <Alert.Heading>Issue Not Found</Alert.Heading>
              <p>Could not find issue with ID #{id}. It might have been deleted.</p>
               <Button as={Link} to="/" variant="secondary">Back to Dashboard</Button>
            </Alert>
          </Container>
        );
  }

  // Render the main issue details view
  return (
    <>
      <Container>
        <h1 className="my-4">Issue Detail: #{issue.id}</h1>

        {/* Display delete errors */}
        {error && !isDeleting && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                <Alert.Heading>Operation Failed</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )}

        <Card className="mb-3">
          <Card.Header>
            <Row className="align-items-center">
              <Col>
                  <Card.Title as="h2">{issue.title}</Card.Title>
              </Col>
              <Col xs="auto">
                  {/* Edit and Delete Buttons */}
                  <Button as={Link} to={`/issues/${issue.id}/edit`} variant="outline-secondary" size="sm" className="me-2" disabled={isDeleting}> Edit </Button>
                  <Button variant="outline-danger" size="sm" onClick={handleShowDeleteModal} disabled={isDeleting}>
                      {isDeleting ? ( <><Spinner as="span" size="sm" animation="border" /> Deleting...</> ) : 'Delete'}
                  </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Card.Subtitle className="mb-2 text-muted">Status</Card.Subtitle>
                <Card.Text><Badge pill bg={getBadgeVariant('status', issue.status)}>{issue.status || 'N/A'}</Badge></Card.Text>
              </Col>
              <Col md={6}>
                <Card.Subtitle className="mb-2 text-muted">Priority</Card.Subtitle>
                <Card.Text><Badge pill bg={getBadgeVariant('priority', issue.priority)}>{issue.priority || 'N/A'}</Badge></Card.Text>
              </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                  <Card.Subtitle className="mb-2 text-muted">Description</Card.Subtitle>
                  {/* Use pre-wrap to preserve whitespace in description */}
                  <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                   {issue.description || <span className="text-muted">No description provided.</span>}
                  </Card.Text>
               </Col>
            </Row>
             <Row>
              <Col md={6}>
                <Card.Subtitle className="mb-2 text-muted">Created At</Card.Subtitle>
                <Card.Text>{formatDate(issue.created_at)}</Card.Text>
              </Col>
              <Col md={6}>
                <Card.Subtitle className="mb-2 text-muted">Last Updated</Card.Subtitle>
                <Card.Text>{formatDate(issue.updated_at)}</Card.Text>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer>
             <Button as={Link} to="/" variant="secondary">Back to Dashboard</Button>
          </Card.Footer>
        </Card>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton> <Modal.Title>Confirm Deletion</Modal.Title> </Modal.Header>
        <Modal.Body>Are you sure you want to delete issue #{id}? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}> Cancel </Button>
          <Button variant="danger" onClick={confirmDelete}> Delete </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default IssueDetailView;