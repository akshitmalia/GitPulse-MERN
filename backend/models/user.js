import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
  repoId: { type: Number, required: true },
  repoName: { type: String, required: true },
  ownerLogin: { type: String, required: true },
  description: { type: String, default: "" },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  savedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  githubId: { type: String },
  googleId: { type: String },
  username: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  favourites: [favouriteSchema],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;