//const productsCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=406069211&single=true&output=csv";
//const companyCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=0&single=true&output=csv";
//const formEndpoint = "https://script.google.com/macros/s/AKfycbwYyQMsjC6y2_cU9LcoD7hpw41ml7-VlFTJBrgKfhkdapEU2fkhUvM3yEdB_KxBf42B/exec";

// ====== CONFIG: Replace these with your actual published CSV links & Web App URL ======
const PRODUCTS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=406069211&single=true&output=csv"; // e.g. https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
const COMPANY_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=0&single=true&output=csv"; // columns: Field,Value (Email, Phone, Address, Gallery1, Gallery2, WhatsApp Number)
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwYyQMsjC6y2_cU9LcoD7hpw41ml7-VlFTJBrgKfhkdapEU2fkhUvM3yEdB_KxBf42B/exec"; // Apps Script web app that writes to Inquiries tab


let products = [];

// Load CSV and parse data
async function loadCSV(url) {
const response = await fetch(url);
const text = await response.text();
return Papa.parse(text, { header: true }).data.filter(row => row['Item Code']);
}

// Load all data on page load
document.addEventListener('DOMContentLoaded', async () => {
products = await loadCSV(PRODUCTS_CSV);
if (document.getElementById('categories-grid')) {
renderCategories();
} else if (document.getElementById('product-list')) {
const category = new URLSearchParams(window.location.search).get('category');
renderCategoryProducts(category);
} else if (document.getElementById('product-detail')) {
const itemCode = new URLSearchParams(window.location.search).get('item');
renderProductDetail(itemCode);
}

const form = document.getElementById('contact-form');
if (form) {
form.addEventListener('submit', handleFormSubmit);
}
});

// Render unique categories
function renderCategories() {
const grid = document.getElementById('categories-grid');
const categories = [...new Set(products.map(p => p['Category']))];
categories.forEach(cat => {
const card = document.createElement('div');
card.className = 'category-card';
card.innerHTML = <h3>${cat}</h3>;
card.onclick = () => {
window.location.href = products.html?category=${encodeURIComponent(cat)};
};
grid.appendChild(card);
});
}

// Render products by unique Item Code
function renderCategoryProducts(category) {
const list = document.getElementById('product-list');
const filtered = products.filter(p => p['Category'] === category);
const uniqueCodes = [...new Set(filtered.map(p => p['Item Code']))];

uniqueCodes.forEach(code => {
const item = filtered.find(p => p['Item Code'] === code);
const card = document.createElement('div');
card.className = 'product-card';
card.innerHTML =       <img src="${item['Image URL']}" alt="${item['Item Name']}" />
      <h4>${item['Item Name']}</h4>
      <button onclick="window.location.href='detail.html?item=${code}'">View Details</button>
   ;
list.appendChild(card);
});
}

// Render product detail and variants
function renderProductDetail(itemCode) {
const detail = document.getElementById('product-detail');
const filtered = products.filter(p => p['Item Code'] === itemCode);
const main = filtered[0];

detail.innerHTML =     <h2>${main['Item Name']}</h2>
    <p><b>Item Code:</b> ${main['Item Code']}</p>
    <p><b>HSN Code:</b> ${main['HSN Code']}</p>
    <p>${main['Specs']}</p>
    <img src="${main['Image URL']}" alt="${main['Item Name']}" class="main-image" />
    <table class="variants">
      <thead>
        <tr>
          <th>Variant Code</th><th>Description</th><th>Price/Unit</th><th>Unit</th><th>MOQ</th><th>WhatsApp</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(variant =>

${variant['Variant Code']}
${variant['Description']}
${variant['Price/Unit']}
${variant['Unit']}
${variant['MOQ']}
WhatsApp
).join('')}
      </tbody>
    </table>
  ;
}

// Handle Contact form
async function handleFormSubmit(e) {
e.preventDefault();
const formData = new FormData(e.target);
const data = Object.fromEntries(formData.entries());

const response = await fetch(FORM_ENDPOINT, {
method: 'POST',
body: JSON.stringify(data),
headers: { 'Content-Type': 'application/json' }
});

if (response.ok) {
alert('Thank you for contacting us!');
e.target.reset();
} else {
alert('There was an error. Please try again.');
}
}

