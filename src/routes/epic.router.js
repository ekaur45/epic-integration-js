const { Router } = require("express");
const EpicController = require("../controllers/epic.controller");
const safeCode = require("../utils/safe-code");
const { searchPatient } = require("../middleware/search-patient.middleware");

const epicController = new EpicController();
const accountRouter = Router();

accountRouter.post('/search-patient', safeCode(epicController.searchPatient));
accountRouter.post('/create-patient', safeCode(epicController.createPatient));
accountRouter.post('/get-patient-appointments',safeCode(searchPatient),safeCode(epicController.searchPatientAppointment));
accountRouter.get('/slots',safeCode(searchPatient),safeCode(epicController.$find));
accountRouter.post('/book-appointment',safeCode(searchPatient),safeCode(epicController.$book));

module.exports = accountRouter;
