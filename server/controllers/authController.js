import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //Sending welcome email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to the portal",
      text: `Welcome to the portal website. Your account has been created with the email id: ${email}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Email or password doesn't match",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Email or password doesn't match",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOTP = otp;
    user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP is: ${otp}. Verify your account with the otp`,
    };
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification otp is sent to the registered email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "user id or otp is not available",
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User is not found" });
    }

    if (user.verifyOTP === "" || user.verifyOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOTPExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP is expired" });
    }
    user.isVerified = true;
    user.verifyOTP = "";
    user.verifyOTPExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//check if user is authenticated or not
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send password reset otp

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required!" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 5 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      text: `Your OTP is: ${otp}. Reset Your Password with the OTP`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP is sent to the registered email.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Reset user password

export const resetPassword = async (req, res) => {
  const { email, otp,newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "All the fields are required!",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    if(user.resetOTP===''|| user.resetOTP!==otp)
    {
      return res.json({success:false,message:"Invalid OTP"})
    }
    if(user.resetOTPExpireAt<Date.now())
    {
      return res.json({success:false,message:"OTP is expired!"})
    }

    const hashedPassword=await bcrypt.hash(newPassword,10);
    user.password=hashedPassword;
    user.resetOTP='';
    user.resetOTPExpireAt=0;

    await user.save();

    return res.json({success:true,message:"Password has been reset successfully!"})
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
