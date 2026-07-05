import React, { useEffect, useState, useRef, useReducer } from 'react';
import {Task, Collection, Action} from '../../types/types'
import '../../pages/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircleMinus, faPen, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
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

type StarterCollectionsRequest = {
  collections: Collection[];
  requestId: number;
}

type ShelfDialog = 'jar' | 'task' | null;

const TaskCollections: React.FC<{
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
  completeTaskRequest?: CompleteTaskRequest | null,
  restoreTaskRequest?: RestoreTaskRequest | null,
  starterCollectionsRequest?: StarterCollectionsRequest | null
}> = ({setCollections, completeTaskRequest, restoreTaskRequest, starterCollectionsRequest}) => {

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
          if (collection.id !== action.collection) {
            return collection;
          }

          return {
            ...collection,
            tasks: collection.tasks.map(task => {
              if (task.id !== action.task) {
                return task;
              }

              return {
                ...task,
                name: action.name!
              };
            })
          }
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
      case 'replaceCollections':
        return action.collections || state;
      default:
        return state;
    }
  }, initialCollections);

  const modalInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | ''>(initialCollections[0]?.id ?? '');
  const [pendingDeleteCollectionId, setPendingDeleteCollectionId] = useState<number | null>(null);
  const [activeDialog, setActiveDialog] = useState<ShelfDialog>(null);
  const [newJarName, setNewJarName] = useState<string>('');
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number>(0);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>('');
  const serializedCollections = JSON.stringify(collections);

  const closeDialog = () => {
    setActiveDialog(null);
    setNewJarName('');
    setNewTaskName('');
  }

  const handleNewCollection = (event: React.FormEvent )  => {
    event.preventDefault()

    const nextName = newJarName.trim();

    if (!nextName) {
      return;
    }

    dispatch({
      type: 'addCollection',
      name: nextName
    });

    closeDialog();
  }

  const handleSubmit = (event: React.FormEvent )  => {
    event.preventDefault()

    const nextName = newTaskName.trim();

    if (!nextName) {
      return;
    }

    dispatch({
      type: 'add',
      name: nextName,
      collection: selectedCollectionId === '' ? undefined : selectedCollectionId
    });

    closeDialog();
  }

  const startEditingTask = (collectionId: number, task: Task) => {
    setEditingCollectionId(collectionId);
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  }

  const cancelEditingTask = () => {
    setEditingCollectionId(null);
    setEditingTaskId(0);
    setEditingTaskName('');
  }

  const saveEditingTask = (event: React.FormEvent) => {
    event.preventDefault();

    if (editingCollectionId === null) {
      return;
    }

    const nextName = editingTaskName.trim();

    if (!nextName) {
      return;
    }

    dispatch({
      type: 'edit',
      name: nextName,
      collection: editingCollectionId,
      task: editingTaskId
    });
    cancelEditingTask();
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
          updatedCollection: {
            ...changedCollection,
            tasks: newCollectionTasks
          }
        })
      }
    } else {
      const sourceCollection = collections.find(collection => collection.id === sourceId)
      const destinationCollection = collections.find(collection => collection.id === destinationId)

      if (!sourceCollection || !destinationCollection) {
        return;
      }
      
      const updatedSourceTasks = [...sourceCollection.tasks]
      const [jumper] = updatedSourceTasks.splice(source.index, 1)
      const updatedDestinationTasks = [...destinationCollection.tasks]
      updatedDestinationTasks.splice(destination.index, 0, jumper)

      dispatch({
          type: 'jump',
          updatedSource: {
            ...sourceCollection,
            tasks: updatedSourceTasks
          },
          updatedDestination: {
            ...destinationCollection,
            tasks: updatedDestinationTasks
          }
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
    if (!starterCollectionsRequest) {
      return;
    }

    dispatch({
      type: 'replaceCollections',
      collections: starterCollectionsRequest.collections
    });
  }, [starterCollectionsRequest])

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
  
  useEffect(() => {
    modalInputRef.current?.focus();
  }, [activeDialog]);

  useEffect(() => {
    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [editingTaskId]);

  return ( 
    <div className="tasks__board">
        <TaskCollectionsHeader
          collections={collections}
          onAddJar={() => setActiveDialog('jar')}
        />
        <div className="tasks__collections">
          <DragDropContext onDragEnd={onDragEnd}>
              {collections.length === 0 && (
                <div className="tasks__empty-shelf">
                  <span>No jars yet.</span>
                  Create a jar above, then add the first task slip.
                </div>
              )}
              {collections.map((collection: Collection) => {
                return <Droppable droppableId={JSON.stringify(collection.id)} key={collection.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`tasks__collection ${snapshot.isDraggingOver ? 'tasks__collection--drop-target' : ''}`}
                  >
                    <div className="tasks__collection-header">
                      <span className="tasks__collection-name">{collection.name}</span>
                      <span className="tasks__collection-count">
                        {collection.tasks.length} {collection.tasks.length === 1 ? 'slip' : 'slips'}
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
                        isDragDisabled={editingTaskId === task.id}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(editingTaskId !== task.id && provided.dragHandleProps ? provided.dragHandleProps : {})}
                            className={`tasks__collection-item ${snapshot.isDragging? 'dragActive': ''} ${editingTaskId === task.id ? 'tasks__collection-item--editing' : ''}`}
                          >
                            {editingTaskId === task.id?
                              <form
                                className="tasks__edit-form"
                                onSubmit={saveEditingTask}
                              >
                                <input
                                  type="text"
                                  className="tasks__collection-item-input"
                                  ref={editInputRef}
                                  value={editingTaskName}
                                  onChange={(event) => setEditingTaskName(event.target.value)}
                                />
                                <div className="tasks__edit-actions">
                                  <button
                                    type="submit"
                                    className="tasks__collection-item-action tasks__collection-item-action--save"
                                    aria-label={`Save ${task.name}`}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </button>
                                  <button
                                    type="button"
                                    className="tasks__collection-item-action"
                                    aria-label={`Cancel editing ${task.name}`}
                                    onClick={cancelEditingTask}
                                  >
                                    <FontAwesomeIcon icon={faXmark} />
                                  </button>
                                </div>
                              </form>
                              : <span
                                className="tasks__collection-item-name"
                              >
                                {task.name}
                              </span>
                            }

                            {editingTaskId !== task.id && (
                              <div className="tasks__collection-item-actions">
                                <button
                                  type="button"
                                  className="tasks__collection-item-action"
                                  aria-label={`Edit ${task.name}`}
                                  onClick={() => startEditingTask(collection.id, task)}
                                >
                                  <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button
                                  type="button"
                                  className="tasks__collection-item-action tasks__collection-item-action--delete"
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
        <div className="tasks__shelf-footer">
          <button
            className="tasks__shelf-action tasks__shelf-action--primary"
            type="button"
            onClick={() => setActiveDialog('task')}
            disabled={collections.length === 0}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>New slip</span>
          </button>
        </div>

        {activeDialog && (
          <div className="tasks__dialog-backdrop" role="presentation">
            <form
              className="tasks__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tasks-dialog-title"
              onSubmit={activeDialog === 'jar' ? handleNewCollection : handleSubmit}
            >
              <div>
                <h3 className="tasks__dialog-title" id="tasks-dialog-title">
                  {activeDialog === 'jar' ? 'New jar' : 'New slip'}
                </h3>
                <p className="tasks__dialog-copy">
                  {activeDialog === 'jar' ? 'Create a place for related slips.' : 'Add one small task to a jar.'}
                </p>
              </div>
              {activeDialog === 'task' && (
                <label className="tasks__dialog-label">
                  <span>Jar</span>
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
              )}
              <label className="tasks__dialog-label">
                <span>{activeDialog === 'jar' ? 'Jar name' : 'Task slip'}</span>
                <input
                  ref={modalInputRef}
                  type="text"
                  value={activeDialog === 'jar' ? newJarName : newTaskName}
                  onChange={(event) => activeDialog === 'jar'
                    ? setNewJarName(event.target.value)
                    : setNewTaskName(event.target.value)}
                  placeholder={activeDialog === 'jar' ? 'Errands' : 'Clear the counter'}
                />
              </label>
              <div className="tasks__dialog-actions">
                <button
                  className="tasks__dialog-secondary"
                  type="button"
                  onClick={closeDialog}
                >
                  Cancel
                </button>
                <button
                  className="tasks__dialog-primary"
                  type="submit"
                >
                  {activeDialog === 'jar' ? 'Add jar' : 'Add slip'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  export default TaskCollections
