const EpicEmrService = require('../services/epic.service');
const logger = require('../utils/logger');

class EpicController {
    constructor() {
        this.epicEmrService = new EpicEmrService();
    }

    searchPatientAppointment = async (req, res, next) => {
        logger.info("Request: Search Patient Appointment: ", req);
        const appointments = await this.epicEmrService.getAppointments(req.body);
        logger.info("Response: Search Patient Appointment result.", appointments);
        return res.Ok(appointments);
    }

    searchPatient = async (req, res, next) => {
        const { family, given, dob } = req.body;
        const patientInfo = await this.epicEmrService.searchPatient({ family, given, dob });
        return res.Ok(patientInfo);
    }
}

module.exports = EpicController;
