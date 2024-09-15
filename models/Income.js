import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  source: { type: String, required: true },
});

const Income = mongoose.models.Income || mongoose.model('Income', incomeSchema);

export default Income;
