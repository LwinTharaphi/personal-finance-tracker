import connect from '@/lib/mongodb'; // Ensure the path is correct
import Expense from '@/models/Expense'; // Ensure the path is correct

// GET request to fetch all expenses
export async function GET(req) {
  try {
    await connect(); // Connect to MongoDB
    const expenses = await Expense.find({}); // Fetch all expense records
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (error) {
    console.error('Error fetching expense data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST request to create a new expense
export async function POST(req) {
  try {
    await connect(); // Connect to MongoDB
    const expenseData = await req.json(); // Parse request body
    const newExpense = await Expense.create(expenseData); // Create new expense record
    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (error) {
    console.error('Error creating expense data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
