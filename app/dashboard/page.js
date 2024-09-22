"use client"; // Client component

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeResponse = await fetch('/api/income');
        if (!incomeResponse.ok) throw new Error('Error fetching income data');
        const incomeData = await incomeResponse.json();
        setIncomeList(incomeData);

        const expenseResponse = await fetch('/api/expense');
        if (!expenseResponse.ok) throw new Error('Error fetching expense data');
        const expenseData = await expenseResponse.json();
        setExpenseList(expenseData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const totalIncome = incomeList.reduce((total, income) => total + income.amount, 0);
  const totalExpenses = expenseList.reduce((total, expense) => total + expense.amount, 0);
  const budget = totalIncome - totalExpenses;

  return (
    <Container fluid>
        <Row>
            <Col md={3} className='p-0'>
                <Sidebar/>
            </Col>
            <Col>
                <Row>
                    <h1 className="text-center mb-4">Dashboard</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row className="justify-content-center">
                        <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                            <Card.Title>Income</Card.Title>
                            <h3>${totalIncome.toFixed(2)}</h3>
                            <Table striped bordered hover responsive>
                                <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {incomeList.map((income) => (
                                    <tr key={income._id}>
                                    <td>{income.source}</td>
                                    <td>${income.amount.toFixed(2)}</td>
                                    <td>{new Date(income.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">

                        <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                            <Card.Title>Expenses</Card.Title>
                            <h3>${totalExpenses.toFixed(2)}</h3>
                            <Table striped bordered hover responsive>
                                <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {expenseList.map((expense) => (
                                    <tr key={expense._id}>
                                    <td>{expense.category}</td>
                                    <td>${expense.amount.toFixed(2)}</td>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                            <Card.Title>Budget</Card.Title>
                            <h3>${budget.toFixed(2)}</h3>
                            <p>{budget >= 0 ? "You're within budget!" : "You're over budget!"}</p>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                </Row>
            </Col>
        </Row>
        {/* <Sidebar/> */}
    </Container>
  );
}
