// script.js

// 1. Mobile Menu Toggle Logic
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// 2. Leaflet Map Initialization
const mapElement = document.getElementById('map');
if (mapElement) {
    const lat = 18.6429; 
    const lng = 73.7640;
    var map = L.map('map').setView([lat, lng], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>SoftCircuit Solutions</b><br>Head Office, Pune").openPopup();
}

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

// 5. Modal Logic
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
// 6. DYNAMIC PROJECTS & ADMIN PANEL LOGIC 
// =========================================================================

// Fetch and render projects from Vercel Postgres
async function fetchAndRenderProjects() {
    const commercialGrid = document.getElementById('commercial-grid');
    const academicGrid = document.getElementById('academic-grid');
    
    if(!commercialGrid || !academicGrid) return;

    try {
        const response = await fetch('/api/get-projects');
        const data = await response.json();
        const projects = data.projects || [];

        commercialGrid.innerHTML = '';
        academicGrid.innerHTML = '';

        if (projects.length === 0) {
            commercialGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">No projects added yet. Use the Admin panel to add your first commercial project.</div>';
            academicGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">No projects added yet. Use the Admin panel to add your first academic project.</div>';
            return;
        }

        projects.forEach(proj => {
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
    } catch (error) {
        console.error("Error fetching projects:", error);
        commercialGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load projects.</div>';
        academicGrid.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load projects.</div>';
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProjects);

// Admin Routing Logic
const mainContent = document.getElementById('main-content');
const mainHeader = document.getElementById('main-header');
const adminPanel = document.getElementById('admin-panel');

function handleRouting() {
    if (window.location.hash === '#admin') {
        if(mainContent) mainContent.classList.add('hidden');
        if(mainHeader) mainHeader.classList.add('hidden');
        if(adminPanel) {
            adminPanel.classList.remove('hidden');
            adminPanel.classList.add('flex');
        }
    } else {
        if(mainContent) mainContent.classList.remove('hidden');
        if(mainHeader) mainHeader.classList.remove('hidden');
        if(adminPanel) {
            adminPanel.classList.add('hidden');
            adminPanel.classList.remove('flex');
        }
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// Admin Panel Interactions
const loginBtn = document.getElementById('login-btn');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBox = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

let currentAdminPassword = '';

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const pwd = adminPasswordInput.value.trim();
        if (pwd) {
            currentAdminPassword = pwd;
            // Proceed to dashboard; verification happens securely on upload
            adminLoginBox.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            if(loginError) loginError.classList.add('hidden');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentAdminPassword = '';
        adminPasswordInput.value = '';
        adminDashboard.classList.add('hidden');
        adminLoginBox.classList.remove('hidden');
        window.location.hash = ''; 
    });
}

// Admin Dashboard Form Upload Logic
const addProjectForm = document.getElementById('add-project-form');
const uploadStatus = document.getElementById('upload-status');
const uploadBtn = document.getElementById('upload-btn');

if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        uploadStatus.textContent = 'Uploading...';
        uploadStatus.className = 'text-center mt-4 text-sm font-bold text-yellow-400';
        uploadBtn.disabled = true;

        const title = document.getElementById('proj-title').value;
        const type = document.getElementById('proj-type').value;
        const category = type === 'commercial' ? 'Business Solutions' : 'Engineering Project';
        const desc = document.getElementById('proj-desc').value;
        const imageFile = document.getElementById('proj-image').files[0];

        // Convert image file to Base64 string for database storage
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;

            try {
                const response = await fetch('/api/add-project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        password: currentAdminPassword,
                        title,
                        category,
                        type,
                        image: base64Image,
                        desc
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    uploadStatus.textContent = 'Project successfully added!';
                    uploadStatus.className = 'text-center mt-4 text-sm font-bold text-green-400';
                    addProjectForm.reset();
                    fetchAndRenderProjects(); 
                } else {
                    uploadStatus.textContent = result.message || 'Upload failed.';
                    uploadStatus.className = 'text-center mt-4 text-sm font-bold text-red-500';
                    
                    if (response.status === 401) {
                        setTimeout(() => {
                            if(logoutBtn) logoutBtn.click();
                            if(loginError) {
                                loginError.textContent = 'Unauthorized: Incorrect Password';
                                loginError.classList.remove('hidden');
                            }
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('Upload error:', error);
                uploadStatus.textContent = 'Connection error.';
                uploadStatus.className = 'text-center mt-4 text-sm font-bold text-red-500';
            } finally {
                uploadBtn.disabled = false;
            }
        };
        
        if (imageFile) {
            reader.readAsDataURL(imageFile);
        }
    });
}
