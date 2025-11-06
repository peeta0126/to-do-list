// ===== 화면 요소 =====
const registerWrap = document.getElementById('registerWrap');
const loginWrap = document.getElementById('loginWrap');
const appWrap = document.getElementById('appWrap');

const registerId = document.getElementById('registerId');
const registerPw = document.getElementById('registerPw');
const registerBtn = document.getElementById('registerBtn');
const loginId = document.getElementById('loginId');
const loginPw = document.getElementById('loginPw');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMsg = document.getElementById('welcomeMsg');
const toLogin = document.getElementById('toLogin');
const toRegister = document.getElementById('toRegister');

// ===== 페이지 전환 =====
toLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerWrap.style.display = 'none';
  loginWrap.style.display = 'block';
});

toRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginWrap.style.display = 'none';
  registerWrap.style.display = 'block';
});

// ===== 회원가입 =====
registerBtn.addEventListener('click', () => {
  const id = registerId.value.trim();
  const pw = registerPw.value.trim();

  if (id === '' || pw === '') return alert('아이디와 비밀번호를 모두 입력해주세요.');

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const exists = users.find(u => u.id === id);
  if (exists) return alert('이미 존재하는 아이디입니다.');

  users.push({ id, pw });
  localStorage.setItem('users', JSON.stringify(users));

  alert('회원가입이 완료되었습니다!');
  registerId.value = '';
  registerPw.value = '';
  registerWrap.style.display = 'none';
  loginWrap.style.display = 'block';
});

// ===== 로그인 =====
loginBtn.addEventListener('click', () => {
  const id = loginId.value.trim();
  const pw = loginPw.value.trim();

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.id === id && u.pw === pw);
  if (!user) return alert('아이디 또는 비밀번호가 올바르지 않습니다.');

  localStorage.setItem('currentUser', id);
  showApp();
});

// ===== 로그아웃 =====
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  appWrap.style.display = 'none';
  loginWrap.style.display = 'block';
});

// ===== 자동 로그인 유지 =====
function checkLogin() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) showApp();
}

function showApp() {
  const user = localStorage.getItem('currentUser');
  if (!user) return;
  welcomeMsg.textContent = `안녕하세요, ${user}님 👋`;
  loginWrap.style.display = 'none';
  registerWrap.style.display = 'none';
  appWrap.style.display = 'block';
  loadTodos();
  render();
}

// ===== ToDo 기능 =====
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

let todos = [];

function getTodoKey() {
  const user = localStorage.getItem('currentUser');
  return `todos_${user}`;
}

function loadTodos() {
  const key = getTodoKey();
  todos = JSON.parse(localStorage.getItem(key)) || [];
}

function saveTodos() {
  const key = getTodoKey();
  localStorage.setItem(key, JSON.stringify(todos));
}

function render() {
  list.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `
      <span>${todo.text}</span>
      <div>
        <button onclick="toggle(${idx})">✔</button>
        <button onclick="remove(${idx})">✖</button>
      </div>
    `;
    list.appendChild(li);
  });
  saveTodos();
}

function add() {
  const text = input.value.trim();
  if (text === '') return;
  todos.push({ text, done: false });
  input.value = '';
  render();
}

function toggle(idx) {
  todos[idx].done = !todos[idx].done;
  render();
}

function remove(idx) {
  todos.splice(idx, 1);
  render();
}

addBtn.addEventListener('click', add);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') add();
});

checkLogin();
