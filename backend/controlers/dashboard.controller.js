const dashboardService = require("../services/dashboard.service");
const responseHandler = require("../utils/responseHeader");

const getDashboard = async (req, res, next) => {
    try {
        let dashboardData;

        if (req.user.role === "Admin") {
            dashboardData = await dashboardService.getAdminDashboard();
        } else {
            dashboardData = await dashboardService.getUserDashboard(req.user.id);
        }

        responseHandler.success(res, "Dashboard data retrieved successfully", dashboardData);
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard };
