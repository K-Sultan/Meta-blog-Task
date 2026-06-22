// DOM Elements
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const loginBtn = document.getElementById('nav-login-btn');
const registerBtn = document.getElementById('nav-register-btn');
const logoutBtn = document.getElementById('nav-logout-btn');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');

const authForm = document.getElementById('auth-form');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchLink = document.getElementById('auth-switch-link');
const authSwitchText = document.getElementById('auth-switch-text');
const modalTitle = document.getElementById('modal-title');
const nameGroup = document.getElementById('name-group');
const authError = document.getElementById('auth-error');

const createPostSection = document.getElementById('create-post-section');
const createPostForm = document.getElementById('create-post-form');
const postsContainer = document.getElementById('posts-container');
const refreshPostsBtn = document.getElementById('refresh-posts-btn');

// State
let isLoginMode = true;
let currentUser = null;

// API Helpers
const API_URL = ''; // Relative to origin

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();
  
  if (!response.ok) {
    let errorMsg = data.message || 'Something went wrong';
    if (data.errors && data.errors.length > 0) {
      errorMsg = data.errors.map(e => e.msg).join(', ');
    }
    throw new Error(errorMsg);
  }
  return data;
}

// Auth Logic
function toggleModal(show = true) {
  if (show) {
    authModal.classList.remove('hidden');
    authError.textContent = '';
  } else {
    authModal.classList.add('hidden');
  }
}

function setAuthMode(login) {
  isLoginMode = login;
  modalTitle.textContent = login ? 'Login' : 'Register';
  authSubmitBtn.textContent = login ? 'Login' : 'Create Account';
  authSwitchText.textContent = login ? "Don't have an account?" : "Already have an account?";
  authSwitchLink.textContent = login ? 'Register here' : 'Login here';
  nameGroup.style.display = login ? 'none' : 'block';
  document.getElementById('auth-name').required = !login;
  authError.textContent = '';
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    return null;
  }
}

function updateAuthState() {
  const token = localStorage.getItem('token');
  if (token) {
    const decoded = parseJwt(token);
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    createPostSection.classList.remove('hidden');
    currentUser = decoded;
  } else {
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    userInfo.classList.add('hidden');
    createPostSection.classList.add('hidden');
    currentUser = null;
  }
}

// Event Listeners
loginBtn.addEventListener('click', () => { setAuthMode(true); toggleModal(true); });
registerBtn.addEventListener('click', () => { setAuthMode(false); toggleModal(true); });
closeModal.addEventListener('click', () => toggleModal(false));
authModal.addEventListener('click', (e) => { if (e.target === authModal) toggleModal(false); });

authSwitchLink.addEventListener('click', (e) => {
  e.preventDefault();
  setAuthMode(!isLoginMode);
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  updateAuthState();
  loadPosts(); // Re-render to hide delete buttons
});

refreshPostsBtn.addEventListener('click', loadPosts);

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('auth-name').value;
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  try {
    if (isLoginMode) {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
    } else {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      // Registration successful, switch to login mode
      if(data.userId) {
         setAuthMode(true);
         authError.textContent = "Registration successful. Please login.";
         authError.style.color = "#10b981"; // success green
         return;
      }
    }
    toggleModal(false);
    updateAuthState();
    loadPosts();
  } catch (err) {
    authError.style.color = "var(--danger)";
    authError.textContent = err.message;
  }
});

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;

  try {
    await apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    createPostForm.reset();
    loadPosts();
  } catch (err) {
    alert(err.message);
  }
});

async function deletePost(id) {
  if(!confirm('Are you sure you want to delete this post?')) return;
  try {
    await apiFetch(`/posts/${id}`, { method: 'DELETE' });
    loadPosts();
  } catch (err) {
    alert(err.message);
  }
}

// Render logic
function renderPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">No posts yet. Be the first to create one!</p>';
    return;
  }

  postsContainer.innerHTML = posts.map(post => {
    const isOwner = currentUser && post.authorId && post.authorId._id === currentUser.id;
    const authorName = post.authorId ? post.authorId.name : 'Unknown Author';
    const date = new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    
    return `
      <div class="card glass post-card fade-in-up">
        ${isOwner ? `<div class="post-actions"><button onclick="deletePost('${post._id}')" class="btn btn-danger">Delete</button></div>` : ''}
        <h3 class="post-title">${post.title}</h3>
        <div class="post-meta">By ${authorName} • ${date}</div>
        <div class="post-content">${post.content}</div>
      </div>
    `;
  }).reverse().join(''); // Reverse to show newest first
}

async function loadPosts() {
  postsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading posts...</p>';
  try {
    const posts = await apiFetch('/posts');
    renderPosts(posts);
  } catch (err) {
    postsContainer.innerHTML = `<p class="error-msg" style="text-align: center; padding: 2rem;">Failed to load posts: ${err.message}</p>`;
  }
}

// Init
window.deletePost = deletePost; // Expose to global for onclick handler
updateAuthState();
loadPosts();
