import User from '../models/user.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from '../helpers/crypto.helper';
import { confirmEmail } from '../helpers/common.helper';
import Mail from '../helpers/ses.helper';
import { IUser } from '../helpers/interface.helper';

const UserService = {

  test: async() => {
    return {
      foo: "bar"
    }
  },

  userDetails: async (id?: string, email?: string) => {
    let query: any = {};
    if(id) {
      query._id = id;
    }
    if(email){
      query.email = email;
    }
    let user = await User.findOne(query, { password: 0, session: 0 , session_id: 0 }, null).lean()
    return user
  },

  userDetailsWithPassword: async (id?: string, email?: string) => {
    let query: any = {};
    if(id) {
      query._id = id;
    }
    if(email){
      query.email = email;
    }
    let user = await User.findOne(query, { session: 0 ,session_id: 0 }, null).lean();
    return user;
  },

  updateUser: async (query: IUser, update: any) => {
    let updatedUser: any = await User.updateOne(query, update).lean();
    if(updatedUser.n === 0){
      return false
    }
    const user = await UserService.getSingleUserByQuery(query);
    return user;
  },

  getMultipleUsers: async (query: IUser) => {
    let users = await User.find(query, { password: 0, session: 0 , session_id: 0 }, null).lean();
    return users;
  },

  generateToken: async (id: string, email: string, role: string) => {
    let expiry = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365)
    let token = jwt.sign({ exp: expiry, data: { id: id, email: email, role: role } }, process.env.SECRET);
    token = "Bearer " + token;
    return token;
  },

  sendConfirmationMail: async (email: string) =>{
      email = crypto.encrypt(email);
      let user: any = await UserService.userDetails(undefined, email);
  
      //Send mail
      var id = new mongoose.Types.ObjectId();
      let html = await confirmEmail(user.username, id)
      let decrypted_email = crypto.decrypt(email);
      const response = await Mail("p7@tionkar.com", decrypted_email, "Livyana | Confirm Your Account", "test", html);
      if (response) {
        let body = {
          email_confirmation_id: id
        }
        let update: any = await User.updateOne({ email: email }, body);
        if(update.n === 0) {
          return false;
        }
        return true;
      } else {
        return false;
      }
  },

  createUser: async(data: IUser) => {
    const user = await User.create(data);
    return user;
  },

  userList: async(query: any) => {
    let page = query?.page || 1;
    let limit = query?.limit || 20;
    let users: any = await User.find(query, { password: 0, session: 0 , session_id: 0 }).skip(page).limit(limit).lean();
    if(query.user_id) {
      let index = await users.findIndex(user => user._id.toString() === query.user_id.toString());
      if(index === -1) {
        let req: any = {
          _id: query.user_id
        }
        if(query.search && query.search.length > 0) {
          req.username = { $regex: query.search, $options: 'i' };
        }
        const user = await User.find(req).lean();
        users = [...users, ...user];
      }
    }
    return users;
  },

  getSingleUserByQuery: async(query: IUser) => {
    const user = await User.findOne(query, { password: 0, session: 0 , session_id: 0 }, null).lean();
    return user;
  },
  
  getUserCount: async(query: IUser) => {
    const count = await User.countDocuments(query).lean();
    return count;
  },

  getUserDetailsWithSession: async(query: IUser) => {
    const user = await User.findOne(query, null, null).lean();
    return user;
  }

};

export default UserService;