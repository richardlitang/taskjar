import React, { useEffect, useState } from 'react';
import {Task} from '../types/types'
import './styles.css'
import {Link} from 'react-router-dom'

export default function Home() {
    let [task, setTask] = useState<Task>()
    // let [userTasks, setUserTasks] = useState<Task[]>([{name: "Go to sleep"}, {name: "Take a break"}])

    const fetchTask = async () => {
      await fetch('http://localhost:5000/api/tasks').
        then(response => response.json()).
        then(data => setTask(data[0]))
    } 

    // const fetchUserTasks = async () => {
    //   await fetch('http://localhost:5000/api/user/tasks/me').
    //     then(response => response.json()).
    //     then(data => setTask(data[0]))
    // }

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
        <span className="task__name">{task?.name}</span>
        <span className="task__description">{task?.description}</span>
        <button className="task__search" onClick = {fetchTask}>
          Find a task
        </button>
      </div>
      <div className="user">
        <div className="user__collections">
          <span className="user__collections-title">My Tasks</span>
        {/* <div className="user__collections-list">
          <ul>
            {userTasks.map(task => task)}
          </ul>
        </div> */}
       </div>
       <div className="user__collections-form">
         <span className="user__collections-form-title">Add a task</span>
       </div>
      </div>
    </div>
} 