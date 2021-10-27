process.env.NODE_ENV = "test";
import User from "../src/models/user.model";
import UserService from "../src/services/user.service";
import mongoose from 'mongoose';
import crypto from '../src/helpers/crypto.helper';
import toBeType from "jest-tobetype";
import request from "supertest";
import app from "../src/app";

expect.extend(toBeType);

let token, id

beforeAll(async () => {
  await User.deleteMany({})
});

afterAll(async () => mongoose.disconnect());

// beforeEach(async () => console.log("Before"))
// afterEach(async () => console.log("After"))

describe("User Auth", () => {
  test("User signup", async () => {
    let body = {
      email: "kishore1@yopmail.com",
      password: "qwertyuiop",
      username: "kishore"
    }
    const response: any = await request(app).post("/api/v1/auth/user_signup").send(body);
    expect(response.statusCode).toBe(200);
  });
  test("User login", async () => {
    let body = {
      email: "kishore1@yopmail.com",
      password: "qwertyuiop"
    }
    const response: any = await request(app).post("/api/v1/auth/user_login").send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    token = response.body.token
  });

  test("Social signup", async () => {
    let body = {
      email: "kishore@yopmail.com",
      social_account_type: "google"
    }
    const response: any = await request(app).post("/api/v1/auth/social_login").send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.message).toBe("user created");
  });

  test("Social login", async () => {
    let body = {
      email: "kishore@yopmail.com",
      social_account_type: "google"
    }
    const response: any = await request(app).post("/api/v1/auth/social_login").send(body);
    expect(response.body).toHaveProperty("token");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("user exist");
  });

  test("Forget password", async () => {
    let body = {
      email: "kishore1@yopmail.com"
    }
    const response: any = await request(app).post("/api/v1/auth/forget_password").send(body);
    expect(response.statusCode).toBe(200);
  });

  test("Reset password", async () => {
    let email = crypto.encrypt("kishore1@yopmail.com");
    let user: any = await User.findOne({ email: email })
    id = user._id
    let body = {
      reset_password_hash: user.reset_password_hash,
      password: "1234567890"
    }
    const response: any = await request(app).post("/api/v1/auth/reset_password").send(body);
    expect(response.statusCode).toBe(200);
  });

  test("Resend Confirmation Mail", async () => {
    const response: any = await request(app).post("/api/v1/auth/resend_confirmation_email").set('authorization', token).send();
    expect(response.statusCode).toBe(200);
  });

  test("Change password", async () => {
    let body = {
      old_password: "1234567890",
      password: "qwertyuiop"
    }
    const response: any = await request(app).post("/api/v1/auth/change_password").set('authorization', token).send(body);
    expect(response.statusCode).toBe(200);
  });

  test("View User", async () => {
    const response: any = await request(app).post("/api/v1/auth/view_user").set('authorization', token).send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(typeof response.body.data).toBe("object");
    expect(response.body.data).toHaveProperty("_id");
  });

  test("Edit User", async () => {
    let body = {
      first_name: "kishore"
    }
    const response: any = await request(app).post("/api/v1/auth/edit_user").set('authorization', token).send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(typeof response.body.data).toBe("object");
    expect(response.body.data.first_name).toBe(body.first_name);
  });

  test("Logout", async () => {
    const response: any = await request(app).post("/api/v1/auth/logout").set('authorization', token).send();
    expect(response.statusCode).toBe(200);
  });
});