"use client"; // Client component

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccessDenied from '../components/accessDenied';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [budgetList, setBudgetList] = useState([]); // State for storing budget data
  const [error, setError] = useState('');
  const [incomeSelectedMonth, setIncomeSelectedMonth] = useState(new Date().getMonth());
  const [expenseSelectedMonth, setExpenseSelectedMonth] = useState(new Date().getMonth());
  // const [budgetSelectedMonth, setBudgetSelectedMonth] = useState(new Date().getMonth());
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  // Redirect to home if no session
  useEffect(() => {
    if (!loading && !session) {
      router.push('/');
    }
  }, [loading, session, router]);

  // Render loading or access denied state
  if (loading) return <p>Loading ...</p>;
  if (!session) return <AccessDenied />;

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

        const budgetResponse = await fetch('/api/budget'); // Fetching budget data
        if (!budgetResponse.ok) throw new Error('Error fetching budget data');
        const budgetData = await budgetResponse.json();
        setBudgetList(budgetData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  // Function to calculate total income, expenses, and net worth
  // const totalIncome = incomeList.reduce((total, income) => total + income.amount, 0);
  // const totalExpenses = expenseList.reduce((total, expense) => total + expense.amount, 0);
  // const totalBudget = expenseList.reduce((total, budget) => total + budget.amount, 0);
  // const totalNetWork = totalIncome - totalExpenses;

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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
  
  const totalBudgetForCurrentMonth = (budgetList) => {
    const currentMonth = new Date().getMonth(); // Get current month (0-11)
    const currentYear = new Date().getFullYear(); // Get current year

    // Filter budgets for the current month and year
    const budgetsForCurrentMonth = budgetList.filter(budget => {
      const budgetDate = new Date(budget.date);
      return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear;
    });

    // Sum the amounts of the filtered budgets
    const total = budgetsForCurrentMonth.reduce((total, budget) => total + budget.amount, 0);

    return total;
  };
  const totalBudget = totalBudgetForCurrentMonth(budgetList);

  const currentMonth = new Date().getMonth();
  const totalIncomeForCurrentMonth = incomeByMonth[currentMonth] || 0;
  const totalExpensesForCurrentMonth = expenseByMonth[currentMonth] || 0;
  const budgetLeft = totalBudget - totalExpensesForCurrentMonth;

  const withinBudget = budgetLeft >= 0;

  const filterByMonth = (data, month) => {
    return data.filter(item => new Date(item.date).getMonth() === month);
  };

  const getCategoryData = (data, key) => {
    return data.reduce((acc, item) => {
      const category = item[key];
      acc[category] = (acc[category] || 0) + item.amount;
      return acc;
    }, {});
  };

  const renderPieChart = (data, title, selectedMonth, handleMonthChange) => {
    const filteredData = filterByMonth(data.list, selectedMonth);
    const categoryData = getCategoryData(filteredData, data.key);

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

  const handleIncomeMonthChange = (event) => {
    setIncomeSelectedMonth(parseInt(event.target.value));
  };

  const handleExpenseMonthChange = (event) => {
    setExpenseSelectedMonth(parseInt(event.target.value));
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

 const currentMonthIndex = new Date().getMonth(); // Get current month (0-11)
 const currentMonthName = monthNames[currentMonthIndex]; // Get current month name

  return (
    <Container fluid style={{ backgroundColor: '#E5EEF8' }}>
      <Row>
        <Col md={3} className='p-0'>
          <Sidebar />
        </Col>
        <Col>
          <h3 className="text-center mb-8 mt-6"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2.5rem', fontWeight: '500' }}>Welcome {session.user.username}!</h3>
          <h4 className='mb-8'
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.5rem', fontWeight: '500' }}>Manage your money! Master your life!</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Row className="justify-content-center">
              <Col md={4}>
                <Card className="mb-4 shadow-sm border-primary">
                  <Card.Body>
                    <Card.Title>Budget Status</Card.Title>
                    <h3>{budgetLeft.toFixed(2)}B</h3>
                    <p>{withinBudget ? `You're within budget for ${currentMonthName}!` : `You're over budget for ${currentMonthName}!`}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-4 shadow-sm border-primary">
                  <Card.Body>
                    <Card.Title>Total Income</Card.Title>
                    <h3>{totalIncomeForCurrentMonth.toFixed(2)}B</h3>
                    <p>{totalIncomeForCurrentMonth >= 0 ? `This is your total income for ${currentMonthName}!` : "No income recorded!"}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-4 shadow-sm border-primary">
                  <Card.Body>
                    <Card.Title>Total Expense</Card.Title>
                    <h3>{totalExpensesForCurrentMonth.toFixed(2)}B</h3>
                    <p>{totalExpensesForCurrentMonth >= 0 ? `This is your total expense for ${currentMonthName}!` : "No expenses recorded!"}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-center">
            <Col md={8}>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title>Income vs Expenses</Card.Title>
                  <Bar data={chartData} />
                </Card.Body>
              </Card>
            </Col>
            </Row>
            
            <Row className="justify-content-center">
            <Col md={4}>
                {renderPieChart(
                  { list: incomeList, key: 'type' },
                  "Income by Category",
                  incomeSelectedMonth,
                  handleIncomeMonthChange
                )}
              </Col>

              <Col md={4}>
                {renderPieChart(
                  { list: expenseList, key: 'category' },
                  "Expenses by Category",
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
