// DOM Elements
const currentDateElement = document.getElementById('current-date');
const currentLocationElement = document.getElementById('current-location');
const prayerListElement = document.getElementById('prayer-list');
const loadingSpinner = document.getElementById('loading-spinner');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeBtn = document.querySelector('.close-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const locationInput = document.getElementById('location-input');
const detectLocationBtn = document.getElementById('detect-location-btn');
const reminderTimeSelect = document.getElementById('reminder-time-select');
const debugLink = document.getElementById('debug-link');
const prayerToggles = {
  subuh: document.getElementById('subuh-toggle'),
  zuhur: document.getElementById('zuhur-toggle'),
  asar: document.getElementById('asar-toggle'),
  maghrib: document.getElementById('maghrib-toggle'),
  isyak: document.getElementById('isyak-toggle')
};

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

// API URLs
const API_BASE_URL = 'https://api.waktusolat.app/v2/solat';
const API_ZONES_URL = 'https://api.waktusolat.app/zones';
const API_GPS_URL = 'https://api.waktusolat.app/v2/solat/gps';
const API_ZONES_GPS_URL = 'https://api.waktusolat.app/zones/gps';

// Additional location data
const ADDITIONAL_LOCATIONS = {
  "Perak": [
    {
      "code": "PRK01",
      "locations": [
        "Tapah",
        "Slim River",
        "Tanjung Malim"
      ]
    },
    {
      "code": "PRK02",
      "locations": [
        "Kuala Kangsar",
        "Sg. Siput",
        "Ipoh",
        "Batu Gajah",
        "Kampar"
      ]
    },
    {
      "code": "PRK03",
      "locations": [
        "Lenggong",
        "Pengkalan Hulu",
        "Grik"
      ]
    },
    {
      "code": "PRK04",
      "locations": [
        "Temengor",
        "Belum"
      ]
    },
    {
      "code": "PRK05",
      "locations": [
        "Kg Gajah",
        "Teluk Intan",
        "Bagan Datuk",
        "Seri Iskandar",
        "Beruas",
        "Parit",
        "Lumut",
        "Sitiawan",
        "Pulau Pangkor"
      ]
    },
    {
      "code": "PRK06",
      "locations": [
        "Selama",
        "Taiping",
        "Serai",
        "Parit Buntar"
      ]
    },
    {
      "code": "PRK07",
      "locations": [
        "Bukit Larut"
      ]
    }
  ],
  "Kelantan": [
    {
      "code": "KTN01",
      "locations": [
        "Bachok",
        "Kota Bharu",
        "Machang",
        "Pasir Mas",
        "Pasir Puteh",
        "Tanah Merah",
        "Tumpat",
        "Kuala Krai",
        "Mukim Chiku"
      ]
    },
    {
      "code": "KTN02",
      "locations": [
        "Gua Musang (Daerah Galas Dan Bertam)",
        "Jeli",
        "Jajahan Kecil Lojing"
      ]
    }
  ],
  "Melaka": [
    {
      "code": "MLK01",
      "locations": [
        "SELURUH NEGERI MELAKA"
      ]
    }
  ],
  "Negeri Sembilan": [
    {
      "code": "NGS01",
      "locations": [
        "Tampin",
        "Jempol"
      ]
    },
    {
      "code": "NGS02",
      "locations": [
        "Jelebu",
        "Kuala Pilah",
        "Rembau"
      ]
    },
    {
      "code": "NGS03",
      "locations": [
        "Port Dickson",
        "Seremban"
      ]
    }
  ],
  "Pahang": [
    {
      "code": "PHG01",
      "locations": [
        "Pulau Tioman"
      ]
    },
    {
      "code": "PHG02",
      "locations": [
        "Kuantan",
        "Pekan",
        "Rompin",
        "Muadzam Shah"
      ]
    },
    {
      "code": "PHG03",
      "locations": [
        "Jerantut",
        "Temerloh",
        "Maran",
        "Bera",
        "Chenor",
        "Jengka"
      ]
    },
    {
      "code": "PHG04",
      "locations": [
        "Bentong",
        "Lipis",
        "Raub"
      ]
    },
    {
      "code": "PHG05",
      "locations": [
        "Genting Sempah",
        "Janda Baik",
        "Bukit Tinggi"
      ]
    },
    {
      "code": "PHG06",
      "locations": [
        "Cameron Highlands",
        "Genting Highlands",
        "Bukit Fraser"
      ]
    }
  ],
  "Johor": [
    {
      "code": "JHR01",
      "locations": [
        "Pulau Aur and Pulau Pemanggil"
      ]
    },
    {
      "code": "JHR02",
      "locations": [
        "Johor Bahru",
        "Kota Tinggi",
        "Mersing",
        "Kulai"
      ]
    },
    {
      "code": "JHR03",
      "locations": [
        "Kluang",
        "Pontian"
      ]
    },
    {
      "code": "JHR04",
      "locations": [
        "Batu Pahat",
        "Muar",
        "Segamat",
        "Gemas",
        "Johor",
        "Tangkak"
      ]
    }
  ],
  "Kedah": [
    {
      "code": "KDH01",
      "locations": [
        "Kota Setar",
        "Kubang Pasu",
        "Pokok Sena (Daerah Kecil)"
      ]
    },
    {
      "code": "KDH02",
      "locations": [
        "Kuala Muda",
        "Yan",
        "Pendang"
      ]
    },
    {
      "code": "KDH03",
      "locations": [
        "Padang Terap",
        "Sik"
      ]
    },
    {
      "code": "KDH04",
      "locations": [
        "Baling"
      ]
    },
    {
      "code": "KDH05",
      "locations": [
        "Bandar Baharu",
        "Kulim"
      ]
    },
    {
      "code": "KDH06",
      "locations": [
        "Langkawi"
      ]
    },
    {
      "code": "KDH07",
      "locations": [
        "Puncak Gunung Jerai"
      ]
    }
  ]
};

// State
let currentSettings = { ...DEFAULT_SETTINGS };
let prayerTimes = null;
let availableZones = [];

// Initialize the extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initialized');
  
  try {
    // Set current date
    updateCurrentDate();
    
    // Load settings
    await loadSettings();
    
    // Fetch available zones
    await fetchZones();
    
    // Display current location
    updateLocationDisplay();
    
    // Fetch and display prayer times
    await fetchPrayerTimes();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize the extension. Please try again later.');
  }
});

