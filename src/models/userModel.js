
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password : {
type : String ,
required : [true , 'Password is required'],
minlength : [6,'Password must be at least 6 characters long']
} ,
  age: {
    type: Number,
    min: [4, 'Minimum age is 4']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
