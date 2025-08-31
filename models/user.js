import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // Ensure that email is unique
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'customer' // Default role is 'user'
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false // Default value is false
  },
  img: {
    type: String,
    required: true,
    default: 'https://www.freepik.com/free-vector/user-circles-set_145856997.htm#fromView=keyword&page=1&position=2&uuid=36d691cd-2815-4f14-bbe3-e161009deedd&query=Default+User' // Default image URL
  },

});

const User = mongoose.model('User', userSchema);

export default User;