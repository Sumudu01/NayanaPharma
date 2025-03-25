import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  nic: {
    type: String,
    required: [true, "NIC is required"],
    unique: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: ["male", "female"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  contactNumber: {
    type: String,
    required: [true, "Contact number is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate age from DOB before saving
userSchema.pre("save", function (next) {
  if (this.dob) {
    const birthDate = new Date(this.dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
