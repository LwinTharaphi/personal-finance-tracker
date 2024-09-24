"use client";
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Modal, Card, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/budget");
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        setError('Error fetching budgets.');
        console.error('Error fetching budgets:', error);
      }
    }
    fetchData();
  }, []);

  const handleAddBudget = (month) => {
    setSelectedMonth(month);
    setEditMode(false);
    setBudgetAmount(''); // Reset the budget amount for a new entry
  };

  const handleSaveBudget = async (event) => {
    event.preventDefault();
  
    const newBudget = {
      month: selectedMonth,
      amount: parseFloat(budgetAmount),
    };
  
    try {
      let response;
      if (editMode) {
        // Update existing budget using PUT
        const existingBudget = getBudgetByMonth(selectedMonth);
        if (existingBudget) {
          response = await fetch(`/api/budget/${existingBudget._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBudget),
          });
        }
      } else {
        // Add new budget using POST
        response = await fetch('/api/budget', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([newBudget]), // Send as array for backend
        });
      }
  
      if (response.ok) {
        const addedOrUpdatedBudget = await response.json();
  
        if (editMode) {
          // Update the existing budget in the state
          setBudgets((prevBudgets) => prevBudgets.map((budget) =>
            budget._id === addedOrUpdatedBudget._id ? addedOrUpdatedBudget : budget
          ));
        } else {
          // Add new budget to the list, or replace if it already exists
          setBudgets((prevBudgets) => {
            const existing = prevBudgets.find(b => b.month === addedOrUpdatedBudget.month);
            if (existing) {
              // Replace the existing budget
              return prevBudgets.map((budget) =>
                budget.month === addedOrUpdatedBudget.month ? addedOrUpdatedBudget : budget
              );
            }
            // Add the new budget
            return [...prevBudgets, addedOrUpdatedBudget];
          });
        }
  
        // Reset form and state
        setBudgetAmount('');
        setSelectedMonth(null); // Close the modal
        setEditMode(false);
        setError(null); // Clear any previous errors
      } else {
        setError('Error saving budget. Please check your input.');
      }
    } catch (error) {
      setError('Error saving budget. Please try again later.');
      console.error('Error saving budget:', error);
    }
  };
  
  

  const handleEditBudget = (month) => {
    setSelectedMonth(month);
    setEditMode(true);
    const existingBudget = getBudgetByMonth(month);
    setBudgetAmount(existingBudget?.amount || ''); // Set amount for editing
  };

  const handleDeleteBudget = async (month) => {
    const budgetToDelete = budgets.find((budget) => budget.month === month);

    if (!budgetToDelete) {
      setError('Budget not found for this month.');
      return;
    }

    try {
      const response = await fetch(`/api/budget/${budgetToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedBudgets = budgets.filter((budget) => budget.month !== month);
        setBudgets(updatedBudgets);
        setError(null);
      } else {
        setError('Failed to delete budget. Please try again.');
      }
    } catch (error) {
      setError('Error deleting budget.');
      console.error('Error deleting budget:', error);
    }
  };

  const getBudgetByMonth = (month) => {
    return budgets.find((budget) => budget.month === month);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3} className='p-0'>
        <Sidebar/>
        </Col>
        <Col>
        <h1 className="text-center mb-4" style={{ color: '#007bff' }}>Budget List</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {months.map((month) => {
            const budget = getBudgetByMonth(month);
            return (
              <Col key={month} sm={6} md={4} lg={3} className="mb-4">
                <Card className="border border-primary shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-center mb-2 fw-bold">{month}</Card.Title>
                    {budget ? (
                      <>
                        <Card.Text>Amount: {budget.amount} B</Card.Text>
                        <div className="d-flex justify-content-center">
                          <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditBudget(month)}>
                            Update
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteBudget(month)}>
                            Delete
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex justify-content-center">
                        <Button variant="success" size="sm" onClick={() => handleAddBudget(month)}>
                          Add Budget
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        
        </Col>
      </Row>


      <Modal show={selectedMonth !== null} onHide={() => setSelectedMonth(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit" : "Add"} Budget for {selectedMonth}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Budget Amount</Form.Label>
              <Form.Control
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Enter budget amount"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedMonth(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBudget}>
            Save Budget
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
