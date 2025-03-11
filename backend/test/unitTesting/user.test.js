const request = require("supertest");
const app = require("../../server");
const sinon = require("sinon");
const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

// Mock user data
const mockUser = {
  _id: "605c72bcf3a0f7a1e0d2b6d7",
  fullName: "John Doe",
  email: "johndoe@example.com",
  phone: "1234567890",
  role: "Admin", // ✅ Ensure this user has "Admin" role to bypass verifyAdmin middleware
  imageurl: "http://profile.com",
  password: "hashedpassword",
};

// Mock JWT Tokens
const mockToken = `Bearer ${jwt.sign(
  { id: mockUser._id, role: "Admin" }, // ✅ Must be "Admin" to pass verifyAdmin
  "testsecret",
  { expiresIn: "1h" }
)}`;

const invalidToken = "Bearer invalidtoken"; // Simulating an invalid token

describe("User API Tests", () => {
  beforeEach(() => {
    // ✅ Mock all database operations
    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(User.prototype, "save").resolves(mockUser);
    sinon.stub(User, "findById").resolves(mockUser);
    sinon.stub(User, "findByIdAndUpdate").resolves({ ...mockUser, fullName: "Updated Name" });
    sinon.stub(User, "findByIdAndDelete").resolves(mockUser);

    // ✅ Mock JWT verification for valid tokens
    sinon.stub(jwt, "verify").callsFake((token, secret, callback) => {
      if (token.includes("invalidtoken")) {
        return callback(new Error("Unauthorized"), null); // Simulating invalid token rejection
      }
      callback(null, { id: mockUser._id, role: "Admin" }); // Return an admin user
    });
  });

  afterEach(() => {
    sinon.restore(); // Restore all mocks after each test
  });

//   // ✅ TEST: Register User
//   test("Should register a new user successfully", async () => {
//     const res = await request(app)
//       .post("/api/users/adduser")
//       .set("Authorization", mockToken)
//       .send(mockUser);

//     expect(res.statusCode).toBe(201);
//     expect(res.body.success).toBe(true);
//     expect(res.body.message).toBe("User Registered Successfully!");
//   });

  // ✅ TEST: Get User by ID
  test("Should get user details successfully", async () => {
    const res = await request(app)
      .get(`/api/users/getuser/${mockUser._id}`)
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User fetched successfully");
    expect(res.body.user.email).toBe(mockUser.email);
  });

  // ✅ TEST: Update User
  test("Should update user successfully", async () => {
    const res = await request(app)
      .put(`/api/users/updateuser/${mockUser._id}`)
      .set("Authorization", mockToken)
      .send({ fullName: "Updated Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User updated successfully");
    expect(res.body.updatedUser.fullName).toBe("Updated Name");
  });

  // ✅ TEST: Delete User
  test("Should delete user successfully", async () => {
    const res = await request(app)
      .delete(`/api/users/delete/${mockUser._id}`)
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  // ✅ TEST: Unauthorized Access (No Token)
  test("Should return 403 when no token is provided", async () => {
    const res = await request(app).get(`/api/users/getuser/${mockUser._id}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("No token provided!");
  });

  // ✅ TEST: Unauthorized Access (Invalid Token)
  test("Should return 401 when token is invalid", async () => {
    const res = await request(app)
      .get(`/api/users/getuser/${mockUser._id}`)
      .set("Authorization", invalidToken);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized!");
  });
});
