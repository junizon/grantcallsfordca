document.addEventListener('DOMContentLoaded', () => {
  let grantCalls = []; // Placeholder for JSON data

  // Fetch the data from the JSON file
  fetch('grant_calls.json')
  .then(response => response.json())
  .then(data => {
    console.log("Grant calls loaded:", data); // Debug log to confirm JSON data is loaded
    grantCalls = data; // Assign the data to the global variable
    document.getElementById('searchButton').disabled = false; // Enable search button
  })
  .catch(error => console.error("Error loading grant calls:", error));

  // Add event listener for the "Enter" key in the search input
  document.getElementById('search').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission
      filterCalls(); // Trigger the search
    }
  });

  // Attach the filterCalls function to the search button
  document.getElementById('searchButton').addEventListener('click', filterCalls);

function filterCalls() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const startDate = document.getElementById('startDate')?.value; // Optional date filter
  const endDate = document.getElementById('endDate')?.value; // Optional date filter

  const results = grantCalls.filter(call => {
    // Filter by keyword
    const matchesKeyword =
      call.grant_name.toLowerCase().includes(keyword) ||
      call.focus_area.toLowerCase().includes(keyword) ||
      call.eligibility.toLowerCase().includes(keyword) ||
      call.objectives?.toLowerCase().includes(keyword) ||
      (call.keywords && call.keywords.some(kw => kw.toLowerCase().includes(keyword)));

    // Filter by date range
    let matchesDate = true; // Default to true if no date filters are set
    if (startDate || endDate) {
      const deadline = new Date(call.deadline.match(/\d{1,2} \w+ \d{4}/)[0]); // Parse deadline
      if (startDate) matchesDate = matchesDate && deadline >= new Date(startDate);
      if (endDate) matchesDate = matchesDate && deadline <= new Date(endDate);
    }

    return matchesKeyword && matchesDate;
  });

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = results.map(call => {
    // Calculate urgency for deadline
    const today = new Date();
    const deadlineMatch = call.deadline.match(/\d{1,2} \w+ \d{4}/); // Extract date
    let urgencyStyle = "";
    let urgencyMessage = "";

    if (deadlineMatch) {
      const deadline = new Date(deadlineMatch[0]);
      const timeDifference = (deadline - today) / (1000 * 60 * 60 * 24); // Difference in days

      if (timeDifference <= 7) {
        // Less than or equal to 7 days
        urgencyStyle = "color: red; font-weight: bold;";
        urgencyMessage = "(Urgent)";
      } else if (timeDifference <= 30) {
        // Less than or equal to 30 days
        urgencyStyle = "color: orange; font-weight: bold;";
        urgencyMessage = "(Approaching)";
      } else {
        // More than 30 days
        urgencyStyle = "color: green; font-weight: bold;";
        urgencyMessage = "(Plenty of Time)";
      }
    }

    return `
      <div class="call">
        <h3>${call.grant_name}</h3>
        <p><strong>Focus Area:</strong> ${call.focus_area || 'Not specified'}</p>
        <p><strong>Eligibility:</strong> ${call.eligibility || 'Not specified'}</p>
        <p><strong>Deadline:</strong> 
          <span style="${urgencyStyle}">${call.deadline || 'Not specified'} ${urgencyMessage}</span>
        </p>
        <p><strong>Objectives:</strong> ${call.objectives || 'Not specified'}</p>
        <p><strong>Keywords:</strong> ${call.keywords ? call.keywords.join(', ') : 'Not specified'}</p>
        <p>For detailed info, please see the call document: 
          <a href="${call.link}" target="_blank">View Call Document</a>
        </p>
      </div>
    `;
  }).join('');
}
});
