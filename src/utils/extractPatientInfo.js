function extractPatientInfo(fhirPatient) {
    return {
        id: fhirPatient.id || "",
        name: extractName(fhirPatient),
        dateOfBirth: fhirPatient.birthDate || "",
        phoneNumber: extractPhoneNumber(fhirPatient),
        address: extractAddress(fhirPatient),
        maritalStatus: (fhirPatient.maritalStatus && fhirPatient.maritalStatus.text) || "",
        generalPractitioner: extractGeneralPractitioner(fhirPatient),
        managingOrganization: extractManagingOrganization(fhirPatient),
    };
}

function extractName(patient) {
    if (patient.name && Array.isArray(patient.name) && patient.name.length > 0) {
        const name = patient.name[0]; // Get first name object
        return `${(name.given && name.given.join(" ")) || ""} ${name.family || ""}`.trim();
    }
    return "";
}

function extractPhoneNumber(patient) {
    if (patient.telecom && Array.isArray(patient.telecom)) {
        const phoneEntry = patient.telecom.find(t => t.system === "phone");
        return (phoneEntry && phoneEntry.value) || "";
    }
    return "";
}

function extractAddress(patient) {
    if (patient.address && Array.isArray(patient.address) && patient.address.length > 0) {
        const addr = patient.address[0];
        return `${(addr.line && addr.line.join(", ")) || ""}, ${addr.city || ""}, ${addr.state || ""}, ${addr.postalCode || ""}, ${addr.country || ""}`.trim();
    }
    return "";
}

function extractGeneralPractitioner(patient) {
    if (patient.generalPractitioner && Array.isArray(patient.generalPractitioner)) {
        return patient.generalPractitioner.map(gp => ({
            name: gp.display || "",
            reference: gp.reference || "",
        }));
    }
    return [];
}

function extractManagingOrganization(patient) {
    if (patient.managingOrganization) {
        return {
            name: patient.managingOrganization.display || "",
            reference: patient.managingOrganization.reference || "",
        };
    }
    return { name: "", reference: "" };
}

module.exports = {
    extractPatientInfo,
    extractName,
    extractPhoneNumber,
    extractAddress,
    extractGeneralPractitioner,
    extractManagingOrganization,
};
