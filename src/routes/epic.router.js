const { Router } = require("express");
const EpicController = require("../controllers/epic.controller");
const safeCode = require("../utils/safe-code");
const { searchPatientMiddleware } = require("../middleware/search-patient.middleware");

const epicController = new EpicController();
const accountRouter = Router();

accountRouter.post('/search-patient', safeCode(epicController.searchPatient));
accountRouter.post('/create-patient', safeCode(epicController.createPatient));
accountRouter.post('/get-patient-appointments',searchPatientMiddleware(),safeCode(epicController.searchPatientAppointment));
accountRouter.post('/slots',searchPatientMiddleware(true),safeCode(epicController.$find));
accountRouter.post('/book-appointment',searchPatientMiddleware(),safeCode(epicController.$book));

module.exports = accountRouter;
