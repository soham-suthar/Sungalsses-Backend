import mongoose from "mongoose";

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return resizeBy.status(400).json({ message: "Invalid Id" });
  }

  next();
};

export default validateObjectId;
