let healthData = JSON.parse(localStorage.getItem('healthData')) || {};
let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('health-form');
    const exportButton = document.getElementById('export-data');
    const mealStatusButtons = document.querySelectorAll('#meal-status button');
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
    
    activitySlider.addEventListener('input', () => {
        activityValue.textContent = activitySlider.value;
    });
    
    renderCalendar();
    updateWeeklyStats();
});

function changeWeek(offset) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (offset * 7));
    renderCalendar();
}

function saveData(event) {
    event.preventDefault();
    const date = document.getElementById('selected-date').value;
    const mealStatus = document.querySelector('#meal-status button.active').dataset.value;
    const waterGoal = document.getElementById('water-goal').checked;
    const activityTime = document.getElementById('activity-time').value;

    healthData[date] = {
        mealStatus: parseInt(mealStatus),
        waterGoal,
        activityTime: parseInt(activityTime)
    };

    localStorage.setItem('healthData', JSON.stringify(healthData));
    alert('Données enregistrées !');
    renderCalendar();
    updateWeeklyStats();
}

function exportData() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
        Object.entries(healthData).map(([date, data]) => ({
            Date: date,
            'Repas suivis': data.mealStatus,
            'Objectif eau atteint': data.waterGoal ? 'Oui' : 'Non',
            'Temps d activite (min)': data.activityTime
        }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suivi Santé");
    XLSX.writeFile(workbook, "suivi_sante.xlsx");
}

function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = '';
    
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = `
            <div class="date">${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()]}</div>
            <div>${date.getDate()}</div>
            <div class="icons">
                <i class="fas fa-utensils ${getMealIconClass(dateString)}"></i>
                <i class="fas fa-glass-water ${getWaterIconClass(dateString)}"></i>
                <i class="fas fa-bicycle ${getActivityIconClass(dateString)}"></i>
            </div>
        `;

        dayEl.addEventListener('click', () => {
            document.getElementById('selected-date').valueAsDate = date;
            fillFormWithData(dateString);
        });

        calendarEl.appendChild(dayEl);
    }
}

function getMealIconClass(date) {
    if (!healthData[date]) return 'neutral';
    const status = healthData[date].mealStatus;
    if (status === 3) return 'success';
    if (status === 2) return 'warning';
    return 'danger';
}

function getWaterIconClass(date) {
    if (!healthData[date]) return 'neutral';
    return healthData[date].waterGoal ? 'success' : 'danger';
}

function getActivityIconClass(date) {
    if (!healthData[date]) return 'neutral';
    return healthData[date].activityTime > 0 ? 'success' : 'danger';
}

function fillFormWithData(date) {
    const data = healthData[date];
    if (data) {
        document.querySelectorAll('#meal-status button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value == data.mealStatus);
        });
        document.getElementById('water-goal').checked = data.waterGoal;
        document.getElementById('activity-time').value = data.activityTime;
        document.getElementById('activity-value').textContent = data.activityTime;
    } else {
        document.querySelectorAll('#meal-status button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value == '3');
        });
        document.getElementById('water-goal').checked = false;
        document.getElementById('activity-time').value = 0;
        document.getElementById('activity-value').textContent = '0';
    }
}
function updateWeeklyStats() {
    const statsEl = document.getElementById('weekly-stats');
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    
    let totalMeals = 0;
    let totalWaterGoals = 0;
    let totalActivity = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        if (healthData[dateString]) {
            totalMeals += healthData[dateString].mealStatus;
            totalWaterGoals += healthData[dateString].waterGoal ? 1 : 0;
            totalActivity += healthData[dateString].activityTime;
        }
    }
    
    const avgMeals = (totalMeals / 7).toFixed(1);
    const avgWaterGoals = (totalWaterGoals / 7 * 100).toFixed(1);
    const avgActivity = (totalActivity / 7).toFixed(0);
    
    statsEl.innerHTML = `
        <div class="stat-card">
            <h3>Moyenne des repas suivis</h3>
            <p>${avgMeals} / 3</p>
        </div>
        <div class="stat-card">
            <h3>Objectifs d'eau atteints</h3>
            <p>${avgWaterGoals}%</p>
        </div>
        <div class="stat-card">
            <h3>Moyenne d'activité quotidienne</h3>
            <p>${avgActivity} min</p>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function saveData(event) {
    event.preventDefault();
    const date = document.getElementById('selected-date').value;
    const mealStatus = document.querySelector('#meal-status button.active').dataset.value;
    const waterGoal = document.getElementById('water-goal').checked;
    const activityTime = document.getElementById('activity-time').value;

    healthData[date] = {
        mealStatus: parseInt(mealStatus),
        waterGoal,
        activityTime: parseInt(activityTime)
    };

    localStorage.setItem('healthData', JSON.stringify(healthData));
    showNotification('Données enregistrées avec succès !');
    renderCalendar();
    updateWeeklyStats();
}

function resetData() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) {
        healthData = {};
        localStorage.removeItem('healthData');
        renderCalendar();
        updateWeeklyStats();
        showNotification('Toutes les données ont été réinitialisées.', 'info');
    }
}

// Ajout d'une fonction pour vérifier et afficher les tendances
function checkTrends() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let mealTrend = 0;
    let waterTrend = 0;
    let activityTrend = 0;
    
    for (let date in healthData) {
        const entryDate = new Date(date);
        if (entryDate >= lastWeek && entryDate <= today) {
            mealTrend += healthData[date].mealStatus;
            waterTrend += healthData[date].waterGoal ? 1 : 0;
            activityTrend += healthData[date].activityTime;
        }
    }
    
    const trends = [];
    if (mealTrend >= 18) trends.push("Excellente semaine pour les repas !");
    if (waterTrend >= 6) trends.push("Vous atteignez régulièrement votre objectif d'eau !");
    if (activityTrend >= 150) trends.push("Vous êtes très actif cette semaine !");
    
    if (trends.length > 0) {
        showNotification(trends.join(" "), 'info');
    }
}

// Appel de la fonction checkTrends lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // ... (code existant)
    checkTrends();
});

// Ajout des styles pour les notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        background-color: var(--success-color);
        color: white;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
    }
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    .notification.info {
        background-color: var(--primary-color);
    }
`;
document.head.appendChild(style);