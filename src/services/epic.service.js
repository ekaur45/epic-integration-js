const axios = require('axios');
const { extractPatientInfo } = require('../utils/extractPatientInfo');
const TokenService = require('./token.service');

class EpicEmrService {
    constructor() {
        this.tokenService = new TokenService();
    }

    searchPatient = async (body, isRetry = false) => {
        const parameters = new URLSearchParams({
            "family": body.family,
            "given": body.given,
            "birthdate": body.dob
        });

        const result = await this.getBundle('Patient/_search', parameters);
        if (result && result.total > 0) {
            const fhirPatient = result.entry[0].resource;
            return await extractPatientInfo(fhirPatient);
        }
        throw new Error('Patient not found');
    }

    getAppointments = async (body) => {
        const { epicPatientId, family, given, dob } = body;
        let _pid = epicPatientId;

        if (!_pid) {
            const patient = await this.searchPatient(body);
            if (!patient) throw new Error('Patient not found');
            _pid = patient.id;
        }

        const parameters = new URLSearchParams({
            "patient": _pid,
            "_count": "200"
        });

        return await this.getBundle('Appointment/_search', parameters);
    }

    getBundle = async (url, parameters, isPost = true, isRetry = false) => {
        try {
            const accessToken = await this.tokenService.getAccessTokenFromDb();
            const result = await axios.post(process.env.EPIC_BASE_URL + url, parameters, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/fhir+json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            return result.data;
        } catch (error) {
            if (error.response && error.response.status === 401 && !isRetry) {
                await this.tokenService.renewToken();
                return this.getBundle(url, parameters, isPost, true);
            }
            throw error;
        }
    }
}

module.exports = EpicEmrService;
