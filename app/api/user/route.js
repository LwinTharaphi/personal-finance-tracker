import connect from '@/lib/mongodb';
import GitHubUser from '@/models/User';

// GET: Fetch all GitHub users
export async function GET() {
  try {
    await connect(); // Connect to MongoDB
    const users = await GitHubUser.find({}); // Fetch all GitHub user records
     // If no session, return an error
    if (!session) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }
  
      // Extract the GitHub user ID from the session
    const { id: userId } = session.user;
  
    if (!userId) {
        return new Response(JSON.stringify({ error: "GitHub user ID not found" }), { status: 400 });
    }
      // Fetch the user data from MongoDB based on the GitHub user ID
    const user = await GitHubUser.findOne({ githubId: userId });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error('Error fetching GitHub users:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// POST: Create or update a GitHub user
export async function POST(req) {
  try {
    await connect(); // Connect to MongoDB
    const userData = await req.json(); // Parse request body to get user data

    // Basic validation to ensure githubId is present
    if (!userData.githubId) {
      return new Response(JSON.stringify({ error: 'GitHub ID is required' }), { status: 400 });
    }

    // Upsert the GitHub user based on their GitHub ID
    const updatedUser = await GitHubUser.findOneAndUpdate(
      { githubId: userData.githubId },  // Query by GitHub ID
      userData,                         // Update with new data
      { new: true, upsert: true }       // Create if not found, return the new/updated user
    );

    const statusMessage = updatedUser.isNew ? 'User created' : 'User updated';
    return new Response(JSON.stringify({ message: statusMessage, user: updatedUser }), { status: 201 });
  } catch (error) {
    console.error('Error creating or updating GitHub user:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
