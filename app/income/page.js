"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/income");
      const data = await response.json();
      setIncomes(data);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Income List</h1>
      <ul>
        {incomes.map((income) => (
          <li key={income._id}>
            {income.source}: ${income.amount} (Type: {income.type}, Date: {new Date(income.date).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
