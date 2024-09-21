let healthData = JSON.parse(localStorage.getItem('healthData')) || {};
let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - (currentWeekStart.getDay() + 6) % 7);
let currentMonthStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);

// Hardcoded password (in a real application, this should be handled securely on a server)
const CORRECT_PASSWORD = 'alci';

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const passwordInput = document.getElementById('password-input');

    loginButton.addEventListener('click', attemptLogin);
    logoutButton.addEventListener('click', logout);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            attemptLogin();
        }
    });

    if (localStorage.getItem('isLoggedIn') === 'true') {
        showApp();
    } else {
        showLogin();
    }

    function attemptLogin() {
        const password = passwordInput.value;
        if (password === CORRECT_PASSWORD) {
            localStorage.setItem('isLoggedIn', 'true');
            showApp();
        } else {
            alert('Mot de passe incorrect. Veuillez réessayer.');
        }
    }

    function logout() {
        localStorage.removeItem('isLoggedIn');
        showLogin();
    }

    function showLogin() {
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }

    function showApp() {
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        initializeApp();
    }

    function initializeApp() {
        const form = document.getElementById('health-form');
        const exportButton = document.getElementById('export-data');
        const resetButton = document.getElementById('reset-data');
        const mealStatusButtons = document.querySelectorAll('#meal-status button');
        const waterGoalButton = document.getElementById('water-goal');
        const activitySlider = document.getElementById('activity-time');
        const activityValue = document.getElementById('activity-value');

        document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
        
        form.addEventListener('submit', saveData);
        exportButton.addEventListener('click', exportData);
        resetButton.addEventListener('click', resetData);
        
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
        checkTrends();
    }
});
function changeWeek(offset) {
    currentWeekStart.setDate(currentWeekStart.getDate() + offset * 7);
    currentMonthStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
    renderWeeklyCalendar();
    updateMonthlyStats();
}

function renderWeeklyCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    const weekEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    document.getElementById('current-week').textContent = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = `
            <div class="date">${formatDate(date, true)}</div>
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

function formatDate(date, short = false) {
    const options = short 
        ? { weekday: 'short', day: 'numeric' }
        : { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

function saveData(event) {
    event.preventDefault();
    const date = document.getElementById('selected-date').value;
    const mealStatus = document.querySelector('#meal-status button.active')?.dataset.value;
    const waterGoal = document.getElementById('water-goal').classList.contains('active');
    const activityTime = document.getElementById('activity-time').value;

    if (!date || !mealStatus) {
        showNotification('Veuillez sélectionner une date et un statut de repas.', 'warning');
        return;
    }

    healthData[date] = {
        mealStatus: parseInt(mealStatus),
        waterGoal,
        activityTime: parseInt(activityTime)
    };

    localStorage.setItem('healthData', JSON.stringify(healthData));
    showNotification('Données enregistrées avec succès !', 'success');
    renderWeeklyCalendar();
    updateMonthlyStats();
}

function exportData() {
    console.log("Fonction exportData() appelée");
    
    let exportData = [['Date', 'Repas', 'Eau', 'Activite (min)']];
    console.log("healthData:", healthData);
    
    for (let date in healthData) {
        exportData.push([
            date,
            healthData[date].mealStatus,
            healthData[date].waterGoal ? 'Oui' : 'Non',
            healthData[date].activityTime
        ]);
    }

    console.log("Données à exporter:", exportData);

        // Créer un contenu XLS
        let xlsContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Feuille1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>';
    
        exportData.forEach(row => {
            xlsContent += '<tr>';
            row.forEach(cell => {
                xlsContent += `<td>${cell}</td>`;
            });
            xlsContent += '</tr>';
        });
        
        xlsContent += '</table></body></html>';
    
        // Créer un Blob avec le contenu XLS
        const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
    
        // Créer un lien de téléchargement et cliquer dessus
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "suivi_sante.xls");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Exportation terminée");
    }


function resetData() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) {
        healthData = {};
        localStorage.removeItem('healthData');
        renderWeeklyCalendar();
        updateMonthlyStats();
        showNotification('Toutes les données ont été réinitialisées.', 'info');
    }
}

function updateMonthlyStats() {
    const statsEl = document.getElementById('monthly-stats');
    if (!statsEl) {
        console.error("L'élément monthly-stats n'a pas été trouvé.");
        return;
    }

    const monthStart = new Date(currentMonthStart);
    const monthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0);
    
    let totalMeals = 0;
    let totalWaterGoals = 0;
    let totalActivity = 0;
    let daysTracked = 0;
    
    for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];
        
        if (healthData[dateString]) {
            totalMeals += healthData[dateString].mealStatus;
            totalWaterGoals += healthData[dateString].waterGoal ? 1 : 0;
            totalActivity += healthData[dateString].activityTime;
            daysTracked++;
        }
    }
    
    const avgMeals = daysTracked > 0 ? (totalMeals / daysTracked).toFixed(1) : '0.0';
    const avgWaterGoals = daysTracked > 0 ? (totalWaterGoals / daysTracked * 100).toFixed(1) : '0.0';
    const avgActivity = daysTracked > 0 ? (totalActivity / daysTracked).toFixed(0) : '0';
    
    statsEl.innerHTML = `
        <div class="stat-card">
            <h3>Moyenne des repas suivis</h3>
            <p>${avgMeals} / 2</p>
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

function getMealIconClass(date) {
    if (!healthData[date]) return 'neutral';
    const status = healthData[date].mealStatus;
    if (status === 2) return 'success';
    if (status === 1) return 'warning';
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
        document.getElementById('water-goal').classList.toggle('active', data.waterGoal);
        document.getElementById('activity-time').value = data.activityTime;
        document.getElementById('activity-value').textContent = data.activityTime;
    } else {
        document.querySelectorAll('#meal-status button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById('water-goal').classList.remove('active');
        document.getElementById('activity-time').value = 0;
        document.getElementById('activity-value').textContent = '0';
    }
}

function showNotification(message, type) {
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

function checkTrends() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    let mealTrend = 0;
    let waterTrend = 0;
    let activityTrend = 0;
    let daysTracked = 0;
    
    for (let date in healthData) {
        const entryDate = new Date(date);
        if (entryDate >= lastMonth && entryDate <= today) {
            mealTrend += healthData[date].mealStatus;
            waterTrend += healthData[date].waterGoal ? 1 : 0;
            activityTrend += healthData[date].activityTime;
            daysTracked++;
        }
    }
    
    const trends = [];
    if (daysTracked > 0) {
        const avgMeals = mealTrend / daysTracked;
        const avgWater = waterTrend / daysTracked;
        const avgActivity = activityTrend / daysTracked;

        if (avgMeals >= 1.5) trends.push("Excellent mois pour les repas !");
        if (avgWater >= 0.8) trends.push("Vous atteignez régulièrement votre objectif d'eau !");
        if (avgActivity >= 30) trends.push("Vous êtes très actif ce mois-ci !");
    }
    
    if (trends.length > 0) {
        showNotification(trends.join(" "), 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderWeeklyCalendar();
    updateMonthlyStats();
    checkTrends();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/suivi-dietetique/service-worker.js', {scope: '/suivi-dietetique/'}).then(registration => {
        console.log('ServiceWorker registered: ', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'skipWaiting' });
            }
          });
        });
      }).catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    });
}