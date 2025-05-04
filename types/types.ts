type Todo = {
    id: string;
    text: string;
    desc:string;
    completed: boolean;
    createdAt: Date;  
    dueDate?: string; 
    dueTime?: string; 
    priority?: 'low' | 'medium' | 'high';
    isDaily?: boolean;
    notificationId?: string;
  }
type TodoStatus = {
  id:string;
  todoId: string;
  completed: boolean;
  date:Date;
  userId:string;
  isDaily:boolean;
  createdAt:Date;
}

//in addTodo.tsx
type FormState = {
  text: string;
  desc: string;
  date: Date;
  time: Date;
  priority: 'low' | 'medium' | 'high';
  isDaily: boolean;
}
type SortOption = 'dueTime' | 'priority' | 'default';