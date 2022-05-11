"use strict";

///////////////Declarations///////////////////////
const dateDivision = document.querySelector(".date-container");
const timeDivision = document.querySelector(".time-container");
const addTaskButton = document.querySelector(".task-input-btn");
const addTaskIcon = document.querySelector(".task-input-icon");
const tasksSection = document.querySelector(".tasks-section");
const inputSection = document.querySelector(".input-section");
const deleteButton = document.querySelector(".delete-btn");
const allTasksButton = document.querySelector(".all-btn");
const completedTasksButton = document.querySelector(".completed-btn");
const pendingTasksButton = document.querySelector(".pending-btn");
const taskCard = document.querySelector(".task-card");
const editTaskSection = document.querySelector(".edit-task-section");
const updateInput = document.querySelector(".update-input");
const editIcon = document.querySelector(".edit-icon");
const searchBar = document.querySelector(".search-bar");
const searchBarBtn = document.querySelector(".task-search-icon");
const searchBarIcon = document.querySelector(".task-search-btn");
const editWarning = document.querySelector(".edit-warn-pop-up");
const noTasksAvailable = document.querySelector(".no-tasks-div");
const loader = document.querySelector(".loading-section");
let inputTaskName = document.querySelector(".task-input");
let inputErrorPopup = document.querySelector(".popup-input");
let closeEditBox = document.querySelector(".close-edit-box-icon");
const openEditContainer = function () {
  editTaskSection.classList.remove("hidden");
  inputSection.classList.add("hidden");
  tasksSection.classList.add("hidden");
};
const closeEditContainer = function () {
  editTaskSection.classList.add("hidden");
  inputSection.classList.remove("hidden");
  tasksSection.classList.remove("hidden");
};

///////////////////Running initially  to fetch existed tasks/////////////////
const url = "https://bhanu-todo.herokuapp.com/users";
getTask();
////////////////////ADD TASK FUNCTION/////////////////////////
/////////This function will be resued to display data/////////
async function getData(url) {
  let res = await fetch(url);
  return await res.json();
}

async function getTask() {
  loader.classList.remove("hidden");
  try {
    let data = await getData(url);
    let html = "";

    data?.forEach((elem) => {
      const { name, id, done } = elem;
      html += showTemplate(id, name, done);
    });
    tasksSection.innerHTML = html;
    if (!tasksSection.innerHTML) {
      noTasksAvailable.innerText = "Nothing To Do";
    } else if (tasksSection.innerHTML) {
      noTasksAvailable.innerText = "";
    }
  } catch (err) {
    alert(err.message + "----" + "Check your connection");
    inputSection.classList.add("hidden");
    noTasksAvailable.innerText = "Get Your NPM Started and Refresh the Page";
  }
  loader.classList.add("hidden");
}

////////////Add task button (click) functionality////////////

addTaskButton.addEventListener("click", addTask);
async function addTask() {
  if (inputTaskName.value.trim().length === 0) {
    inputErrorPopup.innerText = "Your Task Content is Empty";
    return;
  }
  try {
    let data = await getData(url);
    let name = inputTaskName.value.toLowerCase().trim();
    let filter = data.filter((elem) => elem.name.toLowerCase().trim() === name);

    if (filter.length === 0) {
      let res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: inputTaskName.value, done: "false" }),
      });

      if (res.ok) {
        getTask();
      }

      inputTaskName.value = "";
    } else if (filter.length != 0) {
      inputErrorPopup.textContent = "Task Are Already Exits";
    }
  } catch (error) {
    console.log(error);
    alert(error);
  }
}

////enter key functionality[addTask function]////////////////
inputTaskName.addEventListener("keyup", (e) => {
  inputErrorPopup.innerText = "";
  if (e.key === "Enter") addTask();
});

