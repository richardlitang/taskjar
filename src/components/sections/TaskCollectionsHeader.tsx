import React, { useEffect, useState, useRef, useReducer } from 'react';
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
        <div className="user__collection-header">
            <h2 className="user__collections-title">My tasks</h2>
            <form 
                className="user__collection-form" 
                onSubmit={handleNewCollection}
            >
                <input 
                type="text" 
                className="user__collection-input" 
                ref={inputRef}
                placeholder="Add a new collection"
                />
          </form>
        </div>
    )
}

export default TaskCollectionsHeader
