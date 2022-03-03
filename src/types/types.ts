export interface Task {
    id: number,
    name: string,
    description?: string,
    duration?: number,
    upvotes?: number
}   

export interface Collection {
    id: number,
    name: string,
    tasks: Task[]
}   


export interface Action {
    type: string,
    name?: string,
    collection?: number,
    task?: number,
    updatedCollection?: Collection,
    updatedSource?: Collection,
    updatedDestination?: Collection
}

export interface AddTaskProps {
    task: string;
    setTask: React.Dispatch<React.SetStateAction<string>>;
    // handleAdd: (e: React.FormEvent) => void;
  }