///////////////////completed,delete,edit- task functionality////////////
///for deleting card from db
async function deleteTask(url) {
  try {
    let res = await fetch(`${url}`, {
      method: "DELETE",
    });
    getTask();
  } catch (error) {
    console.log(error);
    alert(error);
  }
}
//for updating card in db
async function update(url, data) {
  let res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    return;
  } else {
    alert("Fail to update");
  }
}
///////////////functionalities////////////////
tasksSection.addEventListener("click", (e) => {
  let click = e.target.closest(".edit-box-btns");
  if (!click) return;
  let id = Number(click.id);

  let btnname = click.getAttribute("dataSet");
  ///////////Completed TAsks (checked) Functionality from DB///////////////
  if (btnname === "finished-btn") {
    click.closest(".task-card").classList.toggle("finished");
    setTimeout(() => {
      async function finishedAsync() {
        let data = await getData(`${url}/${id}`);
        const { done } = data;
        if (done === "false") {
          await update(`${url}/${id}`, { done: "true" });
          getTask();
        } else if (done === "true") {
          await update(`${url}/${id}`, { done: "false" });
          getTask();
        }
      }
      finishedAsync();
    }, 200);
  }
  /////////////for deleting card from DB////////////
  else if (btnname === "delete-btn") {
    if (click.closest(".task-card").classList.contains("finished")) {
      click.closest(".task-card").classList.remove("finished");
      click.closest(".task-card").classList.add("drop-effect");
    } else {
      click.closest(".task-card").classList.add("drop-effect");
    }
    setTimeout(() => {
      deleteTask(`${url}/${id}`);
    }, 1000);
  }
  /////////////////for updating card in DB////////
  else if (btnname === "update-btn") {
    openEditContainer();
    updateInput.value = click
      .closest(".task-card")
      .querySelector(".taskname")
      .textContent.trim();

    updateInput.focus();

    closeEditBox.addEventListener("click", () => {
      closeEditContainer();
    });
    updateInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        (async () => {
          let res = await fetch(url);
          let data = await res.json();

          let filter = data?.filter((elem) => {
            return elem.name === updateInput.value;
          });

          if (!updateInput.value) {
            editWarning.innerText = "Update Input is Empty";
          } else {
            if (filter.length === 0) {
              await update(`${url}/${id}`, { name: updateInput.value });

              window.location.reload();

              closeEditContainer();
            } else {
              editWarning.innerText = "task exists";
            }
          }
        })();
      } else {
        editWarning.innerText = "";
      }
    });
    editIcon.addEventListener("click", async (e) => {
      let res = await fetch(url);
      let data = await res.json();

      let filter = data?.filter((elem) => {
        return elem.name === updateInput.value;
      });
      if (!updateInput.value) {
        editWarning.innerText = "Update Input is Empty";
      } else {
        if (filter.length === 0) {
          await update(`${url}/${id}`, { name: updateInput.value });

          window.location.reload();

          closeEditContainer();
        } else {
          editWarning.innerText = "task exists";
        }
      }
    });
  }
});

/////////////////////filter functionalities////////////////
/////filter buttons fading ////////
const buttonsFading = function (e) {
  if (e.target.classList.contains("task-details-btns")) {
    const totalbuttons = e.target
      .closest(".task-details")
      .querySelectorAll(".task-details-btns");
    totalbuttons.forEach((element) => {
      if (element !== e.target) {
        element.style.opacity = this;
      } else if (element == e.target) {
        element.style.opacity = 1;
      }
    });
  }
};
document
  .querySelector(".task-details")
  .addEventListener("click", buttonsFading.bind(0.3));
///////////////completed-filter/////////
completedTasksButton.addEventListener("click", async () => {
  let data = await getData(url);

  if (data.length > 0) {
    let com = data.filter((element) => element.done === "true");
    let html = "";
    com.map((elem) => {
      const { id, name, done } = elem;
      html += showTemplate(id, name, done);
    });
    tasksSection.innerHTML = html;
  } else {
    inputErrorPopup.innerText = "please enter tasks";
  }
});

////////////////pending-filter/////////////////
pendingTasksButton.addEventListener("click", async () => {
  let data = await getData(url);

  if (data.length > 0) {
    let pend = data.filter((element) => element.done === "false");
    let html = "";
    pend.map((element) => {
      const { id, name, done } = element;
      html += showTemplate(id, name, done);
    });
    tasksSection.innerHTML = html;
  } else {
    inputErrorPopup.innerText = "please enter tasks";
  }
});

///////////////////////All tasks Filter////////////////////
allTasksButton.addEventListener("click", async () => {
  let data = await getData(url);

  if (data.length > 0) {
    let html = "";
    data.map((element) => {
      const { id, name, done } = element;
      html += showTemplate(id, name, done);
    });
    tasksSection.innerHTML = html;
  }
});

