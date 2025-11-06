const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

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
  localStorage.setItem('todos', JSON.stringify(todos));
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

render();
