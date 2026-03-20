const notesArea = document.getElementById("notesArea");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const notesStatus = document.getElementById("notesStatus");

const notesKey = "dailyUtilityNotes";
const savedNotes = localStorage.getItem(notesKey);
if (savedNotes) {
  notesArea.value = savedNotes;
  notesStatus.textContent = "Loaded saved notes";
}

saveNotesBtn.addEventListener("click", () => {
  localStorage.setItem(notesKey, notesArea.value);
  notesStatus.textContent = "Notes saved";
});

