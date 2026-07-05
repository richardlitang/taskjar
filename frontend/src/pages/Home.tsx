import React, { useEffect, useState, useRef } from 'react';
import {Task, Collection} from '../types/types'
import './styles.css'
import TaskCollections from '../components/sections/TaskCollections'
import { idGenerator } from '../lib/utils';

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

type StarterPresetId = 'focus' | 'home' | 'work' | 'blank';

type StarterPreset = {
  id: StarterPresetId;
  name: string;
  description: string;
  preview: string;
}

type StarterCollectionsRequest = {
  collections: Collection[];
  requestId: number;
}

type OnboardingStep = 'name' | 'shelf';
type DrawPhase = 'idle' | 'choosing' | 'doing' | 'completed';

export const DRAW_REVEAL_DELAY_MS = 820;
const drawCollectionStorageKey = 'drawCollectionIds';

const starterPresets: StarterPreset[] = [
  {
    id: 'focus',
    name: 'Just enough',
    description: 'Tiny tasks for low-energy moments.',
    preview: '2 jars, 4 slips'
  },
  {
    id: 'home',
    name: 'Home rhythm',
    description: 'Small resets for your space.',
    preview: '3 jars, 6 slips'
  },
  {
    id: 'work',
    name: 'Workday',
    description: 'Inbox, focus, and follow-up.',
    preview: '3 jars, 6 slips'
  },
  {
    id: 'blank',
    name: 'Start empty',
    description: 'Build your shelf from scratch.',
    preview: 'No slips yet'
  }
]

const defaultUserName = 'Kaye'

const buildStarterCollections = (presetId: StarterPresetId): Collection[] => {
  const baseId = idGenerator();
  let idOffset = 0;
  const nextStarterId = () => baseId + idOffset++;
  const collection = (name: string, tasks: string[]): Collection => ({
    id: nextStarterId(),
    name,
    tasks: tasks.map((task) => ({ name: task, id: nextStarterId() }))
  })

  switch (presetId) {
    case 'home':
      return [
        collection('Kitchen', ['Clear the counter', 'Empty the dish rack']),
        collection('Laundry', ['Start one load', 'Fold for 10 minutes']),
        collection('Admin', ['Open one letter', 'Pay one bill'])
      ];
    case 'work':
      return [
        collection('Inbox', ['Reply to one waiting message', 'Archive five stale emails']),
        collection('Deep work', ['Write the next paragraph', 'Outline one thorny task']),
        collection('Follow-up', ['Send one status note', 'Schedule the next check-in'])
      ];
    case 'blank':
      return [];
    case 'focus':
    default:
      return [
        collection('5 minutes', ['Full body stretch', 'Clear your desk']),
        collection('15 minutes', ['Go for a walk', 'Plan the next step'])
      ];
  }
}

const parseStoredDrawCollectionIds = (storedValue: string | null): number[] => {
  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is number => typeof value === 'number')
      : [];
  } catch {
    return [];
  }
}

const parseStoredUserName = (storedValue: string | null): string => {
  if (!storedValue) {
    return '';
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return typeof parsedValue === 'string' ? parsedValue : '';
  } catch {
    return storedValue;
  }
}

