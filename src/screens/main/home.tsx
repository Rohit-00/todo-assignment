import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}
const user = getAuth().currentUser
const HomeScreen = () => {
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
loading&&console.log('loading')
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const q = query(collection(db, 'todo'), where('user', '==', userId), orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todoList: Todo[] = [];
      querySnapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() } as Todo);
      });
      setTodos(todoList);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (todoText.trim().length === 0) return;

try {
  const docRef = await addDoc(collection(db, "todo"), {
    user:user?.uid,
    text:todoText,
    completed:false,
    createdAt: serverTimestamp(),
});
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await deleteDoc(doc(db, 'todo', todoId));

    } catch (error) {
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.text}</Text>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={todoText}
          onChangeText={setTodoText}
          placeholder="Add a new todo"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    width: 80,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default HomeScreen;