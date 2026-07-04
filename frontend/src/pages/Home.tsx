import React, { useEffect, useState, useRef } from 'react';
import {Task, Collection} from '../types/types'
import './styles.css'
import TaskCollections from '../components/sections/TaskCollections'
import { idGenerator } from '../lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSliders } from '@fortawesome/free-solid-svg-icons'

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

export default function Home() {
  const localUser = localStorage.getItem('user')
  let initialUserName: string = localUser? JSON.parse(localUser): "Stranger";

  const [userName, setUserName] = useState<string>(initialUserName)
  const [collections, setCollections] = useState<Collection[]>([])
  const [chosenTask, setChosenTask] = useState<Task>({name:'', id: idGenerator()})
  const [chosenCollection, setChosenCollection] = useState<string>('')
  const [chosenCollectionId, setChosenCollectionId] = useState<number | null>(null)
  const [hidden, setHidden] = useState<Boolean>(true)
  const [edit, setEdit] = useState<boolean>(false);
  const [drawNotice, setDrawNotice] = useState<string>('Add a few task slips to your jars, then draw one.')
  const [completeTaskRequest, setCompleteTaskRequest] = useState<CompleteTaskRequest | null>(null)
  const [restoreTaskRequest, setRestoreTaskRequest] = useState<RestoreTaskRequest | null>(null)
  const [lastCompletedTask, setLastCompletedTask] = useState<RestoreTaskRequest | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null);
  const taskCount = collections.reduce((count, collection) => count + collection.tasks.length, 0)
  const collectionCount = collections.length
  const taskCountLabel = `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} in ${collectionCount} ${collectionCount === 1 ? 'jar' : 'jars'}`
  const hasDrawnTask = chosenCollectionId !== null && chosenTask.name.length > 0

  const fetchTask = () => {
    const nonEmptyCollections = collections.filter(collection => collection.tasks.length > 0)
    if (nonEmptyCollections.length === 0) {
      setChosenTask({name: 'Add a task to start drawing', id: idGenerator()})
      setChosenCollection('')
      setChosenCollectionId(null)
      setDrawNotice('Create a task in any jar, then draw one when you are ready.')
      setHidden(false)
      return
    }

    const randomCollection = Math.floor((Math.random() * nonEmptyCollections.length));
    const randomTask = Math.floor((Math.random() * nonEmptyCollections[randomCollection].tasks.length));  
    setChosenTask(nonEmptyCollections[randomCollection].tasks[randomTask]) 
    setChosenCollection(nonEmptyCollections[randomCollection].name)
    setChosenCollectionId(nonEmptyCollections[randomCollection].id)
    setDrawNotice('One task slip, one next step.')
    setHidden(true)
  } 

  const completeTask = () => {
    if (chosenCollectionId === null) {
      return
    }

    setCompleteTaskRequest({
      collectionId: chosenCollectionId,
      taskId: chosenTask.id,
      requestId: idGenerator()
    })
    setLastCompletedTask({
      collectionId: chosenCollectionId,
      collectionName: chosenCollection,
      task: chosenTask,
      requestId: idGenerator()
    })
    setChosenTask({name: 'Nice work.', id: idGenerator()})
    setChosenCollection('')
    setChosenCollectionId(null)
    setDrawNotice('Task cleared from the jar. Draw again when you are ready.')
    setHidden(true)
  }

  const undoCompleteTask = () => {
    if (!lastCompletedTask) {
      return
    }

    setRestoreTaskRequest({
      ...lastCompletedTask,
      requestId: idGenerator()
    })
    setChosenTask({name: 'Task restored.', id: idGenerator()})
    setChosenCollection('')
    setChosenCollectionId(null)
    setDrawNotice(`${lastCompletedTask.task.name} is back in ${lastCompletedTask.collectionName}.`)
    setLastCompletedTask(null)
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
    <div className={hidden? "hidden" : "greetings" }>
      {edit?
        <form
          className="greetings__name-form"
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
          className="greetings__main"
          onDoubleClick={() => setEdit(true)}
        >
          Hi, {userName.split(" ", 1)}
        </span>
      }
      <span className="greetings__subtitle">Choose what to do next.</span>
    </div>
    <div className={`${hidden? "finder__full-page" : "finder"} ${hasDrawnTask ? "finder--drawn" : ""}`}>
      <span className="finder__brand">TaskJar</span>
      <span className="finder__eyebrow">{taskCountLabel}</span>
      <h1 className="finder__name">{chosenTask.name || 'What should I do next?'}</h1>
      <span className={chosenCollection ? "finder__collection" : "finder__collection finder__collection--muted"}>
        {chosenCollection || drawNotice}
      </span>
      <div className="finder__actions">
        <button className="finder__search-button" onClick={fetchTask}>
          {hasDrawnTask ? 'Draw another' : 'Draw a task'}
        </button>
        {hasDrawnTask && (
          <button className="finder__secondary-button" onClick={completeTask}>
            Complete task
          </button>
        )}
        {!hasDrawnTask && lastCompletedTask && (
          <button className="finder__secondary-button" onClick={undoCompleteTask}>
            Undo
          </button>
        )}
      </div>
      <button
        className={hidden? "finder__full-page-close-button" : "hidden"}
        onClick = {() => setHidden(false)}
        aria-label="Manage jars"
      >
        <FontAwesomeIcon icon={faSliders} />
      </button>
    </div>
    <div className={hidden? "hidden": "tasks"}>
      <TaskCollections
        setCollections={setCollections}
        completeTaskRequest={completeTaskRequest}
        restoreTaskRequest={restoreTaskRequest}
      />
    </div>
  </div>
}
