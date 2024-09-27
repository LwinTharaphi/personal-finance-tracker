import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  category: String,
  amount: Number,
  date: Date,
  description: String,
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
