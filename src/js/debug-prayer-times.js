// Prayer Time Validation Tool

// API URLs
const API_BASE_URL = 'https://api.waktusolat.app/v2/solat';

document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.getElementById('testButton');
  const zoneInput = document.getElementById('zone');
  const apiResponseDiv = document.getElementById('apiResponse');
  const prayerTable = document.getElementById('prayerTable').querySelector('tbody');
  const validationResultsDiv = document.getElementById('validationResults');
  
  // Create date input element and add to form
  const dateFormGroup = document.createElement('div');
  dateFormGroup.className = 'form-group';
  
  const dateLabel = document.createElement('label');
  dateLabel.setAttribute('for', 'test-date');
  dateLabel.textContent = 'Test Date (YYYY-MM-DD)';
  dateFormGroup.appendChild(dateLabel);
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'test-date';
  
  // Set default value to today
  const today = new Date();
  dateInput.value = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
  
  dateFormGroup.appendChild(dateInput);
  
  // Insert after zone input but before button
  const buttonGroup = document.querySelector('#testButton').parentNode;
  buttonGroup.parentNode.insertBefore(dateFormGroup, buttonGroup);
  
  // Add event listener to the test button
  testButton.addEventListener('click', async () => {
    const zone = zoneInput.value.trim();
    const testDate = dateInput.value; // Get selected date from input
    
    if (!zone) {
      alert('Please enter a zone code');
      return;
    }
    
    // Clear previous results
    apiResponseDiv.textContent = 'Loading...';
    prayerTable.innerHTML = '';
    validationResultsDiv.textContent = 'Validating...';
    
    try {
      // Get current date in Malaysia time
      const now = new Date();
      const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
      const dateString = malaysiaTime.toLocaleDateString('en-MY');
      
      // Fetch prayer times from API with the specified date
      const apiUrl = `${API_BASE_URL}/${zone}${testDate ? `?date=${testDate}` : ''}`;
      console.log(`Fetching prayer times from: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Display raw API response
      apiResponseDiv.textContent = JSON.stringify(data, null, 2);
      
      // Check if the API response has the expected format
      if (!data || !data.prayers || !data.prayers.length) {
        throw new Error('Invalid API response format: missing prayers data');
      }
      
      // Extract prayer times for the selected day
      // If a date is specified, extract the day from it
      let selectedDay;
      if (testDate) {
        selectedDay = parseInt(testDate.split('-')[2], 10);
      } else {
        selectedDay = malaysiaTime.getDate();
      }
      
      // Find the prayer times for the selected day
      let todayPrayers = null;
      for (const prayerData of data.prayers) {
        if (prayerData.day === selectedDay) {
          todayPrayers = prayerData;
          break;
        }
      }
      
      // If no matching day found, fall back to the first entry
      if (!todayPrayers) {
        todayPrayers = data.prayers[0];
        console.warn(`Could not find prayer times for day ${selectedDay}, falling back to day ${data.prayers[0].day}`);
        
        // Add this warning to the validation results
        validationResultsDiv.textContent = `Warning: Could not find prayer times for day ${selectedDay}, using day ${data.prayers[0].day} instead.\n\n`;
      } else {
        validationResultsDiv.textContent = '';
      }
      
      // Create prayer times mapping
      const prayerData = [
        { name: 'Fajr/Subuh', apiKey: 'fajr', displayName: 'Subuh' },
        { name: 'Dhuhr/Zuhur', apiKey: 'dhuhr', displayName: 'Zuhur' },
        { name: 'Asr/Asar', apiKey: 'asr', displayName: 'Asar' },
        { name: 'Maghrib', apiKey: 'maghrib', displayName: 'Maghrib' },
        { name: 'Isha/Isyak', apiKey: 'isha', displayName: 'Isyak' }
      ];
      
      // Extract date information from API response
      const apiDate = {
        day: todayPrayers.day || 1,
        month: data.month || 1,
        year: data.year || new Date().getFullYear()
      };
      
      // Validate the sequence of prayer times
      const validation = validatePrayerTimes(todayPrayers, apiDate);
      
      // Format date from timestamp
      const formatTimeFromTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-MY', {
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kuala_Lumpur'
        });
      };
      
      // Display prayer times in table
      for (const prayer of prayerData) {
        const timestamp = todayPrayers[prayer.apiKey];
        const formattedTime = formatTimeFromTimestamp(timestamp);
        
        // Create table row
        const row = document.createElement('tr');
        
        // Prayer name column
        const nameCell = document.createElement('td');
        nameCell.textContent = prayer.name;
        row.appendChild(nameCell);
        
        // API time column
        const timeCell = document.createElement('td');
        timeCell.textContent = formattedTime;
        row.appendChild(timeCell);
        
        // Raw timestamp column
        const timestampCell = document.createElement('td');
        timestampCell.textContent = timestamp;
        row.appendChild(timestampCell);
        
        // Validation column
        const validationCell = document.createElement('td');
        if (validation.prayerIssues[prayer.apiKey]) {
          validationCell.textContent = validation.prayerIssues[prayer.apiKey];
          validationCell.classList.add('error');
        } else {
          validationCell.textContent = 'Valid';
          validationCell.classList.add('success');
        }
        row.appendChild(validationCell);
        
        // Add row to table
        prayerTable.appendChild(row);
      }
      
      // Display validation results
      let validationSummary = '';
      
      // Add requested date and API date information
      validationSummary += `Requested Date: ${testDate || 'Not specified (API default)'}\n`;
      validationSummary += `API Date: ${apiDate.day}/${apiDate.month}/${apiDate.year}\n\n`;
      
      if (validation.isValid) {
        validationSummary += `✅ PASSED: All prayer times appear to be valid.`;
      } else {
        validationSummary += `❌ FAILED: Found ${validation.issues.length} issues with prayer times:\n\n`;
        validation.issues.forEach((issue, index) => {
          validationSummary += `${index + 1}. ${issue}\n`;
        });
      }
      
      // Add time conversion sanity check
      validationSummary += '\n\n--- Time Conversion Check ---\n';
      for (const prayer of prayerData) {
        const timestamp = todayPrayers[prayer.apiKey];
        const formattedTime = formatTimeFromTimestamp(timestamp);
        const date = new Date(timestamp * 1000);
        
        validationSummary += `${prayer.name}:\n`;
        validationSummary += ` - Unix timestamp: ${timestamp}\n`;
        validationSummary += ` - UTC time: ${date.toUTCString()}\n`;
        validationSummary += ` - Malaysia time: ${formattedTime}\n\n`;
      }
      
      validationResultsDiv.textContent = validationSummary;
      
    } catch (error) {
      apiResponseDiv.textContent = `Error: ${error.message}`;
      validationResultsDiv.textContent = `Validation failed: ${error.message}`;
      console.error('Validation error:', error);
    }
  });
});

// Validate prayer times
function validatePrayerTimes(prayers, apiDate) {
  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const issues = [];
  const prayerIssues = {};
  
  // Check if all prayer times are present
  for (const prayer of prayerOrder) {
    if (!prayers[prayer]) {
      issues.push(`Missing ${prayer} prayer time`);
      prayerIssues[prayer] = 'Missing time';
    }
  }
  
  // Check if prayer times are in correct order
  for (let i = 0; i < prayerOrder.length - 1; i++) {
    const current = prayers[prayerOrder[i]];
    const next = prayers[prayerOrder[i + 1]];
    
    if (current && next && current >= next) {
      const issue = `Invalid sequence: ${prayerOrder[i]} (${current}) should be earlier than ${prayerOrder[i + 1]} (${next})`;
      issues.push(issue);
      prayerIssues[prayerOrder[i]] = 'Invalid sequence';
      prayerIssues[prayerOrder[i + 1]] = 'Invalid sequence';
    }
  }
  
  // Create date from API response
  const apiDateObj = new Date(apiDate.year, apiDate.month - 1, apiDate.day);
  
  // Create start and end of the API date
  const dayStart = new Date(apiDateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartTimestamp = Math.floor(dayStart.getTime() / 1000);
  
  const dayEnd = new Date(apiDateObj);
  dayEnd.setHours(23, 59, 59, 999);
  const dayEndTimestamp = Math.floor(dayEnd.getTime() / 1000);
  
  // For date range validation, check if timestamps belong to the specified date
  // instead of comparing with today's date
  const timestampDate = {};
  let dateWarningShown = false;
  
  for (const prayer of prayerOrder) {
    const timestamp = prayers[prayer];
    if (!timestamp) continue;
    
    // Get the actual date from the timestamp
    const date = new Date(timestamp * 1000);
    timestampDate[prayer] = date;
    
    // If the timestamp is not within the expected date range based on API date
    // we'll track it but not flag as an error, since the API might be returning
    // data for a different date than what's in the metadata
    if (timestamp < dayStartTimestamp || timestamp > dayEndTimestamp) {
      if (!dateWarningShown) {
        issues.push(`Note: The API is returning timestamps for a different date than specified in the API metadata (${apiDate.day}/${apiDate.month}/${apiDate.year}).`);
        dateWarningShown = true;
      }
    }
  }
  
  // Check for reasonable time ranges (prayers should be within reasonable hours)
  const reasonableRanges = {
    fajr: { start: 4, end: 7 },    // 4:00 AM - 7:00 AM
    dhuhr: { start: 12, end: 15 }, // 12:00 PM - 3:00 PM
    asr: { start: 15, end: 18 },   // 3:00 PM - 6:00 PM
    maghrib: { start: 18, end: 20 }, // 6:00 PM - 8:00 PM
    isha: { start: 19, end: 22 }   // 7:00 PM - 10:00 PM
  };
  
  for (const prayer of prayerOrder) {
    const timestamp = prayers[prayer];
    if (!timestamp) continue;
    
    const date = new Date(timestamp * 1000);
    const hour = date.getHours();
    
    const range = reasonableRanges[prayer];
    if (hour < range.start || hour > range.end) {
      const issue = `${prayer} time (${hour}:${date.getMinutes()}) is outside typical range (${range.start}:00-${range.end}:00)`;
      issues.push(issue);
      prayerIssues[prayer] = 'Unusual time';
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    prayerIssues: prayerIssues
  };
} 