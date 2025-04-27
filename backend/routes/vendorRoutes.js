"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const vendorController_1 = require("../controllers/vendorController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get("/", vendorController_1.getVendor);
router.post("/add", vendorController_1.addVendors);
router.get("/event/:eventId", vendorController_1.getVendorsByEvent);
router.get("/getByUser", authMiddleware_1.authenticate, vendorController_1.getByUser);
// add to split
router.post("/addToSplit", vendorController_1.addVendorInSplitOrRemove);
router.post("/addUserToSplit", vendorController_1.addUserInSplit);
// remove vendor
router.delete("/remove-vendor/:id", vendorController_1.removeAddedVendor);
// send mail rout
router.post("/send-mail", vendorController_1.sendMailToUser);
// confirm payment request
router.post("/confirm-payment", vendorController_1.confirmPayment);
// confirm status
router.get("/payment-status", vendorController_1.checkPaymentStatus);
// remove added user for split
router.delete("/delete/addedInSplit", vendorController_1.removeFromSplit);
// edit user from split
router.patch("/split/users/edituser", vendorController_1.editUserInSplit);
// add manual expense
router.post("/addManualExpense", vendorController_1.addManualExpense);
exports.default = router;
