const { Router } = require("express");
const EpicController = require("../controllers/epic.controller");
const safeCode = require("../utils/safe-code");

const epicController = new EpicController();
const accountRouter = Router();

accountRouter.post('/search-patient', safeCode(epicController.searchPatient));
accountRouter.post('/get-patient-appointments', safeCode(epicController.searchPatientAppointment));

module.exports = accountRouter;
