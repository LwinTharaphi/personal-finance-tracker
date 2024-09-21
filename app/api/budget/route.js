import dbConnect from '@/lib/mongodb'; 
import Budget from '@/models/Budget'; 

// GET all budgets
export async function GET(req) {
  try {
    await dbConnect(); 
    const budgets = await Budget.find({}); 
    return new Response(JSON.stringify(budgets), { status: 200 });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST new budget
// POST new budget(s)
export async function POST(req) {
  try {
    await dbConnect();
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
  } catch (error) {
    console.error('Error saving budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}


