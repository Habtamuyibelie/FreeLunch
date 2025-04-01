// FreeLunch Ethiopia - Main JavaScript

// DOM Elements
const countdownEl = document.getElementById('countdown');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const loginBtn = document.getElementById('login-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const loginModal = document.getElementById('login-modal');
const dashboardModal = document.getElementById('dashboard-modal');
const closeButtons = document.querySelectorAll('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const winnersContainer = document.getElementById('winners-container');
const referralLinkInput = document.getElementById('referral-link');
const copyLinkBtn = document.getElementById('copy-link');
const subscribeBtns = document.querySelectorAll('.subscribe-btn');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
const logoutBtn = document.getElementById('logout-btn');
const withdrawalForm = document.getElementById('withdrawal-form');
const dashboardTabBtns = document.querySelectorAll('.dashboard-tab');
const availableBalanceEl = document.getElementById('available-balance');
const withdrawalHistoryContainer = document.getElementById('withdrawal-history-container');
const withdrawalSettingsForm = document.getElementById('withdrawal-settings-form');
const savedPhoneContainer = document.getElementById('saved-phone-container');
const addPhoneBtn = document.getElementById('add-phone-btn');
const newPhoneNumberInput = document.getElementById('new-phone-number');
const defaultWithdrawalAmountInput = document.getElementById('default-withdrawal-amount');
const autoFillSettingsCheckbox = document.getElementById('auto-fill-settings');

// App State
let currentUser = null;
let users = [];
let winners = [];
let nextDrawTime = null;
let savedPhoneNumbers = [];

// Add sample winners with realistic Ethiopian names
function addSampleWinners() {
    const ethiopianNames = [
        { name: "Abebe Bikila", prize: "1000 ETB", date: "2025-01-15T12:00:00Z" },
        { name: "Tigist Ketema", prize: "5000 ETB", date: "2025-01-10T12:00:00Z" },
        { name: "Dawit Haile", prize: "1000 ETB", date: "2025-01-05T12:00:00Z" },
        { name: "Hiwot Tadesse", prize: "1000 ETB", date: "2025-01-01T12:00:00Z" },
        { name: "Yonas Kebede", prize: "20000 ETB", date: "2024-12-31T12:00:00Z" },
        { name: "Meron Alemu", prize: "1000 ETB", date: "2024-12-25T12:00:00Z" },
        { name: "Kidus Tesfaye", prize: "1000 ETB", date: "2024-12-20T12:00:00Z" },
        { name: "Bethlehem Assefa", prize: "5000 ETB", date: "2024-12-15T12:00:00Z" },
        { name: "Henok Girma", prize: "1000 ETB", date: "2024-12-10T12:00:00Z" },
        { name: "Selam Mengistu", prize: "1000 ETB", date: "2024-12-05T12:00:00Z" }
    ];
    
    // Create winner records with IDs
    ethiopianNames.forEach((winner, index) => {
        winners.push({
            id: Date.now() - (index * 86400000), // Different timestamp for each winner
            userId: `sample-${index}`,
            name: winner.name,
            prize: winner.prize,
            date: winner.date,
            claimed: true // Mark as claimed so they don't affect user balance
        });
    });
    
    // Save to localStorage
    saveData();
    console.log("Added sample winners");
}

// Initialize the app
function init() {
    // Load data from localStorage
    loadData();
    
    // Add sample winners if none exist
    if (winners.length === 0) {
        addSampleWinners();
    }
    
    // Set up the next draw time (24 hours from now for demo)
    if (!nextDrawTime) {
        setNextDrawTime();
    }
    
    // Start the countdown
    startCountdown();
    
    // Display winners
    displayWinners();
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Add event listeners
    setupEventListeners();
}

// Load data from localStorage
function loadData() {
    // Load users
    const storedUsers = localStorage.getItem('freelunch_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    
    // Load winners
    const storedWinners = localStorage.getItem('freelunch_winners');
    if (storedWinners) {
        winners = JSON.parse(storedWinners);
    }
    
    // Load next draw time
    const storedDrawTime = localStorage.getItem('freelunch_next_draw');
    if (storedDrawTime) {
        nextDrawTime = new Date(storedDrawTime);
        
        // If the draw time has passed, set a new one and perform a draw
        if (nextDrawTime < new Date()) {
            performDraw();
            setNextDrawTime();
        }
    }
    
    // Load current user
    const storedUser = localStorage.getItem('freelunch_current_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('freelunch_users', JSON.stringify(users));
    localStorage.setItem('freelunch_winners', JSON.stringify(winners));
    localStorage.setItem('freelunch_next_draw', nextDrawTime.toISOString());
    
    if (currentUser) {
        localStorage.setItem('freelunch_current_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('freelunch_current_user');
    }
}

// Set the next draw time
function setNextDrawTime() {
    // For demo purposes, set the next draw to be 3 hours from now
    nextDrawTime = new Date();
    nextDrawTime.setHours(nextDrawTime.getHours() + 3);
    saveData();
}

// Start the countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const distance = nextDrawTime - now;
        
        // If the draw time has passed, perform a draw and set a new time
        if (distance < 0) {
            performDraw();
            setNextDrawTime();
            return;
        }
        
        // Calculate hours, minutes, and seconds
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update the countdown display
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Perform a random draw
function performDraw() {
    // Get all users with at least one entry
    const eligibleUsers = users.filter(user => user.entries > 0);
    
    if (eligibleUsers.length === 0) {
        console.log('No eligible users for the draw');
        return;
    }
    
    // Calculate total entries
    const totalEntries = eligibleUsers.reduce((sum, user) => sum + user.entries, 0);
    
    // Generate a random number between 1 and totalEntries
    const winningNumber = Math.floor(Math.random() * totalEntries) + 1;
    
    // Find the winner
    let entriesCount = 0;
    let winner = null;
    
    for (const user of eligibleUsers) {
        entriesCount += user.entries;
        if (entriesCount >= winningNumber) {
            winner = user;
            break;
        }
    }
    
    if (winner) {
        // Create a winner record
        const winnerRecord = {
            id: Date.now(),
            userId: winner.id,
            name: winner.name,
            prize: '1000 ETB', // Default prize for demo
            date: new Date().toISOString()
        };
        
        // Add to winners list
        winners.unshift(winnerRecord);
        
        // Keep only the last 10 winners
        if (winners.length > 10) {
            winners = winners.slice(0, 10);
        }
        
        // Save data
        saveData();
        
        // Update the winners display
        displayWinners();
        
        console.log(`Draw performed! Winner: ${winner.name}`);
    }
}

// Display winners
function displayWinners() {
    // Clear the container
    winnersContainer.innerHTML = '';
    
    if (winners.length === 0) {
        // Display a message if there are no winners yet
        winnersContainer.innerHTML = '<p class="no-winners">No winners yet. The first draw will happen soon!</p>';
        return;
    }
    
    // Add each winner to the container
    winners.forEach(winner => {
        const winnerCard = document.createElement('div');
        winnerCard.className = 'winner-card';
        
        const winnerDate = new Date(winner.date);
        const formattedDate = winnerDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        winnerCard.innerHTML = `
            <div class="winner-avatar">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="winner-info">
                <h3>${winner.name}</h3>
                <p class="winner-prize">Won ${winner.prize}</p>
                <p class="winner-date">${formattedDate}</p>
            </div>
        `;
        
        winnersContainer.appendChild(winnerCard);
    });
}

// Check if user is logged in
function checkLoginStatus() {
    if (currentUser) {
        // Update login button text
        loginBtn.textContent = 'Dashboard';
        
        // Update dashboard with user info
        updateDashboard();
        
        // Add logout button to navigation if it doesn't exist
        if (!document.getElementById('nav-logout-btn')) {
            const navLogoutBtn = document.createElement('li');
            navLogoutBtn.innerHTML = '<a href="#" id="nav-logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>';
            document.querySelector('nav ul').appendChild(navLogoutBtn);
            
            // Add event listener to the new logout button
            document.getElementById('nav-logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
    } else {
        loginBtn.textContent = 'Login';
        
        // Remove logout button from navigation if it exists
        const navLogoutBtn = document.getElementById('nav-logout-btn');
        if (navLogoutBtn) {
            navLogoutBtn.parentElement.remove();
        }
    }
}

// Logout user
function logoutUser() {
    // Clear current user
    currentUser = null;
    
    // Save data to localStorage
    saveData();
    
    // Update UI
    checkLoginStatus();
    
    // Close dashboard modal
    dashboardModal.style.display = 'none';
    
    // Close mobile menu if open
    nav.classList.remove('active');
    
    // Show feedback with a non-blocking notification
    const notification = document.createElement('div');
    notification.className = 'logout-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> You have been logged out successfully';
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Update dashboard with user info
function updateDashboard() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    
    // Update stats
    document.getElementById('entries-count').textContent = currentUser.entries || 0;
    document.getElementById('referrals-count').textContent = currentUser.referrals?.length || 0;
    document.getElementById('subscriptions-count').textContent = currentUser.subscriptions?.length || 0;
    
    // Update referral link
    const baseUrl = window.location.origin + window.location.pathname;
    referralLinkInput.value = `${baseUrl}?ref=${currentUser.id}`;
    
    // Update available balance
    if (availableBalanceEl) {
        // Initialize balance if it doesn't exist
        if (!currentUser.balance) {
            currentUser.balance = 0;
        }
        
        // Check if user has won any prizes and add to balance
        const userWinnings = winners.filter(w => w.userId === currentUser.id && !w.claimed);
        if (userWinnings.length > 0) {
            userWinnings.forEach(winning => {
                // Extract numeric value from prize string (e.g., "1000 ETB" -> 1000)
                const prizeAmount = parseInt(winning.prize.match(/\d+/)[0]);
                currentUser.balance += prizeAmount;
                winning.claimed = true;
            });
            saveData();
        }
        
        availableBalanceEl.textContent = `${currentUser.balance} ETB`;
    }
    
    // Update withdrawal history
    updateWithdrawalHistory();
    
    // Update withdrawal settings
    updateWithdrawalSettings();
}

// Update withdrawal history
function updateWithdrawalHistory() {
    if (!withdrawalHistoryContainer || !currentUser) return;
    
    // Clear the container
    withdrawalHistoryContainer.innerHTML = '';
    
    // Check if user has any withdrawals
    if (!currentUser.withdrawals || currentUser.withdrawals.length === 0) {
        withdrawalHistoryContainer.innerHTML = '<p class="no-withdrawals">No withdrawal history yet.</p>';
        return;
    }
    
    // Create a header for the withdrawal history
    const historyHeader = document.createElement('div');
    historyHeader.className = 'withdrawal-header';
    historyHeader.innerHTML = `
        <h4>Recent Transactions</h4>
        <p>Your last ${Math.min(currentUser.withdrawals.length, 5)} withdrawals</p>
    `;
    withdrawalHistoryContainer.appendChild(historyHeader);
    
    // Display withdrawals in reverse chronological order (limit to last 5)
    const recentWithdrawals = currentUser.withdrawals.slice(0, 5);
    
    recentWithdrawals.forEach(withdrawal => {
        const withdrawalItem = document.createElement('div');
        withdrawalItem.className = 'withdrawal-item';
        
        const withdrawalDate = new Date(withdrawal.date);
        const formattedDate = withdrawalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Get transaction ID or generate a placeholder
        const transactionId = withdrawal.transactionId || 'FL-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        
        withdrawalItem.innerHTML = `
            <div class="withdrawal-details ${withdrawal.paymentMethod}">
                <div class="withdrawal-main-info">
                    <p class="withdrawal-amount">${withdrawal.amount} ETB</p>
                    <p class="withdrawal-status ${withdrawal.status.toLowerCase()}">${withdrawal.status}</p>
                </div>
                <div class="withdrawal-secondary-info">
                    <p class="withdrawal-phone"><i class="fas fa-phone"></i> ${withdrawal.phoneNumber}</p>
                    <p class="withdrawal-method ${withdrawal.paymentMethod}">
                        ${withdrawal.paymentMethod === 'tellebir' 
                            ? '<i class="fas fa-mobile-alt"></i> TelleBir <span class="provider">Ethio Telecom</span>' 
                            : '<i class="fas fa-university"></i> CBEBirr <span class="provider">Commercial Bank of Ethiopia</span>'}
                    </p>
                </div>
                <div class="withdrawal-meta">
                    <p class="withdrawal-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</p>
                    <p class="withdrawal-transaction-id"><i class="fas fa-hashtag"></i> ${transactionId}</p>
                    ${withdrawal.processingTime ? `<p class="withdrawal-processing-time"><i class="fas fa-clock"></i> Processing: ${withdrawal.processingTime}</p>` : ''}
                </div>
            </div>
        `;
        
        // Add a class to the withdrawal item based on the payment method for styling
        withdrawalItem.classList.add(withdrawal.paymentMethod);
        
        withdrawalHistoryContainer.appendChild(withdrawalItem);
    });
    
    // Add a view all button if there are more than 5 withdrawals
    if (currentUser.withdrawals.length > 5) {
        const viewAllBtn = document.createElement('button');
        viewAllBtn.className = 'btn-secondary view-all-btn';
        viewAllBtn.innerHTML = '<i class="fas fa-list"></i> View All Transactions';
        viewAllBtn.addEventListener('click', function() {
            // This would typically open a full transaction history page
            alert('Full transaction history will be available in the next update!');
        });
        withdrawalHistoryContainer.appendChild(viewAllBtn);
    }
}

// Process withdrawal
function processWithdrawal(phoneNumber, amount, paymentMethod) {
    if (!currentUser) return false;
    
    // Check if user has enough balance
    if (currentUser.balance < amount) {
        alert('Insufficient balance for this withdrawal');
        return false;
    }
    
    // Check minimum withdrawal amount
    if (amount < 100) {
        alert('Minimum withdrawal amount is 100 ETB');
        return false;
    }
    
    // Validate phone number format based on payment method
    let isValidPhone = false;
    let phoneNumberError = '';
    
    // Clean the phone number for validation
    const cleanedPhone = phoneNumber.replace(/\s+/g, '');
    
    if (paymentMethod === 'tellebir') {
        // TelleBir requires Ethio Telecom numbers (starting with +251 9[1-4] or 09[1-4] or 9[1-4])
        const tellebirRegex = /^(\+251|0)?9[1-4]\d{7}$/;
        isValidPhone = tellebirRegex.test(cleanedPhone);
        phoneNumberError = 'Please enter a valid Ethio Telecom number for TelleBir (starting with 091, 092, 093, or 094)';
    } else if (paymentMethod === 'cbebirr') {
        // CBEBirr accepts both Ethio Telecom and Safaricom numbers
        const cbebirrRegex = /^(\+251|0)?9\d{8}$/;
        isValidPhone = cbebirrRegex.test(cleanedPhone);
        phoneNumberError = 'Please enter a valid Ethiopian mobile number for CBEBirr';
    }
    
    if (!isValidPhone) {
        alert(phoneNumberError);
        return false;
    }
    
    // Format phone number consistently for storage
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Create withdrawal record with more detailed information
    const withdrawal = {
        id: Date.now().toString(),
        amount: amount,
        phoneNumber: formattedPhone,
        paymentMethod: paymentMethod,
        date: new Date().toISOString(),
        status: 'Pending', // Start with pending status
        transactionId: generateTransactionId(), // Generate a unique transaction ID
        processingTime: paymentMethod === 'tellebir' ? '1-2 hours' : '1-2 business days',
        provider: paymentMethod === 'tellebir' ? 'Ethio Telecom' : 'Commercial Bank of Ethiopia'
    };
    
    // Initialize withdrawals array if it doesn't exist
    if (!currentUser.withdrawals) {
        currentUser.withdrawals = [];
    }
    
    // Add withdrawal to user's history
    currentUser.withdrawals.unshift(withdrawal);
    
    // Deduct amount from balance
    currentUser.balance -= amount;
    
    // Save data
    saveData();
    
    // Update UI
    updateDashboard();
    
    // Save the phone number for future use if it's not already saved
    if (currentUser.withdrawalSettings && 
        !currentUser.withdrawalSettings.savedPhoneNumbers.includes(formattedPhone)) {
        currentUser.withdrawalSettings.savedPhoneNumbers.push(formattedPhone);
        saveData();
        updateSavedPhoneNumbers();
    }
    
    // Simulate processing (in a real app, this would be handled by a payment gateway)
    setTimeout(() => {
        // Update the withdrawal status to completed
        withdrawal.status = 'Completed';
        saveData();
        updateWithdrawalHistory();
    }, 3000);
    
    return true;
}

// Generate a unique transaction ID for withdrawals
function generateTransactionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FL-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Format phone number consistently
function formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let digits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, remove the 0 and add +251
    if (digits.startsWith('0')) {
        digits = '251' + digits.substring(1);
    }
    
    // If it's just 9 digits (without country code), add +251
    if (digits.length === 9 && digits.startsWith('9')) {
        digits = '251' + digits;
    }
    
    // Format as +251 XX XXX XXXX
    if (digits.length === 12 && digits.startsWith('251')) {
        return `+${digits.substring(0, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`;
    }
    
    // Return original if we couldn't format it
    return phoneNumber;
}

// Update withdrawal settings
function updateWithdrawalSettings() {
    if (!currentUser) return;
    
    // Initialize withdrawal settings if they don't exist
    if (!currentUser.withdrawalSettings) {
        currentUser.withdrawalSettings = {
            defaultPaymentMethod: 'tellebir',
            savedPhoneNumbers: [],
            defaultWithdrawalAmount: 500,
            autoFill: true
        };
    }
    
    // Update UI with user's settings
    const settings = currentUser.withdrawalSettings;
    
    // Set default payment method
    if (settings.defaultPaymentMethod === 'tellebir') {
        document.getElementById('default-tellebir').checked = true;
    } else {
        document.getElementById('default-cbebirr').checked = true;
    }
    
    // Set default withdrawal amount
    if (defaultWithdrawalAmountInput) {
        defaultWithdrawalAmountInput.value = settings.defaultWithdrawalAmount || '';
    }
    
    // Set auto-fill checkbox
    if (autoFillSettingsCheckbox) {
        autoFillSettingsCheckbox.checked = settings.autoFill;
    }
    
    // Update saved phone numbers display
    updateSavedPhoneNumbers();
}

// Update saved phone numbers display
function updateSavedPhoneNumbers() {
    if (!currentUser || !savedPhoneContainer) return;
    
    // Clear the container
    savedPhoneContainer.innerHTML = '';
    
    const phoneNumbers = currentUser.withdrawalSettings.savedPhoneNumbers;
    
    if (phoneNumbers.length === 0) {
        savedPhoneContainer.innerHTML = '<p class="no-saved-phones">No saved phone numbers yet.</p>';
        return;
    }
    
    // Create a list of saved phone numbers
    const phoneList = document.createElement('div');
    phoneList.className = 'saved-phone-list';
    
    phoneNumbers.forEach(phone => {
        const phoneItem = document.createElement('div');
        phoneItem.className = 'saved-phone-item';
        
        phoneItem.innerHTML = `
            <span>${phone}</span>
            <button type="button" class="remove-phone-btn" data-phone="${phone}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        phoneList.appendChild(phoneItem);
    });
    
    savedPhoneContainer.appendChild(phoneList);
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-phone-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const phoneToRemove = this.getAttribute('data-phone');
            removePhoneNumber(phoneToRemove);
        });
    });
}

// Add a new phone number
function addPhoneNumber(phoneNumber) {
    if (!currentUser || !phoneNumber) return;
    
    // Validate phone number format for Ethiopian numbers
    const ethiopianPhoneRegex = /^\+?251 ?9\d{8}$|^0?9\d{8}$|^9\d{8}$/;
    if (!ethiopianPhoneRegex.test(phoneNumber)) {
        alert('Please enter a valid Ethiopian phone number');
        return;
    }
    
    // Check if it's a valid TelleBir or CBEBirr number
    const tellebirRegex = /^\+?251 ?9[1-4]\d{7}$|^0?9[1-4]\d{7}$|^9[1-4]\d{7}$/;
    const isTellebirCompatible = tellebirRegex.test(phoneNumber);
    
    // Show a warning if the number might not be compatible with TelleBir
    if (!isTellebirCompatible) {
        if (!confirm('This number appears to be a Safaricom number which may not work with TelleBir. It will work with CBEBirr. Continue?')) {
            return;
        }
    }
    
    // Check if phone number already exists
    if (currentUser.withdrawalSettings.savedPhoneNumbers.includes(phoneNumber)) {
        alert('This phone number is already saved');
        return;
    }
    
    // Add phone number to the list
    currentUser.withdrawalSettings.savedPhoneNumbers.push(phoneNumber);
    
    // Save data
    saveData();
    
    // Update display
    updateSavedPhoneNumbers();
    
    // Clear input field
    if (newPhoneNumberInput) {
        newPhoneNumberInput.value = '';
    }
}

// Remove a phone number
function removePhoneNumber(phoneNumber) {
    if (!currentUser || !phoneNumber) return;
    
    // Remove phone number from the list
    currentUser.withdrawalSettings.savedPhoneNumbers = 
        currentUser.withdrawalSettings.savedPhoneNumbers.filter(phone => phone !== phoneNumber);
    
    // Save data
    saveData();
    
    // Update display
    updateSavedPhoneNumbers();
}

// Save withdrawal settings
function saveWithdrawalSettings(form) {
    if (!currentUser) return;
    
    // Get form values
    const defaultPaymentMethod = form.querySelector('input[name="default-payment-method"]:checked').value;
    const defaultWithdrawalAmount = parseInt(defaultWithdrawalAmountInput.value) || 500;
    const autoFill = autoFillSettingsCheckbox.checked;
    
    // Update user settings
    currentUser.withdrawalSettings.defaultPaymentMethod = defaultPaymentMethod;
    currentUser.withdrawalSettings.defaultWithdrawalAmount = defaultWithdrawalAmount;
    currentUser.withdrawalSettings.autoFill = autoFill;
    
    // Save data
    saveData();
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'settings-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Settings saved successfully';
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
    
    return true;
}

// Apply settings to withdrawal form
function applySettingsToWithdrawalForm() {
    if (!currentUser || !currentUser.withdrawalSettings.autoFill) return;
    
    const settings = currentUser.withdrawalSettings;
    
    // Set payment method
    if (settings.defaultPaymentMethod === 'tellebir') {
        document.getElementById('tellebir').checked = true;
    } else {
        document.getElementById('cbebirr').checked = true;
    }
    
    // Set withdrawal amount
    const withdrawalAmountInput = document.getElementById('withdrawal-amount');
    if (withdrawalAmountInput && settings.defaultWithdrawalAmount) {
        withdrawalAmountInput.value = settings.defaultWithdrawalAmount;
    }
    
    // Set phone number (use the first saved number if available)
    const phoneNumberInput = document.getElementById('phone-number');
    if (phoneNumberInput && settings.savedPhoneNumbers.length > 0) {
        phoneNumberInput.value = settings.savedPhoneNumbers[0];
    }
}

// Setup event listeners
function setupEventListeners() {
    // Withdrawal settings form submit
    if (withdrawalSettingsForm) {
        withdrawalSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWithdrawalSettings(this);
        });
    }
    
    // Add phone number button
    if (addPhoneBtn) {
        addPhoneBtn.addEventListener('click', function() {
            const phoneNumber = newPhoneNumberInput.value.trim();
            if (phoneNumber) {
                addPhoneNumber(phoneNumber);
            }
        });
    }
    
    // Apply settings when withdrawal tab is opened
    const withdrawalTabBtn = document.querySelector('[data-tab="withdrawal-tab"]');
    if (withdrawalTabBtn) {
        withdrawalTabBtn.addEventListener('click', function() {
            applySettingsToWithdrawalForm();
        });
    }
    // Login button click
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (currentUser) {
            // Show dashboard if logged in
            dashboardModal.style.display = 'block';
        } else {
            // Show login modal if not logged in
            loginModal.style.display = 'block';
        }
    });
    
    // Get started button click
    getStartedBtn.addEventListener('click', function() {
        if (currentUser) {
            // Show dashboard if logged in
            dashboardModal.style.display = 'block';
        } else {
            // Show login modal with register tab active
            loginModal.style.display = 'block';
            document.querySelector('[data-tab="register-tab"]').click();
        }
    });
    
    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            dashboardModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === dashboardModal) {
            dashboardModal.style.display = 'none';
        }
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Dashboard tab switching
    dashboardTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all dashboard tab buttons and contents
            dashboardTabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#dashboard-modal .tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Login form submit
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Set current user
            currentUser = user;
            saveData();
            
            // Update UI
            checkLoginStatus();
            
            // Close login modal and show dashboard
            loginModal.style.display = 'none';
            dashboardModal.style.display = 'block';
            
            // Reset form
            loginForm.reset();
        } else {
            alert('Invalid email or password');
        }
    });
    
    // Register form submit
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phoneNumber = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Check if email is already registered
        if (users.some(u => u.email === email)) {
            alert('Email is already registered');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phoneNumber,
            password,
            entries: 5, // Give 5 free entries to new users
            balance: 0, // Initialize balance for withdrawals
            referrals: [],
            subscriptions: [],
            withdrawals: []
        };
        
        // Check if user was referred
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('ref');
        
        if (refId) {
            // Find the referrer
            const referrer = users.find(u => u.id === refId);
            
            if (referrer) {
                // Add user to referrer's referrals
                if (!referrer.referrals) {
                    referrer.referrals = [];
                }
                referrer.referrals.push(newUser.id);
                
                // Give referrer bonus entries
                referrer.entries = (referrer.entries || 0) + 3;
                
                console.log(`User ${newUser.name} was referred by ${referrer.name}`);
            }
        }
        
        // Add user to users array
        users.push(newUser);
        
        // Set as current user
        currentUser = newUser;
        
        // Save data
        saveData();
        
        // Update UI
        checkLoginStatus();
        
        // Close login modal and show dashboard
        loginModal.style.display = 'none';
        dashboardModal.style.display = 'block';
        
        // Reset form
        registerForm.reset();
    });
    
    // Copy referral link
    copyLinkBtn.addEventListener('click', function() {
        referralLinkInput.select();
        document.execCommand('copy');
        
        // Show feedback
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
    
    // YouTube channel URLs
    const youtubeChannels = {
        'habtech': 'https://www.youtube.com/@HabTechPlc',
        'comedianeshetu': 'https://www.youtube.com/@comedianeshetu',
        'etubers': 'https://www.youtube.com/@etubers',
        'chillflow': 'https://www.youtube.com/@chillflow09',
        'abelbirhanu': 'https://www.youtube.com/@abelbirhanu1',
        'editlike': 'https://www.youtube.com/@edit-like'
    };
    
    // Subscribe buttons
    subscribeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!currentUser) {
                alert('Please login to subscribe');
                return;
            }
            
            const channelId = this.getAttribute('data-channel');
            const channelUrl = youtubeChannels[channelId];
            
            if (!channelUrl) {
                alert('Channel not found');
                return;
            }
            
            // Check if already subscribed
            if (!currentUser.subscriptions) {
                currentUser.subscriptions = [];
            }
            
            if (currentUser.subscriptions.includes(channelId)) {
                alert('You are already subscribed to this channel');
                return;
            }
            
            // Open YouTube channel in a new tab
            window.open(channelUrl, '_blank');
            
            // Add to subscriptions
            currentUser.subscriptions.push(channelId);
            
            // Add entries
            currentUser.entries = (currentUser.entries || 0) + 2;
            
            // Update button
            this.textContent = 'Subscribed';
            this.classList.add('subscribed');
            
            // Save data
            saveData();
            
            // Update dashboard
            updateDashboard();
            
            console.log(`User subscribed to ${channelId} and earned 2 entries`);
        });
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function() {
            // Close the mobile menu when a link is clicked
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && nav.classList.contains('active')) {
            // Check if click is outside the nav and not on the menu toggle
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
            }
        }
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutUser();
        });
    }
    
    // Payment Methods
    if (withdrawalForm) {
        // Get payment method radio buttons and withdraw button
        const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
        const withdrawButton = document.getElementById('withdraw-button');
        const phoneNumberInput = document.getElementById('phone-number');
        
        // Function to update UI based on selected payment method
        function updatePaymentMethodUI() {
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
            const methodName = selectedMethod === 'tellebir' ? 'TelleBir' : 'CBEBirr';
            
            // Update button text
            withdrawButton.innerHTML = `<i class="fas fa-money-bill-wave"></i> Withdraw to ${methodName}`;
            
            // Update phone number placeholder and add helper text
            const helperTextEl = document.getElementById('phone-helper-text') || document.createElement('small');
            helperTextEl.id = 'phone-helper-text';
            helperTextEl.className = 'helper-text';
            
            if (selectedMethod === 'tellebir') {
                phoneNumberInput.placeholder = "+251 91 XXX XXXX";
                helperTextEl.innerHTML = '<i class="fas fa-info-circle"></i> Enter Ethio Telecom number (starting with 091, 092, 093, or 094)';
                document.querySelector('label[for="phone-number"]').textContent = 'TelleBir Phone Number';
            } else {
                phoneNumberInput.placeholder = "+251 9X XXX XXXX";
                helperTextEl.innerHTML = '<i class="fas fa-info-circle"></i> Enter any Ethiopian mobile number (Ethio Telecom or Safaricom)';
                document.querySelector('label[for="phone-number"]').textContent = 'CBEBirr Phone Number';
            }
            
            // Add helper text after the input if it doesn't exist
            if (!document.getElementById('phone-helper-text')) {
                phoneNumberInput.parentNode.appendChild(helperTextEl);
            }
            
            // Update payment method icon and style
            const tellebirRadio = document.getElementById('tellebir');
            const cbebirrRadio = document.getElementById('cbebirr');
            
            if (selectedMethod === 'tellebir') {
                tellebirRadio.parentNode.classList.add('selected');
                cbebirrRadio.parentNode.classList.remove('selected');
            } else {
                cbebirrRadio.parentNode.classList.add('selected');
                tellebirRadio.parentNode.classList.remove('selected');
            }
        }
        
        // Add event listeners to payment method radios
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', updatePaymentMethodUI);
        });
        
        // Initialize UI with default selected payment method
        updatePaymentMethodUI();
        
        // Form submission
        withdrawalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                alert('Please login to withdraw');
                return;
            }
            
            const phoneNumber = document.getElementById('phone-number').value;
            const amount = parseInt(document.getElementById('withdrawal-amount').value);
            let paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
            
            // Validate phone number based on payment method
            let isValidPhone = false;
            let phoneNumberError = '';
            
            // Clean the phone number for validation
            const cleanedPhone = phoneNumber.replace(/\s+/g, '');
            
            // General Ethiopian phone number format check
            const ethiopianPhoneRegex = /^(\+251|0)?9\d{8}$/;
            
            if (!ethiopianPhoneRegex.test(cleanedPhone)) {
                alert('Please enter a valid Ethiopian phone number');
                return;
            }
            
            if (paymentMethod === 'tellebir') {
                // TelleBir requires Ethio Telecom numbers (starting with +251 9[1-4] or 09[1-4] or 9[1-4])
                const tellebirRegex = /^(\+251|0)?9[1-4]\d{7}$/;
                isValidPhone = tellebirRegex.test(cleanedPhone);
                
                if (!isValidPhone) {
                    if (!confirm('This appears to be a Safaricom number which is not compatible with TelleBir. Would you like to switch to CBEBirr instead?')) {
                        return;
                    } else {
                        // Switch to CBEBirr
                        document.getElementById('cbebirr').checked = true;
                        updatePaymentMethodUI();
                        paymentMethod = 'cbebirr';
                        isValidPhone = true;
                    }
                }
            } else if (paymentMethod === 'cbebirr') {
                // CBEBirr accepts all Ethiopian mobile numbers (both Ethio Telecom and Safaricom)
                const cbebirrRegex = /^(\+251|0)?9\d{7,8}$|^0?9\d{7,8}$|^9\d{7,8}$/;
                isValidPhone = cbebirrRegex.test(cleanedPhone);
                
                if (!isValidPhone) {
                    alert('Please enter a valid Ethiopian mobile number for CBEBirr');
                    return;
                }
            }
            
            // Process the withdrawal
            const success = processWithdrawal(phoneNumber, amount, paymentMethod);
            
            if (success) {
                // Reset form
                withdrawalForm.reset();
                
                // Reset UI to default payment method
                document.getElementById('tellebir').checked = true;
                updatePaymentMethodUI();
                
                // Show enhanced success notification with the appropriate payment method
                const paymentMethodName = paymentMethod === 'tellebir' ? 'TelleBir' : 'CBEBirr';
                const paymentIcon = paymentMethod === 'tellebir' ? 'fa-mobile-alt' : 'fa-university';
                const formattedPhone = formatPhoneNumber(phoneNumber);
                
                // Create a styled notification
                const notification = document.createElement('div');
                notification.className = 'withdrawal-notification';
                notification.innerHTML = `
                    <div class="notification-icon ${paymentMethod}">
                        <i class="fas ${paymentIcon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>Withdrawal Initiated!</h4>
                        <p class="notification-amount">${amount} ETB</p>
                        <p class="notification-details">to ${formattedPhone} via ${paymentMethodName}</p>
                        <p class="notification-status">Status: <span class="pending">Pending</span></p>
                        <p class="notification-time">Processing time: ${paymentMethod === 'tellebir' ? '1-2 hours' : '1-2 business days'}</p>
                    </div>
                    <button class="notification-close"><i class="fas fa-times"></i></button>
                `;
                
                document.body.appendChild(notification);
                
                // Add event listener to close button
                notification.querySelector('.notification-close').addEventListener('click', function() {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 500);
                });
                
                // Auto-remove notification after 8 seconds
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }, 500);
                }, 8000);
            }
        });
    }
}

// Check for URL parameters (for referrals)
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    
    if (refId) {
        console.log(`Referred by user ID: ${refId}`);
        // We'll handle this during registration
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);