// Show error message in the UI
function showError(message) {
  loadingSpinner.style.display = 'none';
  prayerListElement.innerHTML = `
    <div class="error-message" style="color: red; padding: 15px; text-align: center;">
      <p>${message}</p>
      <p style="font-size: 12px; margin-top: 10px;">Please check the console for more details.</p>
    </div>
  `;
}

// Update the current date display
function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateElement.textContent = now.toLocaleDateString('en-MY', options);
}

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
      
      // Update UI with loaded settings
      locationInput.value = currentSettings.location;
      reminderTimeSelect.value = currentSettings.reminderTime;
      
      for (const prayer in prayerToggles) {
        if (prayerToggles[prayer]) {
          prayerToggles[prayer].checked = currentSettings.enabledPrayers[prayer];
        }
      }
      
      resolve();
    });
  });
}

// Save settings to Chrome storage
async function saveSettings() {
  try {
    const zoneCode = locationInput.value.trim();
    
    // Validate zone code if zones are available
    if (availableZones.length > 0 && !isValidZone(zoneCode)) {
      alert(`"${zoneCode}" is not a valid zone code. Please select a valid zone from the list.`);
      return;
    }
    
    // Update settings object
    currentSettings.location = zoneCode;
    currentSettings.reminderTime = parseInt(reminderTimeSelect.value, 10);
    
    for (const prayer in prayerToggles) {
      if (prayerToggles[prayer]) {
        currentSettings.enabledPrayers[prayer] = prayerToggles[prayer].checked;
      }
    }
    
    // Save settings to storage
    await new Promise((resolve) => {
      chrome.storage.sync.set({ settings: currentSettings }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving settings:', chrome.runtime.lastError);
        } else {
          console.log('Settings saved successfully');
        }
        resolve();
      });
    });
    
    // Update UI
    updateLocationDisplay();
    await fetchPrayerTimes();
    
    // Close modal
    settingsModal.style.display = 'none';
    
    // Notify background script about settings change
    chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to background script:', chrome.runtime.lastError);
      } else {
        console.log('Settings update message sent to background script');
      }
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    alert(`Failed to save settings: ${error.message}`);
  }
}