export default function Home() {
  const localUser = localStorage.getItem('user')
  const localCollections = localStorage.getItem('collections')
  const storedUserName: string = parseStoredUserName(localUser);
  const initialUserName = storedUserName && storedUserName !== 'Stranger' ? storedUserName : defaultUserName;

  const [userName, setUserName] = useState<string>(initialUserName)
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(!localUser && !localCollections)
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('name')
  const [onboardingName, setOnboardingName] = useState<string>(storedUserName && storedUserName !== 'Stranger' ? initialUserName : '')
  const [selectedStarterPreset, setSelectedStarterPreset] = useState<StarterPresetId>('focus')
  const [collections, setCollections] = useState<Collection[]>([])
  const [chosenTask, setChosenTask] = useState<Task>({name:'', id: idGenerator()})
  const [chosenCollection, setChosenCollection] = useState<string>('')
  const [chosenCollectionId, setChosenCollectionId] = useState<number | null>(null)
  const [hidden, setHidden] = useState<boolean>(true)
  const [edit, setEdit] = useState<boolean>(false);
  const [drawNotice, setDrawNotice] = useState<string>('Add a few task slips to your jars, then draw one.')
  const [drawPhase, setDrawPhase] = useState<DrawPhase>('idle')
  const [selectedDrawCollectionIds, setSelectedDrawCollectionIds] = useState<number[]>(() => parseStoredDrawCollectionIds(localStorage.getItem(drawCollectionStorageKey)))
  const [completeTaskRequest, setCompleteTaskRequest] = useState<CompleteTaskRequest | null>(null)
  const [restoreTaskRequest, setRestoreTaskRequest] = useState<RestoreTaskRequest | null>(null)
  const [lastCompletedTask, setLastCompletedTask] = useState<RestoreTaskRequest | null>(null)
  const [starterCollectionsRequest, setStarterCollectionsRequest] = useState<StarterCollectionsRequest | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null);
  const drawTimeoutRef = useRef<number | null>(null);
  const hasDrawnTask = chosenCollectionId !== null && chosenTask.name.length > 0
  const shelfOpen = !hidden
  const isChoosingTask = drawPhase === 'choosing'
  const isDoingTask = drawPhase === 'doing' && hasDrawnTask
  const validSelectedDrawCollectionIds = selectedDrawCollectionIds.filter(collectionId => (
    collections.some(collection => collection.id === collectionId)
  ))
  const isDrawFilterLimited = validSelectedDrawCollectionIds.length > 0
  const drawFilterLabel = !isDrawFilterLimited
    ? 'All jars'
    : validSelectedDrawCollectionIds.length === 1
      ? collections.find(collection => collection.id === validSelectedDrawCollectionIds[0])?.name || '1 jar'
      : `${validSelectedDrawCollectionIds.length} jars`
  const collectionIsSelectedForDraw = (collectionId: number) => (
    !isDrawFilterLimited || validSelectedDrawCollectionIds.includes(collectionId)
  )
  const filteredCollections = collections.filter(collection => (
    collectionIsSelectedForDraw(collection.id)
  ))
  const totalSlipCount = collections.reduce((count, collection) => count + collection.tasks.length, 0)
  const canFilterDrawCollections = collections.length > 1

  const toggleDrawCollection = (collectionId: number) => {
    setSelectedDrawCollectionIds((currentIds) => {
      const currentValidIds = currentIds.filter(id => collections.some(collection => collection.id === id))
      if (currentValidIds.length === 0) {
        return [collectionId]
      }

      const collectionIsSelected = currentValidIds.includes(collectionId)
      const nextIds = collectionIsSelected
        ? currentValidIds.filter(id => id !== collectionId)
        : [...currentValidIds, collectionId]

      return nextIds.length === collections.length ? [] : nextIds
    })
  }

  const clearPendingDraw = () => {
    if (drawTimeoutRef.current) {
      window.clearTimeout(drawTimeoutRef.current)
      drawTimeoutRef.current = null
    }
  }

  const fetchTask = () => {
    if (isChoosingTask) {
      return
    }

    clearPendingDraw()
    const allNonEmptyCollections = collections.filter(collection => collection.tasks.length > 0)
    const nonEmptyCollections = filteredCollections.filter(collection => collection.tasks.length > 0)
    if (allNonEmptyCollections.length === 0) {
      setChosenTask({name: 'Add a task to start drawing', id: idGenerator()})
      setChosenCollection('')
      setChosenCollectionId(null)
      setDrawNotice('Create a task in any jar, then draw one when you are ready.')
      setDrawPhase('idle')
      setHidden(false)
      return
    }

    if (nonEmptyCollections.length === 0) {
      setChosenTask({name: 'No slips here', id: idGenerator()})
      setChosenCollection('')
      setChosenCollectionId(null)
      setDrawNotice('Choose another jar or add a slip to this draw pool.')
      setDrawPhase('idle')
      setHidden(false)
      return
    }

    const randomCollection = Math.floor((Math.random() * nonEmptyCollections.length));
    const randomTask = Math.floor((Math.random() * nonEmptyCollections[randomCollection].tasks.length));
    const nextCollection = nonEmptyCollections[randomCollection]
    const nextTask = nextCollection.tasks[randomTask]

    setDrawPhase('choosing')
    setChosenTask({name: '', id: idGenerator()})
    setChosenCollection('')
    setChosenCollectionId(null)
    setDrawNotice('Choosing a slip...')
    setHidden(true)

    drawTimeoutRef.current = window.setTimeout(() => {
      setChosenTask(nextTask)
      setChosenCollection(nextCollection.name)
      setChosenCollectionId(nextCollection.id)
      setDrawNotice('Do this one next.')
      setDrawPhase('doing')
      drawTimeoutRef.current = null
    }, DRAW_REVEAL_DELAY_MS)
  } 

  const completeTask = () => {
    if (chosenCollectionId === null) {
      return
    }

    clearPendingDraw()
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
    setDrawPhase('completed')
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
    setDrawPhase('idle')
    setLastCompletedTask(null)
    setHidden(true)
  }

  const handleOnboardingSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (onboardingStep === 'name') {
      setOnboardingStep('shelf')
      return
    }

    const nextUserName = onboardingName.trim() || defaultUserName
    setUserName(nextUserName)
    setStarterCollectionsRequest({
      collections: buildStarterCollections(selectedStarterPreset),
      requestId: idGenerator()
    })
    localStorage.setItem('onboardingComplete', JSON.stringify(true))
    setOnboardingOpen(false)
    setHidden(false)
  }

  useEffect(() => {
    if (onboardingOpen) {
      return;
    }

    const updatedUser = JSON.stringify(userName)
    localStorage.setItem('user', updatedUser)
  }, [userName, onboardingOpen]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  useEffect(() => {
    const nextSelectedIds = selectedDrawCollectionIds.filter(collectionId => (
      collections.some(collection => collection.id === collectionId)
    ))
    const normalizedSelectedIds = nextSelectedIds.length === collections.length ? [] : nextSelectedIds

    if (
      normalizedSelectedIds.length !== selectedDrawCollectionIds.length ||
      normalizedSelectedIds.some((collectionId, index) => collectionId !== selectedDrawCollectionIds[index])
    ) {
      setSelectedDrawCollectionIds(normalizedSelectedIds)
      return
    }

    localStorage.setItem(drawCollectionStorageKey, JSON.stringify(normalizedSelectedIds))
  }, [collections, selectedDrawCollectionIds]);

  useEffect(() => {
    return () => {
      if (drawTimeoutRef.current) {
        window.clearTimeout(drawTimeoutRef.current)
      }
    }
  }, []);

  return <div className={`home ${shelfOpen ? 'home--shelf' : 'home--focus'}`}>
    <button
      className="shelf-toggle"
      onClick={() => setHidden((isClosed) => !isClosed)}
      aria-label={shelfOpen ? 'Close jars' : 'Manage jars'}
      aria-expanded={shelfOpen}
      aria-controls="task-shelf"
      type="button"
    >
      <span className="shelf-toggle__jar" aria-hidden="true" />
      <span>{shelfOpen ? 'Done' : 'Jars'}</span>
    </button>
    <div className="greetings">
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
            placeholder={defaultUserName}
            onBlur={() => setEdit(false)}
          />
        </form> :
        <span
          className="greetings__main"
          onDoubleClick={() => setEdit(true)}
        >
          Hi, {userName.split(" ", 1)[0] || defaultUserName}
        </span>
      }
      <span className="greetings__subtitle">Choose what to do next.</span>
    </div>
    <div className={`finder ${hasDrawnTask ? "finder--drawn" : ""} ${isChoosingTask ? "finder--choosing" : ""} ${isDoingTask ? "finder--doing" : ""} ${drawPhase === 'completed' ? "finder--completed" : ""}`}>
      {isChoosingTask && (
        <div className="finder__draw-stage" aria-hidden="true">
          <span className="finder__slip finder__slip--one" />
          <span className="finder__slip finder__slip--two" />
          <span className="finder__slip finder__slip--three" />
        </div>
      )}
      <h1 className="finder__name">{chosenTask.name || (isChoosingTask ? 'Drawing...' : 'What should I do next?')}</h1>
      <span className={chosenCollection ? "finder__collection" : "finder__collection finder__collection--muted"}>
        {chosenCollection || drawNotice}
      </span>
      {canFilterDrawCollections && (
        <div className="finder__draw-filter" role="group" aria-label="Draw from jars">
          <span className="finder__filter-label">Draw from</span>
          <div className="finder__filter-options">
            <button
              className={`finder__filter-option ${!isDrawFilterLimited ? 'finder__filter-option--selected' : ''}`}
              type="button"
              onClick={() => setSelectedDrawCollectionIds([])}
              aria-pressed={!isDrawFilterLimited}
            >
              <span>All jars</span>
              <small>{totalSlipCount} {totalSlipCount === 1 ? 'slip' : 'slips'}</small>
            </button>
            {collections.map((collection) => {
              const collectionSelected = isDrawFilterLimited && validSelectedDrawCollectionIds.includes(collection.id)

              return (
                <button
                  className={`finder__filter-option ${collectionSelected ? 'finder__filter-option--selected' : ''}`}
                  type="button"
                  key={collection.id}
                  onClick={() => toggleDrawCollection(collection.id)}
                  aria-pressed={collectionSelected}
                >
                  <span>{collection.name}</span>
                  <small>{collection.tasks.length} {collection.tasks.length === 1 ? 'slip' : 'slips'}</small>
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="finder__actions" aria-busy={isChoosingTask}>
        {hasDrawnTask ? (
          <button
            className="finder__secondary-button"
            onClick={fetchTask}
            disabled={isChoosingTask}
            aria-label={`Draw another from ${drawFilterLabel}`}
          >
            Draw another
          </button>
        ) : (
          <button className="finder__search-button" onClick={fetchTask} disabled={isChoosingTask}>
            {isChoosingTask ? 'Choosing...' : 'Draw a task'}
          </button>
        )}
        {hasDrawnTask && (
          <button className="finder__search-button" onClick={completeTask} aria-label="Mark complete task">
            Mark complete
          </button>
        )}
        {!hasDrawnTask && lastCompletedTask && (
          <button className="finder__secondary-button" onClick={undoCompleteTask}>
            Undo
          </button>
        )}
      </div>
    </div>
    <div className="tasks" id="task-shelf" aria-hidden={!shelfOpen}>
      {!onboardingOpen && (
        <TaskCollections
          setCollections={setCollections}
          completeTaskRequest={completeTaskRequest}
          restoreTaskRequest={restoreTaskRequest}
          starterCollectionsRequest={starterCollectionsRequest}
        />
      )}
    </div>
    {onboardingOpen && (
      <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <form className="onboarding__panel" onSubmit={handleOnboardingSubmit}>
          {onboardingStep === 'name' ? (
            <>
              <div className="onboarding__mark" aria-hidden="true">
                <span />
              </div>
              <h2 className="onboarding__title" id="onboarding-title">Welcome to TaskJar</h2>
              <p className="onboarding__copy">A quieter way to pick what comes next.</p>
              <label className="onboarding__name-label">
                <span>What should we call you?</span>
                <input
                  type="text"
                  value={onboardingName}
                  onChange={(event) => setOnboardingName(event.target.value)}
                  placeholder="Kaye"
                  autoFocus
                />
              </label>
            </>
          ) : (
            <>
              <h2 className="onboarding__title" id="onboarding-title">Choose a starter shelf</h2>
              <p className="onboarding__copy">Start with a few slips, or keep the jar empty.</p>
              <fieldset className="onboarding__choices">
                <legend className="hidden">Starter shelf</legend>
                <div className="onboarding__choice-grid">
                  {starterPresets.map((preset) => (
                    <label className="onboarding__choice" key={preset.id}>
                      <input
                        type="radio"
                        name="starterPreset"
                        value={preset.id}
                        checked={selectedStarterPreset === preset.id}
                        onChange={() => setSelectedStarterPreset(preset.id)}
                      />
                      <span className="onboarding__choice-name">{preset.name}</span>
                      <span className="onboarding__choice-description">{preset.description}</span>
                      <span className="onboarding__choice-preview">{preset.preview}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <button className="onboarding__submit" type="submit">
            {onboardingStep === 'name' ? 'Continue' : 'Start'}
          </button>
        </form>
      </div>
    )}
  </div>
}
