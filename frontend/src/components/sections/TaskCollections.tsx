import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Collection, Action} from '../../types/types'
import '../../pages/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleMinus, faTrash } from '@fortawesome/free-solid-svg-icons'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'
import {idGenerator} from '../../lib/utils'
import TaskCollectionsHeader from './TaskCollectionsHeader'

type CompleteTaskRequest = {
  collectionId: number;
  taskId: number;
  requestId: number;
}

type RestoreTaskRequest = {
  collectionId: number;
  collectionName: string;
  task: Task;
  requestId: number;
}

const TaskCollections: React.FC<{
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
  completeTaskRequest?: CompleteTaskRequest | null,
  restoreTaskRequest?: RestoreTaskRequest | null
}> = ({setCollections, completeTaskRequest, restoreTaskRequest}) => {

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

        if (state.length === 0) {
          return state;
        }

        const requestedCollection = action.collection
        const targetCollection = requestedCollection !== undefined && state.some(collection => collection.id === requestedCollection)
          ? requestedCollection
          : state[0].id

        const newTask: Task = {name: action.name, id: idGenerator()}
        return state.map((collection) => {
          if (collection.id === targetCollection) {
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
      case 'restoreTask':
        if (action.collection === undefined || !action.restoredTask) {
          return state;
        }

        if (!state.some(collection => collection.id === action.collection)) {
          return [
            ...state,
            {
              id: action.collection,
              name: action.name || 'Restored jar',
              tasks: [action.restoredTask]
            }
          ];
        }

        return state.map((collection) => {
          if (collection.id !== action.collection) {
            return collection;
          }

          if (collection.tasks.some(task => task.id === action.restoredTask!.id)) {
            return collection;
          }

          return {
            ...collection,
            tasks: [...collection.tasks, action.restoredTask!]
          };
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
      case 'deleteCollection':
        return state.filter(collection => collection.id !== action.collection);
      default:
        return state;
    }
  }, initialCollections);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | ''>(initialCollections[0]?.id ?? '');
  const [pendingDeleteCollectionId, setPendingDeleteCollectionId] = useState<number | null>(null);
  const serializedCollections = JSON.stringify(collections);

  const handleSubmit = (event: React.FormEvent )  => {
    event.preventDefault()

    dispatch({
      type: 'add',
      name: inputRef.current!.value,
      collection: selectedCollectionId === '' ? undefined : selectedCollectionId
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
      const sourceCollectionCopy = collections.find(collection => collection.id === sourceId)
      const destinationCollectionCopy = collections.find(collection => collection.id === destinationId)
      
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
    localStorage.setItem('collections', serializedCollections)
  }, [collections, serializedCollections, setCollections])

  useEffect(() => {
    if (!completeTaskRequest) {
      return;
    }

    dispatch({
      type: 'delete',
      collection: completeTaskRequest.collectionId,
      task: completeTaskRequest.taskId
    });
  }, [completeTaskRequest])

  useEffect(() => {
    if (!restoreTaskRequest) {
      return;
    }

    dispatch({
      type: 'restoreTask',
      collection: restoreTaskRequest.collectionId,
      name: restoreTaskRequest.collectionName,
      restoredTask: restoreTaskRequest.task
    });
  }, [restoreTaskRequest])

  useEffect(() => {
    if (collections.length === 0) {
      setSelectedCollectionId('');
      return;
    }

    if (!collections.some(collection => collection.id === selectedCollectionId)) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId])

  useEffect(() => {
    if (pendingDeleteCollectionId !== null && !collections.some(collection => collection.id === pendingDeleteCollectionId)) {
      setPendingDeleteCollectionId(null);
    }
  }, [collections, pendingDeleteCollectionId])
  
  const [edit, setEdit] = useState<number>(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  return ( 
    <div className="tasks__board">
        <div className="tasks__collections">
          <DragDropContext onDragEnd={onDragEnd}>
            <TaskCollectionsHeader dispatch={dispatch} collections={collections}/>
              {collections.map((collection: Collection) => {
                return <Droppable droppableId={JSON.stringify(collection.id)} key={collection.id}>
                {(provided) => (  
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="tasks__collection"
                  >
                    <div className="tasks__collection-header">
                      <span className="tasks__collection-name">{collection.name}</span>
                      <span className="tasks__collection-count">
                        {collection.tasks.length} {collection.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                      <button
                        type="button"
                        className="tasks__collection-delete-button"
                        aria-label={`Delete ${collection.name} jar`}
                        onClick={() => setPendingDeleteCollectionId(collection.id)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="tasks__collection-delete-icon"
                        />
                      </button>
                    </div>

                    {pendingDeleteCollectionId === collection.id && (
                      <div className="tasks__collection-delete-confirm">
                        <span>Delete this jar?</span>
                        <button
                          type="button"
                          className="tasks__collection-keep-button"
                          onClick={() => setPendingDeleteCollectionId(null)}
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          className="tasks__collection-confirm-button"
                          aria-label={`Confirm delete ${collection.name} jar`}
                          onClick={() => {
                            dispatch({
                              type: 'deleteCollection',
                              collection: collection.id,
                            })
                            setPendingDeleteCollectionId(null)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {collection.tasks.length === 0 && (
                      <p className="tasks__collection-empty">Drop a task here or add one below.</p>
                    )}

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
                            className={`tasks__collection-item ${snapshot.isDragging? 'dragActive': ''}`}
                          >
                            {edit === task.id?
                              <form
                                className="tasks__collection-item-form"
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
                                  className="tasks__collection-item-input"
                                  ref={inputRef}
                                  defaultValue={task.name}
                                  onBlur={() => setEdit(0)}
                                />
                              </form>
                              : <span
                                {...provided.dragHandleProps}
                                className="tasks__collection-item-name"
                                onDoubleClick={() => setEdit(task.id)}
                              >
                                {task.name}
                              </span>
                            }

                            <button
                              type="button"
                              className="tasks__collection-item-delete-button"
                              aria-label={`Delete ${task.name}`}
                              onClick={() => dispatch({
                                type: 'delete',
                                collection: collection.id,
                                task: task.id
                              })}
                            >
                              <FontAwesomeIcon
                                icon={faCircleMinus}
                                className="tasks__collection-item-delete-icon"
                              />
                            </button>
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
          className="tasks__collection-item-form" 
          onSubmit={handleSubmit}
        >
          <label className="tasks__collection-picker">
            <span>Into</span>
            <select
              aria-label="Choose jar"
              value={selectedCollectionId}
              onChange={(event) => setSelectedCollectionId(Number(event.target.value))}
              disabled={collections.length === 0}
            >
              {collections.map((collection) => (
                <option value={collection.id} key={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <input 
            type="text" 
            className="tasks__collection-item-form-input" 
            ref={inputRef}
            aria-label="New task"
            placeholder="Add a task"
            disabled={collections.length === 0}
          />
        </form>
      </div>
    )
  }

  export default TaskCollections
