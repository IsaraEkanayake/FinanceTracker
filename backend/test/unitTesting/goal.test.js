const request = require("supertest");
const app = require("../../server");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const Goal = require("../../models/goal.model");
const User = require("../../models/user.model");

// ✅ Mock user data
const mockUser = {
  _id: "605c72bcf3a0f7a1e0d2b6d7",
  fullName: "John Doe",
  email: "johndoe@example.com",
  phone: "1234567890",
  role: "Admin", // ✅ Admin role for testing verifyAdmin middleware
  imageurl: "http://profile.com",
};

// ✅ Mock JWT Tokens
const mockToken = `Bearer ${jwt.sign(
  { id: mockUser._id, role: "Admin" }, // ✅ Must be "Admin" to pass verifyAdmin
  "testsecret",
  { expiresIn: "1h" }
)}`;

const invalidToken = "Bearer invalidtoken"; // Simulating an invalid token

describe("API Routes Unit Testing", () => {
  beforeEach(() => {
    // ✅ Mock database calls
    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(User.prototype, "save").resolves(mockUser);
    sinon.stub(User, "findById").resolves(mockUser);
    sinon.stub(User, "findByIdAndUpdate").resolves({ ...mockUser, fullName: "Updated Name" });
    sinon.stub(User, "findByIdAndDelete").resolves(mockUser);

    sinon.stub(Goal.prototype, "save").resolves({ title: "New Goal", targetAmount: 1000 });
    sinon.stub(Goal, "findByIdAndUpdate").resolves({ title: "Updated Goal", targetAmount: 2000 });
    sinon.stub(Goal, "find").resolves([{ title: "Goal 1" }, { title: "Goal 2" }]);

    // ✅ Mock JWT verification for valid and invalid tokens
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

  // ✅ TEST: Authentication (No DB)
  test("Should return 403 when no token is provided", async () => {
    const res = await request(app).get("/api/users/getuser/123");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("No token provided!");
  });

  test("Should return 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/users/getuser/123")
      .set("Authorization", invalidToken);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized!");
  });

  // ✅ TEST: User Routes
  test("Should get user details successfully", async () => {
    const res = await request(app)
      .get(`/api/users/getuser/${mockUser._id}`)
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User fetched successfully");
  });

  test("Should update user successfully", async () => {
    const res = await request(app)
      .put(`/api/users/updateuser/${mockUser._id}`)
      .set("Authorization", mockToken)
      .send({ fullName: "Updated Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User updated successfully");
  });

  test("Should delete user successfully", async () => {
    const res = await request(app)
      .delete(`/api/users/delete/${mockUser._id}`)
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  // ✅ TEST: Goal Routes
  test("Should update a goal successfully", async () => {
    const res = await request(app)
      .put("/api/goal/update/123")
      .set("Authorization", mockToken)
      .send({ title: "Updated Goal", targetAmount: 2000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Goal updated successfully");
  });

  test("Should retrieve all goals successfully", async () => {
    const res = await request(app)
      .get("/api/goal/get")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Goals retrieved successfully");
  });

});
