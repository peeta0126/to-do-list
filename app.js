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

// ===== ToDo + 캘린더 기능 =====
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const calendar = document.getElementById('calendar');
const selectedDateText = document.getElementById('selectedDateText');

let todos = {}; // 날짜별 할 일 저장용
let currentDate = new Date().toISOString().split('T')[0]; // 오늘 날짜

function getTodoKey() {
  const user = localStorage.getItem('currentUser');
  return `todos_${user}`;
}

function loadTodos() {
  const key = getTodoKey();
  todos = JSON.parse(localStorage.getItem(key)) || {};
}

function saveTodos() {
  const key = getTodoKey();
  localStorage.setItem(key, JSON.stringify(todos));
}

// ===== 달력 만들기 =====
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = '';
  const totalCells = firstDay + lastDate;

  for (let i = 0; i < totalCells; i++) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('calendar-day');

    if (i >= firstDay) {
      const date = i - firstDay + 1;
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      dayCell.textContent = date;

      // 완료 / 미완료 표시
      if (todos[fullDate]) {
        const allDone = todos[fullDate].every(t => t.done);
        dayCell.classList.add(allDone ? 'complete' : 'incomplete');
      }

      if (fullDate === currentDate) dayCell.classList.add('selected');

      dayCell.addEventListener('click', () => {
        currentDate = fullDate;
        renderCalendar();
        render();
      });
    }

    calendar.appendChild(dayCell);
  }
}

// ===== 할 일 목록 렌더링 =====
function render() {
  list.innerHTML = '';
  const dayTodos = todos[currentDate] || [];

  selectedDateText.textContent = `📅 ${currentDate}의 할 일`;

  dayTodos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `
      <span>${todo.text}</span>
      <div>
        <button onclick="toggle('${currentDate}', ${idx})">✔</button>
        <button onclick="remove('${currentDate}', ${idx})">✖</button>
      </div>
    `;
    list.appendChild(li);
  });

  saveTodos();
  renderCalendar();
}

// ===== 할 일 조작 =====
function add() {
  const text = input.value.trim();
  if (text === '') return;

  if (!todos[currentDate]) todos[currentDate] = [];
  todos[currentDate].push({ text, done: false });
  input.value = '';
  render();
}

function toggle(date, idx) {
  todos[date][idx].done = !todos[date][idx].done;
  render();
}

function remove(date, idx) {
  todos[date].splice(idx, 1);
  render();
}

addBtn.addEventListener('click', add);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') add(); });

// ===== 초기 실행 =====
function showApp() {
  const user = localStorage.getItem('currentUser');
  if (!user) return;
  welcomeMsg.textContent = `안녕하세요, ${user}님 👋`;
  loginWrap.style.display = 'none';
  registerWrap.style.display = 'none';
  appWrap.style.display = 'block';
  loadTodos();
  renderCalendar();
  render();
}

checkLogin();
