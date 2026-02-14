// script.js

// 1. Mobile Menu Toggle Logic
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// 2. Leaflet Map Initialization
// Coordinates for Akurdi, Pune [18.64, 73.77]
var map = L.map('map').setView([18.64, 73.77], 13); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var marker = L.marker([18.64, 73.77]).addTo(map);
marker.bindPopup("<b>SoftCircuit Solutions</b><br>Rutej Park, Akurdi, Pune").openPopup();

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

    const prompt = `Generate a list of 5 innovative engineering project ideas based on the following topic: "${userInput}". Provide a brief one-sentence description for each. Keep it professional.`;
    
    try {
        const apiKey = "AIzaSyAHusNl1XUrJvaDysUngwd1lFhlc6l5oCA"; // Change this!
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            const text = result.candidates[0].content.parts[0].text;
            // Converting Markdown-style lists to HTML line breaks
            ideasList.innerHTML = text.replace(/\n/g, '<br>').replace(/\*/g, '');
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("API Error:", error);
        ideasList.innerHTML = '<p class="text-red-400">Failed to generate ideas. Please check your internet or API settings.</p>';
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
