import dbConnect from '@/lib/mongodb'; // Ensure this path is correct
import Income from '@/models/Income'; // Ensure this path is correct
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

async function ensureAuthenticated(req){
  const session = await getServerSession(req,authOptions);
  if (!session){
    throw new Error('Unauthorized');
  }
  await dbConnect();
  return session;
}

export async function GET(req) {
  try {
    const session = await ensureAuthenticated(req);
    const userId = session.user.id;
    
    if(!userId){
      return new Response(JSON.stringify({error:"User ID not found"}),{status: 400});
    }
    const incomes = await Income.find({userId}); // Fetch all income records
    return new Response(JSON.stringify(incomes), { status: 200 });
  } catch (error) {
    console.error('Error fetching income data:', error.message); // Log the error
    return new Response(JSON.stringify({ error: error.message }), { status: error.message === "Unauthorized" ? 401:500 });
  }
}

export async function POST(req) {
  try {
    const session = await ensureAuthenticated(req);
    
    const incomeData = await req.json(); // Parse request body
    const {amount,type,date,source} = incomeData;
    if (!amount || !type || !date || !source){
      return new Response(JSON.stringify({error: "Invalid input data"}),{status: 400});
    }
    const newIncome = await Income.create({...incomeData,userId:session.user.id}); // Create new income record
    // return new Response(JSON.stringify(newIncome), { status: 201 });
    return NextResponse.json(newIncome,{status:201});
  } catch (error) {
    console.error('Error creating income data:', error.message); // Log the error
    return new Response(JSON.stringify({ error:error.message }), { status: error.message === "Unauthroized"? 401: 400 });
  }
}
