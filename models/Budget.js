import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  month: { type: String, unique: true, required: true }, // Ensure each month is unique
  amount: Number,
}, { timestamps: true });


export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
