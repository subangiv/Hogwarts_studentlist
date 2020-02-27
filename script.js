"use strict";
window.addEventListener("DOMContentLoaded", start);

const HTML = {};

let studentHouse;
const studenturl = "//petlatkea.dk/2020/hogwarts/students.json";
const familyurl = "//petlatkea.dk/2020/hogwarts/families.json";

const Student = {
  firstname: "",
  lastname: "",
  middlename: "",
  nickname: "",
  image: "",
  house: "",
  inq_squad: "false",
  blood_status: ""
  //TODO: Add prefect status and inquisitorial squad
};

const settings = {
  filterType: null,
  filter: null,
  sortBy: "firstname",
  sortDir: "asc",
  list: "attending"
};

function start() {
  HTML.list = document.querySelector("#list");
  HTML.temp = document.querySelector("template");
  HTML.allStudents = [];
  HTML.currentStudentList = [];
  HTML.expelledStudentList = [];
  HTML.pureBlood = [];
  HTML.halfBlood = [];
  HTML.search = " ";
  document.querySelectorAll(`[data-action="filter"]`).forEach(elm => {
    elm.addEventListener("click", setFilterButton);
  });

  document.querySelectorAll(`[data-action="sort"]`).forEach(elm => {
    elm.addEventListener("click", setSortValue);
  });

  getJson(familyurl, prepareBloodStatus);
}

function prepareBloodStatus(familyList) {
  HTML.pureBlood = familyList.pure;
  HTML.halfBlood = familyList.half;

  getJson(studenturl, prepareObjects);
}

function buildList() {
  let currentList = filterStudents(settings.filter, settings.filterType);
  currentList = sortStudents(settings.sortBy);
  displayList(currentList);
}

function expelStudent(student) {
  const allStudents = HTML.allStudents;
  const expelledArray = HTML.expelledStudentList;
  expelledArray.push(student);
  console.log(HTML.expelledStudentList);
  const index = allStudents.indexOf(student);
  allStudents.splice(index, 1);
  console.log("expel");
  buildList();
}

function setFilterButton() {
  settings.filter = this.dataset.filter;
  settings.filterType = this.dataset.type;
  buildList();
}

function setShowButton() {
  // settings.filter = this.dataset.filter;
  // settings.filterType = this.dataset.type;
  buildList();
}

function setSortValue() {
  //TO DO: get the value(s) from the sort button clicked on
  // ==> what to sort on
  // ==> which direction

  const sortBy = this.dataset.sort;
  settings.sortBy = sortBy;

  const sortDir = this.dataset.sortDirection;
  settings.sortDir = sortDir;

  toggleSortArrows(sortBy);
}

function toggleSortArrows(sortBy) {
  //TO DO: Receive button and direction values
  //if this button is not already sorted, set button values on every sort button to "sort" (call a clear function)
  //set clicked button to "sorted"
  // if already sorted and direction is set to "asc", set diretion to "desc" - else set direction to asc

  let sortName = document.querySelector(`[data-sort="${sortBy}"]`);
  if (sortName.dataset.action === "sort") {
    clearAllSort();
    sortName.dataset.action = "sorted";
  } else {
    if (sortName.dataset.sortDirection === "asc") {
      sortName.dataset.sortDirection = "desc";
      settings.sortDir = "desc";
    } else {
      sortName.dataset.sortDirection = "asc";
      settings.sortDir = "asc";
    }
  }
  buildList();
}

