import { useState } from "react";
//import { addMedication } from "../api/medicationApi";
import { medicationApi } from "../api/medicationApi";

const MedicationForm = ({ refresh }) => {

  const [medicineName,setMedicineName] = useState("");
  const [dosage,setDosage] = useState("");
  const [time,setTime] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    await medicationApi.addMedication({
      medicineName,
      dosage,
      time
    });

    setMedicineName("");
    setDosage("");
    setTime("");

    refresh();
  };

  return (
    <form onSubmit={handleSubmit}>

      <h3>Add Medication</h3>

      <input
        type="text"
        placeholder="Medicine Name"
        value={medicineName}
        required
        onChange={(e)=>setMedicineName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Dosage in milligram(mg)"
        value={dosage}
        required
        onChange={(e)=>setDosage(e.target.value)}
      />

      <input
        type="time"
        value={time}
        required
        onChange={(e)=>setTime(e.target.value)}
      />

      <button type="submit">
        Add Medication
      </button>

    </form>
  );
};

export default MedicationForm;