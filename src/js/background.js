// API URLs
const API_BASE_URL = 'https://api.waktusolat.app/v2/solat';
const API_GPS_URL = 'https://api.waktusolat.app/v2/solat/gps';

// Default settings
const DEFAULT_SETTINGS = {
  location: 'SGR01', // Default to Kuala Lumpur zone
  reminderTime: 5, // minutes
  enabledPrayers: {
    subuh: true,
    zuhur: true,
    asar: true,
    maghrib: true,
    isyak: true
  }
};

// State
let currentSettings = { ...DEFAULT_SETTINGS };
let prayerTimes = null;
let notificationAlarms = {};

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Waktu Solat extension installed');
  
  // Load settings
  await loadSettings();
  
  // Fetch prayer times
  await fetchPrayerTimes();
  
  // Set up alarms for notifications
  setupNotificationAlarms();
  
  // Set up daily refresh alarm
  setupDailyRefresh();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    handleSettingsUpdate();
  } else if (message.type === 'GET_PRAYER_TIMES_FROM_GPS') {
    // Handle request to get prayer times from GPS
    if (message.latitude && message.longitude) {
      fetchPrayerTimesFromGPS(message.latitude, message.longitude)
        .then(data => {
          sendResponse({ success: true, data });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicate we'll respond asynchronously
    }
  }
  
  // Always return true for async response
  return true;
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyRefresh') {
    handleDailyRefresh();
  } else if (alarm.name.startsWith('prayer_')) {
    const prayerName = alarm.name.split('_')[1];
    showPrayerNotification(prayerName);
  }
});

// Load settings from Chrome storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading settings:', chrome.runtime.lastError);
      }
      
      if (result && result.settings) {
        currentSettings = result.settings;
        console.log('Settings loaded:', currentSettings);
      } else {
        console.log('No saved settings found, using defaults');
      }
      
      resolve();
    });
  });
}

