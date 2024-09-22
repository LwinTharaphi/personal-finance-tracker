// pages/api/signup.js

export default function handler(req, res) {
    if (req.method === 'POST') {
      const { email, password, name } = req.body;
  
      // Simulated user signup - replace with actual database logic
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      return res.status(201).json({ message: 'Signup successful' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  