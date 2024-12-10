// List of JSON files to load
const jsonFiles = ['grant_info.json', 'DMP_template.json', 'grant_writing_tips.json'];

// Initialize Lunr.js
let lunrIndex;
let documents = [];

// Fetch and combine all JSON files
Promise.all(
  jsonFiles.map(file =>
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        documents = documents.concat(data); // Combine data into a single array
      })
      .catch(error => {
        console.error(`Error loading ${file}:`, error.message);
      })
  )
).then(() => {
  if (documents.length === 0) {
    console.error('No documents were loaded. Please check file paths and content.');
    return;
  }

  // Build the Lunr.js index
  lunrIndex = lunr(function () {
    this.ref('title'); // Use the title as the reference
    this.field('title');
    this.field('deadline_pre-proposal');
    this.field('deadline_full-proposal');
    this.field('deadline');
    this.field('submission_period');
    this.field('funding_amount');
    this.field('domains');
    this.field('eligibility');
    this.field('restrictions');
    this.field('unique_conditions');
    this.field('financial_constraints');
    this.field('eligible_costs');
    this.field('call_document');
    this.field('website');
    this.field('category');
    this.field('type');
    this.field('description');   // Add description for DMP and Writing Tips
    this.field('document');     // Add document field for DMP Templates
    this.field('key_tips.title'); // Add key tips title
    this.field('key_tips.content'); // Add key tips content
    this.field('references.title'); // Add references title
    this.field('references.articles.title'); // Add article titles
    this.field('references.articles.citation'); // Add article citations
    this.field('references.articles.availability'); // Add availability notes

    documents.forEach(doc => this.add(doc));
  });
  console.log('Lunr.js index built successfully!');
});

// Search function
function search(query) {
  if (!lunrIndex) {
    console.error('Search index is not ready yet.');
    return [];
  }

  // Get the selected category
  const selectedCategory = document.getElementById('category-select').value;
  console.log("Selected category:", selectedCategory);

  // Normalize category values to match JSON structure
  const categoryMapping = {
    'grant_Info': 'Grant Info',
    'DMP_template': 'Templates',
    'grant_writing_tips': 'Tips',
    'all': 'all'
  };

  const normalizedCategory = categoryMapping[selectedCategory] || 'all';

  // Filter documents by selected category (if not "all")
  const filteredDocuments = normalizedCategory === 'all'
    ? documents
    : documents.filter(doc => doc.category === normalizedCategory);

  console.log("Filtered documents by category:", filteredDocuments);

  // Perform the Lunr search
  const results = lunrIndex.search(query);

  // Match Lunr results with filtered documents
  return results
    .map(result => filteredDocuments.find(doc => doc.title === result.ref)) // Match with filtered documents
    .filter(result => result !== undefined); // Exclude undefined results
}