// Fetch available zones from API
async function fetchZones() {
  try {
    console.log('Fetching available zones');
    
    const response = await fetch(API_ZONES_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Zones API Response:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid zones data format');
    }
    
    availableZones = data;
    
    // Enhance zones with additional location information
    enhanceZonesWithAdditionalLocations();
    
    // Create datalist for zone suggestions
    createZoneDatalist();
    
    return data;
  } catch (error) {
    console.error('Error fetching zones:', error);
    
    // If API fails, use the additional locations data as fallback
    if (Object.keys(ADDITIONAL_LOCATIONS).length > 0) {
      console.log('Using additional locations data as fallback');
      createFallbackZones();
      createZoneDatalist();
    }
    
    return [];
  }
}

// Create fallback zones from additional locations data
function createFallbackZones() {
  availableZones = [];
  
  Object.entries(ADDITIONAL_LOCATIONS).forEach(([state, zones]) => {
    zones.forEach(zone => {
      availableZones.push({
        jakimCode: zone.code,
        negeri: state,
        daerah: zone.locations.join(', ')
      });
    });
  });
  
  console.log('Created fallback zones:', availableZones);
}

// Enhance zones with additional location information
function enhanceZonesWithAdditionalLocations() {
  // Create a map for quick lookup of existing zones
  const zoneMap = new Map();
  availableZones.forEach(zone => {
    zoneMap.set(zone.jakimCode, zone);
  });
  
  // Add any missing zones from additional locations
  Object.entries(ADDITIONAL_LOCATIONS).forEach(([state, zones]) => {
    zones.forEach(zone => {
      if (!zoneMap.has(zone.code)) {
        availableZones.push({
          jakimCode: zone.code,
          negeri: state,
          daerah: zone.locations.join(', ')
        });
        console.log(`Added missing zone: ${zone.code} - ${state}`);
      } else {
        // Enhance existing zone with more detailed location information if available
        const existingZone = zoneMap.get(zone.code);
        if (zone.locations.length > 0 && (!existingZone.daerah || existingZone.daerah.length < zone.locations.join(', ').length)) {
          existingZone.daerah = zone.locations.join(', ');
          console.log(`Enhanced zone ${zone.code} with more detailed locations`);
        }
      }
    });
  });
}

// Create datalist for zone suggestions
function createZoneDatalist() {
  // Since we're now using a select dropdown instead of datalist
  // Clear existing options
  locationInput.innerHTML = '';
  
  // Group zones by state/negeri
  const zonesByState = {};
  
  availableZones.forEach(zone => {
    if (!zonesByState[zone.negeri]) {
      zonesByState[zone.negeri] = [];
    }
    zonesByState[zone.negeri].push(zone);
  });
  
  // Sort states alphabetically
  const sortedStates = Object.keys(zonesByState).sort();
  
  // Add a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a location --';
  locationInput.appendChild(defaultOption);
  
  // Add options grouped by state
  sortedStates.forEach(state => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = state;
    
    // Sort zones within each state
    const sortedZones = zonesByState[state].sort((a, b) => 
      a.jakimCode.localeCompare(b.jakimCode)
    );
    
    sortedZones.forEach(zone => {
      const option = document.createElement('option');
      option.value = zone.jakimCode;
      option.textContent = `${zone.jakimCode} - ${zone.daerah}`;
      optgroup.appendChild(option);
    });
    
    locationInput.appendChild(optgroup);
  });
  
  // Set the current selected value
  locationInput.value = currentSettings.location;
  
  // If the value doesn't exist in the options, add it temporarily
  if (locationInput.value !== currentSettings.location) {
    const tempOption = document.createElement('option');
    tempOption.value = currentSettings.location;
    tempOption.textContent = currentSettings.location;
    locationInput.appendChild(tempOption);
    locationInput.value = currentSettings.location;
  }
}

