import express from 'express';
import AuthController from '../../controllers/auth.controller';
import Validation from '../../helpers/validation.helper';
import expressValidator from 'express-joi-validation';
const validator = expressValidator.createValidator({});
const router = express.Router();

router.get("/test", AuthController.test);

router.post('/user_signup', validator.body(Validation.createUser), AuthController.userSignup);

router.post('/user_login', validator.body(Validation.userLogin), AuthController.userLogin);

router.post('/social_login', validator.body(Validation.socialLogin), AuthController.userSocialLogin);

router.post('/confirm_email', AuthController.confirmEmail);

router.post('/forget_password', AuthController.forgetPassword);

router.post('/send_otp', AuthController.sendOtp);

router.post('/verify_otp', AuthController.verifyOtp);

router.post('/reset_password', validator.body(Validation.resetPassword), AuthController.resetPassword);

router.post('/resend_confirmation_email',AuthController.verifyToken, AuthController.resendConfirmationMail);

router.post('/change_password', AuthController.verifyToken, AuthController.changePassword);

router.post('/edit_user', AuthController.verifyToken, AuthController.editUser);

router.post('/view_user', AuthController.verifyToken, AuthController.viewUser);

router.post('/logout', AuthController.verifyToken, AuthController.logout);

export default router;
