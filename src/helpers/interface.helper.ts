import { Types } from 'mongoose';

export interface IUser {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  user_type?: string;
  confirmed?: boolean;
  social_account_type?: string;
  email_confirmation_id?: string;
  first_name?: string;
  last_name?: string;
  reset_password_hash?: any;
  reset_password_expiry?: any;
  session?: any[];
  session_id?: Types.ObjectId;
  otp?: string;
  created_by?: Types.ObjectId;
  phone?: string;
  profile?: string;
  health?: any[];
  is_deleted?: boolean;
  created_at?: Date;
  modified_at?: Date;
}