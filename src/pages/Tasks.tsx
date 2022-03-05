import React, { useEffect, useState } from 'react';
import {Task} from '../types/types'

export default function Tasks() {
    let [tasks, setTasks] = useState<Task[]>()
    let [userTasks, setUserTasks] = useState<Task[]>()

    useEffect(() => {
        const fetchAllTasks = async () => {
            await fetch('http://localhost:5000/api/tasks/all').
                then(response => response.json()).
                then(data => setTasks(data))
        } 

        // const fetchUserTasks = async () => {
        //     await fetch('http://localhost:5000/api/user/me', {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             // 'Authorization': `Bearer ${token.jwt}`
        //             },
        //         }).
        //         then(response => response.json()).
        //         then(data => setUserTasks(data))
        // }
        
        fetchAllTasks().catch(console.error)

        // if (token) {
        //     fetchUserTasks().catch(console.error)
        // }
        }, []
    )

    return <div>
        <div>
            <p>Will be availabe in the next update.</p>
        </div>
    </div>
} 