// Fetch prayer times from API
async function fetchPrayerTimes() {
  try {
    const zone = encodeURIComponent(currentSettings.location);
    
    // Format today's date for the API request
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
    const apiUrl = `${API_BASE_URL}/${zone}?date=${formattedDate}`;
    
    console.log(`Fetching prayer times from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prayer times: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Check if the API response has the expected format
    if (!data || !data.prayers || !data.prayers.length) {
      throw new Error('Invalid API response format: missing prayers data');
    }
    
    // Get the current day of the month
    const currentDay = today.getDate();
    
    // Find the prayer times for the current day
    let todayPrayers = null;
    for (const prayerData of data.prayers) {
      if (prayerData.day === currentDay) {
        todayPrayers = prayerData;
        break;
      }
    }
    
    // If no matching day found, fall back to the first entry
    if (!todayPrayers) {
      todayPrayers = data.prayers[0];
      console.warn(`Could not find prayer times for day ${currentDay}, falling back to day ${data.prayers[0].day}`);
    }
    
    // Convert Unix timestamps to formatted time strings
    const prayerTimesData = {
      prayer_times: {
        subuh: formatTimeFromTimestamp(todayPrayers.fajr),
        zuhur: formatTimeFromTimestamp(todayPrayers.dhuhr),
        asar: formatTimeFromTimestamp(todayPrayers.asr),
        maghrib: formatTimeFromTimestamp(todayPrayers.maghrib),
        isyak: formatTimeFromTimestamp(todayPrayers.isha)
      },
      raw_timestamps: {
        subuh: todayPrayers.fajr,
        zuhur: todayPrayers.dhuhr,
        asar: todayPrayers.asr,
        maghrib: todayPrayers.maghrib,
        isyak: todayPrayers.isha
      },
      zone: data.zone,
      date: {
        hijri: todayPrayers.hijri,
        day: todayPrayers.day,
        month: data.month,
        year: data.year
      }
    };
    
    prayerTimes = prayerTimesData;
    
    // Cache the prayer times
    chrome.storage.local.set({ prayerTimes: prayerTimesData });
    
    return prayerTimesData;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // Try to load cached prayer times
    return new Promise((resolve) => {
      chrome.storage.local.get('prayerTimes', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading cached prayer times:', chrome.runtime.lastError);
        }
        
        if (result && result.prayerTimes) {
          prayerTimes = result.prayerTimes;
          console.log('Using cached prayer times:', prayerTimes);
          resolve(prayerTimes);
        } else {
          console.error('No cached prayer times available');
          resolve(null);
        }
      });
    });
  }
}

// Fetch prayer times from GPS coordinates
async function fetchPrayerTimesFromGPS(latitude, longitude) {
  try {
    // Format today's date for the API request
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
    const apiUrl = `${API_GPS_URL}/${latitude}/${longitude}?date=${formattedDate}`;
    
    console.log(`Fetching prayer times from GPS: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prayer times from GPS: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('GPS API Response:', data);
    
    // Check if the API response has the expected format
    if (!data || !data.prayers || !data.prayers.length) {
      throw new Error('Invalid API response format: missing prayers data');
    }
    
    // Get the current day of the month
    const currentDay = today.getDate();
    
    // Find the prayer times for the current day
    let todayPrayers = null;
    for (const prayerData of data.prayers) {
      if (prayerData.day === currentDay) {
        todayPrayers = prayerData;
        break;
      }
    }
    
    // If no matching day found, fall back to the first entry
    if (!todayPrayers) {
      todayPrayers = data.prayers[0];
      console.warn(`Could not find prayer times for day ${currentDay}, falling back to day ${data.prayers[0].day}`);
    }
    
    // Convert Unix timestamps to formatted time strings
    const prayerTimesData = {
      prayer_times: {
        subuh: formatTimeFromTimestamp(todayPrayers.fajr),
        zuhur: formatTimeFromTimestamp(todayPrayers.dhuhr),
        asar: formatTimeFromTimestamp(todayPrayers.asr),
        maghrib: formatTimeFromTimestamp(todayPrayers.maghrib),
        isyak: formatTimeFromTimestamp(todayPrayers.isha)
      },
      raw_timestamps: {
        subuh: todayPrayers.fajr,
        zuhur: todayPrayers.dhuhr,
        asar: todayPrayers.asr,
        maghrib: todayPrayers.maghrib,
        isyak: todayPrayers.isha
      },
      zone: data.zone,
      date: {
        hijri: todayPrayers.hijri,
        day: todayPrayers.day,
        month: data.month,
        year: data.year
      },
      coordinates: {
        latitude,
        longitude
      }
    };
    
    return prayerTimesData;
  } catch (error) {
    console.error('Error fetching prayer times from GPS:', error);
    throw error;
  }
}

// Format time from Unix timestamp
function formatTimeFromTimestamp(timestamp) {
  if (!timestamp) {
    console.error('Invalid timestamp:', timestamp);
    return null;
  }
  
  try {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return null;
  }
}

// Set up alarms for prayer notifications
function setupNotificationAlarms() {
  // Clear existing alarms
  chrome.alarms.clearAll();
  
  if (!prayerTimes || !prayerTimes.prayer_times) {
    console.error('No prayer times available for setting alarms');
    return;
  }
  
  const prayers = [
    { name: 'subuh', time: prayerTimes.prayer_times.subuh },
    { name: 'zuhur', time: prayerTimes.prayer_times.zuhur },
    { name: 'asar', time: prayerTimes.prayer_times.asar },
    { name: 'maghrib', time: prayerTimes.prayer_times.maghrib },
    { name: 'isyak', time: prayerTimes.prayer_times.isyak }
  ];
  
  const now = new Date();
  
  prayers.forEach((prayer) => {
    // Skip if prayer notifications are disabled
    if (!currentSettings.enabledPrayers[prayer.name]) {
      return;
    }
    
    // Skip if prayer time is not available
    if (!prayer.time) {
      console.error(`Prayer time for ${prayer.name} is not available`);
      return;
    }
    
    // Calculate alarm time (prayer time - reminder minutes)
    const prayerTime = convertToDate(prayer.time);
    const reminderMinutes = currentSettings.reminderTime;
    const alarmTime = new Date(prayerTime.getTime() - (reminderMinutes * 60 * 1000));
    
    // Skip if the alarm time has already passed
    if (alarmTime <= now) {
      console.log(`Alarm time for ${prayer.name} has already passed`);
      return;
    }
    
    // Create alarm
    const alarmName = `prayer_${prayer.name}`;
    chrome.alarms.create(alarmName, { when: alarmTime.getTime() });
    
    console.log(`Alarm set for ${prayer.name} at ${alarmTime.toLocaleTimeString()}`);
  });
  
  // Set up daily refresh alarm for midnight
  setupDailyRefresh();
}

// Set up daily refresh alarm
function setupDailyRefresh() {
  // Set alarm for midnight
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  midnight.setDate(midnight.getDate() + 1); // Tomorrow midnight
  
  chrome.alarms.create('dailyRefresh', { when: midnight.getTime() });
  console.log(`Daily refresh alarm set for ${midnight.toLocaleString()}`);
}

// Handle daily refresh
async function handleDailyRefresh() {
  console.log('Performing daily refresh');
  
  // Reload settings
  await loadSettings();
  
  // Fetch new prayer times
  await fetchPrayerTimes();
  
  // Set up new notification alarms
  setupNotificationAlarms();
}

// Handle settings update
async function handleSettingsUpdate() {
  console.log('Settings updated, reconfiguring alarms');
  
  // Reload settings
  await loadSettings();
  
  // Fetch prayer times with new location
  await fetchPrayerTimes();
  
  // Set up new notification alarms
  setupNotificationAlarms();
}

// Show prayer notification
function showPrayerNotification(prayerName) {
  if (!prayerTimes || !prayerTimes.prayer_times) {
    console.error('No prayer times available for notification');
    return;
  }
  
  const prayerTime = prayerTimes.prayer_times[prayerName];
  if (!prayerTime) {
    console.error(`Prayer time for ${prayerName} is not available`);
    return;
  }
  
  const prayerDisplayName = capitalizeFirstLetter(prayerName);
  
  try {
    // Play notification sound
    playNotificationSound();
    
    // Create visual notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/images/icon128.png',
      title: `${prayerDisplayName} Prayer in ${currentSettings.reminderTime} minutes!`,
      message: `${prayerDisplayName} begins at ${prayerTime}.`,
      priority: 2
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Notification error:', chrome.runtime.lastError);
      } else {
        console.log('Notification created with ID:', notificationId);
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Play notification sound
function playNotificationSound() {
  try {
    // Create audio element
    const audio = new Audio(chrome.runtime.getURL('audio/notification.wav'));
    
    // Set volume (0.0 to 1.0)
    audio.volume = 0.7;
    
    // Play the sound
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
    
    console.log('Playing notification sound');
  } catch (error) {
    console.error('Error setting up notification sound:', error);
  }
}

// Validate prayer times by fetching from multiple sources
async function validatePrayerTimes(zone) {
  try {
    console.log(`Validating prayer times for zone: ${zone}`);
    const results = {
      mainAPI: null,
      alternateSource: null,
      comparison: null
    };
    
    // Get prayer times from main API
    const apiUrl = `${API_BASE_URL}/${zone}`;
    console.log(`Fetching from main API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Main API Response:', data);
    
    if (!data || !data.prayers || !data.prayers.length) {
      throw new Error('Invalid API response format: missing prayers data');
    }
    
    // Get today's prayer times
    const todayPrayers = data.prayers[0];
    
    // Store raw timestamps and formatted times
    results.mainAPI = {
      raw: {
        fajr: todayPrayers.fajr,
        dhuhr: todayPrayers.dhuhr,
        asr: todayPrayers.asr,
        maghrib: todayPrayers.maghrib,
        isha: todayPrayers.isha
      },
      formatted: {
        fajr: formatTimeFromTimestamp(todayPrayers.fajr),
        dhuhr: formatTimeFromTimestamp(todayPrayers.dhuhr),
        asr: formatTimeFromTimestamp(todayPrayers.asr),
        maghrib: formatTimeFromTimestamp(todayPrayers.maghrib),
        isha: formatTimeFromTimestamp(todayPrayers.isha)
      }
    };
    
    // Parse timestamps to check if they make sense
    const timestampValidation = validateTimestampSequence(results.mainAPI.raw);
    results.validation = timestampValidation;
    
    return results;
  } catch (error) {
    console.error('Error validating prayer times:', error);
    return { error: error.message };
  }
}

// Validate timestamp sequence (prayers should be in chronological order)
function validateTimestampSequence(timestamps) {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const issues = [];
  
  // Check if timestamps are in ascending order
  for (let i = 0; i < prayers.length - 1; i++) {
    const current = timestamps[prayers[i]];
    const next = timestamps[prayers[i + 1]];
    
    if (!current || !next) {
      issues.push(`Missing timestamp for ${prayers[i]} or ${prayers[i + 1]}`);
      continue;
    }
    
    if (current >= next) {
      issues.push(`Invalid sequence: ${prayers[i]} (${current}) should be earlier than ${prayers[i + 1]} (${next})`);
    }
  }
  
  // Check for reasonable time ranges (prayers should be within a day)
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayStartTimestamp = Math.floor(dayStart.getTime() / 1000);
  
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);
  const dayEndTimestamp = Math.floor(dayEnd.getTime() / 1000);
  
  for (const prayer of prayers) {
    const timestamp = timestamps[prayer];
    if (!timestamp) continue;
    
    if (timestamp < dayStartTimestamp || timestamp > dayEndTimestamp) {
      issues.push(`${prayer} timestamp (${timestamp}) is outside today's range`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// Convert time string to Date object
function convertToDate(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    console.error('Invalid time string:', timeString);
    return new Date(); // Return current time as fallback
  }
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time string:', error);
    return new Date(); // Return current time as fallback
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
} 