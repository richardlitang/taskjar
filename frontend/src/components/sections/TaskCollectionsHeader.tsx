import React, {useRef} from 'react';
import {Action, Collection} from '../../types/types'

const TaskCollectionsHeader: React.FC<{dispatch: React.Dispatch<Action>, collections: Collection[]}> = ({dispatch, collections}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const taskCount = collections.reduce((count, collection) => count + collection.tasks.length, 0);

    const handleNewCollection = (event: React.FormEvent )  => {
        event.preventDefault()
    
        dispatch({
          type: 'addCollection',
          name: inputRef.current!.value
        });
    
        inputRef.current!.value = '';
    }

    return (
        <div className="tasks__header">
            <div>
                <h2 className="tasks__title">Task jars</h2>
                <span className="tasks__subtitle">
                    {taskCount} {taskCount === 1 ? 'task' : 'tasks'} ready to draw
                </span>
            </div>
            <form 
                className="tasks__collection-form" 
                onSubmit={handleNewCollection}
            >
                <input 
                    type="text" 
                    className="tasks__collection-input" 
                    ref={inputRef}
                    aria-label="New jar name"
                    placeholder="New jar"
                />
          </form>
        </div>
    )
}

export default TaskCollectionsHeader
