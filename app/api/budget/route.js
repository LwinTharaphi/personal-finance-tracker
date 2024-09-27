<<<<<<< HEAD
import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Budget from '@/models/Budget'; // Import the Budget model
=======
import connect from '@/lib/mongodb'; 
import Budget from '@/models/Budget'; 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670

// GET request to fetch all budgets
export async function GET(req) {
  try {
<<<<<<< HEAD
    await dbConnect(); // Connect to MongoDB
    const budgets = await Budget.find({}); // Fetch all budget records
=======
    await connect(); 
    const budgets = await Budget.find({}); 
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670
    return new Response(JSON.stringify(budgets), { status: 200 });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST request to create a new budget
export async function POST(req) {
  try {
<<<<<<< HEAD
    await dbConnect(); // Connect to MongoDB
    const budgetData = await req.json(); // Parse request body
    const newBudget = await Budget.create(budgetData); // Create new budget record
    return new Response(JSON.stringify(newBudget), { status: 201 });
=======
    await connect();
    const budgetsData = await req.json();

    const budgetArray = Array.isArray(budgetsData) ? budgetsData : [budgetsData];

    const promises = budgetArray.map(async (budgetData) => {
      const existingBudget = await Budget.findOneAndUpdate(
        { month: budgetData.month },
        { amount: budgetData.amount },
        { new: true, upsert: true }
      );
      return existingBudget;
    });

    const updatedBudgets = await Promise.all(promises);
    return new Response(JSON.stringify(updatedBudgets), { status: 200 });
>>>>>>> 68a1fcd578d763f771f4808dfed610f4f9166670
  } catch (error) {
    console.error('Error creating budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
