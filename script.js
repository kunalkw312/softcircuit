// script.js

// 1. Mobile Menu Toggle Logic
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// 2. Leaflet Map Initialization
const lat = 18.6429; 
const lng = 73.7640;
var map = L.map('map').setView([lat, lng], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);
var marker = L.marker([lat, lng]).addTo(map);
marker.bindPopup("<b>SoftCircuit Solutions</b><br>Head Office, Pune").openPopup();

// 3. Project Idea Generator (Gemini Integration)
const generateIdeasBtn = document.getElementById('generate-ideas-btn');
const ideaInput = document.getElementById('idea-input');
const ideaResults = document.getElementById('idea-results');
const ideasList = document.getElementById('ideas-list');
const loader = document.getElementById('loader');

if (generateIdeasBtn) {
    generateIdeasBtn.addEventListener('click', async () => {
        const userInput = ideaInput.value.trim();
        if (!userInput) {
            alert('Please enter a topic first!');
            return;
        }

        ideaResults.classList.remove('hidden');
        loader.classList.remove('hidden');
        ideasList.innerHTML = '';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput: userInput })
            });

            const result = await response.json();
            
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                let text = result.candidates[0].content.parts[0].text;
                let formattedText = text
                    .replace(/\*\*(.*?)\*\*/g, '<b class="text-orange-500">$1</b>') 
                    .replace(/\n/g, '<br>') 
                    .replace(/\*/g, ''); 
                    
                ideasList.innerHTML = `<div class="space-y-4 text-gray-300">${formattedText}</div>`;
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("API Error:", error);
            ideasList.innerHTML = '<p class="text-red-400">Connection error. Please try again later.</p>';
        } finally {
            loader.classList.add('hidden');
        }
    });
}

// 4. Contact Form Handling (Formspree)
const contactForm = document.getElementById('contact-form');
const formConfirmation = document.getElementById('form-confirmation');
const formError = document.getElementById('form-error');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(contactForm);
        formError.classList.add('hidden');

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formConfirmation.classList.remove('hidden');
                contactForm.reset();
                setTimeout(() => formConfirmation.classList.add('hidden'), 5000);
            } else {
                formError.textContent = "Oops! Something went wrong. Please try again.";
                formError.classList.remove('hidden');
            }
        } catch (error) {
            formError.textContent = "Connection error. Please try again later.";
            formError.classList.remove('hidden');
        }
    });
}

// 5. Modal Logic (Moved from HTML)
function openModal(title, category, img, desc) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalCategory').innerText = category;
    document.getElementById('modalDesc').innerText = desc;
    document.getElementById('modalImg').src = img;
    
    const phone = "917219408643";
    const text = `Hi SoftCircuit Solutions, I'm interested in the "${title}" project. Can you provide more details?`;
    const encodedText = encodeURIComponent(text);
    
    document.getElementById('waBtn').href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    
    document.getElementById('projectModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    document.getElementById('projectModal').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
}

// =========================================================================
// 6. DYNAMIC PROJECTS & ADMIN PANEL LOGIC (NEW)
// =========================================================================

// Temporary data storage until the Vercel database is connected
let currentProjects = [
    {
        title: 'MediGuid',
        category: 'Medical Recommendation System',
        type: 'academic',
        image: 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1770194907/Screenshot_20260204-124918_ygv1qo.png',
        desc: 'Custom ML based medical recommendations app based on your symptoms.'
    },
    {
        title: 'Smart Plant Monitoring',
        category: 'IoT Agriculture System',
        type: 'academic',
        image: 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1770194908/IMG-20260204-WA0019_tqgrzu.jpg',
        desc: 'Real-time soil moisture, temperature, and humidity tracking on your smartphone via ESP8266.'
    },
    {
        title: 'Sun Tracking Solar',
        category: 'IoT Renewable Energy',
        type: 'academic',
        image: 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1771172855/IMG-20260215-WA0005_2_gfdhro.jpg',
        desc: 'Maximizes solar efficiency using LDR sensors to move panels automatically towards the sun.'
    },
    {
        title: 'Smart Water TDS',
        category: 'Water Quality System',
        type: 'academic',
        image: 'https://res.cloudinary.com/dowhvdkjh/image/upload/v1770195080/IMG_20260116_174159147_kbw425.jpg',
        desc: 'Smart TDS control system that lets monitor the current TDS of the water and control the water flow accordingly.'
    },
    {
        title: 'Enterprise ERP System',
        category: 'Business Operations',
        type: 'commercial',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
        desc: 'Comprehensive Enterprise Resource Planning system tailored for large-scale operations and inventory management.'
    },
    {
        title: 'Real Estate CRM',
        category: 'Customer Management',
        type: 'commercial',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2273&auto=format&fit=crop',
        desc: 'Lead generation, client tracking, and invoice generation dashboard built specifically for real estate agencies.'
    }
];

// Function to render projects to the frontend grids
function renderProjects() {
    const commercialGrid = document.getElementById('commercial-grid');
    const academicGrid = document.getElementById('academic-grid');
    
    if(!commercialGrid || !academicGrid) return;
    
    commercialGrid.innerHTML = '';
    academicGrid.innerHTML = '';

    currentProjects.forEach(proj => {
        const cardHTML = `
            <div class="bg-gray-800 rounded-xl overflow-hidden card-glow tech-border flex flex-col" 
                 onclick="openModal('${proj.title}', '${proj.category}', '${proj.image}', '${proj.desc}')">
                <div class="bg-black flex items-center justify-center aspect-video">
                    <img src="${proj.image}" class="max-h-full max-w-full object-cover">
                </div>
                <div class="p-6 text-center">
                    <h3 class="font-bold text-white text-lg">${proj.title}</h3>
                    <p class="text-gray-400 text-xs mt-2 truncate">${proj.desc}</p>
                </div>
            </div>
        `;
        
        if (proj.type === 'commercial') {
            commercialGrid.innerHTML += cardHTML;
        } else {
            academicGrid.innerHTML += cardHTML;
        }
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', renderProjects);

// Admin Routing Logic
const mainContent = document.getElementById('main-content');
const mainHeader = document.getElementById('main-header');
const adminPanel = document.getElementById('admin-panel');

function handleRouting() {
    if (window.location.hash === '#admin') {
        mainContent.classList.add('hidden');
        mainHeader.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        adminPanel.classList.add('flex');
    } else {
        mainContent.classList.remove('hidden');
        mainHeader.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        adminPanel.classList.remove('flex');
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// Admin Panel Interactions
const loginBtn = document.getElementById('login-btn');
const adminPasswordInput = document.getElementById('admin-password');
const loginError = document.getElementById('login-error');
const adminLoginBox = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');

loginBtn.addEventListener('click', () => {
    const pwd = adminPasswordInput.value;
    // Hardcoded password as requested (Will be moved to secure backend API soon)
    if (pwd === 'kunal123') { 
        adminLoginBox.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loginError.classList.add('hidden');
    } else {
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    adminPasswordInput.value = '';
    adminDashboard.classList.add('hidden');
    adminLoginBox.classList.remove('hidden');
    window.location.hash = ''; // Return to home page
});

// Admin Dashboard Form Upload Logic (Mockup for now)
const addProjectForm = document.getElementById('add-project-form');
const uploadStatus = document.getElementById('upload-status');

addProjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    uploadStatus.textContent = 'Preparing upload sequence... Backend connection required.';
    uploadStatus.className = 'text-center mt-4 text-sm font-bold text-yellow-400';
    
    // In the next step, we will connect this logic to fetch('/api/add-project', {...})
});