// Validate zone code
function isValidZone(zoneCode) {
  return availableZones.some(zone => zone.jakimCode === zoneCode);
}

// Get zone display name
function getZoneDisplayName(zoneCode) {
  const zone = availableZones.find(z => z.jakimCode === zoneCode);
  if (zone) {
    return `${zone.negeri}: ${zone.daerah} (${zone.jakimCode})`;
  }
  return zoneCode;
}

// Update location display
function updateLocationDisplay() {
  const displayName = availableZones.length > 0 ? 
    getZoneDisplayName(currentSettings.location) : 
    currentSettings.location;
    
  currentLocationElement.textContent = `Location: ${displayName}`;
}

// Fetch prayer times from API
async function fetchPrayerTimes() {
  loadingSpinner.style.display = 'flex';
  prayerListElement.innerHTML = '';
  
  try {
    const zone = encodeURIComponent(currentSettings.location);
    
    // Add today's date to the API request
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
      }
    };
    
    prayerTimes = prayerTimesData;
    
    displayPrayerTimes(prayerTimes);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    showError(`Failed to load prayer times: ${error.message}. Please check your location and try again.`);
  } finally {
    loadingSpinner.style.display = 'none';
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

// Display prayer times
function displayPrayerTimes(data) {
  if (!data || !data.prayer_times) {
    prayerListElement.innerHTML = '<p>No prayer times available</p>';
    return;
  }
  
  // Validate that all required prayer times exist
  const requiredPrayers = ['subuh', 'zuhur', 'asar', 'maghrib', 'isyak'];
  const missingPrayers = requiredPrayers.filter(prayer => !data.prayer_times[prayer]);
  
  if (missingPrayers.length > 0) {
    console.error('Missing prayer times:', missingPrayers);
    showError(`Invalid prayer times data: missing ${missingPrayers.join(', ')}`);
    return;
  }
  
  const prayers = [
    { name: 'Subuh', time: data.prayer_times.subuh },
    { name: 'Zuhur', time: data.prayer_times.zuhur },
    { name: 'Asar', time: data.prayer_times.asar },
    { name: 'Maghrib', time: data.prayer_times.maghrib },
    { name: 'Isyak', time: data.prayer_times.isyak }
  ];
  
  const now = new Date();
  let nextPrayerIndex = -1;
  
  // Find the next prayer
  for (let i = 0; i < prayers.length; i++) {
    try {
      const prayerTime = convertToDate(prayers[i].time);
      if (prayerTime > now) {
        nextPrayerIndex = i;
        break;
      }
    } catch (error) {
      console.error(`Error processing prayer time for ${prayers[i].name}:`, error);
    }
  }
  
  // If all prayers for today have passed, the next prayer is tomorrow's Subuh
  if (nextPrayerIndex === -1) {
    nextPrayerIndex = 0;
  }
  
  // Create prayer list items
  prayers.forEach((prayer, index) => {
    try {
      const prayerTime = convertToDate(prayer.time);
      const isNextPrayer = index === nextPrayerIndex;
      
      const timeRemaining = isNextPrayer ? getTimeRemaining(now, prayerTime) : '';
      
      const prayerItem = document.createElement('li');
      prayerItem.className = `prayer-item ${isNextPrayer ? 'next-prayer' : ''}`;
      
      prayerItem.innerHTML = `
        <span class="prayer-name">${prayer.name}</span>
        <div class="prayer-info">
          <span class="prayer-time">${prayer.time}</span>
          ${isNextPrayer ? `<div class="time-remaining">${timeRemaining}</div>` : ''}
        </div>
      `;
      
      prayerListElement.appendChild(prayerItem);
    } catch (error) {
      console.error(`Error displaying prayer time for ${prayer.name}:`, error);
    }
  });
}

// Convert time string to Date object
function convertToDate(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    throw new Error(`Invalid time string: ${timeString}`);
  }
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Get time remaining until prayer
function getTimeRemaining(now, prayerTime) {
  let diff = prayerTime - now;
  
  // If the prayer is tomorrow (Subuh)
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000; // Add 24 hours
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  } else {
    return `in ${minutes}m`;
  }
}

