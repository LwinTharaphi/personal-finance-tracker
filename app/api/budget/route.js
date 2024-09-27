import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Budget from '@/models/Budget'; // Import the Budget model

// GET request to fetch all budgets
export async function GET(req) {
  try {
    await dbConnect(); // Connect to MongoDB
    const budgets = await Budget.find({}); // Fetch all budget records
    return new Response(JSON.stringify(budgets), { status: 200 });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST request to create a new budget
export async function POST(req) {
  try {
    await dbConnect(); // Connect to MongoDB
    const budgetData = await req.json(); // Parse request body
    const newBudget = await Budget.create(budgetData); // Create new budget record
    return new Response(JSON.stringify(newBudget), { status: 201 });
  } catch (error) {
    console.error('Error creating budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
