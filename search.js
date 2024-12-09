// List of text files to index
const markdownFiles = ['grant_info.txt', 'DMP_templates.txt', 'grant_writing_tips.txt'];

// Initialize variables
let lunrIndex;
const documents = [];

// Fetch and process each text file
Promise.all(
  markdownFiles.map((file, index) =>
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        console.log(`Loaded content from ${file}:`, text.substring(0, 100)); // Logs first 100 characters
        documents.push({ id: index, title: file, content: text });
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
    this.ref('id');
    this.field('title');
    this.field('content');

    documents.forEach(doc => {
      console.log('Adding document to index:', doc); // Log document being added
      this.add(doc);
    });
  });
  console.log('Lunr.js index built successfully!');
});

// Search function
function search(query) {
  if (!lunrIndex) {
    console.error('Search index is not ready yet.');
    return [];
  }

  const results = lunrIndex.search(query);
  console.log('Search query:', query);
  console.log('Search results:', results);

  return results.map(result => {
    const doc = documents.find(d => d.id === parseInt(result.ref, 10));
    return { title: doc.title, content: doc.content };
  });
}

// Display search results
document.getElementById('search-button').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    console.error('Search query is empty.');
    return;
  }

  const results = search(query);

  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = ''; // Clear previous results

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(result => {
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = `
      <h3>${result.title}</h3>
      <p>${result.content.substring(0, 200)}...</p>
    `;
    resultsDiv.appendChild(resultDiv);
  });
});
