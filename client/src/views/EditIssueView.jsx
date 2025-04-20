import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getIssueById, updateIssue } from '../api/axiosClient';
import { Container, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

// Utility to format dates
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

function EditIssueView() {
  const { id } = useParams(); // Get issue ID from URL
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [loadError, setLoadError] = useState(null); // Error during initial load
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [currentIssue, setCurrentIssue] = useState(null); // Store fetched issue data
  const navigate = useNavigate();

  // Fetch existing issue data on load
  useEffect(() => {
    let isMounted = true;
    const fetchIssueForEdit = async () => {
      setLoadingIssue(true);
      setLoadError(null);
      setCurrentIssue(null);
      try {
        const issueData = await getIssueById(id);
        if (isMounted) {
          setCurrentIssue(issueData);
          // Populate form fields with fetched data
          reset({
            title: issueData.title || '',
            description: issueData.description || '',
            status: issueData.status || 'Open',
            priority: issueData.priority || 'Medium',
          });
        }
      } catch (err) {
         if (isMounted) {
            console.error(`Failed to fetch issue ${id} for editing:`, err);
            setLoadError(err.message || `Failed to load issue #${id} for editing.`);
         }
      } finally {
         if (isMounted) {
            setLoadingIssue(false);
         }
      }
    };
    fetchIssueForEdit();
    // Cleanup function to prevent state updates on unmounted component
    return () => { isMounted = false; };
  }, [id, reset]);

  // Handle form submission for updates
  const onSubmit = async (data) => {
    try {
      const updatedIssue = await updateIssue(id, data);
      toast.success(`Issue #${updatedIssue.id} updated successfully!`);
      navigate(`/issues/${updatedIssue.id}`); // Redirect to detail page
    } catch (err) {
      // Extract validation or general error messages
      const errorMessage = err.errors
        ? err.errors.map(e => e.msg).join(', ')
        : (err.message || 'Failed to update issue. Please try again.');
      toast.error(errorMessage);
    }
  };

  // --- Conditional Rendering ---

  if (loadingIssue) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading data for issue #{id}...</p>
      </Container>
    );
  }

  // Show error if initial loading failed
  if (loadError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Issue Data</Alert.Heading>
          <p>{loadError}</p>
          <Button as={Link} to="/" variant="secondary">Back to Dashboard</Button>
        </Alert>
      </Container>
    );
  }

  // Handle case where issue might not be found (e.g., invalid ID, deleted)
  if (!currentIssue) {
     return (
        <Container className="mt-5">
            <Alert variant="warning">
                <Alert.Heading>Issue Not Found</Alert.Heading>
                <p>Could not find data for issue with ID #{id}.</p>
                <Button as={Link} to="/" variant="secondary">Back to Dashboard</Button>
            </Alert>
        </Container>
     );
  }

  // Render the edit form
  return (
    <Container>
      <h1 className="my-4">Edit Issue: #{currentIssue.id}</h1>
      <Card>
        <Card.Body>
          {/* Submission errors are handled by toast, but an Alert could be added */}
          <Form onSubmit={handleSubmit(onSubmit)}>
             {/* Form fields are the same as CreateIssueView, pre-populated */}
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                {...register("title", {
                  required: "Title is required.",
                  maxLength: { value: 255, message: "Title cannot exceed 255 characters." }
                })}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                {...register("description", {
                    maxLength: { value: 5000, message: "Description cannot exceed 5000 characters." }
                })}
                isInvalid={!!errors.description}
              />
               <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select {...register("status")} isInvalid={!!errors.status}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </Form.Select>
               <Form.Control.Feedback type="invalid">
                {errors.status?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select {...register("priority")} isInvalid={!!errors.priority}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
               <Form.Control.Feedback type="invalid">
                {errors.priority?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Submit and Cancel Buttons */}
            <Button variant="primary" type="submit" disabled={isSubmitting} className="me-2">
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
             <Button variant="secondary" as={Link} to={`/issues/${currentIssue.id}`} disabled={isSubmitting}>
               Cancel
             </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditIssueView;