const EpicEmrService = require("../services/epic.service");

const searchPatient = async (req, res,next) => {
    const emrService = new EpicEmrService();
    const { family, given, dob,emrPatientId } = req.body;
    if(emrPatientId){
        req.emrPatientId = emrPatientId;
        next();
    }else{
        const patient = await emrService.searchPatient({family,given,dob});
        if(patient){
            req.emrPatientId = patient.id;
            next();
        }
    }
    res.NotFound("Patient not found");
}
module.exports = {searchPatient};