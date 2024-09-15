"use client"; // Add this line to make it a Client Component

import { useState, useEffect } from 'react';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/budget");
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Budget List</h1>
      <ul>
        {budgets.map((budget) => (
          <li key={budget._id}>
            {budget.category}: Target ${budget.targetAmount} - Remaining ${budget.remainingBalance}
          </li>
        ))}
      </ul>
    </div>
  );
}