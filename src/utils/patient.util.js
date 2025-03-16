const logger = require("./logger");
const { getCollection } = require("./mongo.util");


/**
 * Upserts a patient record in FHIR R4 format
 * @param {Object} patient - FHIR R4 Patient resource
 * @returns {Object} - Result of the upsert operation
 */
const savePatientToDatabase = async (patient) => {
    const collection = await getCollection('patients');

    // Ensure the patient object follows FHIR R4 structure
    if (!patient.resourceType || patient.resourceType !== 'Patient') {
        throw new Error('Invalid FHIR Patient resource');
    }

    // Use the FHIR resource ID or create a unique identifier
    const query = {
        'id': patient.id || patient.identifier?.[0]?.value
    };

    // Update operation with upsert
    const update = {
        $set: {
            ...patient,
            lastUpdated: new Date().toISOString()
        }
    };

    const options = {
        upsert: true,
        returnDocument: 'after'
    };

    const result = await collection.findOneAndUpdate(
        query,
        update,
        options
    );

    return {
        success: true,
        resource: result.value,
        operation: result.lastErrorObject?.updatedExisting ? 'updated' : 'inserted'
    };


}
/**
 * Finds a patient by FHIR ID
 * @param {string} patientId - FHIR Patient ID
 * @returns {Object|null} - FHIR Patient resource or null if not found
 */
async function findPatientById(patientId) {
    const collection = await getCollection('patients');

    if (!patientId) {
        throw new Error('Patient ID is required');
    }

    const patient = await collection.findOne({
        'id': patientId
    });

    if (!patient) {
        logger.info(`No patient found with ID: ${patientId}`);
        return null;
    }

    return patient;
}
module.exports = { savePatientToDatabase, findPatientById };