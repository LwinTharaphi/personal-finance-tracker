import connect from '@/lib/mongodb'; 
import Budget from '@/models/Budget'; 

// GET a single budget by ID
export async function GET(req, { params }) {
  try {
    await connect(); 
    const { id } = params; 
    const budget = await Budget.findById(id); 
    if (!budget) {
      return new Response(JSON.stringify({ message: 'Budget not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(budget), { status: 200 });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT request to update a budget by ID
export async function PUT(req, { params }) {
  try {
    await connect(); 
    const { id } = params; 
    const updatedData = await req.json(); 
    const updatedBudget = await Budget.findByIdAndUpdate(id, updatedData, { new: true }); 
    if (!updatedBudget) {
      return new Response(JSON.stringify({ message: 'Budget not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(updatedBudget), { status: 200 });
  } catch (error) {
    console.error('Error updating budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE a budget by ID
export async function DELETE(req, { params }) {
  try {
    await connect(); 
    const { id } = params; 
    const deletedBudget = await Budget.findByIdAndDelete(id); 
    if (!deletedBudget) {
      return new Response(JSON.stringify({ message: 'Budget not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Budget deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