// Detect user's location using browser geolocation
function detectLocation() {
  console.log('Detect location button clicked');
  
  // Show a loading indicator
  const originalButtonText = detectLocationBtn.textContent;
  detectLocationBtn.textContent = 'Detecting...';
  detectLocationBtn.disabled = true;
  
  // Function to reset button state
  const resetButton = () => {
    detectLocationBtn.textContent = originalButtonText;
    detectLocationBtn.disabled = false;
  };
  
  if (navigator.geolocation) {
    console.log('Geolocation API is available');
    
    // Request current position with options
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        try {
          console.log('Geolocation successful');
          const { latitude, longitude } = position.coords;
          console.log(`Detected coordinates: ${latitude}, ${longitude}`);
          
          // First, try to get the zone directly from the zones/gps endpoint
          try {
            console.log('Attempting to use zones/gps endpoint...');
            // Note: This endpoint uses query parameters, not path parameters
            const zonesGpsUrl = `${API_ZONES_GPS_URL}?lat=${latitude}&long=${longitude}`;
            console.log(`Fetching zone from zones/gps endpoint: ${zonesGpsUrl}`);
            
            const zonesGpsResponse = await fetch(zonesGpsUrl);
            
            if (zonesGpsResponse.ok) {
              const zonesGpsData = await zonesGpsResponse.json();
              console.log('Zones GPS API Response:', zonesGpsData);
              
              if (zonesGpsData && zonesGpsData.zone) {
                console.log(`Zone from zones/gps: ${zonesGpsData.zone}`);
                locationInput.value = zonesGpsData.zone;
                
                // If the value doesn't exist in the options, add it temporarily
                if (locationInput.value !== zonesGpsData.zone) {
                  const tempOption = document.createElement('option');
                  tempOption.value = zonesGpsData.zone;
                  tempOption.textContent = zonesGpsData.zone;
                  locationInput.appendChild(tempOption);
                  locationInput.value = zonesGpsData.zone;
                }
                
                resetButton();
                return; // Success! No need to continue
              } else {
                console.error('Zones GPS API response missing zone information');
              }
            } else {
              console.error(`Zones GPS API error: ${zonesGpsResponse.status} ${zonesGpsResponse.statusText}`);
              // Try to get more details from the error response
              try {
                const errorData = await zonesGpsResponse.text();
                console.error('Zones GPS API error details:', errorData);
              } catch (e) {
                console.error('Could not parse error response');
              }
            }
          } catch (zonesGpsError) {
            console.error('Error fetching zone from zones/gps endpoint:', zonesGpsError);
          }
          
          // Fallback to solat/gps endpoint if zones/gps fails
          try {
            console.log('Attempting to use solat/gps endpoint...');
            const solatGpsUrl = `${API_GPS_URL}/${latitude}/${longitude}`;
            console.log(`Fetching from solat/gps endpoint: ${solatGpsUrl}`);
            
            const solatGpsResponse = await fetch(solatGpsUrl);
            
            if (solatGpsResponse.ok) {
              const solatGpsData = await solatGpsResponse.json();
              console.log('Solat GPS API Response:', solatGpsData);
              
              if (solatGpsData && solatGpsData.zone) {
                console.log(`Zone from solat/gps: ${solatGpsData.zone}`);
                locationInput.value = solatGpsData.zone;
                
                // If the value doesn't exist in the options, add it temporarily
                if (locationInput.value !== solatGpsData.zone) {
                  const tempOption = document.createElement('option');
                  tempOption.value = solatGpsData.zone;
                  tempOption.textContent = solatGpsData.zone;
                  locationInput.appendChild(tempOption);
                  locationInput.value = solatGpsData.zone;
                }
                
                resetButton();
                return; // Success! No need to continue
              } else {
                console.error('Solat GPS API response missing zone information');
              }
            } else {
              console.error(`Solat GPS API error: ${solatGpsResponse.status} ${solatGpsResponse.statusText}`);
              // Try to get more details from the error response
              try {
                const errorData = await solatGpsResponse.text();
                console.error('Solat GPS API error details:', errorData);
              } catch (e) {
                console.error('Could not parse error response');
              }
            }
          } catch (solatGpsError) {
            console.error('Error fetching from solat/gps endpoint:', solatGpsError);
          }
          
          // Fallback to reverse geocoding if both GPS endpoints fail
          console.log('Falling back to reverse geocoding...');
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          
          if (!response.ok) {
            throw new Error(`Failed to get location name: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Reverse geocoding response:', data);
          
          // Try to get city or town name
          let locationName = data.address.city || 
                            data.address.town || 
                            data.address.state || 
                            'Unknown Location';
          
          console.log(`Detected location: ${locationName}`);
          
          // Try to find a matching zone
          const matchedZone = findMatchingZone(locationName, data.address.state);
          
          if (matchedZone) {
            console.log(`Matched to zone: ${matchedZone.jakimCode} - ${matchedZone.negeri}: ${matchedZone.daerah}`);
            locationInput.value = matchedZone.jakimCode;
            
            // If the value doesn't exist in the options, add it temporarily
            if (locationInput.value !== matchedZone.jakimCode) {
              const tempOption = document.createElement('option');
              tempOption.value = matchedZone.jakimCode;
              tempOption.textContent = `${matchedZone.jakimCode} - ${matchedZone.daerah}`;
              locationInput.appendChild(tempOption);
              locationInput.value = matchedZone.jakimCode;
            }
          } else {
            // Default to a zone if no match found
            console.log('No matching zone found, using default');
            locationInput.value = DEFAULT_SETTINGS.location;
            
            // Show a message to the user
            alert(`Could not find a matching zone for "${locationName}". Please select a zone from the list.`);
          }
          
          resetButton();
        } catch (error) {
          console.error('Error detecting location:', error);
          alert(`Failed to detect location: ${error.message}. Please select a location from the dropdown.`);
          resetButton();
        }
      },
      // Error callback
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unknown error';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
          case error.UNKNOWN_ERROR:
            errorMessage = 'An unknown error occurred';
            break;
        }
        
        alert(`Failed to access geolocation: ${errorMessage}. Please select a location from the dropdown.`);
        resetButton();
      },
      // Options
      { 
        timeout: 10000,         // 10 seconds timeout
        maximumAge: 60000,      // Accept cached positions up to 1 minute old
        enableHighAccuracy: true // Request high accuracy (may be slower)
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser');
    alert('Geolocation is not supported by your browser. Please select a location from the dropdown.');
    resetButton();
  }
}

// Find matching zone based on location name and state
function findMatchingZone(locationName, state) {
  if (!availableZones.length) {
    return null;
  }
  
  // First try to find an exact match in daerah
  const exactMatch = availableZones.find(zone => 
    zone.daerah.toLowerCase().includes(locationName.toLowerCase())
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Then try to match by state
  if (state) {
    const stateMatches = availableZones.filter(zone => 
      zone.negeri.toLowerCase() === state.toLowerCase()
    );
    
    if (stateMatches.length > 0) {
      // Return the first zone in that state
      return stateMatches[0];
    }
  }
  
  // Try to match against additional locations data
  for (const [stateName, zones] of Object.entries(ADDITIONAL_LOCATIONS)) {
    // Check if state matches
    if (state && stateName.toLowerCase() === state.toLowerCase()) {
      // Return the first zone for this state
      if (zones.length > 0) {
        const zoneCode = zones[0].code;
        const matchedZone = availableZones.find(z => z.jakimCode === zoneCode);
        if (matchedZone) return matchedZone;
      }
    }
    
    // Check if location matches any in the additional data
    for (const zone of zones) {
      for (const location of zone.locations) {
        if (location.toLowerCase().includes(locationName.toLowerCase()) || 
            locationName.toLowerCase().includes(location.toLowerCase())) {
          const matchedZone = availableZones.find(z => z.jakimCode === zone.code);
          if (matchedZone) return matchedZone;
        }
      }
    }
  }
  
  return null;
}

// Set up event listeners
function setupEventListeners() {
  // Settings button
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
  });
  
  // Close button
  closeBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Detect location button
  detectLocationBtn.addEventListener('click', detectLocation);
  
  // Debug link for prayer time validation
  debugLink.addEventListener('click', (event) => {
    event.preventDefault();
    
    // Open the debug page in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/debug-prayer-times.html')
    });
  });
} 