
let grantCalls = []; // Placeholder for JSON data

// Fetch the data from the JSON file
fetch('grant_calls.json')
  .then(response => response.json())
  .then(data => {
    grantCalls = data;
  });

// Function to filter calls based on input
function filterCalls() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const results = grantCalls.filter(call =>
    call.grant_name.toLowerCase().includes(keyword) ||
    call.focus_area.toLowerCase().includes(keyword) ||
    call.eligibility.toLowerCase().includes(keyword)
  );

  // Display the results
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = results.map(call => `
    <div class="call">
      <h3>${call.grant_name}</h3>
      <p><strong>Focus Area:</strong> ${call.focus_area}</p>
      <p><strong>Eligibility:</strong> ${call.eligibility}</p>
      <p><strong>Deadline:</strong> ${call.deadline}</p>
      <a href="${call.link}" target="_blank">View Call Document</a>
    </div>
  `).join('');
}
