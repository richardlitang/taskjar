import React, { useEffect, useState } from 'react';
import {Task} from '../types/types'
import './styles.css'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck } from '@fortawesome/free-solid-svg-icons'
import AddUserTask from '../components/ui/AddUserTask';

export default function Home() {
    let [userTask, setUserTask] = useState<Task>()
    let [newTask, setNewTask] = useState<Task>({name: ''})


    const rawUser = localStorage.getItem('user')
    let userTasks = [{name: ''}]

    if (rawUser) {
      userTasks = JSON.parse(rawUser)
    }

    let [localTasks, setLocalTasks] = useState<Task[]>(userTasks)

    const handleNewTask = (event: React.FormEvent) => {
      event.preventDefault()
      setLocalTasks([...localTasks, newTask])
    }

    useEffect(() => {
      const updatedTasks = JSON.stringify(localTasks)
      localStorage.setItem('user', updatedTasks)
    }, [localTasks])

    const fetchTask = async () => {
      await fetch('http://localhost:5000/api/tasks').
        then(response => response.json()).
        then(data => setUserTask(data[0]))
    } 

    const fetchLocalTask = async () => {
      const randomIndex = Math.floor((Math.random()*localTasks.length));
      setUserTask(localTasks[randomIndex])
    } 

    useEffect(() => {
      fetchTask().catch(console.error)

      // if (user) {
      //   fetchUserTasks()
      // }
    }, [])


    return <div className="home">
      <div className="sidebar">
        <div className="sidebar__profile">
          <span className="sidebar__profile-name">Richard Litang</span>
          <span className="sidebar__profile-title">Student</span>
        </div>
        <div className="sidebar__navigation"> 
          <span className="sidebar__navigation-title">Menu</span>
          <ul className="sidebar__navigation-list">
            <li><Link to="/tasks" >My tasks</Link></li>
            <li><Link to="/" >Projects</Link></li>
            <li><Link to="/" >Settings</Link></li>
          </ul>
        </div>

      </div>
      <div className="greetings">
        <span className="greetings__main">Hi, Richard</span>
        <span className="greetings__subtitle">Ready to do some work?</span> 
      </div>
      <div className="task">
        <span className="task__name">{userTask?.name}</span>
        <span className="task__description">{userTask?.description}</span>
        <button className="task__search" onClick = {fetchTask}>
          Find a task
        </button>
        <button className="task__search" onClick = {fetchLocalTask}>
          Find a local task
        </button>
      </div>
      <div className="user">
        <div className="user__collections">
          <span className="user__collections-title">My Tasks</span>
          {localTasks.map(task => 
            <p>{task.name}</p>
          )}
        {/* <div className="user__collections-list">
          <ul>
            {userTasks.map(task => task)}
          </ul>
        </div> */}
       </div>
       <div className="user__collections-form">
         <form action="" className="user__task-form" onSubmit={handleNewTask}>
          <input type="text" className="user__task-input" value={newTask?.name} onChange={(e) => {setNewTask({name: e.target.value})}}/>
          <button className="user__task-submit">Add a task</button>
         </form>
       </div>
      </div>
    </div>
} 