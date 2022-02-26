import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    value: []
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        add: (state) => {   
            // state.value.push
        }
    }
})

