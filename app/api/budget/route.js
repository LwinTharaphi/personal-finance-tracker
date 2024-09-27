import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Budget from '@/models/Budget'; // Import the Budget model
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';


async function ensureAuthenticated(req,res){
  const session = await getServerSession(
    req,
    {
      ...res,
      getHeader: (name)=> res.headers ? res.headers.get(name) : null,
      setHeader: (name,value)=> res.headers ? res.headers.set(name,value): null
    },
    authOptions
  )
  console.log(session)
  if (!session){
    throw new Error('Unauthorized');
  }
  await dbConnect();
  return session;
}

// GET request to fetch all budgets
export async function GET(req,res) {
  try {
    const session = await ensureAuthenticated(req,res);
    const userId = session.user.githubId;
    
    if(!userId){
      return new Response(JSON.stringify({error:"User ID not found"}),{status: 400});
    }
    const budgets = await Budget.find({userId}).exec(); // Fetch all budget records
    return new Response(JSON.stringify(budgets.map((budget)=>budget.toObject())), { status: 200 });
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.message === "Unauthorized" ? 401:500 });
  }
}

// POST request to create a new budget
export async function POST(req,res) {
  try {
    const session = await ensureAuthenticated(req,res);
    const budgetData = await req.json(); // Parse request body
    if (!budgetData || Object.keys(budgetData).length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid expense data' }), { status: 400 });
    }
    const newBudget = await Budget.create({...budgetData,userId:session.user.githubId}); // Create new budget record
    return new Response(JSON.stringify(newBudget), { status: 201 });
  } catch (error) {
    console.error('Error creating budget data:', error);
    return new Response(JSON.stringify({ error:error.message }), { status: error.message === "Unauthroized"? 401: 400 });
  }
}
