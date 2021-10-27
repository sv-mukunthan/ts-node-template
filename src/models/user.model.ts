import mongoose, { Model } from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  email:{
    type:Object,
    required:true
  },
  password: String,
  user_type: String,
  confirmed: Boolean,
  social_account_type: String,
  email_confirmation_id: String,
  first_name: String,
  last_name: String,
  username: String,
  reset_password_hash: String,
  reset_password_expiry: Date,
  session: Array,
  session_id: Schema.Types.ObjectId,
  otp: String,
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  phone: String,
  profile: String,
  health: Array,
  is_deleted: { type: Boolean, default: false }
},{ timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

//Model
const model = mongoose.model('user',schema);

export default model;
