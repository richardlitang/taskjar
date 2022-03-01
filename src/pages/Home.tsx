import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Collection} from '../types/types'
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
  // let userItems: collection[] = [];

  // if (rawUser) {
  //   userItems = JSON.parse(rawUser)
  // }

  // let Next Up = userItems
  
    const idGenerator = () => {
      const tempId =  "" + Date.now() + (Math.floor(Math.random() * Math.pow(10, 3)))
      return parseInt(tempId)
    }

    const inputRef = useRef<HTMLInputElement>(null);

    interface Action {
      type: string,
      name?: string,
      collection?: number,
      updatedCollectionTasks?: Task[]
    }

    const localData = localStorage.getItem('user')
    let initialCollections: Collection[] = [];

    if (localData) {
      initialCollections= JSON.parse(localData)
    } else {
      initialCollections =  [
        {
          id: 0,
          name: 'Next Up',
          tasks: [{name: 'Full body stretch', id: idGenerator()}]
        }
      ]
    }

    const [collections, dispatch] = useReducer((state: Collection[], action: Action) => {
      // const collectionIndex = state.findIndex(collection => collection.id === action.payload.id)
      switch (action.type) {
        case 'reorder':
          return state.map((collection) => {
            if (collection.id === action.collection) {
              return {
                ...collection,
                tasks: [...action.updatedCollectionTasks!]
              }
            }
          return collection;
        });
        case 'add':
          if (!action.name) {
            return state;
          }
          const newTask: Task = {name: action.name, id: idGenerator()}
          return state.map((collection) => {
            if (collection.id === action.collection) {
              return {
                ...collection,
                tasks: [...collection.tasks, newTask]
              }
            }
          return collection;
        });
        default:
          return state;
      }
    }, initialCollections);
    
    const handleSubmit = (event: React.FormEvent )  => {
      event.preventDefault()
      dispatch({
        type: 'add',
        name: inputRef.current?.value,
        collection: 0
      });

      inputRef.current!.value = '';
      // const newTask = {name: newInput, id: idGenerator()}
      // setLocalTasks([...localTasks, newTask])
    }



    const onDragEnd = (result: DropResult) => {
      const {source, destination} = result;

      if (!destination) {
        return;
      }

      const sourceId = parseInt(source.droppableId);
      const destinationId = parseInt(destination.droppableId);

      if (sourceId === destinationId) {
        const changedCollection = collections.find((collection: Collection) => collection.id === destinationId)

        if (changedCollection) {
          const newCollectionTasks = [...changedCollection.tasks]
          const [removed] = newCollectionTasks.splice(source!.index, 1)
          newCollectionTasks.splice(destination!.index, 0, removed)

          dispatch({
            type: 'reorder',
            collection: changedCollection.id,
            updatedCollectionTasks: newCollectionTasks
          })
        }
      } else {
        
      }



        // dispatch({
        //   type: 'reorder',
        //   name: inputRef.current?.value,
        //   source: source,
        //   destination: destination,
        //   collection: 0
        // });
      
      // else {
      //   const result = transferCategory(categories[sourceId], categories[destinationId], source, destination)

      //   if (!result) {
      //     return;
      //   }
      //   setCategories(result)
      // }
    }
  

    const fetchTask = async () => {
      // await fetch('http://localhost:5000/api/tasks').
      //   then(response => response.json()).
      //   then(data => setUserTask(data[0]))
    } 

    const fetchLocalTask = async () => {
      // const randomIndex = Math.floor((Math.random()*localTasks.length));
      // setUserTask(localTasks[randomIndex])
    } 

    // useEffect(() => {
    //   // fetchTask().catch(console.error)
    // }, [])

    // const [edit, setEdit] = useState<boolean>(false);
    // const inputRef = useRef<HTMLInputElement>(null);
    // useEffect(() => {
    //   inputRef.current?.focus();
    // }, [edit]);
    
    useEffect(() => {
      const updatedCollections = JSON.stringify(collections)
      localStorage.setItem('user', updatedCollections)
    }, [JSON.stringify(collections)])
    
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
                {collections.map((collection: Collection) => {
                   return <Droppable droppableId={JSON.stringify(collection.id)} key={collection.id}>
                   {(provided, snapshot) => (  
                     <div
                       ref={provided.innerRef}
                       {...provided.droppableProps}
                     >
                       <p>{collection.name}</p>
                       {collection.tasks.map((task, index) => {
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