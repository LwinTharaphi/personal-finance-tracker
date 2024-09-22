"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';

export default function IncomePage() {
  const [incomeList, setIncomeList] = useState([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('');
  const [editId, setEditId] = useState(null); // For tracking which income to edit
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // For delete confirmation

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/income");
        if (!response.ok) throw new Error('Error fetching income data');
        const data = await response.json();
        setIncomeList(data);
      } catch (error) {
        setError('Error fetching income data. Please try again later.');
        console.error('Error fetching income:', error);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newIncome = {
      type,
      amount: parseFloat(amount),
      date,
      source,
    };

    try {
      let response;
      if (editId) {
        // Update income
        response = await fetch(`/api/income/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newIncome),
        });
      } else {
        // Add new income
        response = await fetch('/api/income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newIncome),
        });
      }

      if (response.ok) {
        const addedOrUpdatedIncome = await response.json();
        if (editId) {
          // Update existing income in state
          setIncomeList(
            incomeList.map((inc) => (inc._id === editId ? addedOrUpdatedIncome : inc))
          );
        } else {
          // Add new income to the list
          setIncomeList([...incomeList, addedOrUpdatedIncome]);
        }
        setType('');
        setAmount('');
        setDate('');
        setSource('');
        setEditId(null);
        setError('');
      } else {
        setError('Error saving income. Please check your input.');
      }
    } catch (error) {
      setError('Error saving income. Please try again later.');
    }
  };

  const handleEdit = (income) => {
    setType(income.type);
    setAmount(income.amount);
    setDate(income.date);
    setSource(income.source);
    setEditId(income._id);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/income/${editId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIncomeList(incomeList.filter((inc) => inc._id !== editId));
        setEditId(null);
        setShowModal(false);
      } else {
        setError('Error deleting income.');
      }
    } catch (error) {
      setError('Error deleting income.');
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

  return (
    <Container fluid>
      <Row>
        <Col md={3}>
        <Sidebar/>
        </Col>
        <Col>
          <Row className="my-5">
            <Col md={{ span: 8, offset: 2 }}>
            <h1 className="text-center mb-4" style={{ color: '#007bff' }}>Income Tracker</h1>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Card for form */}
            <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
              <Card.Body>
                <Card.Title className="mb-3">{editId ? 'Edit Income' : 'Add New Income'}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="formType" className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter income type"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
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
                      <Form.Group controlId="formSource" className="mb-3">
                        <Form.Label>Source</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter source of income"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid">
                    <Button variant={editId ? 'warning' : 'primary'} type="submit" size="lg">
                      {editId ? 'Update Income' : 'Add Income'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Table for displaying income records */}
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Income List</Card.Title>
                <Table striped bordered hover responsive className="mt-3">
                  <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Source</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList.map((income) => (
                      <tr key={income._id}>
                        <td>{income.type}</td>
                        <td>{income.amount.toFixed(2)}</td>
                        <td>{new Date(income.date).toLocaleDateString()}</td>
                        <td>{income.source}</td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(income)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openDeleteModal(income._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {incomeList.length === 0 && <p className="text-center">No income added yet.</p>}
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
        <Modal.Body>Are you sure you want to delete this income?</Modal.Body>
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
