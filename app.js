// ===== 요소 =====
const authWrap = document.getElementById('authWrap');
const appWrap = document.getElementById('appWrap');

const authTitle = document.getElementById('authTitle');
const authId = document.getElementById('authId');
const authPw = document.getElementById('authPw');
const authPwCheck = document.getElementById('authPwCheck');
const authBtn = document.getElementById('authBtn');
const switchMode = document.getElementById('switchMode');
const switchText = document.getElementById('switchText');

const logoutBtn = document.getElementById('logoutBtn');
const welcomeMsg = document.getElementById('welcomeMsg');

const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const calendar = document.getElementById('calendar');
const selectedDateText = document.getElementById('selectedDateText');

let isRegisterMode = false;
let todos = {};
let currentDate = localStorage.getItem('lastDate') || new Date().toISOString().split('T')[0];

// ===== 회원가입 / 로그인 전환 =====
switchMode.addEventListener('click', (e) => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    authTitle.textContent = '🧾 회원가입';
    authBtn.textContent = '가입하기';
    authPwCheck.style.display = 'block';
    switchText.innerHTML = '이미 계정이 있나요? <a href="#" id="switchMode">로그인</a>';
  } else {
    authTitle.textContent = '🔐 로그인';
    authBtn.textContent = '로그인';
    authPwCheck.style.display = 'none';
    switchText.innerHTML = '계정이 없나요? <a href="#" id="switchMode">회원가입</a>';
  }
});

// ===== 회원가입 / 로그인 실행 =====
authBtn.addEventListener('click', () => {
  const id = authId.value.trim();
  const pw = authPw.value.trim();
  const pwCheck = authPwCheck.value.trim();

  if (!id || !pw) return alert('아이디와 비밀번호를 입력해주세요.');

  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (isRegisterMode) {
    if (pw !== pwCheck) return alert('비밀번호가 일치하지 않습니다.');
    if (users.find(u => u.id === id)) return alert('이미 존재하는 아이디입니다.');
    users.push({ id, pw });
    localStorage.setItem('users', JSON.stringify(users));
    alert('회원가입이 완료되었습니다! 로그인해주세요.');
    isRegisterMode = false;
    authTitle.textContent = '🔐 로그인';
    authBtn.textContent = '로그인';
    authPwCheck.style.display = 'none';
    switchText.innerHTML = '계정이 없나요? <a href="#" id="switchMode">회원가입</a>';
    return;
  }

  const user = users.find(u => u.id === id && u.pw === pw);
  if (!user) return alert('아이디 또는 비밀번호가 올바르지 않습니다.');

  localStorage.setItem('currentUser', id);
  showApp();
});

// ===== 로그아웃 =====
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  appWrap.style.display = 'none';
  authWrap.style.display = 'block';
});

// ===== 자동 로그인 유지 =====
function checkLogin() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    loadTodos();
    showApp();
  }
}

// ===== 사용자별 데이터 관리 =====
function getTodoKey() {
  const user = localStorage.getItem('currentUser');
  return user ? `todos_${user}` : null;
}

function loadTodos() {
  const key = getTodoKey();
  if (!key) return;
  todos = JSON.parse(localStorage.getItem(key)) || {};
}

function saveTodos() {
  const key = getTodoKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(todos));
}

// ===== 달력 렌더링 =====
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

      const dayTodos = todos[fullDate] || [];

      // ===== ✅ 색상 상태 처리 =====
      if (dayTodos.length === 0) {
        // 할 일이 아예 없으면 초기 상태 (색상 없음)
        dayCell.classList.remove('complete', 'incomplete');
      } else {
        const allDone = dayTodos.every(t => t.done);
        dayCell.classList.add(allDone ? 'complete' : 'incomplete');
      }

      // ===== 선택된 날짜 표시 =====
      if (fullDate === currentDate) dayCell.classList.add('selected');

      dayCell.addEventListener('click', () => {
        currentDate = fullDate;
        localStorage.setItem('lastDate', currentDate);
        renderCalendar();
        render();
      });
    }

    calendar.appendChild(dayCell);
  }
}


// ===== 할 일 렌더링 =====
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

  renderCalendar();
}

// ===== 할 일 조작 =====
function add() {
  const text = input.value.trim();
  if (!text) return;

  if (!todos[currentDate]) todos[currentDate] = [];
  todos[currentDate].unshift({ text, done: false });
  input.value = '';
  saveTodos();
  render();
}

function toggle(date, idx) {
  todos[date][idx].done = !todos[date][idx].done;
  saveTodos();
  render();
}

function remove(date, idx) {
  todos[date].splice(idx, 1);
  saveTodos();
  render();
}

addBtn.addEventListener('click', add);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') add(); });

// ===== 앱 표시 =====
function showApp() {
  const user = localStorage.getItem('currentUser');
  if (!user) return;

  welcomeMsg.textContent = `안녕하세요, ${user}님 👋`;
  authWrap.style.display = 'none';
  appWrap.style.display = 'block';

  loadTodos();
  renderCalendar();
  render();
}

// ===== 기존 계정 데이터 자동 복구 =====
function fixOldTodosForUser() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;
  
  const key = `todos_${currentUser}`;
  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    // ✅ 구형 데이터: 배열이거나 단일 객체인 경우
    if (Array.isArray(data) || (data && data.text)) {
      const today = new Date().toISOString().split('T')[0];
      const fixed = {};

      if (Array.isArray(data)) {
        // 예: ["공부하기","운동하기"] → [{text:"공부하기", done:false}, …]
        fixed[today] = data.map(t =>
          typeof t === "string" ? { text: t, done: false } : t
        );
      } else {
        // 예: {text:"공부하기"} → [{text:"공부하기", done:false}]
        fixed[today] = [{ text: data.text, done: data.done ?? false }];
      }

      localStorage.setItem(key, JSON.stringify(fixed));
      console.log(`✅ ${currentUser}의 기존 todos 데이터 구조 복구 완료`);
    }
  } catch (err) {
    console.warn("데이터 복구 중 오류:", err);
  }
}

// ===== 페이지 로드시 로그인 상태 확인 =====
checkLogin();
fixOldTodosForUser(); // ✅ 자동 복구 실행