// Display search results
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();

  const results = search(query);

  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = ''; // Clear previous results before displaying new ones

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(result => {
    const resultDiv = document.createElement('div');
    resultDiv.style.border = '1px solid #ccc';
    resultDiv.style.margin = '10px 0';
    resultDiv.style.borderRadius = '5px';
    resultDiv.style.backgroundColor = '#fff';
    resultDiv.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';

    // Create a toggle button for the title
    const titleButton = document.createElement('button');
    titleButton.textContent = result.title || 'Untitled';
    titleButton.style.width = '100%';
    titleButton.style.padding = '10px';
    titleButton.style.border = 'none';
    titleButton.style.backgroundColor = 'transparent';
    titleButton.style.color = '#166b8a';
    titleButton.style.textAlign = 'left';
    titleButton.style.cursor = 'pointer';
    titleButton.style.fontSize = '1.2em';

    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'none';
    contentDiv.style.padding = '15px';
    contentDiv.style.borderTop = '1px solid #ccc';
    contentDiv.style.backgroundColor = '#f9f9f9';
    contentDiv.style.borderRadius = '0 0 5px 5px';

    // Handle colors for deadlines
    const currentDate = new Date();
    const preProposalDate = result['deadline_pre-proposal'] ? new Date(result['deadline_pre-proposal']) : null;
    const fullProposalDate = result['deadline_full-proposal'] ? new Date(result['deadline_full-proposal']) : null;
    const deadlineDate = result['deadline'] ? new Date(result['deadline']) : null;
    

    let preProposalColor = '';
    if (preProposalDate && !isNaN(preProposalDate)) {
      const diffDays = (preProposalDate - currentDate) / (1000 * 60 * 60 * 24);
      preProposalColor = diffDays <= 7 ? 'red' : diffDays <= 30 ? 'orange' : 'green';
    }

    let fullProposalColor = '';
    if (fullProposalDate && !isNaN(fullProposalDate)) {
      const diffDays = (fullProposalDate - currentDate) / (1000 * 60 * 60 * 24);
      fullProposalColor = diffDays <= 7 ? 'red' : diffDays <= 30 ? 'orange' : 'green';
    }
    
let deadlineColor = 'gray';
if (deadlineDate && !isNaN(deadlineDate)) {
  const diffDays = (deadlineDate - new Date()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) {
    deadlineColor = 'red';
  } else if (diffDays <= 30) {
    deadlineColor = 'orange';
  } else {
    deadlineColor = 'green';
  }
}
    

    // Handle colors for submission period
    const submissionPeriod = result['submission_period'] || 'N/A';
    let submissionPeriodColor = 'gray';
    if (submissionPeriod !== 'N/A') {
      const periodMatch = submissionPeriod.match(/(\d{1,2} \w+ \d{4}) to (\d{1,2} \w+ \d{4})/);
      if (periodMatch) {
        const periodStart = new Date(periodMatch[1]);
        const periodEnd = new Date(periodMatch[2]);
        if (currentDate >= periodStart && currentDate <= periodEnd) {
          submissionPeriodColor = 'green';
        } else if (currentDate < periodStart) {
          submissionPeriodColor = 'orange';
        } else {
          submissionPeriodColor = 'red';
        }
      }
    }

    if (result.category === 'Grant Info') {
      contentDiv.innerHTML = `
        <p><strong>Type:</strong> ${result.type || 'N/A'}</p> 
        <p><strong>Category:</strong> ${result.category}</p>
        <p><strong>Pre-Proposal Deadline:</strong> <span style="color: ${preProposalColor}">${result['deadline_pre-proposal'] || 'N/A'}</span></p>
        <p><strong>Full Proposal Deadline:</strong> <span style="color: ${fullProposalColor}">${result['deadline_full-proposal'] || 'N/A'}</span></p>
        <p><strong>Deadline:</strong> <span style="color: ${deadlineColor}">${result.deadline || 'N/A'}</span></p>
        <p><strong>Submission Period:</strong> <span style="color: ${submissionPeriodColor}">${submissionPeriod}</span></p>
        <p><strong>Funding Amount:</strong> ${result.funding_amount || 'N/A'}</p>
        <p><strong>Domains:</strong> ${result.domains || 'N/A'}</p>
        <p><strong>Eligibility:</strong> ${result.eligibility || 'N/A'}</p>
        <p><strong>Restrictions:</strong> ${result.restrictions || 'N/A'}</p>
        <p><strong>Unique Conditions:</strong> ${result.unique_conditions || 'N/A'}</p>
        <p><strong>Financial Constraints:</strong> ${result.financial_constraints || 'N/A'}</p>
        <p><strong>Eligible Costs:</strong> ${result.eligible_costs || 'N/A'}</p>
        <p><strong>Call Document:</strong> <a href="${result.call_document}" target="_blank">Download</a></p>
        <p><strong>Website:</strong> <a href="${result.website}" target="_blank">Visit</a></p>
      `;
    } else if (result.category === 'Templates') {
      contentDiv.innerHTML = `
        <p><strong>Category:</strong> ${result.category}</p>
        <p><strong>Description:</strong> ${result.description || 'N/A'}</p>
        <p><strong>Document:</strong> <a href="${result.document}" target="_blank">Download</a></p>
      `;
    } else if (result.category === 'Tips' && result.key_tips) {
      contentDiv.innerHTML = `
        <p><strong>Description:</strong> ${result.description || 'N/A'}</p>
        <p><strong>Category:</strong> ${result.category}</p>
        <h3>${result.key_tips.title}</h3>
        <ul>${(result.key_tips.content || []).map(tip => `<li>${tip}</li>`).join('')}</ul>
        <h4>${result.references.title}</h4>
        <ul>${(result.references.articles || []).map(article => `
          <li><strong>${article.title}</strong>: ${article.citation} <em>${article.availability}</em></li>
        `).join('')}</ul>
      `;
    }

    titleButton.addEventListener('click', () => {
      contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
    });

    resultDiv.appendChild(titleButton);
    resultDiv.appendChild(contentDiv);
    resultsDiv.appendChild(resultDiv);
  });
});

// Toggle functionality for showing/hiding content in each category
document.querySelectorAll('.toggle-info').forEach(button => {
  button.addEventListener('click', () => {
    const content = button.nextElementSibling; // Select the next sibling content section
    if (content) {
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    }
  });
});

// Trigger search on Enter key press
document.getElementById('search-input').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('search-button').click();
  }
});
