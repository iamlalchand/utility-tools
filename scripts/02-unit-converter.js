const kmInput = document.getElementById("kmInput");
const kmToMilesBtn = document.getElementById("kmToMilesBtn");
const unitResult = document.getElementById("unitResult");

kmToMilesBtn.addEventListener("click", () => {
  const km = Number(kmInput.value);

  if (Number.isNaN(km) || kmInput.value === "") {
    unitResult.textContent = "Miles: Enter kilometers first";
    return;
  }

  const miles = km * 0.621371;
  unitResult.textContent = `Miles: ${miles.toFixed(2)}`;
});

