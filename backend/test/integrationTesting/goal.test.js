const request = require("supertest");
const app = require("../../server"); // Import Express app
const sinon = require("sinon");
const Goal = require("../../models/goal.model");
const jwt = require("jsonwebtoken");

// ✅ Mock user authentication
const mockUser = {
  _id: "605c72bcf3a0f7a1e0d2b6d7",
  role: "User",
};

// ✅ Generate mock JWT Token
const mockToken = `Bearer ${jwt.sign(
  { id: mockUser._id, role: "User" },
  "testsecret",
  { expiresIn: "1h" }
)}`;

describe("Integration Testing - Goal API (No Database)", () => {
  beforeEach(() => {
    sinon.stub(Goal.prototype, "save").resolves({
      _id: "goal123",
      userId: mockUser._id,
      title: "New Goal",
      targetAmount: 1000,
      currentAmount: 0,
      deadline: "2025-01-01T00:00:00.000Z",
      autoAllocate: false,
      allocationPercentage: 0
    });
  
    sinon.stub(Goal, "find").resolves([
      { title: "Goal 1", targetAmount: 1000 },
      { title: "Goal 2", targetAmount: 2000 }
    ]);
  
    // ✅ Mock JWT verification
    sinon.stub(jwt, "verify").callsFake((token, secret, callback) => {
      callback(null, { id: mockUser._id, role: "User" });
    });
  });
  
  afterEach(() => {
    sinon.restore(); // Restore all mocks after each test
  });

  // ✅ TEST: Create Goal
  test("Should create a goal successfully", async () => {
    const res = await request(app)
      .post("/api/goal/create")
      .set("Authorization", mockToken)
      .send({
        title: "New Goal",
        targetAmount: 1000,
        deadline: "2025-01-01T00:00:00.000Z"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Goal created successfully");
    expect(res.body.data.title).toBe("New Goal");
  });

  // ✅ TEST: Get All Goals
  test("Should retrieve all goals successfully", async () => {
    const res = await request(app)
      .get("/api/goal/get")
      .set("Authorization", mockToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Goals retrieved successfully");
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe("Goal 1");
  });
});
