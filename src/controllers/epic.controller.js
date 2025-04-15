const EpicEmrService = require('../services/epic.service');
const logger = require('../utils/logger');

class EpicController {
    constructor() {
        this.epicEmrService = new EpicEmrService();
    }

    searchPatientAppointment = async (req, res, next) => {
        logger.info("Request: Search Patient Appointment: ", req);
        const appointments = await this.epicEmrService.getAppointments(req.emrPatientId);
        logger.info("Response: Search Patient Appointment result.", appointments);
        return res.Ok(appointments);
    }

    searchPatient = async (req, res, next) => {
        const { family, given, dob } = req.body;
        const patientInfo = await this.epicEmrService.searchPatient({ family, given, dob });
        return res.Ok(patientInfo);
    }
    $find = async (req, res, next) => {
        const patientId = req.query.patientId;
        const result = await this.epicEmrService.findSlot(req.emrPatient);
        return res.Ok(result);
    }
    $book = async (req, res, next) => {
        const {note,appointmentId} = req.body;
        const result = await this.epicEmrService.bookSlot({note,appointmentId,patientId:req.emrPatientId});
        return res.Ok(result);
    }
    createPatient = async (req, res, next) => {
        const { family, given, dob } = req.body;
        const patientInfo = await this.epicEmrService.createPatient(req.body);
        return res.Ok(patientInfo);
    }
}

module.exports = EpicController;
