import dbConnect from '@/lib/mongodb'; 
import Budget from '@/models/Budget'; 

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

export async function POST(req) {
  try {
    await dbConnect(); 
    const budgetData = await req.json(); 
    const newBudget = await Budget.create(budgetData); 
    return new Response(JSON.stringify(newBudget), { status: 201 });
  } catch (error) {
    console.error('Error creating budget data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

