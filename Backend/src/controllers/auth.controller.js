const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const { name, userName, email, password } = req.body;

  const isUserAlreadyExist = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExist) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  const isUserNameExist = await userModel.findOne({ userName });
  if (isUserNameExist) {
    return res.status(409).json({
      message: "username already exist",
    });
  }
  // hashing to protect data
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    name,
    userName,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.secret_key
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      userName: user.userName,
    },
  });
}
async function loginUser(req, res) {
  const { userName, email, password } = req.body;

  // Find user by either userName or email
  const user = await userModel.findOne({
    $or: [{ userName }, { email }]
  });
  
  if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  // Compare password
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: "user" },
    process.env.secret_key
  );
  res.cookie("token", token);

  return res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      userName: user.userName,
    },
  });
}
async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  res.send(200).json({
    message: "Log out Successfull",
  });
}

async function registerFoodPartner(req, res) {
  const { name, userName, email, password } = req.body;

  const isFoodPartnerAlreadyExist = await foodPartnerModel.findOne({
    email,
  });

  if (isFoodPartnerAlreadyExist) {
    return res.status(400).json({
      message: "already registered!",
    });
  }
  const isUserNameExist = await foodPartnerModel.findOne({ userName });
  if (isUserNameExist) {
    return res.status(409).json({
      message: "username already exist",
    });
  }
  // hashing to protect data
  const hashedPassword = await bcrypt.hash(password, 10);

  const foodPartner = await foodPartnerModel.create({
    name,
    userName,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.secret_key
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "registered successfully",
    user: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
      userName: foodPartner.userName,
    },
  });
}

async function loginFoodPartner(req, res) {
  const { userName, email, password } = req.body;

  // Find food partner by either userName or email
  const foodPartner = await foodPartnerModel.findOne({
    $or: [{ userName }, { email }]
  });
  if (!foodPartner) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  // Compare password (await bcrypt.compare)
  const isCorrectPassword = await bcrypt.compare(
    password,
    foodPartner.password
  );
  if (!isCorrectPassword) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  // Generate JWT token for the food partner
  const token = jwt.sign(
    { id: foodPartner._id, role: "foodpartner" },
    process.env.secret_key
  );
  res.cookie("token", token);

  return res.status(200).json({
    message: "Partner logged in successfully",
    partner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
      userName: foodPartner.userName,
    },
  });
}

async function logoutFoodPartner(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  res.status(200).json({
    message: "Partner LoggedOut Successfully",
  });
}
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
};
