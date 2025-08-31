import express from "express";
import { 
  deleteSlider, 
  getSliderById, 
  getSliders, 
  saveSlider, 
  updateSlider 
} from "../controllers/sliderController.js";

const sliderRouter = express.Router();

sliderRouter.get("/", getSliders);
sliderRouter.post("/", saveSlider);
sliderRouter.delete("/:sliderId", deleteSlider);
sliderRouter.put("/:sliderId", updateSlider);
sliderRouter.get("/:sliderId", getSliderById);

export default sliderRouter;