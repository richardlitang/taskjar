import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Collection, Action} from '../../types/types'
import '../../pages/styles.css'
import {Link} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons'
import {DragDropContext, Droppable, Draggable, DropResult, DraggableLocation} from 'react-beautiful-dnd'
import {idGenerator} from '../../lib/utils'
import TaskCollectionsHeader from './TaskCollectionsHeader'

const TaskCollections: React.FC<{setCollections: React.Dispatch<React.SetStateAction<Collection[]>>}> = ({setCollections}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);


  const localData = localStorage.getItem('collections')
  let initialCollections: Collection[] = [];
  
  if (localData) {
    initialCollections= JSON.parse(localData)
  } else {
    initialCollections =  [
      {
        id: 0,
        name: '5 minutes',
        tasks: [{name: 'Full body stretch', id: idGenerator()}]
      },
      {
        id: 1,
        name: '15 minutes',
        tasks: [{name: 'Go for a walk', id: idGenerator()}]
      }
    ]
  }

  const [collections, dispatch] = useReducer((state: Collection[], action: Action) => {
    // const collectionIndex = state.findIndex(collection => collection.id === action.payload.id)
    switch (action.type) {
      case 'reorder':
        return state.map((collection) => {
          if (collection.id === action.collection) {
            return action.updatedCollection!
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
      case 'edit':
        if (!action.name) {
          return state;
        }
        return state.map((collection) => {
          if (collection.id === action.collection) {
            collection.tasks.map(task => {
              if (task.id === action.task) {
                task.name = action.name!
              } 
              return task
            })
          } return collection
        }
      );
      case 'delete':
        return state.map((collection) => {
          if (collection.id === action.collection) {
            return {
              ...collection,
              tasks: collection.tasks.filter(task => task.id !== action.task)
            }
          }
        return collection;
      });
      case 'addCollection':
        if (!action.name) {
          return state;
        }
        const newCollection: Collection = {name: action.name, id: idGenerator(), tasks: []}
        return [...state, newCollection];
      case 'jump':
        return state.map((collection) => {
          if (collection.id === action.updatedSource!.id) {
            return action.updatedSource!
          } 
          if (collection.id === action.updatedDestination!.id) {
            return action.updatedDestination!
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
      name: inputRef.current!.value,
      collection: 0
    });

    inputRef.current!.value = '';
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
        changedCollection.tasks = newCollectionTasks

        dispatch({
          type: 'reorder',
          collection: changedCollection.id,
          updatedCollection: changedCollection
        })
      }
    } else {
      const sourceCollectionCopy = collections.find(collection => collection.id == sourceId)
      const destinationCollectionCopy = collections.find(collection => collection.id == destinationId)
      
      const jumper = sourceCollectionCopy!.tasks[source.index]
      sourceCollectionCopy!.tasks.splice(source.index, 1)
      destinationCollectionCopy!.tasks.splice(destination.index, 0, jumper)

      dispatch({
          type: 'jump',
          updatedSource: sourceCollectionCopy,
          updatedDestination: destinationCollectionCopy
      })
    }
    }

    useEffect(() => {
      setCollections(collections)
    }, [])

    useEffect(() => {
      setCollections(collections)
      const updatedCollections = JSON.stringify(collections)
      localStorage.setItem('collections', updatedCollections)
    }, [JSON.stringify(collections)])
    
    const [edit, setEdit] = useState<number>(0);

    useEffect(() => {
      inputRef.current?.focus();
    }, [edit]);


    return ( 
      <div className="user__collections-form">
          <div className="user__task-board">
            <DragDropContext onDragEnd={onDragEnd}>
              <TaskCollectionsHeader dispatch={dispatch}/>
                {collections.map((collection: Collection) => {
                  return <Droppable droppableId={JSON.stringify(collection.id)} key={collection.id}>
                  {(provided, snapshot) => (  
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="user__task-board-collection"
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
                              {edit === task.id? 
                                <form 
                                  className="user__task-form" 
                                  onSubmit={() => {
                                    dispatch({
                                      type: 'edit',
                                      name: inputRef.current!.value,
                                      collection: collection.id,
                                      task: task.id
                                    })
                                    setEdit(0)
                                  }}
                                >
                                  <input 
                                    type="text" 
                                    className="user__task-input" 
                                    ref={inputRef}
                                    defaultValue={task.name}
                                    onBlur={() => setEdit(0)}
                                  />
                                </form>
                                : <span onDoubleClick={() => 
                                  setEdit(task.id)
                                }>
                                  {task.name}
                                </span>
                              }
                              
                              <FontAwesomeIcon 
                                icon={faCircleMinus} 
                                className="user__item-delete-icon" 
                                onClick={() => dispatch({
                                  type: 'delete',
                                  collection: collection.id,
                                  task: task.id
                                })}
                              />
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
              placeholder="Add a new task"
            />
          </form>
        </div>
    )
  }

  export default TaskCollections