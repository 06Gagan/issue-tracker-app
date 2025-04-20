import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../api/axiosClient';
import { Container, Form, Button, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

function CreateIssueView() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const newIssue = await createIssue(data);
      toast.success(`Issue #${newIssue.id} created successfully!`);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      // Extract validation or general error messages for the toast
      const errorMessage = err.errors
        ? err.errors.map(e => e.msg).join(', ')
        : (err.message || 'Failed to create issue. Please try again.');
      toast.error(errorMessage);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Create New Issue</h1>
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Title Field */}
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter issue title"
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

            {/* Description Field */}
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter issue description (optional)"
                {...register("description", {
                     maxLength: { value: 5000, message: "Description cannot exceed 5000 characters." }
                })}
                 isInvalid={!!errors.description}
              />
               <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Status Field */}
            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select {...register("status")} defaultValue="Open" isInvalid={!!errors.status}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </Form.Select>
               <Form.Control.Feedback type="invalid">
                {errors.status?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Priority Field */}
            <Form.Group className="mb-3" controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select {...register("priority")} defaultValue="Medium" isInvalid={!!errors.priority}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
               <Form.Control.Feedback type="invalid">
                {errors.priority?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Creating...</span>
                </>
              ) : (
                'Create Issue'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreateIssueView;