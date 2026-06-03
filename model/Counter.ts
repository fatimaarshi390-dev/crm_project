import mongoose, { Schema } from 'mongoose';

const CounterSchema = new Schema({
  _id:     { type: String, required: true },
  seq:     { type: Number, default: 0 },
});

export default mongoose.models.Counter ||
  mongoose.model('Counter', CounterSchema);