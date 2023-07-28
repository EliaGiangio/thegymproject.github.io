//define Gym object
function Gym(name, street, number, city, type, startTime, endTime, price, bookings) {
  if (name) { this.name = name } else { this.name = street + " " + type };
  this.address = street +" "+ number +" "+ city ;
  this.type = type;
  this.startTime = startTime;
  this.endTime = endTime;
  this.price = "€" + price;
  this.bookings = bookings;
};

//logic for user login

let loggedIn = localStorage.getItem('loggedIn') === 'true';
let loginButton = document.getElementById("login");

function login(){
  if (!loggedIn){
    loggedIn = true
    localStorage.setItem('loggedIn', 'true');
    document.getElementById("new-user").style.display = "none";
    document.getElementById("logged-user").style.display = "";
    updateDeleteButtonsVisibility()

  } else {
    loggedIn = false
    localStorage.setItem('loggedIn', 'false');
    document.getElementById("new-user").style.display = "";
    document.getElementById("logged-user").style.display = "none";
    updateDeleteButtonsVisibility()
  }
}

function updateDeleteButtonsVisibility() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  if (loggedIn) {
    deleteButtons.forEach(button => button.style.display = "block");
  } else {
    deleteButtons.forEach(button => button.style.display = "none");
  }
}
loginButton.addEventListener("change", function(){login()});

// set up for manipulating the data in Local storage
let savedData = localStorage.getItem('data');
let data = savedData ? JSON.parse(savedData) : []; // Initialize data if it doesn't exist

// create some instances of Gym for test cases
document.addEventListener("DOMContentLoaded",
  initializeGyms(),
  localStorage.setItem('loggedIn', 'false')
);

function initializeGyms() {
  // create some instances of Gym for test cases
  let weightsAndEstates = new Gym('Weights And Estates',
    "Aurikelstraat",
    "61",
    "Amsterdam",
    "Weightlifting",
    "9",
    "15",
    "5"
    )

  let dutchStrength = new Gym("Dutch Strength",
    "Hobbemakade",
    "104",
    "Amsterdam",
    "Weightlifting",
    "9",
    "15",
    "5"
    )

  let RCF020 = new Gym("020",
    "Hoogoorddreef",
    "3",
    "Amsterdam",
    "Crossfit",
    "9",
    "15",
    "5"
    )

  // Check if data array is empty before adding gyms
  if (data.length == 0) {
    data.push(weightsAndEstates);
    data.push(dutchStrength);
    data.push(RCF020);

    localStorage.setItem('data', JSON.stringify(data));
  }
}

//initialize homepage map
var generalMap = L.map('map').setView([52.3676, 4.9041], 10.5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(generalMap);

//initialize gym page map
var singleMap = L.map('map1').setView([52.3676, 4.9041], 11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(singleMap);

//create a new gym
let form = document.getElementById("gymform");
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let fd = new FormData(form);
  let newGym = new Gym(
    fd.get('name'),
    fd.get('street'),
    fd.get('street-number'),
    fd.get('city'),
    fd.get('type'),
    fd.get('start-time'),
    fd.get('end-time'),
    fd.get('price')
  )
  document.getElementById("gymform").reset();
  location.reload();
  // Add a new object to the data array
  data.push(newGym);
  // Save the updated data to localStorage (as string)
  localStorage.setItem('data', JSON.stringify(data));
})

// iterate trough "data" in order to make a list appear on the homepage and link every element to its own page.
var selectedDate;
let latitude;
let longitude;
let gym;
let gymsList = document.getElementById("gyms");
for (let y = 0; y < data.length; y++) {
  let gym = data[y];
  let gymItem = document.createElement("li");
  let gymLink = document.createElement("a");
  let gymName = document.createTextNode(gym.name);
  let gymAddress = document.createElement("p");
  let gymType = document.createElement("h3");
  let gymPrice = document.createElement("p");

  //create list AND add ID to every link
  gymLink.href = "gym.html?id=" + y;
  gymType.textContent = gym.type;
  gymAddress.textContent = gym.address;
  gymPrice.textContent = gym.price + " per hour";
  gymItem.appendChild(gymType);
  gymLink.appendChild(gymName);
  gymItem.appendChild(gymLink);
  gymItem.appendChild(gymAddress);
  gymItem.appendChild(gymType);
  gymItem.appendChild(gymPrice);
  gymsList.appendChild(gymItem);

  let deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.innerHTML = "Delete";
  gymItem.appendChild(deleteButton);
  let buttons = document.getElementsByClassName("delete-button");
  for (l = 0; l < buttons.length; l++){
      buttons[l].style.display = "none"
  } 

  // Event listener for delete button
  deleteButton.addEventListener("click", function () {
    deleteGym(y);
    gymsList.removeChild(gymItem);
    location.reload();
  });
  
  //obtain coordinates of each gym
    var requestOptions = {
      method: 'GET',
    };
    fetch("https://api.geoapify.com/v1/geocode/search?text="+gym.address+"&apiKey=b2a84fb0fbc3485a95c5328fff28dff5", requestOptions)
      .then(response => response.json())
      .then(result => {
        // Get the first feature from the response
        const feature = result.features[0];
        if (feature) {
          const lon = feature.properties.lon;
          const lat = feature.properties.lat;
          // Create a map marker using the coordinates
          L.marker([lat, lon]).addTo(generalMap).bindPopup(gym.name);
        }
      })
      .catch(error => console.log('error', error));
}

