import Product from "../models/product-model.js";
import User from "../models/user-model.js";
import bcrypt from "bcrypt";

const getProducts = async (req, res) => {
  try {
    const { color } = req.query;

    // if (color) {
    //   const products = await Product.find({
    //     color: {
    //       $regex: new RegExp(`^${color}$`, "i"),
    //     },
    //   });
    //   return res.status(200).json(products);
    //}

    const filter = {};

    if (color) {
      filter.color = new RegExp(`^${color}$`, "i");
    }

    const products = await Product.find(filter).lean();

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};

const Register = async (req, res) => {
  try {
    const { name, password, email } = req.body;

    const UserExist = await User.findOne({ email: email.toLowerCase() });

    if (UserExist) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, saltRound);

    const userCreated = await User.create({
      name,
      password: hash_password,
      email: email.toLowerCase(),
    });

    return res.status(201).json({
      message: "Registration Successful",
      token: await userCreated.generateToken(),
      userId: userCreated._id,
      name: userCreated.name,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server Error" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const UserExist = await User.findOne({ email: email.toLowerCase() });
    if (!UserExist) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = await bcrypt.compare(password, UserExist.password);

    if (user) {
      return res.status(200).json({
        message: "Login Successful",
        token: await UserExist.generateToken(),
        userId: UserExist._id,
        name: UserExist.name,
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getColors = async (req, res) => {
  try {
    const colors = await Product.distinct("color");

    const filteredColors = colors.filter(Boolean);
    return res.status(200).json(filteredColors);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Data not Found" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { getProducts, Register, Login, getColors, getProfile };
