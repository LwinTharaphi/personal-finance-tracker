import dbConnect from '@/lib/mongodb'; // Ensure this path is correct
import Expense from '@/models/Expense'; // Ensure this path is correct

export async function GET() {
  try {
    await dbConnect(); // Connect to MongoDB
    const expenses = await Expense.find({}); // Fetch all expense records
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (error) {
    console.error('Error fetching expense data:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect(); // Connect to MongoDB
    const expenseData = await req.json(); // Parse request body
    const newExpense = await Expense.create(expenseData); // Create new expense record
    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (error) {
    console.error('Error creating expense data:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
