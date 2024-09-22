"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null); // For tracking which expense to edit
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // For delete confirmation
  const [incomelist, setIncomelist] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/expense");
        if (!response.ok) throw new Error('Error fetching expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        setError('Error fetching expenses. Please try again later.');
        console.error('Error fetching expenses:', error);
      }
    }
    async function fetchIncome() {
      try {
        const response = await fetch("/api/income");
        if (!response.ok) throw new Error('Error fetching income data');
        const data = await response.json();
        setIncomelist(data);
    
      } catch (error) {
        setError('Error fetching income data. Please try again later.');
        console.error('Error fetching income:', error);
      }
    }

    // console.log(incomelist)
    fetchData();
    fetchIncome();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newExpense = {
      category,
      amount: parseFloat(amount),
      date,
      description,
    };

    try {
      let response;
      if (editId) {
        // Update expense
        response = await fetch(`/api/expense/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newExpense),
        });
      } else {
        // Add new expense
        response = await fetch('/api/expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newExpense),
        });
      }

      if (response.ok) {
        const addedOrUpdatedExpense = await response.json();
        if (editId) {
          // Update existing expense in state
          setExpenses(
            expenses.map((exp) => (exp._id === editId ? addedOrUpdatedExpense : exp))
          );
        } else {
          // Add new expense to the list
          setExpenses([...expenses, addedOrUpdatedExpense]);
        }
        setCategory('');
        setAmount('');
        setDate('');
        setDescription('');
        setEditId(null);
        setError('');
      } else {
        setError('Error saving expense. Please check your input.');
      }
    } catch (error) {
      setError('Error saving expense. Please try again later.');
    }
  };

  const handleEdit = (expense) => {
    setCategory(expense.category);
    setAmount(expense.amount);
    setDate(expense.date.split('T')[0]);
    setDescription(expense.description);
    setEditId(expense._id);
  };

  const handleCancelEdit = ()=>{
    setCategory('');
    setAmount('');
    setDate('');
    setDescription('');
    setEditId('');
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/expense/${editId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter((exp) => exp._id !== editId));
        setEditId(null);
        setShowModal(false);
      } else {
        console.log('response ok but error')
        setError('Error deleting expense.');
      }
    } catch (error) {
      console.log('response not ok')
      setError('Error deleting expense.');
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

  const totalIncome = incomelist.reduce((total, income) => {
    const amount = parseFloat(income.amount); // Ensure it's a number
    return total + (isNaN(amount) ? 0 : amount); // Fallback to 0 if NaN
  }, 0);
  

  const totalExpenses = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  const balance = totalIncome - totalExpenses;


  return (
    <Container>
      <Row className="my-5">
        <Col md={{ span: 8, offset: 2 }}>
          <h1 className="text-center mb-4" style={{ color: '#007bff' }}>Expense Tracker</h1>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Card for form */}
          <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
            <Card.Body>
              <Card.Title className="mb-3">{editId ? 'Edit Expense' : 'Add New Expense'}</Card.Title>
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
                  {/* <Button variant={editId ? 'warning' : 'primary'} type="submit" size="lg">
                    {editId ? 'Update Expense' : 'Add Expense'}
                  </Button> */}
                  {editId? (
                    <>
                    <Button variant='warning' type='submit' size='lg'>
                      Update Expense
                    </Button>
                    <Button variant='secondary' size='lg' onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    </>
                  ): (
                    <Button variant='primary' type='submit' size='lg'>
                      Add Expense
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Table for displaying expenses */}
          <Card className="shadow-sm">
            <Card.Body>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Card.Title>Expense List</Card.Title>
                <span style={{ fontSize: '1rem', color: '#28a745' }}>
                  (Balance: {balance.toFixed(2)}B)
                </span>
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
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>{expense.category}</td>
                      <td>{expense.amount.toFixed(2)}B</td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.description}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(expense)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(expense._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {expenses.length === 0 && <p className="text-center">No expenses added yet.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete confirmation modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this expense?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
