import Slider from "../models/slider.js";
import { isAdmin } from "./userController.js";

export async function getSliders(req, res) {
  try {
    if (isAdmin(req)) {
      const sliders = await Slider.find().sort({ order: 1 });
      res.json(sliders);
    } else {
      const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
      res.json(sliders);
    }
  } catch (err) {
    console.error("Error retrieving sliders:", err);
    res.status(500).json({
      message: "Error retrieving sliders",
      error: err.message,
    });
  }
}

export async function saveSlider(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to add sliders",
    });
  }

  const slider = new Slider({
    ...req.body,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  });

  try {
    await slider.save();
    res.json({
      message: "Slider added successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        message: "Slider ID already exists",
        error: error.message,
      });
    } else if (error.name === "ValidationError") {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to add slider",
        error: error.message,
      });
    }
  }
}

export async function deleteSlider(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to delete sliders",
    });
  }

  try {
    await Slider.deleteOne({ sliderId: req.params.sliderId });
    res.json({
      message: "Slider deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete slider",
      error: error.message,
    });
  }
}

export async function updateSlider(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update sliders",
    });
  }
  const sliderId = req.params.sliderId;
  const updatedSlider = req.body;

  try {
    await Slider.updateOne(
      { sliderId: sliderId },
      { $set: updatedSlider }
    );
    res.json({
      message: "Slider updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getSliderById(req, res) {
  const sliderId = req.params.sliderId;

  try {
    const slider = await Slider.findOne({ sliderId: sliderId });
    if (!slider) {
      return res.status(404).json({
        message: "Slider not found",
      });
    }
    if (slider.isActive || isAdmin(req)) {
      res.json(slider);
    } else {
      return res.status(403).json({
        message: "Slider not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}