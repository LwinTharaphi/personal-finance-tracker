"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccessDenied from '../components/accessDenied'

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
  const [filteredExpense, setFilteredExpense] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const {data: session, status} = useSession();
  const loading = status === 'loading'
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      if (!loading && session && session.user.githubId) {
        try {
          const response = await fetch("/api/expense");
          if (!response.ok) throw new Error('Error fetching expenses.');
          const data = await response.json();
          setExpenses(data);
        } catch (error) {
          setError('Error fetching expenses. Please try again later.');
          console.error('Error fetching expenses:', error);
        }
      } else if (!loading && !session) {
        router.push('/');
      }
    };

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

    fetchData();
    fetchIncome();
  }, [loading,router,session]); // Run only once when the component mounts

  // Render loading or access denied state
  if (loading) return <p>Loading ...</p>;
  if (!session) return <AccessDenied />;
  
  // Filter expenses based on selected month and year
  useEffect(() => {
    const filterExpenseByMonth = () => {
      const filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
      });
      setFilteredExpense(filtered);
    };

    filterExpenseByMonth();
  }, [expenses, selectedMonth, selectedYear]);

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

  const handleCancelEdit = () => {
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

  const calculateTotalIncome = () => {
    return incomelist
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear;
      })
      .reduce((total, income) => total + income.amount, 0);
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

  const totalIncomeByMonth = calculateTotalIncome(); // Calculate total income for the selected month

  const totalExpensesByMonth = filteredExpense.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  const balanceByMonth = totalIncomeByMonth - totalExpensesByMonth;


  return (
    <Container fluid style={{ backgroundColor: '#E5EEF8' }}>
      <Row>
        <Col md={3} className='p-0'>
          <Sidebar />
        </Col>
        <Col>
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
                    <Button variant="secondary" onClick={handlePreviousMonth}>
                      ◀️
                    </Button>
                    <Card.Title>Expense List (Month: {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} )</Card.Title>
                    <span style={{ fontSize: '1rem', color: '#28a745' }}>
                      (Balance: {balanceByMonth.toFixed(2)}B)
                    </span>
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
                      {filteredExpense.map((expense) => (
                        <tr key={expense._id}>
                          <td>{expense.category}</td>
                          <td>{expense.amount.toFixed(2)}B</td>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description}</td>
                          <td className="d-flex justify-content-start">
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
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Total:</td>
                        <td className="fw-bold">${totalExpensesByMonth.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                  {expenses.length === 0 && <p className="text-center">No expenses added yet.</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>

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
