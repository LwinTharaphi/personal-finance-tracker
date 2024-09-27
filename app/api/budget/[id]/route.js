<<<<<<< HEAD
import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Budget from '@/models/Budget'; // Import the Budget model
=======
import connect from '@/lib/mongodb'; 
import Budget from '@/models/Budget'; 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670

// GET request to fetch a single budget by ID
export async function GET(req, { params }) {
  try {
<<<<<<< HEAD
    await dbConnect(); // Connect to MongoDB
    const { id } = params;
    const budget = await Budget.findById(id); // Fetch budget by ID
=======
    await connect(); 
    const { id } = params; 
    const budget = await Budget.findById(id); 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670
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
<<<<<<< HEAD
    await dbConnect(); // Connect to MongoDB
    const { id } = params;
    const updatedData = await req.json(); // Get updated data from the request
    const updatedBudget = await Budget.findByIdAndUpdate(id, updatedData, { new: true }); // Update budget
=======
    await connect(); 
    const { id } = params; 
    const updatedData = await req.json(); 
    const updatedBudget = await Budget.findByIdAndUpdate(id, updatedData, { new: true }); 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670
    if (!updatedBudget) {
      return new Response(JSON.stringify({ message: 'Budget not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(updatedBudget), { status: 200 });
  } catch (error) {
    console.error('Error updating budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE request to delete a budget by ID
export async function DELETE(req, { params }) {
  try {
<<<<<<< HEAD
    await dbConnect(); // Connect to MongoDB
    const { id } = params;
    const deletedBudget = await Budget.findByIdAndDelete(id); // Delete budget by ID
=======
    await connect(); 
    const { id } = params; 
    const deletedBudget = await Budget.findByIdAndDelete(id); 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670
    if (!deletedBudget) {
      return new Response(JSON.stringify({ message: 'Budget not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Budget deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
