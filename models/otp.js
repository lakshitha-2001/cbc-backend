import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 300, // 5 minutes
    },
});
const Otp = mongoose.model("Otp", otpSchema);
export default Otp;