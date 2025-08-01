import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { senVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          sucess: false,
          message: "Username is alredy taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({
      email,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 90000).toString();

    if (existingUserByEmail) {
    if(existingUserByEmail.isVerified){
       return Response.json(
      {
        sucess:false,
        message:"User already exist with this email"
      },{status:400}
    )
    }else{
      const hashedPassword = await bcrypt.hash(password,10)
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.verifyCode = verifyCode;
      existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
      await existingUserByEmail.save()
    }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry: expiryDate,
      isVerified: false,
      isAcceptingMessage: true,
      messages: [],
    });

    await newUser.save();
    }

   //send verification email
   const emailResponse = await senVerificationEmail(
    email,
    username,
    verifyCode
   )

   if(emailResponse.success){
    return Response.json(
      {
        sucess:false,
        message:emailResponse.message
      },{status:500}
    )
   }

   return Response.json(
      {
        sucess:true,
        message:"User registered successfully. Please verify your email"
      },{status:201}
    )
  } catch (error) {
    console.error("Error Resgering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
