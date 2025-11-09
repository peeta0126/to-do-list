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

let isRegisterMode = false;
let todos = {};
let currentDate = new Date().toISOString().split('T')[0];
let isWeekMode = false;
let viewDate = new Date();
const today = new Date().toISOString().split('T')[0]; // ✅ 오늘 날짜

// === 로그인 로직 ===
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
  showApp();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  location.reload();
});

// === 데이터 저장 ===
function getTodoKey() {
  const user = localStorage.getItem('currentUser');
  return user ? `todos_${user}` : null;
}
function loadTodos() {
  todos = JSON.parse(localStorage.getItem(getTodoKey())) || {};
}
function saveTodos() {
  localStorage.setItem(getTodoKey(), JSON.stringify(todos));
}

// === 캘린더 ===
function renderCalendar() {
  calendar.innerHTML = '';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  monthLabel.textContent = `${year}년 ${month + 1}월`;

  if (!isWeekMode) {
    // 월간 보기
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      calendar.appendChild(empty);
    }
    for (let day = 1; day <= lastDate; day++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.classList.add('calendar-day');
      cell.textContent = day;

      // ✅ 오늘 표시
      if (fullDate === today) {
        cell.classList.add('today');
      }

      const dayTodos = todos[fullDate] || [];
      if (dayTodos.length) {
        const allDone = dayTodos.every(t => t.done);
        cell.classList.add(allDone ? 'complete' : 'incomplete');
      }
      if (fullDate === currentDate) cell.classList.add('selected');

      cell.addEventListener('click', () => {
        currentDate = fullDate;
        viewDate = new Date(fullDate);
        render();
      });
      calendar.appendChild(cell);
    }
  } else {
    // 주간 보기 (선택한 날짜 기준)
    const selected = new Date(currentDate);
    const weekStart = new Date(selected);
    weekStart.setDate(selected.getDate() - selected.getDay());
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(weekStart.getDate() + 6);

    monthLabel.textContent = `${year}년 ${month + 1}월 (${weekStart.getDate()}~${endOfWeek.getDate()}일)`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const fullDate = d.toISOString().split('T')[0];
      const cell = document.createElement('div');
      cell.classList.add('calendar-day');
      cell.textContent = d.getDate();

      // ✅ 오늘 표시
      if (fullDate === today) {
        cell.classList.add('today');
      }

      const dayTodos = todos[fullDate] || [];
      if (dayTodos.length) {
        const allDone = dayTodos.every(t => t.done);
        cell.classList.add(allDone ? 'complete' : 'incomplete');
      }
      if (fullDate === currentDate) cell.classList.add('selected');

      cell.addEventListener('click', () => {
        currentDate = fullDate;
        viewDate = new Date(fullDate);
        render();
      });
      calendar.appendChild(cell);
    }
  }
}

// === 이전/다음 이동 ===
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

// === 모드 전환 ===
toggleViewBtn.addEventListener('click', () => {
  isWeekMode = !isWeekMode;
  toggleViewBtn.textContent = isWeekMode ? '📅 월간보기' : '📆 주간보기';

  // ✅ 선택한 날짜를 기준으로 전환
  viewDate = new Date(currentDate);
  renderCalendar();
});

// === 할 일 ===
function render() {
  list.innerHTML = '';
  const dayTodos = todos[currentDate] || [];
  selectedDateText.textContent = `📅 ${currentDate}의 할 일`;
  dayTodos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `<span>${todo.text}</span>
      <div>
        <button onclick="toggle('${currentDate}', ${idx})">✔</button>
        <button onclick="remove('${currentDate}', ${idx})">✖</button>
      </div>`;
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
  saveTodos(); render();
}
function toggle(date, idx) { todos[date][idx].done = !todos[date][idx].done; saveTodos(); render(); }
function remove(date, idx) { todos[date].splice(idx, 1); saveTodos(); render(); }

addBtn.addEventListener('click', add);
input.addEventListener('keypress', e => { if (e.key === 'Enter') add(); });

// === 로그인 유지 ===
function checkLogin() {
  const user = localStorage.getItem('currentUser');
  if (user) { loadTodos(); showApp(); }
}
function showApp() {
  const user = localStorage.getItem('currentUser');
  authWrap.style.display = 'none';
  appWrap.style.display = 'flex';
  renderCalendar(); render();
}
checkLogin();
