const urlParams = new URLSearchParams(window.location.search);
const day = parseInt(urlParams.get('day')); // Get day from URL and convert to integer
const monthName = urlParams.get('month');
const year = parseInt(urlParams.get('year'));

const monthsMap = {
    Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
    Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11
};

const monthIndex = monthsMap[monthName]; // Convert month name to month index (0-11)

// Get the full date for the selected day
const date = new Date(year, monthIndex, day);

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Display the date information
document.getElementById('day').textContent = day;
document.getElementById('month').textContent = `${monthName}`;
document.getElementById('year').textContent = year;
document.getElementById('weekday').textContent = dayNames[date.getDay()];

// Define the time slots for the day
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

// Define colors for each doctor
const doctorColors = {
    "Dr Belhedid Ibtissem": "#FF7F7F",
    "Dr Bensalah Meriem": "#87CEEB",
    "Dr Guerroumi Lynda": "#9370DB",
    "Dr Bouchetara Ryane": "#FFCC00",
    "Dr Keciour Nesma": "#98FB98"
};

// Function to populate the available hours blocks on the day page
function populateHours() {
    const hoursGrid = document.getElementById('hours');
    hoursGrid.innerHTML = ""; // Clear existing hours

    timeSlots.forEach(slot => {
        // Create a block container for each hour
        const hourBlock = document.createElement('div');
        hourBlock.classList.add('hour-block');

        hourBlock.innerHTML = `
            <div class="hour-label-container">
                <span class="hour-label">${slot}</span>
                <div class="hour-line"></div>
            </div>
            <div class="hour-appointments" id="appointments-${slot}"></div>
        `;

        // Append the block to the grid
        hoursGrid.appendChild(hourBlock);
    });
}

// Fetch appointments from the server
function fetchAppointments() {
    fetch('fetchAppointments.php') // Adjust the URL as necessary
        .then(response => response.json())
        .then(appointments => {
            console.log('Appointments fetched:', appointments);
            displayAppointments(appointments);
        })
        .catch(error => console.error('Error fetching appointments:', error));
}

// Display appointments filtered by doctor
// Display appointments filtered by doctor
// Display appointments filtered by doctor
// Display appointments filtered by doctor
// Display appointments filtered by doctor
function displayAppointments(appointments) {
    const selectedDoctor = document.getElementById('filters').value; // Get the selected doctor

    // Filter appointments for the selected day
    const filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.start);
        const matchesDoctor = selectedDoctor === "tous" || appointment.doctor === selectedDoctor;

        return matchesDoctor &&
               appointmentDate.getFullYear() === year &&
               appointmentDate.getMonth() === monthIndex &&
               appointmentDate.getDate() === day;
    });

    // Clear and repopulate time slots
    populateHours();

    // Iterate through the filtered appointments and add them to the correct block
    filteredAppointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.start);
        const appointmentTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Create appointment element
        const appointmentDetails = document.createElement('div');
        appointmentDetails.classList.add('appointment');
        
        // Get the doctor's color for background
        const doctorColor = doctorColors[appointment.doctor] || '#ffffff'; // Default to white if no color is found

        // Set background color based on the doctor
        appointmentDetails.style.backgroundColor = doctorColor;

        // Add appointment details
        appointmentDetails.innerHTML = `
            <div class="appointment-header">
                <div class="delete-x">x</div>
            </div>
            <div class="appointment-doctor">${appointment.doctor}</div>
            <div class="appointment-motif">${appointment.motif}</div>
            <div class="appointment-patient">${appointment.title}</div>
            <div class="appointment-phone">${appointment.phone}</div>
        `;

        // Add event listener to show delete confirmation when the "X" button is clicked
        const deleteButton = appointmentDetails.querySelector('.delete-x');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();  // Prevent the click event from bubbling up to other elements
            const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?');
            if (confirmDelete) {
                deleteAppointment(appointment.id, appointmentDetails);
            }
        });

        // Append the appointment to the corresponding hour block
        if (timeSlots.includes(appointmentTime)) {
            const appointmentSlot = document.getElementById(`appointments-${appointmentTime}`);
            appointmentSlot.appendChild(appointmentDetails);
        }
    });
}
function deleteAppointment(appointmentId, appointmentElement) {
    fetch(`deleteAppointment.php?id=${appointmentId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            appointmentElement.remove(); // Remove the appointment from the UI
            alert('Rendez-vous supprimé avec succès!');
        } else {
            alert(`Erreur: ${data.message || "Impossible de supprimer le rendez-vous."}`);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression:', error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    });
}



// Add filters for doctors
function populateFilters() {
    const filterSelect = document.getElementById('filters');
    filterSelect.innerHTML = ""; // Clear existing options

    // Add default option for all doctors
    const defaultOption = document.createElement('option');
    defaultOption.value = "tous";
    defaultOption.textContent = "Tous les Docteurs";
    filterSelect.appendChild(defaultOption);

    // Add options for each doctor
    Object.keys(doctorColors).forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor;
        option.textContent = doctor;
        filterSelect.appendChild(option);
    });

    // Add event listener for filter changes
    filterSelect.addEventListener('change', () => fetchAppointments());
}

// Initialize the page
populateHours();
populateFilters();
fetchAppointments();
