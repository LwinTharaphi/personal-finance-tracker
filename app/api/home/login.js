// pages/api/login.js

export default function handler(req, res) {
    if (req.method === 'POST') {
      const { email, password } = req.body;
  
      // Simulated user login - replace with actual authentication logic
      if (email === 'user@example.com' && password === 'password123') {
        return res.status(200).json({ message: 'Login successful' });
      }
  
      return res.status(401).json({ message: 'Invalid credentials' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  