import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  let [task, setTask] = useState<Task>()

  interface Task {
    name: string,
    description?: string,
    duration?: number,
    upvotes?: number
  }

  const fetchTask = async () => {
    await fetch('http://localhost:5000/api/tasks').
      then(response => response.json()).
      then(data => setTask(data[0]))
  } 

  useEffect(() => {
    fetchTask().catch(console.error)
  }, [])

  return (
    <div className="App">
      {/* <header className="App-header">
        <div className="Logo-container">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
      </header> */}
      <div className="task">
        <span className="task_name">{task?.name}</span>
        <span className="task_description">{task?.description}</span>
        <button className="task_search" onClick = {fetchTask}>
          Find a task
        </button>
      </div>
    </div>
  );
}

export default App;
