// app/home/page.tsx

"use client"; // Client component

import { useReducer, useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useSession,signIn } from "next-auth/react"; // Import signIn from NextAuth
import 'bootstrap/dist/css/bootstrap.min.css';
import Router from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession()
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // Only needed for signup
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleButton = () => {
    router.push('/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/home/login' : '/api/home/signup';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error occurred');

      // Handle successful login or signup
      console.log(result);
      alert(`${isLogin ? 'Login' : 'Signup'} successful!`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col xs={12} md={8} lg={5} className="mx-auto">
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                {!isLogin && (
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                  </Form.Group>
                )}
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  {isLogin ? 'Login' : 'Sign Up'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  {isLogin
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="p-0"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </Button>
                </p>
                
                {/* <Button variant="secondary" onClick={handleGitHubSignIn} className="w-100">
                  Sign in with GitHub
                </Button> */}
                {session ? (
                  // <h2>Welcome, {session.user.name}</h2>
                  <Button variant='secondary' onClick={handleButton}>Welcome,{session.user.name}</Button>
                  ) : (
                  <button onClick={() => signIn('github')}>Sign in with GitHub</button>
                  )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};