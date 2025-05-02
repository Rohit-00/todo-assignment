import React, { useState, useEffect, useRef } from 'react';
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
import {Picker} from '@react-native-picker/picker';
import TodoList from '../../components/todoList';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';

const today = new Date().toISOString().split('T')[0]
const TodoListScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [desc , setDesc] = useState('')
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean|null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showAddButton, setShowAddButton] = useState(true);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [isDaily, setIsDaily] = useState(false);
  const pickerRef:any = useRef(null);
  const changeShowInputFromChild = (status:boolean) => {
    setShowAddButton(status)
  }
  const openPriorityPicker = () => {
    pickerRef.current?.focus();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF4B4B';
      case 'medium':
        return '#FFA246';
      case 'low':
        return '#4CAF50';
      default:
        return colors.secondText;
    }
  };

  const resetForm = () => {
    setNewTaskText('');
    setDesc('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setPriority('low');
  }
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    if(showInput){
      if(!keyboardVisible){
        if(!showTimePicker){
        setShowInput(false)
        setShowAddButton(true);
        resetForm()
        }
      }
    }
    
    const backAction = () => {
      if (keyboardVisible) {
        Keyboard.dismiss();
        return true;
      }
    
      if (keyboardVisible) {
        setShowInput(false);
        setShowAddButton(true);
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

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
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
          time: data.createdAt ? formatTime(data.createdAt.toDate()) : '2:00PM',
          dueTime: data.dueTime,
          dueDate: data.dueDate?.toDate(),
          desc: data.description,
          priority: data.priority
        } as Todo);
      });
      setTodos(todoList);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (newTaskText.trim().length === 0) return;
    setShowInput(false);
    setShowAddButton(true)
    resetForm()
    try {
      await addDoc(collection(db, "todo"), {
        user: user?.uid,
        text: newTaskText,
        completed: false,
        description: desc,
        createdAt: serverTimestamp(),
        dueDate: selectedDate,
        dueTime: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: priority,
        isDaily: isDaily, // Add this line
      });
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


  const pendingTaskCount = todos.filter(task => !task.completed).length;
  const username = user?.displayName?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00c853" />
      </View>
    );
  }
  const handleUpdateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      const todoRef = doc(db, 'todo', todoId);
      await updateDoc(todoRef, updates);
    } catch (error) {
      console.error("Error updating todo: ", error);
      Alert.alert('Error', 'Failed to update todo');
    }
  };
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.container} >

      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fa" />
      <TouchableOpacity style={styles.header} onPress={async() => {auth.signOut();}}>
        <Text style={styles.greeting}>Hii {username}</Text>
        <Text style={styles.pendingCount}>{pendingTaskCount} tasks pending</Text>
        
      </TouchableOpacity>
    
      <View>
   
      </View>
      <CalendarProvider date={today} style={{marginBottom:-100}}>
      <WeekCalendar
       theme={{
        backgroundColor: 'black',
        calendarBackground: colors.background,
        textSectionTitleColor: '#333333',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e1e8',
        dotColor: '#00adf5',
        selectedDotColor: '#ffffff',
        arrowColor: 'orange',
        monthTextColor: 'blue',
        textDayFontFamily: 'Arial',
        textDayFontWeight: '500',
        textDayFontSize: 16,
        
      }}
      style={{elevation:0}}
      current={today}
        firstDay={1}
        onDayPress={(day) => {
          console.log('Selected day', day);
        }}
      
    
      />
</CalendarProvider>
  {todos&&<TodoList
      todos={todos}
      onToggleComplete={toggleTaskCompletion}
      onDeleteTodo={deleteTodo}
      getPriorityColor={getPriorityColor}
      onUpdateTodo={handleUpdateTodo}
      changeShowInputFromChild={changeShowInputFromChild}
    />}

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder="Do some work..."
            autoFocus={true}
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
<TouchableOpacity 
  style={styles.detailButton}
  onPress={openPriorityPicker}
>
  <Feather 
    name="flag" 
    size={14} 
    color={getPriorityColor(priority)} 
  />
  <Text style={[
    styles.detailButtonText,
    { color: getPriorityColor(priority) }
  ]}>
    {priority.charAt(0).toUpperCase() + priority.slice(1)}
  </Text>
  <Picker
    ref={pickerRef}
    selectedValue={priority}
    onValueChange={(itemValue) => setPriority(itemValue)}
    style={{ height: 0, width: 0, opacity: 0 }}
  >
    <Picker.Item 
      label="Low Priority" 
      value="low" 
      color={getPriorityColor('low')} 
    />
    <Picker.Item 
      label="Medium Priority" 
      value="medium" 
      color={getPriorityColor('medium')} 
    />
    <Picker.Item 
      label="High Priority" 
      value="high" 
      color={getPriorityColor('high')} 
    />
  </Picker>
</TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.detailButton}
    onPress={() => setShowDatePicker(true)}
  >
    <Feather name="calendar" size={14} color={colors.secondText} />
    <Text style={styles.detailButtonText}>
      {selectedDate.toLocaleDateString()}
    </Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.detailButton}
    onPress={() => setShowTimePicker(true)}
  >
    <Feather name="clock" size={14} color={colors.secondText}/>
    <Text style={styles.detailButtonText}>
      {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={isDaily?styles.detailButton:styles.dailyButton}
    onPress={() => setIsDaily(!isDaily)}
  >
      <Text style={isDaily?styles.checkboxLabel:styles.dailyButtonText}>Daily</Text>

  </TouchableOpacity>
</View>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display="default"
    onChange={handleDateChange}
    minimumDate={new Date()}
  />
)}

{showTimePicker && (
  <DateTimePicker
    value={selectedTime}
    mode="time"
    display="default"
    onChange={handleTimeChange}
  />
)}
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={addTodo}
          >
            <Text style={styles.addTaskButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

     {!showInput&& showAddButton &&<TouchableOpacity 
        style={styles.addButton}
        onPress={() => {setShowInput(true);setShowAddButton(false)}}
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
    justifyContent:'flex-start',
    backgroundColor: '#f7f9fa',
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
    paddingBottom: 100,
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
    zIndex: 1, 
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
  dailyButton:{
    flexDirection:'row',
    alignItems:'baseline',
    gap:2,
    backgroundColor:colors.primary,
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:5
  },
  dailyButtonText:{
    color:'white'
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
  taskTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },

});

export default TodoListScreen;