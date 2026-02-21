// ===== DOM Elements =====
const skillsContainer = document.getElementById('skills-container');
const projectsContainer = document.getElementById('projects-container');
const contactForm = document.getElementById('contact-form');
const scrollTop = document.getElementById('scroll-top');
const filterBtns = document.querySelectorAll('.filter-btn');

// ===== Socket.io Setup =====
const socket = io();
let userName = '';

// ===== Load Skills =====
async function loadSkills() {
  try {
    const response = await fetch('/api/skills');
    const skills = await response.json();
    
    skillsContainer.innerHTML = skills.map(skill => `
      <div class="skill-card">
        <div class="skill-header">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-category">${skill.category}</span>
        </div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${skill.level}%"></div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading skills:', error);
    skillsContainer.innerHTML = '<p>Failed to load skills</p>';
  }
}

// ===== Load Projects =====
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    
    projectsContainer.innerHTML = projects.map(project => `
      <div class="project-card" data-category="${getCategory(project.technologies)}">
        <img src="${project.image}" alt="${project.title}" class="project-image">
        <div class="project-info">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-links">
            <a href="${project.githubLink}" class="project-link" target="_blank">
              <i class="fab fa-github"></i> Code
            </a>
            <a href="${project.liveDemo}" class="project-link" target="_blank">
              <i class="fas fa-external-link-alt"></i> Demo
            </a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
    projectsContainer.innerHTML = '<p>Failed to load projects</p>';
  }
}

function getCategory(technologies) {
  const tech = technologies.join(' ').toLowerCase();
  if (tech.includes('react') || tech.includes('vue') || tech.includes('html') || tech.includes('css')) {
    return 'frontend';
  }
  if (tech.includes('node') || tech.includes('express') || tech.includes('api')) {
    return 'backend';
  }
  return 'fullstack';
}

// ===== Project Filter =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ===== Contact Form =====
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(contactForm);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };
  
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Message sent successfully!');
      contactForm.reset();
    } else {
      alert('Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  }
});

// ===== Chat System =====
const chatLogin = document.getElementById('chat-login');
const chatBox = document.getElementById('chat-box');
const joinChatBtn = document.getElementById('join-chat');
const userNameInput = document.getElementById('user-name');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');

joinChatBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if (name) {
    userName = name;
    chatLogin.style.display = 'none';
    chatBox.style.display = 'flex';
    chatBox.style.flexDirection = 'column';
    
    socket.emit('joinChat', userName);
  }
});

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && userName) {
    socket.emit('sendMessage', {
      userName: userName,
      message: message,
      isAdmin: false
    });
    messageInput.value = '';
  }
}

socket.on('receiveMessage', (data) => {
  const messageDiv = document.createElement('div');
  const isSent = data.sender === userName || data.sender === 'Admin';
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  messageDiv.innerHTML = `
    ${!isSent ? `<div class="sender">${data.sender}</div>` : ''}
    ${data.text}
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ===== Scroll Top =====
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollTop.classList.add('active');
  } else {
    scrollTop.classList.remove('active');
  }
});

scrollTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Mobile Menu Toggle =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  if (navLinks.style.display === 'flex') {
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.left = '0';
    navLinks.style.width = '100%';
    navLinks.style.background = 'white';
    navLinks.style.padding = '20px';
    navLinks.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
  }
});

// ===== Smooth Scroll for Nav Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu
      if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
      }
    }
  });
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  loadSkills();
  loadProjects();
});
