// // import {
// //  markMedicationTaken,
// //  updateMedicationTime,
// //  deleteMedication
// // } from "../api/medicationApi";
 import { medicationApi } from "../api/medicationApi";
// const MedicationList = ({ medications, refresh }) => {

//   const handleTaken = async (id) => {

//     await medicationApi.markMedicationTaken({id});

//     refresh();
//   };

//   const handleUpdate = async (id) => {

//     const newTime = prompt("Enter new time (HH:MM)");

//     if(newTime){
//       await medicationApi.updateMedicationTime(id,newTime);
//       refresh();
//     }
//   };

//   const handleDelete = async (id) => {

//     await medicationApi.deleteMedication({id});

//     refresh();
//   };

//   return (

//     <div>

//       <h3>Your Medications</h3>
      
//       {medications?.map((med)=> (

//         <div key={med.id}>

//           <p><b>{med.medicineName}</b></p>
//           <p>Dosage: {med.dosage}</p>
//           <p>Time: {med.time}</p>

//           <button onClick={()=>handleTaken(med.id)}>
//             Taken
//           </button>

//           <button onClick={()=>handleUpdate(med.id)}>
//             Update Time
//           </button>

//           <button onClick={()=>handleDelete(med.id)}>
//             Delete
//           </button>

//           <hr/>

//         </div>

//       ))}

//     </div>

//   );
// };

// export default MedicationList;



const MedicationList = ({ medications, refresh }) => {

  const handleTaken = async (logId) => {
    console.log("requested to markmedication api")
    await medicationApi.markMedicationTaken( logId );
    console.log("successfully requested on mark medication")
    refresh();
  };

  const handleUpdate = async (id) => {
    const newTime = prompt("Enter new time (HH:MM)");

    if (newTime) {
      await medicationApi.updateMedicationTime(id, newTime);
      refresh();
    }
  };

  const handleDelete = async (id) => {
    await medicationApi.deleteMedication({ id });
    refresh();
  };

  return (
    <div>
      <h3>Your Medications</h3>

      {medications?.map((med) => (
        <div key={med.id}>

          <p><b>{med.medicineName}</b></p>
          <p>Dosage: {med.dosage}</p>
          <p>Time: {med.time}</p>

          
          <h4>Schedule:</h4>

          {med.logs?.map((log) => (
            <div key={log.id} style={{ marginBottom: "8px" }}>

              <span>
                {new Date(log.scheduledTime).toLocaleString()}
              </span>

              {log.taken ? (
                <span style={{ marginLeft: "10px", color: "green" }}>
                   Taken
                </span>
              ) : (
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleTaken(log.id)} 
                >
                  Taken
                </button>
              )}

            </div>
          ))}

          <br />

          <button onClick={() => handleUpdate(med.id)}>
            Update Time
          </button>

          <button onClick={() => handleDelete(med.id)}>
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
};

export default MedicationList;