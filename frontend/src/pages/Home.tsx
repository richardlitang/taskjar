import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Collection, Action} from '../types/types'
import {Link} from 'react-router-dom'
import './styles.css'
import TaskCollections from '../components/sections/TaskCollections'
import { idGenerator } from '../lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSliders } from '@fortawesome/free-solid-svg-icons'


export default function Home() {
  const localUser = localStorage.getItem('user')
  let initialUserName: string = localUser? JSON.parse(localUser): "Stranger";

  const [userName, setUserName] = useState<string>(initialUserName)
  const [collections, setCollections] = useState<Collection[]>([])
  const [chosenTask, setChosenTask] = useState<Task>({name:'', id: idGenerator()})
  const [chosenCollection, setChosenCollection] = useState<string>('')
  const [hidden, setHidden] = useState<Boolean>(true)
  const [edit, setEdit] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchTask = () => {
    const nonEmptyCollections = collections.filter(collection => collection.tasks.length > 0)
    const randomCollection = Math.floor((Math.random() * nonEmptyCollections.length));
    const randomTask = Math.floor((Math.random() * nonEmptyCollections[randomCollection].tasks.length));  
    setChosenTask(nonEmptyCollections[randomCollection].tasks[randomTask]) 
    setChosenCollection(nonEmptyCollections[randomCollection].name)
    setHidden(true)
  } 

  useEffect(() => {
    const updatedUser = JSON.stringify(userName)
    localStorage.setItem('user', updatedUser)
  }, [userName]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  return <div className="home"> 
    <div className={hidden? "hidden":"sidebar"}>
      <div className="sidebar__profile">
          {edit? 
          <form 
            className="sidebar__profile-name"
            onSubmit={() => {
              setUserName(inputRef.current!.value)
              setEdit(false)
            }
          }>
            <input 
              type="text" 
              ref={inputRef} 
              defaultValue={userName}
              onBlur={() => setEdit(false)}
            /> 
          </form> : 
          <span 
            className="sidebar__profile-name" 
            onDoubleClick={() => setEdit(true)}
          >
            {userName}
          </span>
        }
      </div>
      <div className="sidebar__navigation"> 
        <span className="sidebar__navigation-title">Menu</span>
        <ul className="sidebar__navigation-list">
          <li><Link to="/tasks" >My tasks</Link></li>
          <li><Link to="/projects" >Projects</Link></li>
          <li><Link to="/settings" >Settings</Link></li>
        </ul>
      </div>
    </div>
    <div className={hidden? "hidden" : "greetings" }>
      <span className="greetings__main">Hi, {userName.split(" ", 1)}</span>
      <span className="greetings__subtitle">Ready to do some work?</span> 
    </div>
    <div className={hidden? "finder__full-page" : "finder" }>
      <h1 className="finder__name">{chosenTask.name}</h1>
      <span className="finder__collection">{chosenCollection}</span>
      <button className="finder__search-button" onClick={fetchTask}>
        Find a task
      </button>
      <FontAwesomeIcon 
        icon={faSliders} 
        className={hidden? "finder__full-page-close-icon" : "hidden"}
        onClick = {() => setHidden(false)}
      />
    </div>
    <div className={hidden? "hidden": "tasks"}>
      <TaskCollections setCollections={setCollections} />
    </div>
  </div>
} 