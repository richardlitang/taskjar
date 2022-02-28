import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Category} from '../types/types'
import './styles.css'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck } from '@fortawesome/free-solid-svg-icons'
import AddUserTask from '../components/ui/AddUserTask';
import {DragDropContext, Droppable, Draggable, DropResult, DraggableLocation} from 'react-beautiful-dnd'
import e from 'express';
import Tasks from './Tasks';
import { act } from 'react-dom/test-utils';
import { defaultCipherList } from 'constants';

export default function Home() {

  // const rawUser = localStorage.getItem('user')
  // let userItems: Category[] = [];

  // if (rawUser) {
  //   userItems = JSON.parse(rawUser)
  // }

  // let defaultCategory = userItems
  
    const idGenerator = () => {
      const tempId =  "" + Date.now() + (Math.floor(Math.random() * Math.pow(10, 3)))
      return parseInt(tempId)
    }

    const inputRef = useRef<HTMLInputElement>(null);

    interface Action {
      type: string,
      name?: string,
      category: Category["id"]
    }
    
    const initialCategories: Category[] = [
      {
        id: 0,
        name: 'defaultCategory',
        tasks: [{name: 'Hey', id: idGenerator()}]
      }
    ]
    

    // const stringDefaultCat = JSON.stringify([defaultCategory])

    // localStorage.setItem('user', stringDefaultCat)

    const [categories, dispatch] = useReducer((state: Category[], action: Action) => {
      // const categoryIndex = state.findIndex(category => category.id === action.category.id)

      if (!action.name) {
        return state;
      }

      const newTask: Task = {name: action.name, id: idGenerator()}
      
      switch (action.type) {
        case 'add':
          return state.map((category) => {
            if (category.id === action.category) {
              return {
                ...category,
                tasks: [...category.tasks, newTask]
              }
            }
            return category;
          });
        default:
          return state;
      }
    }, initialCategories);
    
    const handleSubmit = (event: React.FormEvent )  => {
      event.preventDefault()
      dispatch({
        type: 'add',
        name: inputRef.current?.value,
        category: 0
      });

      inputRef.current!.value = '';
      // const newTask = {name: newInput, id: idGenerator()}
      // setLocalTasks([...localTasks, newTask])
    }

    useEffect(() => {
      const updatedCategories = JSON.stringify(categories)
      localStorage.setItem('user', updatedCategories)
    }, [categories])

    // console.log(items)
    const onDragEnd = (result: DropResult) => {}
  

    const fetchTask = async () => {
      // await fetch('http://localhost:5000/api/tasks').
      //   then(response => response.json()).
      //   then(data => setUserTask(data[0]))
    } 

    const fetchLocalTask = async () => {
      // const randomIndex = Math.floor((Math.random()*localTasks.length));
      // setUserTask(localTasks[randomIndex])
    } 

    useEffect(() => {
      // fetchTask().catch(console.error)
    }, [])

    // const [edit, setEdit] = useState<boolean>(false);
    // const inputRef = useRef<HTMLInputElement>(null);
    // useEffect(() => {
    //   inputRef.current?.focus();
    // }, [edit]);

    console.log(categories)
    return (
      <div className="home">
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
          {/* <span className="task__name">{userTask?.name}</span>
          <span className="task__description">{userTask?.description}</span> */}
          <button className="task__search" onClick = {fetchTask}>
            Find a task
          </button>
          <button className="task__search" onClick = {fetchLocalTask}>
            Find a local task
          </button>
        </div>
        <div className="user">
          <div className="user__collections-form">
            <div className="user__task-board">
              <DragDropContext onDragEnd={onDragEnd}>
                {categories.map(category => {
                   return <Droppable droppableId="0">
                   {(provided, snapshot) => (  
                     <div
                       ref={provided.innerRef}
                       {...provided.droppableProps}
                     >
                       <p>{category.name}</p>
                       {category.tasks.map((task, index) => {
                         console.log(task)
                         return <Draggable 
                           draggableId={task.id.toString()} 
                           key={task.id}
                           index={index}
                         >
                           {(provided, snapshot) => (
                             <div 
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               className="user__task-board-item"
                             >
                               <span>{task.name}</span>
                             </div>
                           )}
 
                         </Draggable>
                       })}
                       {provided.placeholder}  
                     </div>
                   )}
                 </Droppable>
                }  
                )}
               
              </DragDropContext>
            </div>
              <form 
                className="user__task-form" 
                onSubmit={handleSubmit}
                >
                <input 
                  type="text" 
                  className="user__task-input" 
                  ref={inputRef}
                />
                <button 
                  className="user__task-submit"
                >
                  Add a task
                </button>
              </form>
            </div>
        </div>
      </div>
    )
    
} 