import connect from '@/lib/mongodb'; // Ensure the path is correct
import Expense from '@/models/Expense'; // Ensure the path is correct

// GET request to fetch a single expense by ID
export async function GET(req, { params }) {
  try {
    await connect(); // Connect to MongoDB
    const { id } = params;
    const expense = await Expense.findById(id);
    if (!expense) {
      return new Response(JSON.stringify({ message: 'Expense not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (error) {
    console.error('Error fetching expense data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT request to update an expense by ID
export async function PUT(req, { params }) {
  try {
    await connect(); // Connect to MongoDB
    const { id } = params;
    const updatedData = await req.json();
    const updatedExpense = await Expense.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedExpense) {
      return new Response(JSON.stringify({ message: 'Expense not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(updatedExpense), { status: 200 });
  } catch (error) {
    console.error('Error updating expense data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE request to delete an expense by ID
export async function DELETE(req, { params }) {
  try {
    await connect(); // Connect to MongoDB
    const { id } = params;
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return new Response(JSON.stringify({ message: 'Expense not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Expense deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting expense data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
