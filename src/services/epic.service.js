const axios = require('axios');
const { extractPatientInfo } = require('../utils/extractPatientInfo');
const TokenService = require('./token.service');
const { savePatientToDatabase, findPatientById } = require('../utils/patient.util');
const { toSlotDto, toAppointmentDto } = require('../utils/transformers/appointment');
// axios.interceptors.request.use(
//     (config) => {
//       console.log(`📤 [Request] ${config.method?.toUpperCase()} ${config.url}`);
//       console.log("Headers:", config.headers);
//       console.log("Data:", config.data);
//       return config;
//     },
//     (error) => {
//       console.error("❌ [Request Error]:", error);
//       return Promise.reject(error);
//     }
//   );
  
//   // Response Interceptor - Logs response details
//   axios.interceptors.response.use(
//     (response) => {
//       console.log(`📥 [Response] ${response.config.method?.toUpperCase()} ${response.config.url}`);
//       console.log("Status:", response.status);
//       console.log("Data:", response.data);
//       return response;
//     },
//     (error) => {
//       console.error("❌ [Response Error]:", error.response ? error.response.data : error.message);
//       return Promise.reject(error);
//     }
//   );
  class EpicEmrService {
    constructor() {
        this.tokenService = new TokenService();
    }

    searchPatient = async (body, isRetry = false) => {
        const parameters = {
            "family": body.family,
            "given": body.given,
            "birthdate": body.dob
        };

        const result = await this.getBundle('Patient/_search', parameters);
        if (result && result.total > 0) {
            const fhirPatient = result.entry[0].resource;
            savePatientToDatabase(fhirPatient);
            return await extractPatientInfo(fhirPatient);
        }
        throw new Error('Patient not found');
    }
    readPatient = async (patientId)=>{
        const parameters = {
            "_id": patientId,
        };
        const result = await this.getBundle('Patient/_search', parameters);
        if (result && result.total > 0) {
            const fhirPatient = result.entry[0].resource;
            savePatientToDatabase(fhirPatient);
            return await extractPatientInfo(fhirPatient);
        }
        throw new Error('Patient not found');
    }
    createPatient = async (obj)=>{
        const createPatientParams =   {
            "resourceType": "Patient",
            "identifier": [
                {
                    "use": "usual",
                    "system": "urn:oid:2.16.840.1.113883.4.1",
                    "value": "000-00-0000"
                }
            ],
            "active": "true",
            "name": [
                {
                    "use": "usual",
                    "family": obj.family,
                    "given": [
                        obj.given
                    ]
                }
            ],
           
            "gender": obj.gender,
            "birthDate": obj.dateOfBirth
           
        };
        const result = await this.postBundle("Patient",createPatientParams,{"Prefer":"return=representation"});
        return await extractPatientInfo(result);
        return result;
    }
    getAppointments = async (epicPatientId) => {
        if (!epicPatientId) {
            const patient = await this.searchPatient(body);
            if (!patient) throw new Error('Patient not found');
            _pid = patient.id;
        }

        const parameters = {
            "patient": epicPatientId,
            "_count": "200"
        };

        const result = await this.getBundle('Appointment/_search', parameters);
        if(result.entry&&result.entry.length>0){
            const resultDto = [];
            for (let i = 0; i < result.entry.length; i++) {
                const el = result.entry[i];
                const dto = toAppointmentDto(el);
                resultDto.push(dto);
            }
            return resultDto;
        }
        return [];
    }
    /**
     * 
     * @param {*} patientId - FHIR Patient Id
     * @returns 
     */
    findSlot = async (patient) => {
        const obj = {
            "resourceType": "Parameters", 
           
            "parameter": [
                patient,
                {
                    "name": "_count",
                    "valueInteger": 3
                }
            ]
        }
        const _date = new Date();
        const year = _date.getFullYear();
        let month = _date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        let day = _date.getUTCDate();
        day = day < 10 ? "0" + day : day;
        const date = `${year}-${month}-${day}`;
        obj['parameter'].push({
            "name": "startTime",
            "valueDateTime": `${date}T00:00:00Z`
        })
        obj['parameter'].push({
            "name": "endTime",
            "valueDateTime": `${year}-${month}-${day + 1}T22:00:00Z`
        })
        const result = await this.getBundleStu3("Appointment/$find", obj);
        if(result.entry&&result.entry.length>0){
            const resultDto = [];
            for (let i = 0; i < result.entry.length; i++) {
                const el = result.entry[i];
                const dto = toSlotDto(el);
                resultDto.push(dto);
            }
            return resultDto;
        }
        return result?.entry;
    }


    bookSlot = async (obj) => {
        const bookParams = {
            "resourceType": "Parameters",
            "parameter": [
                {
                    "name": "patient",
                    "valueIdentifier": { "value": obj.patientId }
                },
                {

                    "name": "appointment",
                    "valueReference":{
                        "reference":"Appointment/"+obj.appointmentId
                    },
                    "valueIdentifier": { "value": ""+obj.appointmentId }
                },
                {

                    "name": "appointmentNote",
                    "valueString": obj.note
                }

            ]

        }
        try {
            const result = await this.postBundleStu3("Appointment/$book", bookParams);
            if(result&&result.entry&&result.entry.length>0){
                return toAppointmentDto(result.entry[0]);
            }
            return null;
        } catch (error) {
            if(error&&error['issue']&&Array.isArray(error['issue'])){
                const issue = error['issue'].map(x=>x.diagnostics);
                throw issue;
            }
            throw error;
        }

    }
    postBundleStu3 = async (url, parameters, isRetry = false) => {
        const accessToken = await this.tokenService.getAccessTokenFromDb();
        try {
            const result = await axios.post(process.env.EPIC_BASE_URL_STU3 + url, parameters, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/fhir+json'
                }
            });
            return result.data;
        } catch (error) {
            if (error.response?.status === 401 && !isRetry) {
                console.warn("Token expired. Renewing token...");
                await this.tokenService.renewToken();
                return this.postBundleStu3(url, parameters, true);
            }
            throw error?.response?.data
        }
    }
    getBundleStu3 = async (url, parameters, isPost = true, isRetry = false) => {
        try {
            const accessToken = await this.tokenService.getAccessTokenFromDb();
            const config = {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/fhir+json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            };

            const requestMethod = isPost ? axios.post : axios.get;
            const requestUrl = `${process.env.EPIC_BASE_URL_STU3}${url}`;
            const formParams = new URLSearchParams();
            for (const [key, value] of Object.entries(parameters)) {
                if(Array.isArray(value))
                formParams.append(key, JSON.stringify(value));
            else
            formParams.append(key, value);
            }
            // Corrected request handling for GET and POST
            const result = isPost
                ? await requestMethod(requestUrl, formParams, config)
                : await requestMethod(requestUrl, { params: { ...formParams, "_count": "200" }, ...config });

            let bundle = result.data;
            if(false){

            
            let allEntries = bundle.entry || [];
            // Handle pagination
            let nextLink = bundle.link?.find(x => x.relation === "next");
            while (nextLink?.url) {
                const sessionIDMatch = nextLink.url.match(/sessionID=([^&]+)/);
                const nextResult = await axios.post(nextLink.url,{sessionID:sessionIDMatch}, { headers: config.headers });
                const nextBundle = nextResult.data;

                if (nextBundle.entry) {
                    allEntries = allEntries.concat(nextBundle.entry);
                }

                nextLink = nextBundle.link?.find(x => x.relation === "next");
            }

            bundle.entry = allEntries;
            bundle.total =allEntries.length;
        }
            return bundle;

        } catch (error) {
            if (error.response?.status === 401 && !isRetry) {
                console.warn("Token expired. Renewing token...");
                await this.tokenService.renewToken();
                return this.getBundleStu3(url, parameters, isPost, true);
            }
            throw error?.response?.data;
        }
    }

    getBundle = async (url, parameters, isPost = true, isRetry = false) => {
        try {
            const accessToken = await this.tokenService.getAccessTokenFromDb();
            const formParams = new URLSearchParams();
            for (const [key, value] of Object.entries(parameters)) {
                if(Array.isArray(value))
                formParams.append(key, JSON.stringify(value));
            else
            formParams.append(key, value);
            }
            const result = await axios.post(process.env.EPIC_BASE_URL + url, formParams, {
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
            let _error = error?.response?.data;
            if(_error&&_error['issue']&&Array.isArray(_error['issue'])){
                const issue = _error['issue'].map(x=>x);
                throw issue;
            }
        }
    }
    postBundle = async (url, parameters, headers = {}, isRetry = false) => {
        try {
            const accessToken = await this.tokenService.getAccessTokenFromDb();
            const result = await axios.post(process.env.EPIC_BASE_URL + url, parameters, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    ...headers
                }
            });
            return result.data;
        } catch (error) {
            if (error.response && error.response.status === 401 && !isRetry) {
                await this.tokenService.renewToken();
                return this.getBundle(url, parameters,headers, isPost, true);
            }
            let _error = error?.response?.data;
            if(_error&&_error['issue']&&Array.isArray(_error['issue'])){
                const issue = _error['issue'].map(x=>x);
                throw issue;
            }
        }
    }
}

module.exports = EpicEmrService;
