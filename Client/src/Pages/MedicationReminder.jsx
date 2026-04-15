import { useEffect, useState } from "react";

import { medicationApi } from "../api/medicationApi.jsx";
import MedicationForm from "../components/MedicationForm.jsx";
import MedicationList from "../components/MedicationList.jsx";

const MedicationReminder = () => {

  const [medications,setMedications] = useState([]);

  const fetchMedications = async () => {

    const res = await medicationApi.getMedications();

    setMedications(res);
  };

  useEffect(()=>{

    fetchMedications();

  },[]);

  return (

    <div>

      <h2>Medication Reminder</h2>

      <MedicationForm refresh={fetchMedications} />

      <MedicationList
        medications={medications}
        refresh={fetchMedications}
      />

    </div>

  );
};

export default MedicationReminder;