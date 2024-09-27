// pages/api/user.js

import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/db'; // Adjust the path as necessary
import User from '../../../models/User'; // Adjust the path as necessary

export default async function handler(req, res) {
  await dbConnect(); // Connect to the database
  const session = await getSession({ req }); // Get the session

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Fetch user data using lean to get a plain object
    const user = await User.findOne({ githubId: session.user.id }).lean().exec();
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user); // Send plain object as response
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Error fetching user data' });
  }
}
