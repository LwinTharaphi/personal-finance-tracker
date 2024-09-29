"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccessDenied from '../components/accessDenied'

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null); // For tracking which budget to edit
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // For delete confirmation
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!loading && session && session.user.githubId) {
        try {
          const response = await fetch("/api/budget");
          if (!response.ok) throw new Error('Error fetching budgets');
          const data = await response.json();
          setBudgets(data);
        } catch (error) {
          setError('Error fetching budgets. Please try again later.');
          console.error('Error fetching budgets:', error);
        }
      } else if (!loading && !session) {
        router.push('/');
      }
    }''

    fetchData();
  }, [loading,session,router]); // Run only once when the component mounts

  // Filter budgets based on selected month and year
  useEffect(() => {
    const filterBudgetByMonth = () => {
      const filtered = budgets.filter((budget) => {
        const budgetDate = new Date(budget.date);
        return budgetDate.getMonth() === selectedMonth && budgetDate.getFullYear() === selectedYear;
      });
      setFilteredBudgets(filtered);
    };

    filterBudgetByMonth();
  }, [budgets, selectedMonth, selectedYear]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newBudget = {
      category,
      amount: parseFloat(amount),
      date,
      description,
    };

    try {
      let response;
      if (editId) {
        // Update budget
        response = await fetch(`/api/budget/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBudget),
        });
      } else {
        // Add new budget
        response = await fetch('/api/budget', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBudget),
        });
      }

      if (response.ok) {
        const addedOrUpdatedBudget = await response.json();
        if (editId) {
          // Update existing budget in state
          setBudgets(
            budgets.map((bud) => (bud._id === editId ? addedOrUpdatedBudget : bud))
          );
        } else {
          // Add new budget to the list
          setBudgets([...budgets, addedOrUpdatedBudget]);
        }
        setCategory('');
        setAmount('');
        setDate('');
        setDescription('');
        setEditId(null);
        setError('');
      } else {
        setError('Error saving budget. Please check your input.');
      }
    } catch (error) {
      setError('Error saving budget. Please try again later.');
    }
  };

  const handleEdit = (budget) => {
    setCategory(budget.category);
    setAmount(budget.amount);
    setDate(budget.date.split('T')[0]);
    setDescription(budget.description);
    setEditId(budget._id);
  };

  const handleCancelEdit = () => {
    setCategory('');
    setAmount('');
    setDate('');
    setDescription('');
    setEditId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/budget/${editId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBudgets(budgets.filter((bud) => bud._id !== editId));
        setEditId(null);
        setShowModal(false);
      } else {
        setError('Error deleting budget.');
      }
    } catch (error) {
      setError('Error deleting budget.');
    }
  };

  const openDeleteModal = (id) => {
    setEditId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };
  const handlePreviousMonth = () => {
    setSelectedMonth((prevMonth) => {
      prevMonth = prevMonth - 1;
      if (prevMonth < 0) {
        setSelectedYear(selectedYear - 1);
        return 11;
      }
      return prevMonth;
    });
  };

  const handleNextMonth = () => {

    // Increment selectedMonth, handling year rollover
    setSelectedMonth((prevMonth) => {
      const nextMonth = prevMonth + 1;
      if (nextMonth > 11) {
        setSelectedYear(selectedYear + 1);
        return 0;
      }
      return nextMonth;
    });
  };

  const totalBudgetsByMonth = filteredBudgets.reduce((total, budget) => total + parseFloat(budget.amount), 0);

  // Render loading or access denied state
  if (loading) return <p>Loading ...</p>;
  if (!session) return <AccessDenied />;

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Container fluid style={{ backgroundColor: '#E5EEF8' }}>
      <Row>
        <Col md={3} className='p-0'>
          <Sidebar />
        </Col>
        <Col>
          <Row className="my-5">
            <Col md={{ span: 8, offset: 2 }}>
              <h1 className="text-center mb-4" style={{ color: '#007bff' }}>Budget Manager</h1>

              {error && <Alert variant="danger">{error}</Alert>}

              {/* Card for form */}
              <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
                <Card.Body>
                  <Card.Title className="mb-3">{editId ? 'Edit Budget' : 'Add New Budget'}</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="formCategory" className="mb-3">
                          <Form.Label>Category</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="formAmount" className="mb-3">
                          <Form.Label>Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="formDate" className="mb-3">
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="formDescription" className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-grid">
                      {editId ? (
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant='warning' type='submit' size='lg'>
                            Update
                          </Button>
                          <Button variant='secondary' size='lg' onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant='primary' type='submit' size='lg'>
                          Add Budget
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Table for displaying budgets */}
              <Card className="shadow-sm">
                <Card.Body>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="secondary" onClick={handlePreviousMonth}>
                      ◀️
                    </Button>
                    <Card.Title>Budget List (Month: {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })})</Card.Title>
                    <Button variant="secondary" onClick={handleNextMonth}>
                      ▶️
                    </Button>
                  </div>
                  <Table striped bordered hover responsive className="mt-3">
                    <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBudgets.map((budget) => (
                        <tr key={budget._id}>
                          <td>{budget.category}</td>
                          <td>${budget.amount.toFixed(2)}</td>
                          <td>{new Date(budget.date).toLocaleDateString()}</td>
                          <td>{budget.description}</td>
                          <td className="d-flex justify-content-start">
                            <Button variant='success' size='sm' className="me-2" onClick={() => handleEdit(budget)}>Edit</Button>
                            <Button variant='danger' size='sm' onClick={() => openDeleteModal(budget._id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Total:</td>
                        <td className="fw-bold">${totalBudgetsByMonth.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>

              {/* Delete confirmation modal */}
              <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this budget item?</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                  <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
