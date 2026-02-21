let tasks = [];
let nextId = 1;

export const reset = () => {
  tasks = [];
  nextId = 1;
};

export const getAll = () => {
  return tasks;
};

export const create = (description) => {
  const newTask = {
    id: nextId,
    description: description
  };
  tasks.push(newTask);
  nextId++;
  return newTask;
};

export const remove = (id) => {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks.splice(i, 1);
      return true;
    }
  }
  return false;
};