function sortStudents(sortBy) {
  //Sort array using a compare function
  let sortName = document.querySelector(`[data-sort="${sortBy}"]`);
  const sortList = HTML.currentStudentList.sort(compareFunction);

  function compareFunction(a, b) {
    if (sortName.dataset.sortDirection == "asc") {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a[sortBy] > b[sortBy]) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  return sortList;
  // filterStudents(button, type);
}

function clearAllSort() {
  // set all buttons to "sort" instead of "sorted"

  document.querySelectorAll(`[data-action="sorted"]`).forEach(botton => {
    botton.dataset.action = "sort";
  });
}

function filterStudents(filter, type) {
  if (settings.filter === "expelled") {
    console.log("expelled");
    const result = HTML.expelledStudentList;
    HTML.currentStudentList = result;
    return result;
  } else if (settings.filter === "searching") {
    const result = HTML.currentStudentList;
    return result;
  } else {
    const result = HTML.allStudents.filter(filterFunction);
    HTML.currentStudentList = result;
    return result;
  }
  // console.log(filter);
  function filterFunction(student) {
    const filterType = student[type];
    if (filterType == filter) {
      return true;
    } else if (filter === "*") {
      return true;
    }
  }
}

async function getJson(url, callback) {
  let jsonData = await fetch(url);
  let jsonObjects = await jsonData.json();
  // showList();
  // themeSelector();
  // prepareObjects(jsonObjects);

  callback(jsonObjects);
}

function prepareObjects(jsonObjects) {
  jsonObjects.forEach(jsonObject => {
    const student = Object.create(Student);
    HTML.allStudents.push(student);

    const fullName = jsonObject.fullname;
    let house = jsonObject.house;
    const houseToLowerCase = house.toLowerCase();
    house = houseToLowerCase.trim();
    house = house.charAt(0).toUpperCase() + house.slice(1);
    const fullNameToLowerCase = fullName.toLowerCase();
    let trimFullName = fullNameToLowerCase.trim();
    const search = '"';
    const indexOfFirst = trimFullName.indexOf(search);
    const hyphenSplit = trimFullName.split("-");
    let fullNameHyphen;
    if (trimFullName.includes("-") == true) {
      fullNameHyphen = hyphenSplit[1].charAt(0).toUpperCase() + hyphenSplit[1].slice(1);
      hyphenSplit[1] = "-" + fullNameHyphen;
    }
    const fullNameJoined = hyphenSplit.join();
    trimFullName = fullNameJoined.replace(",", "");
    const indexOfLast = trimFullName.lastIndexOf(search);
    const nickNameSubstring = trimFullName.substring(indexOfFirst - 1, indexOfLast + 1);
    const nickNameTrimmed = nickNameSubstring.replace(/"/g, "").trim();
    const fullNameWithoutNickName = trimFullName.replace(nickNameSubstring, "");
    const fullNameSplit = fullNameWithoutNickName.split(" ");
    const fullNameArray = [];
    for (let i = 0; i < fullNameSplit.length; i++) {
      fullNameSplit[i].charAt(0).toUpperCase() + fullNameSplit[i].slice(1);
      fullNameArray.push(fullNameSplit[i].charAt(0).toUpperCase() + fullNameSplit[i].slice(1));
    }
    const firstName = fullNameArray[0];
    let lastName;
    if (fullNameArray.length > 1) {
      lastName = fullNameArray[fullNameArray.length - 1];
    } else {
      lastName = "";
    }
    fullNameArray.pop();
    fullNameArray.shift();
    const middleNameJoin = fullNameArray.join();
    const middleName = middleNameJoin.replace(",", " ");
    const nickName = nickNameTrimmed.charAt(0).toUpperCase() + nickNameTrimmed.slice(1);

    student.image = displayImage(firstName, lastName);
    student.firstname = firstName;
    student.lastname = lastName;
    student.middlename = middleName;
    student.nickname = nickName;
    student.bloodStatus = bloodStatus();
    function bloodStatus() {
      function checkBlood(list) {
        return student.lastname == list;
      }
      const pure = HTML.pureBlood.some(checkBlood);
      const half = HTML.halfBlood.some(checkBlood);
      if (pure && half) {
        return "Pureblood";
      } else if (pure) {
        return "Pureblood";
      } else if (half) {
        return "Halfblood";
      } else {
        return "Muggle-born";
      }
    }
    student.house = house.toLowerCase();
    if (student.middlename === "") {
      delete student.middlename;
    }
    if (student.nickname === "") {
      delete student.nickname;
    }
    if (student.lastname === "") {
      delete student.lastName;
    }
    //console.log(student);

    if (student.house === "slytherin" || student.bloodStatus === "Pureblood") {
      student.inq_squad = Student.inq_squad;
    }
    displayList(HTML.allStudents);
  });
}
document.querySelector("#search_text").addEventListener("input", searchFunction);

function searchFunction() {
  console.log("SearchFunction");
  const inputField = document.querySelector("#search_text");
  const inputValue = inputField.value;
  console.log(HTML.allStudents.firstname);
  inputValue.toLowerCase();
  HTML.currentStudentList = [];
  settings.filter = "searching";
  HTML.allStudents.forEach(searching);

  function searching(student) {
    console.log(` Hej ${inputValue}`);
    const firstNameLowerCase = student.firstname.toLowerCase();
    const firstNameUpperCase = student.firstname.toUpperCase();
    const lastNameLowerCase = student.firstname.toLowerCase();
    const lastNameUpperCase = student.firstname.toUpperCase();

    if (
      firstNameLowerCase.includes(inputValue) ||
      student.firstname.includes(inputValue) ||
      firstNameUpperCase.includes(inputValue) ||
      lastNameLowerCase.includes(inputValue) ||
      student.lastname.includes(inputValue) ||
      lastNameUpperCase.includes(inputValue)
    ) {
      HTML.currentStudentList.push(student);
      console.log(HTML.currentStudentList);
      buildList();
    }
  }
}

function displayImage(firstname, lastname) {
  const lastName = lastname.toLowerCase();
  let firstName = firstname[0].toLowerCase();
  if (firstname === "Padma") {
    firstName = "padme";
  } else if (firstname === "Parvati") {
    firstName = "parvati";
  }
  let filename = `${lastName}_${firstName}`;

  return filename;
}

function displayList(student) {
  document.querySelector("#list").innerHTML = "";
  student.forEach(displayStudent);
}

function displayStudent(student) {
  //create clone
  const clone = HTML.temp.content.cloneNode(true);
  //set clone data
  clone.querySelector(".name").textContent = student.firstname + " " + student.lastname;
  clone.querySelector(".house").textContent = student.house;

  // TODO: Show prefect add and remove button
  // TODO addEventlisteners to button
  clone.querySelector(".item").addEventListener("click", function clickList() {
    showSingle(student);
    themeSelector(student);
    clone.querySelectorAll(".item").forEach(elm => {
      elm.removeEventListener("click", clickList);
    });
  });

  //append clone to list
  HTML.list.appendChild(clone);
}

function showSingle(student) {
  document.querySelector("#popup").style.display = "flex";
  document.querySelector("#popup .close").addEventListener("click", closeSingle);
  document.querySelector(".fullname").textContent = student.firstname + " " + student.nickname + " " + student.middlename + " " + student.lastname;
  document.querySelector(".bloodstatus").textContent = student.bloodStatus;
  document.querySelector(".image").src = `images/${student.image}.png`;
  document.querySelector(".house").textContent = student.house;
  document.querySelector(".expel").addEventListener("click", function expel() {
    closeSingle();
    document.querySelector(".expel").removeEventListener("click", expel);
    setTimeout(() => {
      expelStudent(student);
    }, 1000);
  });

  squadHandler(student);
}

function squadHandler(student) {
  if (student.hasOwnProperty("inq_squad") === true) {
    document.querySelector("[data-field=inqSquad]").style.display = "inline-block";
    console.log("Hejhej");

    if (student.inq_squad == true) {
      document.querySelector("[data-field=inqSquad]").textContent = "Remove from the inquisitorial squad";
    } else {
      console.log("hej");
      document.querySelector("[data-field=inqSquad]").textContent = "Add to the inquisitorial squad";
    }
    document.querySelector(`[data-field="inqSquad"]`).addEventListener("click", function clickSquad() {
      document.querySelector(`[data-field="inqSquad"]`).removeEventListener("click", clickSquad);
      squadToggle(student);
    });
  } else {
    document.querySelector("[data-field=inqSquad]").style.display = "none";
  }
}

function squadToggle(student) {
  if (student.inq_squad == true) {
    student.inq_squad = false;
    console.log("false");
  } else {
    student.inq_squad = true;
  }

  showSingle(student);
}

function closeSingle() {
  document.querySelector("#popup").style.display = "none";
}

function themeSelector(student) {
  document.querySelector(".content").dataset.selected = student.house.toLowerCase();
  document.querySelector(".close").dataset.selected = student.house.toLowerCase();
  document.querySelector(".crest").src = `crests/${student.house.toLowerCase()}.png`;
}
