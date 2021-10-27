import Joi from 'joi';

const createUser = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().regex(/[0-9]{10}/).optional(),
  password: Joi.string().required(),
  user_type: Joi.string().optional(),
  username: Joi.string().required()
})

const editUser = Joi.object({
  phone: Joi.string().regex(/[0-9]{10}/).optional(),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  username: Joi.string().optional(),
  id: Joi.string().required()
})

const userLogin = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
})

const socialLogin = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  username: Joi.string().optional(),
  email: Joi.string().email().required(),
  social_account_type: Joi.string().required(),
})

const login = Joi.object({ 
  username: Joi.string().required(),
  password: Joi.string().required()
})

const resetPassword = Joi.object({
  reset_password_hash: Joi.string().required(),
  password: Joi.string().required()
});

export default {
  createUser, 
  userLogin, 
  socialLogin, 
  login, 
  resetPassword, 
  editUser
};

