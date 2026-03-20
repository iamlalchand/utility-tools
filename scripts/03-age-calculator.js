const dobInput = document.getElementById("dobInput");
const ageBtn = document.getElementById("ageBtn");
const ageResult = document.getElementById("ageResult");

ageBtn.addEventListener("click", () => {
  if (!dobInput.value) {
    ageResult.textContent = "Age: Select date of birth";
    return;
  }

  const dob = new Date(dobInput.value);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  ageResult.textContent = `Age: ${age} years`;
});

