export interface Task {
    name: string,
    description?: string,
    duration?: number,
    upvotes?: number
}   

export interface AddTaskProps {
    task: string;
    setTask: React.Dispatch<React.SetStateAction<string>>;
    // handleAdd: (e: React.FormEvent) => void;
  }