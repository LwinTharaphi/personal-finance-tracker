import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Income from '@/models/Income'; // Ensure the path is correct

// Helper function to connect to MongoDB
async function connectToDatabase() {
  try {
    await dbConnect(); // Connect to MongoDB
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed');
  }
}

// GET request to fetch a single income by ID
export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const income = await Income.findById(id);
    
    if (!income) {
      return new Response(JSON.stringify({ message: 'Income not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(income), { status: 200 });
  } catch (error) {
    console.error('Error fetching income data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT request to update income by ID
export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const updatedData = await req.json();

    // Validate incoming data if needed (optional)
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid data for update' }), { status: 400 });
    }

    const updatedIncome = await Income.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedIncome) {
      return new Response(JSON.stringify({ message: 'Income not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedIncome), { status: 200 });
  } catch (error) {
    console.error('Error updating income data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE request to delete income by ID
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const deletedIncome = await Income.findByIdAndDelete(id);
    
    if (!deletedIncome) {
      return new Response(JSON.stringify({ message: 'Income not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Income deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting income data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
