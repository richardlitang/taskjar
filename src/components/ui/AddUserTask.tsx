import {useRef} from 'react'


function AddUserTaskForm() {
    const handleFormSubmit = () => {

    }

    const inputRef = useRef <HTMLInputElement>(null)

    return (
        <form action="submit" 
          onSubmit={handleFormSubmit} 
        >
          <input 
            type="text" 
            className="user__collections-form-input"
            ref={inputRef}
        />
        </form>
    )
}

export default AddUserTaskForm



