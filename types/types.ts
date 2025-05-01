type Todo = {
    id: string;
    text: string;
    desc:string;
    completed: boolean;
    createdAt: Date;  
    dueDate?: Date; 
    dueTime?: string; 
    priority?: 'low' | 'medium' | 'high';
  }

  type SortOption = 'dueTime' | 'priority' | 'default';