// ===== Socket.io Setup =====
const socket = io();
let currentUser = '';

// ===== DOM Elements =====
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const tabLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
const messagesList = document.getElementById('messages-list');
const projectsList = document.getElementById('projects-list');
const skillsList = document.getElementById('skills-list');
const addProjectBtn = document.getElementById('add-project-btn');
const addSkillBtn = document.getElementById('add-skill-btn');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalFields = document.getElementById('modal-fields');
const modalForm = document.getElementById('modal-form');

// ===== Login =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      adminLogin.style.display = 'none';
      adminDashboard.style.display = 'flex';
      loadMessages();
      loadProjects();
      loadSkills();
      socket.emit('adminConnect');
    } else {
      loginError.textContent = result.message;
    }
  } catch (error) {
    loginError.textContent = 'Login failed. Please try again.';
  }
});

// ===== Logout =====
logoutBtn.addEventListener('click', () => {
  adminDashboard.style.display = 'none';
  adminLogin.style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
});

// ===== Tab Navigation =====
tabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    tabLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const tabId = link.dataset.tab;
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
      }
    });
  });
});

// ===== Load Messages =====
async function loadMessages() {
  try {
    const response = await fetch('/api/messages');
    const messages = await response.json();
    
    if (messages.length === 0) {
      messagesList.innerHTML = '<p>No messages yet</p>';
      return;
    }
    
    messagesList.innerHTML = messages.map(msg => `
      <div class="message-card">
        <div class="message-header">
          <h4>${msg.name}</h4>
          <span>${new Date(msg.createdAt).toLocaleDateString()}</span>
        </div>
        <p style="color: #6366f1; margin-bottom: 10px;">${msg.email}</p>
        <p class="message-content">${msg.message}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// ===== Load Projects =====
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    
    if (projects.length === 0) {
      projectsList.innerHTML = '<p>No projects yet</p>';
      return;
    }
    
    projectsList.innerHTML = projects.map(project => `
      <div class="project-card">
        <img src="${project.image}" alt="${project.title}">
        <div class="project-info">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <div class="project-actions">
            <button class="edit-btn" onclick="editProject('${project._id}')">Edit</button>
            <button class="delete-btn" onclick="deleteProject('${project._id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

// ===== Load Skills =====
async function loadSkills() {
  try {
    const response = await fetch('/api/skills');
    const skills = await response.json();
    
    if (skills.length === 0) {
      skillsList.innerHTML = '<p>No skills yet</p>';
      return;
    }
    
    skillsList.innerHTML = skills.map(skill => `
      <div class="skill-card">
        <div class="skill-header">
          <h4>${skill.name}</h4>
          <span class="skill-category">${skill.category}</span>
        </div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${skill.level}%"></div>
        </div>
        <div class="skill-actions">
          <button class="edit-btn" onclick="editSkill('${skill._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteSkill('${skill._id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading skills:', error);
  }
}

// ===== Add/Edit Project =====
let editingProjectId = null;

addProjectBtn.addEventListener('click', () => {
  editingProjectId = null;
  modalTitle.textContent = 'Add Project';
  modalFields.innerHTML = `
    <div class="form-group">
      <input type="text" name="title" placeholder="Project Title" required>
    </div>
    <div class="form-group">
      <textarea name="description" placeholder="Description" rows="3" required></textarea>
    </div>
    <div class="form-group">
      <input type="text" name="image" placeholder="Image URL" required>
    </div>
    <div class="form-group">
      <input type="text" name="technologies" placeholder="Technologies (comma separated)" required>
    </div>
    <div class="form-group">
      <input type="text" name="githubLink" placeholder="GitHub Link" required>
    </div>
    <div class="form-group">
      <input type="text" name="liveDemo" placeholder="Live Demo Link" required>
    </div>
  `;
  modal.classList.add('active');
});

window.editProject = async (id) => {
  try {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    const project = projects.find(p => p._id === id);
    
    if (project) {
      editingProjectId = id;
      modalTitle.textContent = 'Edit Project';
      modalFields.innerHTML = `
        <div class="form-group">
          <input type="text" name="title" value="${project.title}" required>
        </div>
        <div class="form-group">
          <textarea name="description" rows="3" required>${project.description}</textarea>
        </div>
        <div class="form-group">
          <input type="text" name="image" value="${project.image}" required>
        </div>
        <div class="form-group">
          <input type="text" name="technologies" value="${project.technologies.join(', ')}" required>
        </div>
        <div class="form-group">
          <input type="text" name="githubLink" value="${project.githubLink}" required>
        </div>
        <div class="form-group">
          <input type="text" name="liveDemo" value="${project.liveDemo}" required>
        </div>
      `;
      modal.classList.add('active');
    }
  } catch (error) {
    console.error('Error loading project:', error);
  }
};

window.deleteProject = async (id) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }
};

// ===== Add/Edit Skill =====
let editingSkillId = null;

addSkillBtn.addEventListener('click', () => {
  editingSkillId = null;
  modalTitle.textContent = 'Add Skill';
  modalFields.innerHTML = `
    <div class="form-group">
      <input type="text" name="name" placeholder="Skill Name" required>
    </div>
    <div class="form-group">
      <select name="category" required>
        <option value="">Select Category</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Database">Database</option>
        <option value="Tools">Tools</option>
      </select>
    </div>
    <div class="form-group">
      <input type="number" name="level" placeholder="Level (0-100)" min="0" max="100" required>
    </div>
  `;
  modal.classList.add('active');
});

window.editSkill = async (id) => {
  try {
    const response = await fetch('/api/skills');
    const skills = await response.json();
    const skill = skills.find(s => s._id === id);
    
    if (skill) {
      editingSkillId = id;
      modalTitle.textContent = 'Edit Skill';
      modalFields.innerHTML = `
        <div class="form-group">
          <input type="text" name="name" value="${skill.name}" required>
        </div>
        <div class="form-group">
          <select name="category" required>
            <option value="Frontend" ${skill.category === 'Frontend' ? 'selected' : ''}>Frontend</option>
            <option value="Backend" ${skill.category === 'Backend' ? 'selected' : ''}>Backend</option>
            <option value="Database" ${skill.category === 'Database' ? 'selected' : ''}>Database</option>
            <option value="Tools" ${skill.category === 'Tools' ? 'selected' : ''}>Tools</option>
          </select>
        </div>
        <div class="form-group">
          <input type="number" name="level" value="${skill.level}" min="0" max="100" required>
        </div>
      `;
      modal.classList.add('active');
    }
  } catch (error) {
    console.error('Error loading skill:', error);
  }
};

window.deleteSkill = async (id) => {
  if (confirm('Are you sure you want to delete this skill?')) {
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      loadSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  }
};

// ===== Modal Form Submit =====
modalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(modalForm);
  const data = Object.fromEntries(formData.entries());
  
  if (data.technologies) {
    data.technologies = data.technologies.split(',').map(t => t.trim());
  }
  
  if (data.level) {
    data.level = parseInt(data.level);
  }
  
  try {
    const endpoint = modalTitle.textContent.includes('Project') ? '/api/projects' : '/api/skills';
    const method = editingProjectId || editingSkillId ? 'PUT' : 'POST';
    const url = editingProjectId ? `${endpoint}/${editingProjectId}` : endpoint;
    
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    modal.classList.remove('active');
    loadProjects();
    loadSkills();
  } catch (error) {
    console.error('Error saving item:', error);
  }
});

// ===== Modal Close =====
modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// ===== Chat Functionality =====
const adminMessageInput = document.getElementById('admin-message-input');
const adminSendBtn = document.getElementById('admin-send-btn');
const adminChatMessages = document.getElementById('admin-chat-messages');
const usersList = document.getElementById('users-list');

socket.on('updateUsers', (users) => {
  usersList.innerHTML = users.map(user => `
    <div class="user-item" data-name="${user.name}">${user.name}</div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.user-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentUser = item.dataset.name;
    });
  });
});

socket.on('receiveMessage', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${data.sender === 'Admin' ? 'sent' : 'received'}`;
  messageDiv.innerHTML = data.text;
  adminChatMessages.appendChild(messageDiv);
  adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
});

adminSendBtn.addEventListener('click', sendAdminMessage);
adminMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendAdminMessage();
  }
});

function sendAdminMessage() {
  const message = adminMessageInput.value.trim();
  if (message && currentUser) {
    socket.emit('sendMessage', {
      userName: currentUser,
      message: message,
      isAdmin: true
    });
    adminMessageInput.value = '';
  } else if (!currentUser) {
    alert('Please select a user to chat with');
  }
}