// using the if statement on "details-container" to make sure that only gym.html will have the following features
//get the data to display from the "id"
if (document.getElementById("details-container")) {
  const urlParams = new URLSearchParams(window.location.search);
  const gymId = urlParams.get('id');
  const selectedGym = data[gymId];
  if (selectedGym.bookings == null) { selectedGym.bookings = [] };


  // Update the HTML elements with the gym details
  document.getElementById("nameofgym").innerHTML = selectedGym.name;
  document.getElementById("address").innerHTML = selectedGym.address;
  document.getElementById("type").innerHTML = selectedGym.type;

    //obtain coordinates of each gym
    var requestOptions = {
      method: 'GET',
    };
    fetch("https://api.geoapify.com/v1/geocode/search?text="+selectedGym.address+"&apiKey=b2a84fb0fbc3485a95c5328fff28dff5", requestOptions)
      .then(response => response.json())
      .then(result => {
        // Get the first feature from the response
        const feature = result.features[0];
        if (feature) {
          const lon = feature.properties.lon;
          const lat = feature.properties.lat;
          // Create a map marker using the coordinates
          L.marker([lat, lon]).addTo(singleMap).bindPopup(selectedGym.name).openPopup();
        }
      })
      .catch(error => console.log('error', error));

  //Edit
  let editForm = document.getElementById("gymform-edit")
  editForm.addEventListener('submit', (u) => {
    u.preventDefault();
    let fdn = new FormData(editForm);
    if (fdn.get("name-update").length !== 0) { selectedGym.name = fdn.get("name-update") }
    if (fdn.get("street-update").length !== 0) { selectedGym.street = fdn.get("street-update") }
    if (fdn.get("street-number-update").length !== 0) { selectedGym.number = fdn.get("street-number-update") }
    if (fdn.get("city-update").length !== 0) { selectedGym.city = fdn.get("city-update") }
    if (fdn.get("type-update") != null && fdn.get("type-update").length !== 0) { selectedGym.type = fdn.get("type-update") }
    if (fdn.get("start-time-update").length !== 0) { selectedGym.startTime = fdn.get("start-time-update") }
    if (fdn.get("end-time-update").length !== 0) { selectedGym.endTime = fdn.get("end-time-update") }
    if (fdn.get("price-update").length !== 0) { selectedGym.price = fdn.get("price-update") }

    let street = fdn.get("street-update");
    let number = fdn.get("street-number-update");
    let city = fdn.get("city-update");
    if (street && number && city) {
      selectedGym.address = street + " " + number + " " + city;}

    // Save the updated data to localStorage (as string)
    localStorage.setItem('data', JSON.stringify(data));
  })

  //CALENDAR
  let nextMonth = document.getElementById("next")
  let pastMonth = document.getElementById("past")
  let option1 = [...Array(31).keys()];
  let option2 = [...Array(30).keys()];
  let option3 = [...Array(28).keys()];
  let month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const d = new Date();
  let counter = 0;

  // Initial calendar rendering
  updateCalendar();

  function updateCalendar() {
    //Make sure that when the month changes the cells get cleaned and repopulated with the new month's days
    let tbl = document.getElementById("calendar-body");
    tbl.innerHTML = "";

    //Initialize Months/Year and make sure that by ending the year and going to next month it starts back from January
    const year = 2023;
    const monthIndex = (d.getMonth() + counter + 12) % 12;
    selectedMonth = month[monthIndex];
    document.getElementById("user-month").innerHTML = selectedMonth + " " + 2023;
    let firstDay = (new Date(year, monthIndex)).getDay();

    //Logic to declare the lenght of each month
    let daysInMonth;
    if (monthIndex === 1) {
      daysInMonth = option3.length;
    } else if ([3, 5, 8, 10].includes(monthIndex)) {
      daysInMonth = option2.length;
    } else {
      daysInMonth = option1.length;
    }

    //Logic to create cells with days and make sure that they are ordered based on the days of the week
    let date = 1;
    for (let i = 0; i < 6; i++) {
      let row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          let cell = document.createElement("td");
          let cellText = document.createTextNode("");
          cell.appendChild(cellText);
          row.appendChild(cell);
        }
        else if (date > daysInMonth) {
          break;
        }
        else {
          let cell = document.createElement("td");
          let cellText = document.createTextNode(date);
          cell.appendChild(cellText);
          row.appendChild(cell);
          date++;
          cell.addEventListener("click", function () {
            selectedDate = cell.textContent;
            dateSelection(selectedDate)
          })
          cell.addEventListener("click", (event) => { event.target.style.background = "#46c230" })
          cell.addEventListener("mouseover", (event) => { event.target.style.background = "#50b3eb" })
          cell.addEventListener("mouseout", (event) => { event.target.style.background = ""; })

        }
        tbl.appendChild(row);
      }
    }
  }

  // Buttons for next and previous month
  nextMonth.addEventListener("click", function () {
    counter++;
    updateCalendar();
  });
  pastMonth.addEventListener("click", function () {
    counter--;
    updateCalendar();
  });

  //CLOCK
  let startTimeBooking = Number(selectedGym.startTime);
  let endTimeBooking = Number(selectedGym.endTime);

  document.getElementById("availability").innerHTML = "The facility will be available from " + startTimeBooking + ":00" + " to " + (endTimeBooking + 3) + ":00";

  const arrayRange = (start, stop, step) => {
    //Logic created so "step" could be 0.5, this was not implemented yet casue converting number with decimal to time is a bit messy
    const length = Math.floor((stop - start) / step) + 1;
    return Array.from({ length }, (value, index) => start + index * step);
  };
  let example_array = arrayRange(startTimeBooking, endTimeBooking, 1)

  var select = document.getElementById("time-selector");
  for (index in example_array) {
    select.options[select.options.length] = new Option(example_array[index]);
  }

  //BOOKING
  var t = document.getElementById("time-selector");
  var tText = t.options[t.selectedIndex].text;
  var s = document.getElementById("timeframe");
  var sText = s.options[s.selectedIndex].text;
  document.getElementById("booking-card").hidden = true

  function dateSelection(x) {
    document.getElementById("booking-date").innerHTML = "Date: " + x + " " + selectedMonth + " 2023";
    document.getElementById("booking-card").hidden = false
  };

  function timeSelection() {
    var tValue = parseInt(t.value);
    var sValue = parseInt(s.value);
    document.getElementById("booking-time").innerHTML = "Time slot: from " + tValue + ":00" + " to " + (tValue + sValue) + ":00";
  }

  function bookingConfirmation() {
    var tValue = parseInt(t.value);
    var sValue = parseInt(s.value);
    console.log(selectedMonth)
    selectedGym.bookings.push([selectedDate, selectedMonth, tValue, tValue + sValue])
    localStorage.setItem('data', JSON.stringify(data));
    document.getElementById("confirmation-text").innerHTML = "Your booking has been confirmed! Booking number:" + selectedGym.bookings.length;
    document.getElementById("confirmation-card").style.display = "block";
  }

 //Make a list of the bookings for a specific gym in order to delete them if needed
  let bookingList = document.getElementById("booking-list");
  if (selectedGym.bookings.length > 0) {
    document.getElementById("booking-list-title").style.display = "block";
    for (let b = 0; b < selectedGym.bookings.length; b++) {
      let booking = selectedGym.bookings[b];
      let bookingItem = document.createElement("li");
      let bookingName = document.createTextNode(booking[0] + " " + booking[1] + " from " + booking[2] + ":00 till " + booking[3] +":00");
      let deleteBookingButton = document.createElement("button");
      deleteBookingButton.setAttribute("id", "booking-delete-button")
      deleteBookingButton.innerHTML = "X";
      bookingItem.appendChild(bookingName)
      bookingItem.appendChild(deleteBookingButton)
      bookingList.appendChild(bookingItem);
      deleteBookingButton.addEventListener("click", function() {
        deleteBooking(b);
        bookingList.removeChild(bookingItem);
      });}

      function deleteBooking(index) {
        console.log(index)
        selectedGym.bookings.splice(index, 1); 
        localStorage.setItem("data", JSON.stringify(data));
      }
  }
}

// Function to delete a gym from local storage
function deleteGym(index) {
  data.splice(index, 1); // Remove the gym object from the data array

  // Update local storage with the modified data
  localStorage.setItem("data", JSON.stringify(data));
}

//delete created elements from Local Storage (not the 3 initialized gyms)
function clearStorage() {
  localStorage.clear();
  location.reload()
};




   