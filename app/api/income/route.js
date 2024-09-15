import dbConnect from '@/lib/mongodb'; // Ensure this path is correct
import Income from '@/models/Income'; // Ensure this path is correct

export async function GET() {
  try {
    await dbConnect(); // Connect to MongoDB
    const incomes = await Income.find({}); // Fetch all income records
    return new Response(JSON.stringify(incomes), { status: 200 });
  } catch (error) {
    console.error('Error fetching income data:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect(); // Connect to MongoDB
    const incomeData = await req.json(); // Parse request body
    const newIncome = await Income.create(incomeData); // Create new income record
    return new Response(JSON.stringify(newIncome), { status: 201 });
  } catch (error) {
    console.error('Error creating income data:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
