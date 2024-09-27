"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccessDenied from '../components/accessDenied'

export default function IncomePage() {
  const [incomeList, setIncomeList] = useState([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('');
  const [editId, setEditId] = useState(null); // For tracking which income to edit
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // For delete confirmation
  const [filteredIncome, setFilteredIncome] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const {data: session, status} = useSession();
  const loading = status === "loading";
  // const [userData,setUserData] = useState(null);
  const router = useRouter()

  // Redirect to home if no session
  useEffect(() => {
    if (!loading && session && session.user?.id) {
      fetch(`/api/income?userId=${session.user.id}`)
      .then((res)=> res.json())
      .then((data)=> setIncomeList(data))
      .catch((error)=>{
        setError('Error fetching incoe data');
        console.error(error);
      });
    } else if (!loading && !session){
      router.push('/');
    }

    // if (session){
    //   fetch(`/api/income?userId=${session.user.id}`);
    // }

    // if (status === "authenticated"){
    //   fetch(`/api/income?userId=${session.user.id}`)
    //   .then((res)=>res.json())
    //   .then((data)=> setIncomeList(data));
    // }
  }, [loading, session, router,status]);

  // Render loading or access denied state
  if (loading) return <p>Loading ...</p>;
  if (!session) return <AccessDenied />;

  // useEffect(() => {
  //   // Fetch income data only once
  //   async function fetchData() {
  //     try {
  //       const response = await fetch("/api/income");
  //       if (!response.ok) throw new Error('Error fetching income data');
  //       const data = await response.json();
  //       setIncomeList(data);
  //     } catch (error) {
  //       setError('Error fetching income data. Please try again later.');
  //       console.error('Error fetching income:', error);
  //     }
  //   }

  //   fetchData();
  // }, []); // Empty dependency array to fetch income only once on mount

  // Filter income by month and year when incomeList, selectedMonth, or selectedYear change
  useEffect(() => {
    const filterIncomeByMonth = () => {
      const filtered = incomeList.filter((income) => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === selectedMonth && incomeDate.getFullYear() === selectedYear;
      });
      setFilteredIncome(filtered);
    };

    // Only run the filtering when the dependency changes
    if (incomeList.length > 0) {
      filterIncomeByMonth();
    }
  }, [incomeList, selectedMonth, selectedYear]); // Dependencies for filtering


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
    setDate(income.date.split('T')[0]);
    setSource(income.source);
    setEditId(income._id);
  };

  const handleCancelEdit = () => {
    setType('');
    setAmount('');
    setDate('');
    setSource('');
    setEditId('');
  }

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
  const totalIncome = filteredIncome.reduce((acc, income) => acc + income.amount, 0).toFixed(2);

  return (
    <Container fluid>
      <Row>
        <Col md={3} className='p-0'>
          <Sidebar />
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
                          Add Income
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Table for displaying income records */}
              <Card className="shadow-sm">
                <Card.Body>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button variant="secondary" onClick={handlePreviousMonth}>
                      ◀️
                    </Button>
                    <Card.Title>Income List (Month: {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} )</Card.Title>
                    <Button variant="secondary" onClick={handleNextMonth}>
                      ▶️
                    </Button>
                  </div>
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
                      {filteredIncome.map((income) => (
                        <tr key={income._id}>
                          <td>{income.type}</td>
                          <td>{income.amount.toFixed(2)}B</td>
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
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'right' }}>
                          <strong>Total Income:</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>{totalIncome} B</td>
                        <td></td>
                      </tr>
                    </tfoot>
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
