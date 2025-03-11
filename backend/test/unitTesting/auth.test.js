const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const authService = require("../../services/auth.service");
const User = require("../../models/user.model");
const sinon = require("sinon");

const mockUser = {
  fullName: "Test User",
  email: "testuser@example.com",
  phone: "1234567890",
  password: "Test@1234",
  role: "User",
  imageurl: "http://profile.com",
};

describe("Auth API Tests", () => {
  let server; // Hold server instance

  beforeAll(() => {
    server = app.listen(5001); // Run server on test port
  });

  afterEach(() => {
    sinon.restore(); // Reset mocks after each test
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Close DB connection
    server.close(); // Stop server after tests
  });

  // ✅ Mock the User model to prevent real database queries
  beforeEach(() => {
    sinon.stub(User, "findOne").resolves(null); // Simulate user not existing
    sinon.stub(User.prototype, "save").resolves(mockUser); // Simulate saving user
  });

  // ✅ TEST: Successful Registration
  test("Should register a new user successfully", async () => {
    sinon.stub(authService, "registerUser").resolves({
      success: true,
      message: "User registered successfully",
    });

    const res = await request(app).post("/api/auth/register").send(mockUser);

    console.log("📌 API Response:", res.body); // Debugging log

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Registered Successfully!");
  });

  // ✅ TEST: Successful Login
  test("Should log in a user successfully", async () => {
    sinon.stub(authService, "loginUser").resolves({
      success: true,
      message: "Login successful",
      user: { id: "12345", email: mockUser.email, role: "User" },
      token: "mocked_token",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User login successful");
    expect(res.body).toHaveProperty("token");
  });

  // ❌ TEST: Login with Wrong Password
  test("Should return error for incorrect password", async () => {
    sinon.stub(authService, "loginUser").resolves({
      success: false,
      message: "Invalid credentials",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: mockUser.email,
      password: "WrongPassword123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
