import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  BackHandler,
  Keyboard,
} from 'react-native';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import app from '../../../utils/firebase';
import { colors } from '../../../utils/colors';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  time?: string; // For displaying formatted time
}

const TodoListScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [desc , setDesc] = useState('')
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean|null>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    if(showInput){
      if(!keyboardVisible){
        setShowInput(false)
      }
    }
    
    const backAction = () => {
      if (keyboardVisible) {
        Keyboard.dismiss();
        return true;
      }
    
      if (keyboardVisible) {
        setShowInput(false);
        return true;
      }
    
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {backHandler.remove();       
    showSubscription.remove();
    hideSubscription.remove();}
    
  }, [keyboardVisible]);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  
  const formatTime = (date: Date): string => {
    return date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2:00PM';
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }
  
    const q = query(
      collection(db, 'todo'), 
      where('user', '==', userId), 
      orderBy('createdAt', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todoList: Todo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todoList.push({
          id: doc.id,
          text: data.text,
          completed: data.completed,
          createdAt: data.createdAt?.toDate(),
          time: data.createdAt ? formatTime(data.createdAt.toDate()) : '2:00PM'
        } as Todo);
      });
      setTodos(todoList);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (newTaskText.trim().length === 0) return;

    try {
      await addDoc(collection(db, "todo"), {
        user: user?.uid,
        text: newTaskText,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTaskText('');
      setShowInput(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert('Error', 'Failed to add todo');
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

  const toggleTaskCompletion = async (todo: Todo) => {
    try {
      const todoRef = doc(db, 'todo', todo.id);
      await updateDoc(todoRef, {
        completed: !todo.completed
      });
    } catch (error) {
      console.error("Error updating task: ", error);
      Alert.alert('Error', 'Failed to update todo status');
    }
  };

  const renderTask = ({ item }: { item: Todo }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => toggleTaskCompletion(item)}
      activeOpacity={0.8}
      onLongPress={() => deleteTodo(item.id)}
    >
      <View style={styles.taskContent}>
        <View style={styles.checkboxContainer}>
          {item.completed ? (
            <View style={styles.checkboxChecked}>
              <View style={styles.checkboxInner} />
            </View>
          ) : (
            <View style={styles.checkbox} />
          )}
        </View>
        <Text 
          style={[
            styles.taskText, 
            item.completed && styles.taskTextCompleted
          ]}
        >
          {item.text}
        </Text>
      </View>
      <Text style={styles.taskTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  const pendingTaskCount = todos.filter(task => !task.completed).length;
  const username = user?.displayName?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00c853" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container} >
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Hii {username}</Text>
        <Text style={styles.pendingCount}>{pendingTaskCount} tasks pending</Text>
      </View>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder="Do some work..."
            autoFocus
            onSubmitEditing={addTodo}
          />
          <TextInput
            style={styles.desc}
            value={desc}
            onChangeText={setDesc}
            placeholder="Description"
          
            onSubmitEditing={addTodo}
          />
          <View style={styles.taskDetails}>
        <TouchableOpacity style={styles.detailButton}>
        <Feather name="flag" size={14} color={colors.secondText} />
          <Text style={styles.detailButtonText}>Priority</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailButton}>
        <Feather name="calendar" size={14} color={colors.secondText} />
          <Text style={styles.detailButtonText}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailButton}>
        <Feather name="clock" size={14} color={colors.secondText}/>
          <Text style={styles.detailButtonText}>Time</Text>
        </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={addTodo}
          >
            <Text style={styles.addTaskButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

     {!showInput&& <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowInput(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  pendingCount: {
    fontSize: 16,
    color: '#00c853',
    marginTop: 4,
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space at bottom for FAB
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#00c853',
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#00c853',
    backgroundColor: '#00c853',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskTime: {
    fontSize: 14,
    color: '#999',
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00c853',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
    lineHeight: 56,
  },
  inputContainer: {
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    backgroundColor: 'white',
    width:"100%",
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 100,
  },
  input: {
    flex: 1,
    padding: 5,
    fontSize: 20,
  },
  desc:{
    flex: 1,
    padding: 5,
    fontSize:14
  },
  taskDetails:{
    flex:1,
    flexDirection:'row',
    margin:5,
    gap:8
  },
  detailButton:{
    flexDirection:'row',
    alignItems:'baseline',
    gap:2,
    backgroundColor:colors.buttonBackground,
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:5
  },
  detailButtonText:{
    color:colors.secondText
  },
  addTaskButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width:100,
    height:40,
    alignSelf:'flex-end',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addTaskButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default TodoListScreen;