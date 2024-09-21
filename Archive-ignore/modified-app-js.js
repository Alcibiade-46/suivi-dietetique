document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('health-form');
    const exportButton = document.getElementById('export-data');
    const mealStatusButtons = document.querySelectorAll('#meal-status button');
    const waterGoalButton = document.getElementById('water-goal');
    const activitySlider = document.getElementById('activity-time');
    const activityValue = document.getElementById('activity-value');

    document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
    document.getElementById('reset-data').addEventListener('click', resetData);
    
    form.addEventListener('submit', saveData);
    exportButton.addEventListener('click', exportData);
    
    mealStatusButtons.forEach(button => {
        button.addEventListener('click', () => {
            mealStatusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    waterGoalButton.addEventListener('click', () => {
        waterGoalButton.classList.toggle('active');
    });
    
    activitySlider.addEventListener('input', () => {
        activityValue.textContent = activitySlider.value;
    });
    
    renderWeeklyCalendar();
    updateMonthlyStats();
});

let healthData = JSON.parse(localStorage.getItem('healthData')) || {};
let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

function changeWeek(offset) {
    currentWeekStart.setDate(currentWeekStart.getDate() + offset * 7);
    renderWeeklyCalendar();
    updateMonthlyStats();
}

function renderWeeklyCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    document.getElementById('current-week').textContent = `${currentWeekStart.toLocaleDateString()} - ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = `
            <div class="date">${date.toLocaleDateString('default', { weekday: 'short' })} ${date.getDate()}</div>
            <div class="icons">
                <i class="fas fa-utensils ${getMealIconClass(dateString)}"></i>
                <i class="fas fa-tint ${getWaterIconClass(dateString)}"></i>
                <i class="fas fa-running ${getActivityIconClass(dateString)}"></i>
            </div>
        `;

        dayEl.addEventListener('click', () => {
            document.getElementById('selected-date').value = dateString;
            fillFormWithData(dateString);
        });

        calendarEl.appendChild(dayEl);
    }
}

// Reste du code inchangé...

// Assurez-vous que ces fonctions sont appelées au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderWeeklyCalendar();
    updateMonthlyStats();
    checkTrends();
});
