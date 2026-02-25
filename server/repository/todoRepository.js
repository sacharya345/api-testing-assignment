let todos = [];
let nextId = 1;

export const reset = () => {
  todos = [];
  nextId = 1;
};

export const getAll = () => {
  return todos;
};

export const create = (description) => {
  const todo = { id: nextId++, description };
  todos.push(todo);
  return todo;
};

export const remove = (id) => {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;

  todos.splice(index, 1);
  return true;
};