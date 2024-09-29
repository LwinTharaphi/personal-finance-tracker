import dbConnect from '@/lib/mongodb'; // Ensure the path is correct
import Expense from '@/models/Expense'; // Ensure the path is correct
import { getServerSession } from 'next-auth';
import {authOptions} from "@/lib/auth"



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

// GET request to fetch all expenses
export async function GET(req,res) {
  try {
    const session = await ensureAuthenticated(req,res);
    const userId = session.user.githubId;
    
    if(!userId){
      return new Response(JSON.stringify({error:"User ID not found"}),{status: 400});
    }
    const expenses = await Expense.find({userId}).exec(); // Fetch all expense records
    return new Response(JSON.stringify(expenses.map((expense)=> expense.toObject())), { status: 200 });
  } catch (error) {
    console.error('Error fetching expense data:', error.message); // Log the error
    return new Response(JSON.stringify({ error: error.message }), { status: error.message === "Unauthorized" ? 401:500 });
  }
}

// POST request to create a new expense
export async function POST(req,res) {
  try {
    const session = await ensureAuthenticated(req,res);
    const expenseData = await req.json(); // Parse request body
    
    // Validate expense data
    if (!expenseData || Object.keys(expenseData).length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid expense data' }), { status: 400 });
    }

    const { amount, description, category, date } = expenseData;
    if (!amount || !description || !category || !date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    const newExpense = await Expense.create({...expenseData,userId: session.user.githubId}); // Create new expense record
    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (error) {
    console.error('Error creating expense data:', error.message); // Log the error
    return new Response(JSON.stringify({ error:error.message }), { status: error.message === "Unauthroized"? 401: 400 });
  }
}
