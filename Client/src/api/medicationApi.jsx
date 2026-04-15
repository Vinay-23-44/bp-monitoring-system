import axios from "./axios"
import auth from "../lib/auth"
 

async function addMedication({ medicineName, dosage, time }) {

  const { data } = await axios({
    method: "post",
    url: "/api/medication",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
    data: {
      medicineName,
      dosage,
      time
    },
  });

  return data;
}

async function getMedications() {

  const { data } = await axios({
    method: "get",
    url: "/api/medication",
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
  });

  return data;
}


async function markMedicationTaken( logId) {

  const { data } = await axios({
    method: "post",
    url: `/api/medication/taken`,
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
    data: {
      logId

    },
   
  });
  console.log("request done")
  return data;
}

async function updateMedicationTime( id, time ) {

  const { data } = await axios({
    method: "put",
    url: `/api/medication/${id}`,
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
    data: {
      time
    },
  });

  return data;
}

async function deleteMedication({ id }) {

  const { data } = await axios({
    method: "delete",
    url: `/api/medication/${id}`,
    headers: {
      Authorization: `Bearer ${auth.token || ""}`,
    },
  });

  return data;
}
export const medicationApi={
  addMedication,
   getMedications,
   markMedicationTaken,
   updateMedicationTime,
   deleteMedication
}