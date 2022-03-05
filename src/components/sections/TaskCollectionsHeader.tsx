import React, {useRef} from 'react';
import {Action} from '../../types/types'

const TaskCollectionsHeader: React.FC<{dispatch: React.Dispatch<Action>}> = ({dispatch}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

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
            <h2 className="tasks__title">My tasks</h2>
            <form 
                className="tasks__collection-form" 
                onSubmit={handleNewCollection}
            >
                <input 
                    type="text" 
                    className="tasks__collection-input" 
                    ref={inputRef}
                    placeholder="Add a new collection"
                />
          </form>
        </div>
    )
}

export default TaskCollectionsHeader
