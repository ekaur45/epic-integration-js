function AppointmentDto(obj){
    this.id = obj.id;
    this.status = obj.name;
}

function toSlotDto(fhirResource){
    const appointment = fhirResource.resource;
    
    return {
        id: appointment.id,
        status: appointment.status,
        timezone: appointment.extension?.find(ext => ext.url === "http://hl7.org/fhir/StructureDefinition/timezone")?.valueCode || "",
        serviceCategory: appointment.serviceCategory?.coding?.[0]?.display || "",
        serviceType: appointment.serviceType?.[0]?.coding?.[0]?.display || "",
        start: appointment.start,
        end: appointment.end,
        durationMinutes: appointment.minutesDuration,
        slot: appointment.slot?.map(s => ({
            reference: s.reference,
            display: s.display
        })) || [],
        participants: appointment.participant?.map(p => ({
            reference: p.actor.reference,
            display: p.actor.display,
            required: p.required,
            status: p.status
        })) || []
    };
}
function toAppointmentDto(fhirResource) {
    const resource = fhirResource.resource;
    return {
        id: resource.id,
        status: resource.status,
        timezone: resource.extension?.find(ext => ext.url === "http://hl7.org/fhir/StructureDefinition/timezone")?.valueCode || null,
        identifier: resource.identifier?.map(id => ({ system: id.system, value: id.value })) || [],
        serviceCategory: resource.serviceCategory?.text || null,
        serviceType: resource.serviceType?.map(st => st.coding?.map(c => c.display)).flat() || [],
        appointmentType: resource.appointmentType?.coding?.map(c => c.display) || [],
        start: resource.start,
        end: resource.end,
        minutesDuration: resource.minutesDuration,
        created: resource.created,
        comment: resource.comment?.trim() || null,
        participants: resource.participant?.map(part => ({
            reference: part.actor.reference,
            display: part.actor.display,
            required: part.required,
            status: part.status
        })) || []
    };
}
module.exports = {toSlotDto,toAppointmentDto};