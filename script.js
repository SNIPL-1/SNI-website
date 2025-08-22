//const productsCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=406069211&single=true&output=csv";
//const companyCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=0&single=true&output=csv";
//const formEndpoint = "https://script.google.com/macros/s/AKfycbwYyQMsjC6y2_cU9LcoD7hpw41ml7-VlFTJBrgKfhkdapEU2fkhUvM3yEdB_KxBf42B/exec";
//https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pubhtml?gid=406069211&single=true

const PRODUCTS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pubhtml?gid=406069211&single=true&output=csv";
const COMPANY_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBzZ-oe22p1secr4Z1JGc105GaDHzH7eJvXIVcHDcNQ2WNYTZKFlwUyQcNjb6XuAvYCvcrovvcnajj/pub?gid=0&single=true&output=csv";
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwYyQMsjC6y2_cU9LcoD7hpw41ml7-VlFTJBrgKfhkdapEU2fkhUvM3yEdB_KxBf42B/exec";

// Utility to parse CSV to JSON
async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.trim().split('\n').map(r => r.split(','));
  const headers = rows.shift();
  return rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = r[i]?.trim());
    return obj;
  });
}

// Global variables
let products = [];
let companyInfo = {};

// Initialize website
async function initSite() {
  companyInfo = (await fetchCSV(COMPANY_CSV))[0];
  products = await fetchCSV(PRODUCTS_CSV);

  renderHomePage();
}

// Home Page Rendering
function renderHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section id="about" class="p-4">
      <h1 class="text-2xl font-bold mb-2">${companyInfo['Company Name'] || 'Our Company'}</h1>
      <p>${companyInfo['About'] || 'About info not available'}</p>
    </section>

    <section id="categories" class="p-4">
      <h2 class="text-xl font-bold mb-2">Categories</h2>
      <div id="category-list" class="grid grid-cols-2 gap-4"></div>
    </section>

    <section id="contact" class="p-4">
      <h2 class="text-xl font-bold mb-2">Contact Us</h2>
      <form id="contact-form" class="flex flex-col gap-2">
        <input type="text" name="name" placeholder="Your Name" required class="p-2 border rounded"/>
        <input type="email" name="email" placeholder="Your Email" required class="p-2 border rounded"/>
        <textarea name="message" placeholder="Your Message" required class="p-2 border rounded"></textarea>
        <button type="submit" class="bg-blue-500 text-white p-2 rounded">Send</button>
      </form>
      <p id="contact-status" class="text-sm mt-2"></p>
    </section>
  `;

  renderCategories();
  handleContactForm();
}

// Render Categories
function renderCategories() {
  const uniqueCategories = [...new Set(products.map(p => p['Category']))];
  const container = document.getElementById('category-list');
  container.innerHTML = uniqueCategories.map(cat => `
    <div class="border p-2 rounded shadow cursor-pointer text-center hover:bg-gray-100"
         onclick="renderProducts('${cat}')">
      <h3 class="font-semibold">${cat}</h3>
    </div>
  `).join('');
}

// Render Products for Selected Category
function renderProducts(category) {
  const app = document.getElementById('app');
  const filtered = products.filter(p => p['Category'] === category);
  const uniqueItems = [...new Map(filtered.map(p => [p['Item Code'], p])).values()];

  app.innerHTML = `
    <button onclick="renderHomePage()" class="mb-4 text-blue-500">&larr; Back</button>
    <h2 class="text-xl font-bold mb-4">${category}</h2>
    <div class="grid grid-cols-2 gap-4">
      ${uniqueItems.map(item => `
        <div class="border p-2 rounded shadow cursor-pointer hover:bg-gray-100"
             onclick="renderProductDetails('${item['Item Code']}')">
          <img src="${item['Image URL']}" alt="${item['Product Name']}" class="w-full h-32 object-contain mb-2"/>
          <p class="font-semibold">${item['Product Name']} (${item['Item Code']})</p>
        </div>
      `).join('')}
    </div>
  `;
}

// Render Product Details
function renderProductDetails(itemCode) {
  const app = document.getElementById('app');
  const variants = products.filter(p => p['Item Code'] === itemCode);
  const main = variants[0];

  app.innerHTML = `
    <button onclick="renderProducts('${main['Category']}')" class="mb-4 text-blue-500">&larr; Back</button>
    <h2 class="text-xl font-bold">${main['Product Name']}</h2>
    <p><strong>Item Code:</strong> ${main['Item Code']}</p>
    <p><strong>HSN Code:</strong> ${main['HSN Code']}</p>
    <p><strong>Specifications:</strong> ${main['Specifications']}</p>
    <img src="${main['Image URL']}" class="w-64 h-64 object-contain my-4"/>
    <table class="w-full border">
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2">Variant Code</th>
          <th class="border p-2">Description</th>
          <th class="border p-2">Price/Unit</th>
          <th class="border p-2">Unit</th>
          <th class="border p-2">MOQ</th>
          <th class="border p-2">WhatsApp</th>
        </tr>
      </thead>
      <tbody>
        ${variants.map(v => `
          <tr>
            <td class="border p-2">${v['Variant Code']}</td>
            <td class="border p-2">${v['Description']}</td>
            <td class="border p-2">${v['Price/Unit']}</td>
            <td class="border p-2">${v['Unit']}</td>
            <td class="border p-2">${v['MOQ']}</td>
            <td class="border p-2">
              <a href="https://wa.me/YOUR_NUMBER?text=Hi, I am interested in this product.%0AItem Name: ${encodeURIComponent(v['Product Name'])}%0AVariant Code: ${encodeURIComponent(v['Variant Code'])}%0ADescription: ${encodeURIComponent(v['Description'])}%0APrice/Unit: ${encodeURIComponent(v['Price/Unit'])}%0AUnit: ${encodeURIComponent(v['Unit'])}"
                 class="text-green-600 font-semibold" target="_blank">WhatsApp</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Handle Contact Form
function handleContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((v, k) => data[k] = v);

    status.textContent = "Sending...";
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    status.textContent = res.ok ? "Message sent successfully!" : "Failed to send message.";
    form.reset();
  });
}

window.onload = initSite;



