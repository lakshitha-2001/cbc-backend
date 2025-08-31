import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
  sliderId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Slider = mongoose.model('Slider', sliderSchema);
export default Slider;