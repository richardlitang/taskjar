import React, { useEffect, useState, useRef } from 'react';
import {Task, Category} from '../types/types'
import './styles.css'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck } from '@fortawesome/free-solid-svg-icons'
import AddUserTask from '../components/ui/AddUserTask';
import {DragDropContext, Droppable, Draggable, DropResult, DraggableLocation} from 'react-beautiful-dnd'
import e from 'express';

export default function Home() {
 
    const idGenerator = () => {
      const tempId =  "" + Date.now() + (Math.floor(Math.random() * Math.pow(10, 3)))
      return parseInt(tempId)
    }

    const [edit, setEdit] = useState<boolean>(false);
    const [userTask, setUserTask] = useState<Task>()

    const [newInput, setNewInput] = useState<string>('')

    const rawUser = localStorage.getItem('user')
    let userTasks: Task[] = [];

    if (rawUser) {
      userTasks = JSON.parse(rawUser)
    }

    const [localTasks, setLocalTasks] = useState<Task[]>(userTasks)
    const [categories, setCategories] = useState<Category[]>([])

    const transferCategory = (sourceList: Category, destinationList: Category, draggableSource: DraggableLocation, draggableDestination: DraggableLocation | undefined ) => {
      const sourceCopy = sourceList;
      const destinationCopy = destinationList;
      const [removed] = sourceCopy.tasks.splice(draggableSource.index, 1);

      if (!draggableDestination) {
        return;
      }

      destinationCopy.tasks.splice(draggableDestination.index, 0, removed);

      const result: Category[] = [];
      result[parseInt(draggableSource.droppableId)] = sourceCopy;
      result[parseInt(draggableDestination.droppableId)] = destinationCopy;
    
      return result;
    };
    
    const handleNewTask = (event: React.FormEvent, )  => {
      event.preventDefault()
      const newTask = {name: newInput, id: idGenerator()}
      setLocalTasks([...localTasks, newTask])
    }
    
    const onDragEnd = (result: DropResult) => {
      const {source, destination} = result;

      if (!destination) {
        return;
      }

      const sourceId = parseInt(source.droppableId);
      const destinationId = parseInt(destination.droppableId);

      if (sourceId === destinationId) {
        const newTaskList = [...localTasks];
        const [removed] = newTaskList.splice(source.index, 1)
        newTaskList.splice(destination.index, 0, removed)
        setLocalTasks(newTaskList)
      } else {
        const result = transferCategory(categories[sourceId], categories[destinationId], source, destination)

        if (!result) {
          return;
        }
        setCategories(result)
      }
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
    }, [])

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, [edit]);

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
          <div className="user__collections-form">
            <div className="user__task-board">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="0">
                  {(provided, snapshot) => (  
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <p>First</p>
                      {localTasks.map((task, index) => {
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
                {/* <Droppable droppableId="1">
                  {(provided, snapshot) => (  
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <p>Second</p>
                      {localTasks.map((task, index) => {
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
                </Droppable> */}
              </DragDropContext>
            </div>
              
              <form 
                className="user__task-form" 
                onSubmit={handleNewTask}
                >
                <input 
                  type="text" 
                  className="user__task-input" 
                  value={newInput} 
                  onChange={(e) => {
                    setNewInput(e.target.value)
                  }}
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