import React from 'react';
import {Collection} from '../../types/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const TaskCollectionsHeader: React.FC<{collections: Collection[], onAddJar: () => void}> = ({collections, onAddJar}) => {
    const taskCount = collections.reduce((count, collection) => count + collection.tasks.length, 0);

    return (
        <div className="tasks__header">
            <div>
                <h2 className="tasks__title">Your jars</h2>
                <span className="tasks__subtitle">
                    {taskCount} {taskCount === 1 ? 'slip' : 'slips'} ready
                </span>
            </div>
            <button
                className="tasks__shelf-action"
                type="button"
                onClick={onAddJar}
            >
                <FontAwesomeIcon icon={faPlus} />
                <span>New jar</span>
            </button>
        </div>
    )
}

export default TaskCollectionsHeader
