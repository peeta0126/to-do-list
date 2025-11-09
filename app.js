// ===== 요소 =====
const authWrap = document.getElementById('authWrap');
const appWrap = document.getElementById('appWrap');
const authTitle = document.getElementById('authTitle');
const authId = document.getElementById('authId');
const authPw = document.getElementById('authPw');
const authPwCheck = document.getElementById('authPwCheck');
const authBtn = document.getElementById('authBtn');
const switchMode = document.getElementById('switchMode');
const logoutBtn = document.getElementById('logoutBtn');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const welcomeMsg = document.getElementById('welcomeMsg');
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const calendar = document.getElementById('calendar');
const selectedDateText = document.getElementById('selectedDateText');
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// ===== 상태 변수 =====
let isRegisterMode = false;
let todos = {};
let currentDate = new Date().toISOString().split('T')[0];
let isWeekMode = false;
let viewDate = new Date();
const today = new Date().toISOString().split('T')[0];

// ===== 월요일 기준 요일 계산 =====
const monIndex = d => (d.getDay() + 6) % 7; // 월(1)=0, 화(2)=1 ... 일(0)=6

// ===== 사용자별 데이터 관리 =====
function getTodoKey() {
  const user = localStorage.getItem('currentUser');
  return user ? `todos_${user}` : null;
}

function loadTodos() {
  const key = getTodoKey();
  if (!key) return;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      todos = JSON.parse(raw) || {};
    } else {
      // 예전 구조 호환
      const legacy = JSON.parse(localStorage.getItem('todos') || '{}');
      todos = legacy;
      localStorage.setItem(key, JSON.stringify(todos));
    }
  } catch (e) {
    todos = {};
  }
}

function saveTodos() {
  const key = getTodoKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(todos));
}

// ===== 회원가입 / 로그인 =====
switchMode.addEventListener('click', e => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  authTitle.textContent = isRegisterMode ? '🧾 회원가입' : '🔐 로그인';
  authBtn.textContent = isRegisterMode ? '가입하기' : '로그인';
  authPwCheck.style.display = isRegisterMode ? 'block' : 'none';
});

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
    alert('회원가입이 완료되었습니다!');
    isRegisterMode = false;
    authPwCheck.style.display = 'none';
    return;
  }

  const user = users.find(u => u.id === id && u.pw === pw);
  if (!user) return alert('아이디 또는 비밀번호가 올바르지 않습니다.');

  localStorage.setItem('currentUser', id);
  loadTodos(); // ✅ 로그인 시 사용자 데이터 복원
  showApp();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser'); // ✅ todos_<user>는 유지
  appWrap.style.display = 'none';
  authWrap.style.display = 'block';
});

// ===== 캘린더 =====
function renderCalendar() {
  calendar.innerHTML = '';
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  monthLabel.textContent = `${y}년 ${m + 1}월`;

  if (!isWeekMode) {
    // === 월간 보기 ===
    const firstDayMon = monIndex(new Date(y, m, 1)); // 월요일 기준 시작 요일
    const lastDate = new Date(y, m + 1, 0).getDate();

    // 앞쪽 빈칸
    for (let i = 0; i < firstDayMon; i++) {
      calendar.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDate; day++) {
      const d = new Date(y, m, day);
      const full = d.toISOString().split('T')[0];
      const w = monIndex(d);

      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (w === 5) cell.classList.add('sat'); // 토요일
      if (w === 6) cell.classList.add('sun'); // 일요일
      if (full === today) cell.classList.add('today'); // 오늘 표시

      // 할일 상태
      const dayTodos = todos[full] || [];
      if (dayTodos.length) {
        const allDone = dayTodos.every(t => t.done);
        cell.classList.add(allDone ? 'complete' : 'incomplete');
      }

      if (full === currentDate) cell.classList.add('selected');
      cell.textContent = day;

      cell.addEventListener('click', () => {
        currentDate = full;
        viewDate = new Date(full);
        render();
      });

      calendar.appendChild(cell);
    }
  } else {
    // === 주간 보기 ===
    const sel = new Date(currentDate);
    const offset = monIndex(sel);
    const weekStart = new Date(sel);
    weekStart.setDate(sel.getDate() - offset);
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    monthLabel.textContent = `${y}년 ${m + 1}월 (${weekStart.getDate()}~${end.getDate()}일)`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const full = d.toISOString().split('T')[0];
      const w = monIndex(d);

      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (w === 5) cell.classList.add('sat');
      if (w === 6) cell.classList.add('sun');
      if (full === today) cell.classList.add('today');

      const dayTodos = todos[full] || [];
      if (dayTodos.length) {
        const allDone = dayTodos.every(t => t.done);
        cell.classList.add(allDone ? 'complete' : 'incomplete');
      }

      if (full === currentDate) cell.classList.add('selected');
      cell.textContent = d.getDate();

      cell.addEventListener('click', () => {
        currentDate = full;
        viewDate = new Date(full);
        render();
      });

      calendar.appendChild(cell);
    }
  }
}

// ===== 이전 / 다음 이동 =====
prevBtn.addEventListener('click', () => {
  if (isWeekMode) {
    viewDate.setDate(viewDate.getDate() - 7);
    currentDate = viewDate.toISOString().split('T')[0];
  } else {
    viewDate.setMonth(viewDate.getMonth() - 1);
  }
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  if (isWeekMode) {
    viewDate.setDate(viewDate.getDate() + 7);
    currentDate = viewDate.toISOString().split('T')[0];
  } else {
    viewDate.setMonth(viewDate.getMonth() + 1);
  }
  renderCalendar();
});

// ===== 주간 / 월간 전환 =====
toggleViewBtn.addEventListener('click', () => {
  isWeekMode = !isWeekMode;
  toggleViewBtn.textContent = isWeekMode ? '📅 월간보기' : '📆 주간보기';
  viewDate = new Date(currentDate);
  renderCalendar();
});

// ===== 할 일 목록 =====
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
input.addEventListener('keypress', e => {
  if (e.key === 'Enter') add();
});

// ===== 로그인 유지 =====
function checkLogin() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    loadTodos();
    showApp();
  }
}

function showApp() {
  const user = localStorage.getItem('currentUser');
  authWrap.style.display = 'none';
  appWrap.style.display = 'flex';
  renderCalendar();
  render();
}

// ===== 실행 =====
checkLogin();
