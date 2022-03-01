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


export interface AddTaskProps {
    task: string;
    setTask: React.Dispatch<React.SetStateAction<string>>;
    // handleAdd: (e: React.FormEvent) => void;
  }
