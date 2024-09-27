import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  category: String,
  amount: Number,
  date: Date,
  description: String,
}, { timestamps: true });


export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
