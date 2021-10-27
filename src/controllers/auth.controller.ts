import UserService from '../services/user.service';
import jwt from 'jsonwebtoken';
import crypto from '../helpers/crypto.helper';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import moment from "moment";
import { customAlphabet } from 'nanoid';
import mongoose from "mongoose";
import Mail from '../helpers/ses.helper';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../helpers/interface.helper';
// import Mail from '../helpers/mail.helper';

const saltRounds = 10;
const numbers = '0123456789';
const nanoid = customAlphabet(numbers, 6);

const userController =  {
  
  test: async(req: any, res: Response, next: NextFunction) => {
    try {
      const test = await UserService.test();
      res.send({ status: "success", message: "Test route success", data: test});
    } catch(err) {
      console.log(err);
      err.desc = "Test Route failed";
      next(err);
    }
  },

  verifyToken: async (req: any, res: Response, next: NextFunction) => {
    try {
      var token: string = req.headers['authorization'];

      if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

      if (!token.includes("Bearer "))
        return res.status(403).send({ auth: false, message: 'Invalid token' });

      token = token.replace('Bearer ', '');
      let decoded = await jwt.verify(token, process.env.SECRET);
      if (decoded) {
        decoded = decoded.data;
        let user: IUser = await UserService.userDetails(decoded.id, undefined);
        if (user) {
          req.decoded = decoded;
          next();
        } else {
          return res.status(403).send({ auth: false, message: 'Failed to authenticate token' });
        }
      } else {
        return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
      }
    } catch (err) {
      err.desc = "Invalid Token";
      next(err);
    }
  },

  userSignup: async (req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user: IUser = await UserService.userDetails(undefined, email);
      if (!user) {
        let hash = await bcrypt.hash(req.body.password, saltRounds)
        req.body.password = hash
        req.body.email = email;
        // Store hash in your password DB.
        await UserService.createUser(req.body);
        res.send({ status: "success", message: "User Created Successfully" })
        email = crypto.decrypt(req.body.email);
        await UserService.sendConfirmationMail(email);
      } else if(user && user.is_deleted) {
        let hash = await bcrypt.hash(req.body.password, saltRounds)
        req.body.password = hash;
        req.body.email = email;
        req.body.is_deleted = false;
        // Store hash in your password DB.
        let query = { _id: user._id }
        const user_update = await UserService.updateUser(query, req.body);
        if(user_update) {
          email = crypto.decrypt(req.body.email);
          let confirmation = await UserService.sendConfirmationMail(email);
          if(!confirmation) {
            res.status(422).send({ status: "failed", message: "Failed to send confirmation email" });
          }
          res.send({ status: "success", message: "User Created Successfully" })
        } else {
          res.status(422).send({ status: "failed", message: "Signup failed retry again" });
        }
      } else {
        res.status(422).send({ status: "failed", message: "Email Already Exists" });
      }
    } catch (error) {
      error.desc = "Signup failed";
      next(error)
    }
  },

  userLogin: async (req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user: IUser = await UserService.userDetailsWithPassword(undefined, email);
      if (user) {
        user.email = crypto.decrypt(user.email);
        let isTrue = await bcrypt.compare(req.body.password, user.password);
        if (isTrue) {
          let token = await UserService.generateToken(user._id, user.email, user.user_type)
          delete user.password
          res.send({ status: "success", message: "user exist", token, role: user.user_type, data: user })
          let session_id = new mongoose.Types.ObjectId();
          let session = {
            id: session_id,
            login: new Date()
          }
          await UserService.updateUser({ email: email }, { $push: { session: session }, session_id: session_id })
        } else {
          res.status(422).send({ status: "failed", message: "Incorrect password" })
        }
      } else {
        res.status(422).send({ status: "failed", message: "User doesn't exist" })
      }
    } catch (err) {
      err.desc = "Failed to login"
      next(err);
    }
  },

  //Social Login
  userSocialLogin: async (req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email)
      let user: IUser = await UserService.userDetails(undefined, email);
      if (user && !user.is_deleted) {
        user.email = crypto.decrypt(user.email);
        let token = await UserService.generateToken(user._id, user.email, user.user_type)
        res.send({ status: "success", message: "user exist", token, role: user.user_type, data: user })
        let session_id = new mongoose.Types.ObjectId();
        let session = {
          id: session_id,
          login: new Date()
        }
        await UserService.updateUser({ email: email }, { $push: { session: session }, session_id: session_id })
      } else if(user && user.is_deleted) {
        req.body.user_type = "social";
        req.body.email = email;
        req.body.social_account_type = req.body.social_account_type;
        req.body.confirmed = true;
        req.body.is_deleted = false;
        let user_details: IUser = await UserService.updateUser( { _id: user._id }, req.body);
        user_details.email = crypto.decrypt(user_details.email);
        let token = await UserService.generateToken(user_details._id, user_details.email, user_details.user_type)
        res.send({ status: "success", message: "user created", token, role: user_details.user_type, data: user_details })
        let session_id = new mongoose.Types.ObjectId();
        let session = {
          id: session_id,
          login: new Date()
        }
        await UserService.updateUser({ email: email }, { $push: { session: session }, session_id: session_id })
      } else {
        req.body.user_type = "social";
        req.body.social_account_type = req.body.social_account_type;
        req.body.email = email;
        req.body.confirmed = true;
        let user: IUser = await UserService.createUser(req.body);
        user.email = crypto.decrypt(user.email);
        let token = await UserService.generateToken(user._id, user.email, user.user_type)
        res.send({ status: "success", message: "user created", token, role: user.user_type, data: user })
        let session_id = new mongoose.Types.ObjectId();
        let session = {
          id: session_id,
          login: new Date()
        }
        await UserService.updateUser({ email: email }, { $push: { session: session }, session_id: session_id })
      }
    } catch (err) {
      err.desc = "Failed to Login";
      next(err);
    }
  },

  //Resend Confirm Email
  resendConfirmationMail: async (req: any, res: Response, next: NextFunction) =>{
    try {
      let user: IUser = await UserService.userDetails(req.decoded.id, undefined);
      user.email = crypto.decrypt(user.email);
      let confirmation = await UserService.sendConfirmationMail(user.email);
      if(confirmation) {
        res.send({ status:"success", message:"Resent Confirmation Mail" });
      } else {
        res.status(422).send({ status: "failed", message: "Failed to send confirmation email" });
      }
    } catch(error){
      error.desc = "Failed to resend confirmation email";
      next(error)
    }
  },

  //Get Confirm Email
  confirmEmail: async (req: any, res: Response, next: NextFunction) =>{
    try{
      let data: IUser = await UserService.getSingleUserByQuery({ email_confirmation_id: req.body.email_confirmation_id })
      if(data){
          let query = {
            email_confirmation_id: req.body.email_confirmation_id
          }
          let update = {
            confirmed: true
          }
          let user = await UserService.updateUser(query, update);
          if(user){
            res.send({status:"success",message:"Email confirmed successfully"});
          }else{
            res.status(422).send({status:"failed",message:"Failed to confirm email"});
          }
      } else {
        res.status(422).send({ status: "failed", message: "email doesn't exist" });
      }
    }catch(err){
      err.desc = "Failed to send confirmation email";
      next(err);
    }
  },

  //Forget Password
  forgetPassword: async (req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user: IUser = await UserService.userDetails(undefined, email);
      if (user) {
        //Send mail
        var id = new mongoose.Types.ObjectId();
        let html = "<h4>Please click here to reset your password</h4><a href=" + process.env.DOMAIN + "/reset_password/" + id + ">Reset Password</a>";
        const response = await Mail("p7@tionkar.com", req.body.email, "Reset Your Password", "test", html)
        if (response) {
          let query = {
            email: email
          }
          let update = {
            reset_password_expiry: moment().add(1, "days"),
            reset_password_hash: id
          }
          let user: IUser = await UserService.updateUser(query, update);
          if(user){
            res.send({ status: "success", message: "Reset Password has been Sent to the E-mail" });
          } else{
            res.status(422).send({ status: "failed", message: "Failed to Send Mail" });
          }
        } else {
          res.status(422).send({ status: "failed", message: "Failed to send Mail" });
        }
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't Exist" });
      }
    } catch (err) {
      err.desc = "Failed to Forget Password";
      next(err)
    }
  },

  resetPassword: async (req: any, res: Response, next: NextFunction) => {
    try {
      let user: IUser = await UserService.getSingleUserByQuery({ reset_password_hash: req.body.reset_password_hash });
      if (user) {
        let hash = await bcrypt.hash(req.body.password, saltRounds);
        let reset_password_hash = new mongoose.Types.ObjectId();
        let update = await UserService.updateUser({ _id: user._id }, { password: hash, reset_password_hash });
        if(update) {
          res.send({ status: "success", message: "Password Changed" });
        } else {
          res.status(422).send({ status: "failed", message: "Failed to Reset Password" });
        }
      } else {
        res.status(409).send({ status: "failed", message: "Incorrect Credentials" })
      }
    } catch (err) {
      err.desc = "Failed to Reset Password";
      next(err);
    }
  },

  changePassword: async (req: any, res: Response, next: NextFunction) => {
    try {
      let user: IUser = await UserService.userDetailsWithPassword(req.decoded.id, undefined);
      if (user && user.password) {
        let response = await bcrypt.compare(req.body.old_password, user.password);
        if (response) {
          let hash = await bcrypt.hash(req.body.password, saltRounds);
          await UserService.updateUser({ _id: req.decoded.id }, { password: hash });
          res.send({ status: "success", message: "Password Changed" })
        } else {
          res.status(409).send({ status: "failed", message: "Incorrect Credentials" })
        }
      } else {
        res.status(409).send({ status: "failed", message: "Incorrect Credentials" })
      }
    } catch (err) {
      err.desc = "Failed to Change Password";
      next(err);
    }
  },

  sendOtp: async(req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email);
      let user: IUser = await UserService.userDetails(undefined, email);
      if(user) {
        const otp = await nanoid();
        let html = `<p>Hi ${user.username}</p><p>Your one time password for off leash training.</p></p>OTP: ${otp}</p>`;
        let mail = await Mail("", req.body.email, "Forget Password", "", html);
        if(mail) {
          let update = await UserService.updateUser({ _id: user._id }, { otp: otp });
            if(update){
              res.send({ status: "success", message: "OTP has been Sent to your registered email" });
            }else{
              res.status(422).send({ status: "failed", message: "Failed to Send Mail" });
            }
        } else {
          res.status(422).send({ status: "failed", message: "Failed to send otp" });
        }
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't Exist" });
      }
    } catch(err) {
      err.desc = "Failed to send otp";
      next(err);
    }
  },

  verifyOtp: async(req: any, res: Response, next: NextFunction) => {
    try {
      let email = crypto.encrypt(req.body.email);
      const user: IUser = await UserService.getSingleUserByQuery({ email: email, otp: req.body.otp });
      if(user) {
        let id = new mongoose.Types.ObjectId();
        let password_hash = {
          reset_password_expiry: moment().add(1, "days"),
          reset_password_hash: id,
          otp: null
        }
        let update: IUser = await UserService.updateUser({ _id: user._id }, password_hash);
        if(update) {
          res.send({ status: "success", message: "Otp verified", data: { hash: id } });
        } else {
          res.status(422).send({ status: "failed", message: "Invalid otp", data: false });
        }
      } else {
        res.status(422).send({ status: "failed", message: "Invalid otp", data: false });
      }
    } catch(err) {
      err.desc = "Failed to verify otp";
      next(err);
    }
  },

  editUser: async (req: any, res: Response, next: NextFunction) => {
    try {
      if (req.body.password || req.body.email) {
        req.body.password = undefined;
        req.body.email = undefined;
      }
      let user: IUser = await UserService.userDetails(req.decoded.id);
      if (user) {
        let query = {
          _id: req.decoded.id
        }
        let editedUser: IUser = await UserService.updateUser(query, req.body)
        if(!editedUser){
          throw new Error("Failed to edit user")
        } else {
          res.send({ status: "success", message: "User Modified", data: editedUser });
        }
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't Exist" })
      }
    } catch (err) {
      err.desc = "Failed to Edit User";
      next(err);
    }
  },

  viewUser: async (req: any, res: Response, next: NextFunction) => {
    try {
      let id = req.params.id ? req.params.id : req.decoded.id;
      let user: IUser = await UserService.userDetails(id);
      if (user) {
        user.email = crypto.decrypt(user.email);
        res.send({ status: "success", message: "User Fetched", data: user })
      } else {
        res.status(409).send({ status: "failed", message: "User doesn't Exist" })
      }
    } catch (err) {
      err.desc = "Failed to Get User";
      next(err);
    }
  },

  logout: async (req: any, res: Response, next: NextFunction) => {
    try {
      let user: IUser = await UserService.getUserDetailsWithSession({ _id: req.decoded.id });
      if(user.session) {
        //Find index of specific object using findIndex method.  
        let index = user.session.findIndex((obj => obj.id.toString() == user.session_id.toString()));
        if(user.session[index]){
          user.session[index].logout = new Date()
        }
        await UserService.updateUser({ _id: req.decoded.id }, { session: user.session });
        res.send({ status: "success", message: "User logged out successfully" })
      } else{
        res.send({ status: "success", message: "User logged out successfully" })
      }
    } catch (err) {
      err.desc = "Failed to Logout";
      next(err);
    }
  },

}

export default userController;
