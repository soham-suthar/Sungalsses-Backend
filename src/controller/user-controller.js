import User from "../models/user-model.js";
import bcrypt from "bcrypt";
import asyncMiddleware from "../middleware/asyncMiddleware.js";

const Register = asyncMiddleware(async (req, res) => {
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
});

const Login = asyncMiddleware(async (req, res) => {
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
});

const getProfile = asyncMiddleware(async (req, res) => {
  res.status(200).json(req.user);
});

export { Register, Login, getProfile };
