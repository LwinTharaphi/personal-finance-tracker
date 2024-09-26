"use client"; // Client component

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [error, setError] = useState('');
  const [incomeSelectedMonth, setIncomeSelectedMonth] = useState(new Date().getMonth());
  const [expenseSelectedMonth, setExpenseSelectedMonth] = useState(new Date().getMonth());

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
  const totalNetWork = totalIncome - totalExpenses;

  // Function to aggregate monthly data
  const getMonthlyData = (data) => {
    const monthlyTotals = Array(12).fill(0);
    data.forEach(item => {
      const month = new Date(item.date).getMonth();
      monthlyTotals[month] += item.amount;
    });
    return monthlyTotals;
  };

  const incomeByMonth = getMonthlyData(incomeList);
  const expenseByMonth = getMonthlyData(expenseList);

  const chartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Income',
        data: incomeByMonth,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: expenseByMonth,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const filterByMonth = (data,month)=>{
    return data.filter(item=> new Date(item.date).getMonth() === month);
  };

  const getCategoryData = (data,key) => {
    return data.reduce((acc,item)=>{
      const category = item[key];
      acc[category] = (acc[category] || 0) + item.amount;
      return acc;
    },{});
  };

  const renderPieChart = (data,title,selectedMonth,handleMonthChange)=>{
    const filteredData = filterByMonth(data.list,selectedMonth);
    const categoryData = getCategoryData(filteredData,data.key);

    const pieChartData = {
      labels: Object.keys(categoryData).length > 0 ? Object.keys(categoryData) : ['No Data'],
      datasets: [
        {
          data: Object.values(categoryData).length > 0 ? Object.values(categoryData) : [0],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        },
      ],
    };

    return (
      <Card className='mb-4 shadow-sm'>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Form.Group controlId={`${title.toLowerCase()}MonthSelect`} className="mb-3">
            <Form.Label>Select Month</Form.Label>
            <Form.Control as="select" value={selectedMonth} onChange={handleMonthChange}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Pie data={pieChartData} />
        </Card.Body>
      </Card>
    );
  };

  const handleIncomeMonthChange = (event) =>{
    setIncomeSelectedMonth(parseInt(event.target.value))
  }

  const handleExpenseMonthChange = (event) => {
    setExpenseSelectedMonth(parseInt(event.target.value));
  }




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
                        <Col md={6}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                            <Card.Title>Income vs Expenses</Card.Title>
                            <Bar data={chartData} />
                            </Card.Body>
                        </Card>
                        </Col>
                        <Col md={4}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                            <Card.Title>Total Net Worth</Card.Title>
                            <h3>${totalNetWork.toFixed(2)}</h3>
                            <p>{totalNetWork >= 0 ? "You're within budget!" : "You're over budget!"}</p>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col md={4}>
                          {renderPieChart(
                            {list: incomeList, key: 'type'},
                            "Income by Category",
                            incomeSelectedMonth,
                            handleIncomeMonthChange
                          )}
              
                        </Col>
                        <Col md={4}>
                          {renderPieChart(
                            {list: expenseList, key: 'category'},
                            "Expense by Category",
                            expenseSelectedMonth,
                            handleExpenseMonthChange

                          )}
                        </Col>
                    </Row>
                </Row>
            </Col>
        </Row>
    </Container>
  );
}
