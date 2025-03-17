const EpicEmrService = require("../services/epic.service");

const searchPatientMiddleware = (isDetailsRequired = false) => {

    return async function (req, res, next) {
        try {
            const emrService = new EpicEmrService();
            const { family, given, dob, epicPatientId } = req.body;
            if (epicPatientId) {
                req.emrPatientId = epicPatientId;
                if (isDetailsRequired) {
                    const emrPatient = await emrService.readPatient(epicPatientId);
                    req.emrPatient = emrPatient;
                }
                return next();
            } else {
                if (family && given && dob) {
                    const patient = await emrService.searchPatient({ family, given, dob });
                    if (patient) {
                        req.emrPatientId = patient.id;
                        req.emrPatient = patient;
                        return next();
                    }
                }else{
                    return res.BadRequest("Patient information not provided.")
                }
            }
        } catch (error) {

        }
        return res.NotFound("Patient not found.")
    }
}
module.exports = { searchPatientMiddleware };