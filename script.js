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

// 3. Project Idea Generator (Gemini API)
const generateIdeasBtn = document.getElementById('generate-ideas-btn');
const ideaInput = document.getElementById('idea-input');
const ideaResults = document.getElementById('idea-results');
const ideasList = document.getElementById('ideas-list');
const loader = document.getElementById('loader');

generateIdeasBtn.addEventListener('click', async () => {
    const userInput = ideaInput.value.trim();
    
    if (!userInput) {
        alert('Please enter a topic first!');
        return;
    }

    // UI Updates
    ideaResults.classList.remove('hidden');
    loader.classList.remove('hidden');
    ideasList.innerHTML = '';

    // Access key from config.js
    const apiKey = typeof CONFIG !== 'undefined' ? CONFIG.GEMINI_API_KEY : '';
    
    if (!apiKey) {
        ideasList.innerHTML = '<p class="text-red-400">Error: API Key not found in config.js</p>';
        loader.classList.add('hidden');
        return;
    }

    const prompt = `Generate a list of 5 innovative engineering project ideas for: "${userInput}". For each, provide a bold title and a short one-sentence description. Use professional language.`;
    
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            let text = result.candidates[0].content.parts[0].text;
            
            // Clean up the formatting
            let formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<b class="text-orange-500">$1</b>') // Bold titles
                .replace(/\n/g, '<br>') // Line breaks
                .replace(/\*/g, ''); // Remove bullet stars
                
            ideasList.innerHTML = `<div class="space-y-4">${formattedText}</div>`;
        } else {
            throw new Error("Invalid response");
        }
    } catch (error) {
        console.error("API Error:", error);
        ideasList.innerHTML = '<p class="text-red-400">Failed to generate ideas. Ensure the API key is restricted to your domain.</p>';
    } finally {
        loader.classList.add('hidden');
    }
});

// 4. Contact Form Handling (Formspree)
const contactForm = document.getElementById('contact-form');
const formConfirmation = document.getElementById('form-confirmation');
const formError = document.getElementById('form-error');

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
