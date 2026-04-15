export const formatProfileData = (data) => {
  const formatted = { ...data };
  const toArray = (value) =>
    typeof value === "string"
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : value;

  // convert number fields
  if (data.age) formatted.age = Number(data.age);
  if (data.weight) formatted.weight = Number(data.weight);
  if (data.height) formatted.height = Number(data.height);
  if (data.exerciseFrequency) formatted.exerciseFrequency = Number(data.exerciseFrequency);
  if (data.sleepHours) formatted.sleepHours = Number(data.sleepHours);
  if (data.waterIntake) formatted.waterIntake = Number(data.waterIntake);
  if (data.stressLevel) formatted.stressLevel = Number(data.stressLevel);

  // boolean
  if (data.isSmoker !== "" && data.isSmoker !== undefined) {
    formatted.isSmoker = data.isSmoker === "true" || data.isSmoker === true;
  }

  // array fields
  formatted.exerciseTypes = toArray(data.exerciseTypes);
  formatted.medicalConditions = toArray(data.medicalConditions);
  formatted.familyHistory = toArray(data.familyHistory);

  Object.keys(formatted).forEach((key) => {
    if (formatted[key] === "") {
      formatted[key] = undefined;
    }
  });

  return formatted;
};