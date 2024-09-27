// models/githubUser.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '', // URL to the user's GitHub profile picture
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields as necessary, such as:
  // bio, location, publicReposCount, etc.
});

// Create a GitHubUser model from the schema
// If the model already exists, use it, otherwise create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
