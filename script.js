const productsCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=406069211&single=true&output=csv";
const companyCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=0&single=true&output=csv";
const formEndpoint = "https://script.google.com/macros/s/AKfycbwYyQMsjC6y2_cU9LcoD7hpw41ml7-VlFTJBrgKfhkdapEU2fkhUvM3yEdB_KxBf42B/exec";

// Fetch and render company info
Papa.parse(companyCSV, {
  download: true,
  header: true,
  complete: (results) => {
    const data = results.data;
    document.getElementById('company-name').innerText = data.find(r => r.Field === 'Company Name').Value;
    document.getElementById('company-tagline').innerText = data.find(r => r.Field === 'Tagline').Value;
    document.getElementById('company-about').innerText = data.find(r => r.Field === 'About').Value;
  }
});

// Fetch and render products
let productsData = [];
Papa.parse(productsCSV, {
  download: true,
  header: true,
  complete: (results) => {
    productsData = results.data;
    renderProducts(productsData);
    renderSectors(productsData);
  }
});

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  products.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p['Image URL'] || 'placeholder.jpg'}" alt="${p['Item Name']}">
        <h3>${p['Item Name']} (${p['Variant Code']})</h3>
        <p>${p['Description']}</p>
        <p><strong>Price:</strong> ${p['Price/Unit']} (${p['Unit']})</p>
        <p><strong>MOQ:</strong> ${p['MOQ']}</p>
      </div>
    `;
  });
}

// Render sectors dynamically
function renderSectors(products) {
  const sectors = [...new Set(products.map(p => p.Category))];
  const container = document.getElementById('sector-list');
  container.innerHTML = '';
  sectors.forEach(sector => {
    container.innerHTML += `<div class="card"><h3>${sector}</h3></div>`;
  });
}

// Search function
document.getElementById('search').addEventListener('input', (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = productsData.filter(p =>
    p['Item Name'].toLowerCase().includes(keyword) ||
    p['Variant Code'].toLowerCase().includes(keyword)
  );
  renderProducts(filtered);
});

// Handle contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = {};
  formData.forEach((value, key) => payload[key] = value);

  const statusEl = document.getElementById('form-status');
  statusEl.innerText = "Sending...";
  
  try {
    await fetch(formEndpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    statusEl.innerText = "Inquiry sent successfully!";
    e.target.reset();
  } catch {
    statusEl.innerText = "Failed to send. Please try again.";
  }
});