//////////////////search filter///////////////////
const searchFunction = async () => {
  try {
    let res = await fetch(url);
    let data = await res.json();
    let html = "";
    await data.forEach(async (element) => {
      if (
        element.name
          .toLowerCase()
          .trim()
          .includes(searchBar.value.toLowerCase().trim())
      ) {
        let data = await element;

        const { id, name, done } = element;

        html += showTemplate(id, name, done);
        tasksSection.innerHTML = html;
        inputErrorPopup.textContent = "";
      } else if (
        !element.name
          .toLowerCase()
          .trim()
          .includes(searchBar.value.toLowerCase().trim())
      ) {
        const infoPara = `no task matches your search`;
        inputErrorPopup.textContent = infoPara;
        tasksSection.innerHTML = "";
      }
    });
  } catch (error) {
    console.log(error);
    alert(error);
  }
};
searchBar.addEventListener("keyup", searchFunction);
searchBarBtn.addEventListener("click", searchFunction);

//////////////////////showTemplate function/////////////////////////

function showTemplate(id, name, done) {
  return ` <div class="task-card ${done === "true" ? "finished" : ""}">
  <div class="edit-box">
    <button id='${id}' class="finished-btn edit-box-btns" dataSet="finished-btn">
      <i
        class="bx bx-check-shield finished-icon edit-box-icons"

      ></i>
    </button>
    <button id='${id}' class="update-btn edit-box-btns" dataSet="update-btn">
      <i
        class="bx bxs-edit-alt update-icon edit-box-icons"

      ></i>
    </button>
    <button id='${id}' class="delete-btn edit-box-btns" dataSet= "delete-btn">
      <i
        class="bx bx-calendar-x delete-icon edit-box-icons"

      ></i>
    </button>
  </div>
  <div class="taskname">
    ${name}
  </div>
</div> `;
}

//////////////////////////////date-time//////////////////
var today = new Date();
var day = today.getDate();
var month = today.getMonth() + 1;
function displaytime() {
  var date = new Date();
  timeDivision.innerText = date.toLocaleTimeString("en-US");
}
if (day < 10) {
  day = "0" + day;
}
if (month < 10) {
  month = "0" + month;
}
today = day + "/" + month + "/" + today.getFullYear();
dateDivision.innerText = today;
displaytime();
var myVar = setInterval(function () {
  displaytime();
}, 1000);

////////////////////////toggle-them///////////////

//toggle theme;

let currentPageColor = "Dark";
function themeChanger() {
  document.body.classList.toggle("dark-theme");
  let theme = document.querySelector(".theme-btn");
  theme.innerHTML = "";
  if (currentPageColor === "Dark") {
    const lightTheme = `<svg xmlns="http://www.w3.org/2000/svg" class="theme-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>`;
    dateDivision.style.color = "#ddd";
    timeDivision.style.color = "#ddd";
    addTaskButton.style.backgroundColor = "#222";
    addTaskIcon.style.backgroundColor = "#222";
    addTaskIcon.style.color = "#fff";
    searchBarBtn.style.backgroundColor = "#222";
    searchBarIcon.style.backgroundColor = "#222";
    searchBarBtn.style.color = "#fff";
    searchBar.style.backgroundColor = "#f6edc7";
    inputTaskName.style.backgroundColor = "#f6edc7";
    allTasksButton.style.backgroundColor = "#154c99";
    pendingTasksButton.style.backgroundColor = "#154c99";
    completedTasksButton.style.backgroundColor = "#154c99";

    theme.insertAdjacentHTML("beforeend", lightTheme);

    currentPageColor = "Light";
  } else {
    const darkTheme = `<svg xmlns="http://www.w3.org/2000/svg" class="theme-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>`;
    dateDivision.style.color = "#565d66";
    timeDivision.style.color = "#565d66";
    addTaskButton.style.backgroundColor = "#f6edc7";
    addTaskIcon.style.backgroundColor = "#f6edc7";
    addTaskIcon.style.color = "#222";
    searchBarBtn.style.backgroundColor = "#f6edc7";
    searchBarIcon.style.backgroundColor = "#f6edc7";
    searchBarBtn.style.color = "#222";
    searchBar.style.backgroundColor = "#fff";
    inputTaskName.style.backgroundColor = "#fff";
    allTasksButton.style.backgroundColor = "#2c3540";
    pendingTasksButton.style.backgroundColor = "#2c3540";
    completedTasksButton.style.backgroundColor = "#2c3540";
    theme.insertAdjacentHTML("beforeend", darkTheme);

    currentPageColor = "Dark";
  }
}
