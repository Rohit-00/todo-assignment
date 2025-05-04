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
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, updateDoc, or, and, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import app from '../../../utils/firebase';
import { colors } from '../../../utils/colors';
import Feather from '@expo/vector-icons/Feather';
import TodoList from '../../components/todoList';
import { CalendarProvider, WeekCalendar} from 'react-native-calendars';
import * as Notifications from 'expo-notifications';
import * as Network from 'expo-network';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AddTodo from '../../components/addTodo';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const scheduleTaskNotificationDaily = async (title:string,desc:string,time:Date) => {
  try {
      const hour = time.getHours();
      const minute = time.getMinutes();
      const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: desc,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
      },
    });
    return notificationId
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};
const scheduleTaskNotificationOnce = async (title:string,desc:string,time:Date) => {
  try {
      const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: desc,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date:time
      },
    });
    return notificationId
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};
const OfflineMessage = () => (
  <View style={styles.offlineContainer}>
    <Feather name="wifi-off" size={50} color={colors.negative} />
    <Text style={styles.offlineTitle}>No Internet Connection</Text>
    <Text style={styles.offlineText}>
      Please check your internet connection and try again
    </Text>
  </View>
);
const today = new Date().toISOString().split('T')[0]
const TodoListScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean|null>(null); 
  const [showAddButton, setShowAddButton] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [todoStatus , setTodoStatus] = useState<TodoStatus[]>([])
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected!);
    };
  
    const intervalId = setInterval(checkConnection, 5000); 
    checkConnection(); 
  
    return () => clearInterval(intervalId);
  }, []);
  
  const changeShowInputFromChild = (status:boolean) => {
    setShowAddButton(status)
  }


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
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Push notifications are required for task reminders');
      }
    };

    requestPermissions();
  }, []);
  
  // const resetForm = () => {
  //   setNewTaskText('');
  //   setDesc('');
  //   setSelectedDate(new Date());
  //   setSelectedTime(new Date());
  //   setPriority('low');
  //   setIsDaily(false);
  // }
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
        setShowAddButton(true);
        // resetForm()
        
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



  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }
  
    const q = query(
      collection(db, 'todo'), 
      and(where('user', '==',userId),
      or(where('dueDate', '==', date),
      where('isDaily', '==', true)), ),
      orderBy('createdAt', 'desc')
    );
    const q2 = query(
      collection(db, 'todo_status'), 
      where('date', '==', date),
      where('userId', '==', userId),
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
          dueDate: data.dueDate,
          desc: data.description,
          priority: data.priority,
          isDaily: data.isDaily,
          notificationId: data.notificationId,
        } as Todo);
      });
      setTodos(todoList);
      setLoading(false);
    });
    const unsubscribeTodoStatus = onSnapshot(q2, (querySnapshot) => {
      const todoList: TodoStatus[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        todoList.push({
          id: doc.id,
          todoId: data.todoId,
          userId:data.userId,
          date: data.date,

        } as TodoStatus);
      });
      setTodoStatus(todoList);
      setLoading(false);
    });
  
    return () => {unsubscribe();unsubscribeTodoStatus();};
  }, [date]);

  const addTodo = async (text:string,desc:string,selectedDate:Date,selectedTime:Date,priority:string,isDaily:boolean) => {
    if (newTaskText.trim().length === 0) return;
    setShowInput(false);
    setShowAddButton(true)
    // resetForm()
    let notificationId = null;
    if(isDaily){
      notificationId = await scheduleTaskNotificationDaily(newTaskText,desc,selectedTime)
    } else {
      notificationId = await scheduleTaskNotificationOnce(newTaskText,desc,selectedTime)
    }
    
    try {
      await addDoc(collection(db, "todo"), {
        user: user?.uid,
        text: text,
        completed: false,
        description: desc,
        createdAt: serverTimestamp(),
        dueDate: selectedDate.toISOString().split('T')[0], 
        dueTime: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: priority,
        isDaily: isDaily, 
        notificationId: notificationId,
      });
      // await addDoc(collection(db, "todo_status"), {
      //   user: user?.uid,
      //   todoId: data.id,
      //   completed: false,
      //   date: selectedDate.toISOString().split('T')[0], 
      //   createdAt: serverTimestamp(),
      //   isDaily: isDaily, 
      // }).then((docRef) => {
      //   const todoRef = doc(db, 'todo', docRef.id);
      //   updateDoc(todoRef, { todoId: docRef.id });
      // });
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert('Error', 'Failed to add todo');
    }
  };
  const deleteTodo = async (todoId: Todo) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      await Notifications.cancelScheduledNotificationAsync(todoId.notificationId!);
      await deleteDoc(doc(db, 'todo', todoId.id));
      const q = query(collection(db, 'todo_status'), where('todoId', '==', todoId.id));
      const querySnapshot = await getDocs(q);
      await deleteDoc(doc(db, 'todo_status', querySnapshot.docs[0].id));
    } catch (error) {
    }
  };
  const toggleTaskCompletion = async (todo: Todo) => {
    try {
      const todoRef = collection(db, 'todo_status');

      const q = query(
        todoRef,
        and(where('todoId','==',todo.id),
        where('date','==',date)),
      );
      const snapshot = await getDocs(q);
      if(!snapshot.empty){
        deleteDoc(doc(db, 'todo_status', snapshot.docs[0].id))
      }else{
        await addDoc(todoRef, {
          todoId: todo.id,
          date:date,
          userId:user?.uid,
         
        })
      }


    } catch (error) {
      console.error("Error updating task: ", error);
      Alert.alert('Error', 'Failed to update todo status');
    }
  };
  const totalTask = todos.length;
  console.log(totalTask,todoStatus)
  const pendingTaskCount = totalTask-todoStatus.filter(task => task).length;
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
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
      <TouchableOpacity style={styles.header}>
        <Text style={styles.greeting}>Hii {username}</Text>
        <Text style={styles.pendingCount}>{pendingTaskCount} tasks pending</Text>
        
      </TouchableOpacity>
      <TouchableOpacity style={{padding:10}} onPress={async()=>await auth.signOut()}>
      <MaterialIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
      
      </View>
 
    <View style={styles.calendarContainer}> 
  <CalendarProvider 
    date={today}
    style={styles.calendarProvider}
  >
    <WeekCalendar
      theme={{
        backgroundColor: colors.background,
        calendarBackground: colors.background,
        textSectionTitleColor: '#333333',
        selectedDayBackgroundColor: colors.primary,
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
      allowShadow={false}
      current={today}
        firstDay={1}
        onDayPress={(day) => {
          setDate(day.dateString)
        }}
      style={styles.weekCalendar}
    />
  </CalendarProvider>
</View>
{isConnected ? (
  todos && (
    <TodoList
      todos={todos}
      todoStatus={todoStatus}
      onToggleComplete={toggleTaskCompletion}
      onDeleteTodo={deleteTodo}
      getPriorityColor={getPriorityColor}
      onUpdateTodo={handleUpdateTodo}
      changeShowInputFromChild={changeShowInputFromChild}
    />
  )
) : (
  <OfflineMessage />
)}

      {showInput && (
      <AddTodo addTodo={addTodo}/>  )}

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
    backgroundColor: colors.primary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  calendarContainer: {
    height: '10%', 
  },
  calendarProvider: {
    height: '100%',
  },
  weekCalendar: {
    height: 70, 
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.negative,
    marginTop: 16,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 16,
    color: colors.secondText,
    textAlign: 'center',
    lineHeight: 24,
  },

});

export default TodoListScreen;