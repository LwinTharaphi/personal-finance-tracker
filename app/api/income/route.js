import dbConnect from '@/lib/mongodb'; // Ensure this path is correct
import Income from '@/models/Income'; // Ensure this path is correct
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

export async function GET(req,res) {
  try {
    const session = await ensureAuthenticated(req,res);
    const userId = session.user.githubId;
    
    if(!userId){
      return new Response(JSON.stringify({error:"User ID not found"}),{status: 400});
    }
    const incomes = await Income.find({userId}).exec(); // Fetch all income records
    // console.log(incomes)
    return new Response(JSON.stringify(incomes.map((income)=> income.toObject())), { status: 200 });
  } catch (error) {
    console.error('Error fetching income data:', error.message); // Log the error
    return new Response(JSON.stringify({ error: error.message }), { status: error.message === "Unauthorized" ? 401:500 });
  }
}

export async function POST(req,res) {
  try {
    // console.log('res.headers:', res.headers);
    const session = await ensureAuthenticated(req,res);
    
    const incomeData = await req.json(); // Parse request body
    const {amount,type,date,source} = incomeData;
    if (!amount || !type || !date || !source){
      return new Response(JSON.stringify({error: "Invalid input data"}),{status: 400});
    }
    const newIncome = await Income.create({...incomeData,userId:session.user.githubId}); // Create new income record
    // return new Response(JSON.stringify(newIncome), { status: 201 });
    return NextResponse.json(newIncome,{status:201});
  } catch (error) {
    console.error('Error creating income data:', error.message); // Log the error
    return new Response(JSON.stringify({ error:error.message }), { status: error.message === "Unauthroized"? 401: 400 });
  }
}
