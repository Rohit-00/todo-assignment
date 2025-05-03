import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Platform, 
  BackHandler
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../utils/colors';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
type SortOption = 'default' | 'dueTime' | 'priority';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (todo: Todo) => void;
  onDeleteTodo: (todo:Todo) => void;
  getPriorityColor: (priority: string) => string;
  onUpdateTodo: (todoId: string, todo: Partial<Todo>) => void;
  changeShowInputFromChild: (show: boolean) => void;
  todoStatus: TodoStatus[];
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete, 
  onDeleteTodo,
  getPriorityColor,
  onUpdateTodo,
  changeShowInputFromChild,
  todoStatus,
}) => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [editForm, setEditForm] = useState({
    text: '',
    desc: '',
    priority: 'low' as 'low' | 'medium' | 'high',
    dueDate: new Date(),
    dueTime: new Date(),
    daily:false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortPicker, setShowSortPicker] = useState(false);

  const getSortedTodos = useCallback((todos: Todo[]) => {
    switch (sortBy) {
      case 'dueTime':
        return [...todos].sort((a, b) => {
          if (!a.dueTime) return 1;
          if (!b.dueTime) return -1;
          return a.dueTime.localeCompare(b.dueTime);
        });
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return [...todos].sort((a, b) => {
          const priorityA = a.priority || 'low';
          const priorityB = b.priority || 'low';
          return priorityOrder[priorityA] - priorityOrder[priorityB];
        });
      default:
        return todos;
    }
  }, [sortBy]);

  const SortingHeader = () => (
    <View style={styles.sortingHeader}>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowSortPicker(true)}
      >
        <Feather name="filter" size={16} color={colors.primary} />
        <Text style={styles.sortButtonText}>
          Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const pickerRef: any = useRef(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    let backPressTimeoutId: NodeJS.Timeout;
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isBottomSheetActive) {
        bottomSheetModalRef.current?.dismiss();
        setBackPressCount(1);
        
        backPressTimeoutId = setTimeout(() => {
          setBackPressCount(0);
        }, 2000);
        
        return true;
      }
  
      if (backPressCount === 1) {
        BackHandler.exitApp();
        return true;
      }
  
      setBackPressCount(1);
      backPressTimeoutId = setTimeout(() => {
        setBackPressCount(0);
      }, 2000);
      
      return true;
    });
  
    return () => {
      backHandler.remove();
      if (backPressTimeoutId) {
        clearTimeout(backPressTimeoutId);
      }
    };
  }, [backPressCount, isBottomSheetActive]);

  const handlePresentModalPress = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
    changeShowInputFromChild(false);
    setEditForm({
      text: todo.text,
      desc: todo.desc || '',
      priority: todo.priority || 'low',
      dueDate: todo.dueDate ? new Date(todo.dueDate) : new Date(),
      dueTime: todo.dueTime
        ? new Date(`2000-01-01T${todo.dueTime}`)
        : new Date(),
        daily:todo.isDaily || false,
    });
    bottomSheetModalRef.current?.present();
  }, []); 
  const handleUpdateTodo = async () => {
    if (!selectedTodo) return;
    bottomSheetModalRef.current?.dismiss();
    const formattedTime = editForm.dueTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      });

    try {
      await onUpdateTodo(selectedTodo.id, {
        text: editForm.text,
        desc: editForm.desc,
        priority: editForm.priority,
        dueDate: editForm.dueDate.toISOString().split('T')[0],
        dueTime: formattedTime, 
      });
      
    } catch (error) {
      console.error("Update failed:", error); 
      Alert.alert('Error', 'Failed to update todo');
    }
  };
 const renderTask = ({ item }: { item: Todo }) => {
  return(
    <TouchableOpacity
      style={styles.taskItem}
      onPress={()=>handlePresentModalPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.taskContent}>
         <TouchableOpacity onPress={() => onToggleComplete(item)} style={styles.checkboxContainer}>
          {todoStatus.some(todo => todo.todoId === item.id) ? (
            <View style={styles.checkboxChecked}>
               <Feather name="check" size={14} color="white" />
            </View>
          ) : (
            <View style={styles.checkbox} />
          )}
        </TouchableOpacity>
        <View style={styles.taskTextContainer}>
          <Text
            style={[
              styles.taskText,
              todoStatus.some(todo => todo.todoId === item.id) && styles.taskTextCompleted
            ]}
          >
            {item.text}
          </Text>
          {item.priority && (
            <View style={styles.priorityIndicator}>
              <Feather
                name="flag"
                size={12}
                color={getPriorityColor(item.priority)}
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority}
              </Text>
            </View>
          )}
        </View>
      </View>
       {item.dueTime && <Text style={styles.taskTime}>{item.dueTime}</Text>}
    </TouchableOpacity>
  );}


  return (
    <>
    <BottomSheetModalProvider>
        <SortingHeader />
        <FlatList
  data={getSortedTodos(todos)} 
  renderItem={renderTask}
  keyExtractor={item => item.id}
  contentContainerStyle={todos.length === 0 ? styles.emptyListContainer : styles.taskList}
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
    </View>
  )}
/>

      <BottomSheetModal
        onDismiss={() => changeShowInputFromChild(true)}
        ref={bottomSheetModalRef}

        enablePanDownToClose
        style={styles.bottomSheet}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <TextInput
          readOnly
            style={styles.input}
            value={editForm.text}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, text }))}
            placeholder="Task title"
            placeholderTextColor={colors.secondText}
          />

          <TextInput
          readOnly
            style={styles.desc}
            value={editForm.desc}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, desc: text }))}
            placeholder="Description"
            placeholderTextColor={colors.secondText}
            multiline
          />

          <View style={styles.taskDetails}>
             <TouchableOpacity
                style={styles.detailButton}
               
            >
                <Feather
                    name="flag"
                    size={14}
                    color={getPriorityColor(editForm.priority)}
                />
                <Text style={[styles.detailButtonText, { color: getPriorityColor(editForm.priority) }]}>
                    {editForm.priority.charAt(0).toUpperCase() + editForm.priority.slice(1)}
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
                <Picker
                    ref={pickerRef}
                    selectedValue={editForm.priority}
                    onValueChange={(itemValue) => setEditForm(prev => ({ ...prev, priority: itemValue }))}
                    style={{ height: 0, width: 0, opacity: 0, position: 'absolute' }} // Ensure it's completely hidden
                >
                    <Picker.Item label="Low" value="low" color={getPriorityColor('low')} />
                    <Picker.Item label="Medium" value="medium" color={getPriorityColor('medium')} />
                    <Picker.Item label="High" value="high" color={getPriorityColor('high')} />
                </Picker>
            )}

            <TouchableOpacity
              style={styles.detailButton}
          
            >
              <Feather name="calendar" size={14} color={colors.secondText} />
              <Text style={styles.detailButtonText}>
                {editForm.dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailButton}
            >
              <Feather name="clock" size={14} color={colors.secondText}/>
              <Text style={styles.detailButtonText}>
                {editForm.dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
            </TouchableOpacity>
            {editForm.daily && <TouchableOpacity
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>
               Daily
              </Text>
            </TouchableOpacity>}
            
          </View>

          <View style={styles.bottomSheetActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  'Delete Task',
                  'Are you sure you want to delete this task?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      onPress: () => {
                        if (selectedTodo) {
                          onDeleteTodo(selectedTodo);
                          bottomSheetModalRef.current?.dismiss();
                        }
                      },
                      style: 'destructive'
                    },
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={20} color="white" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>

       
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {showDatePicker && (
        <DateTimePicker
          value={editForm.dueDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (event.type !== 'dismissed' && date) {
              setEditForm(prev => ({ ...prev, dueDate: date }));
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={editForm.dueTime}
          mode="time"
          display="default"
          onChange={(event, time) => {
            setShowTimePicker(false);
             if (event.type !== 'dismissed' && time) {
              setEditForm(prev => ({ ...prev, dueTime: time }));
            }
          }}
        />
      )}
    </BottomSheetModalProvider>
    {showSortPicker && (
    <View style={styles.sortPickerContainer}>
      <View style={styles.sortPicker}>
        <TouchableOpacity 
          style={styles.sortOption}
          onPress={() => {
            setSortBy('default');
            setShowSortPicker(false);
          }}
        >
          <Text style={[styles.sortOptionText, sortBy === 'default' && styles.selectedSort]}>
            Default
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sortOption}
          onPress={() => {
            setSortBy('dueTime');
            setShowSortPicker(false);
          }}
        >
          <Text style={[styles.sortOptionText, sortBy === 'dueTime' && styles.selectedSort]}>
            Due Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sortOption}
          onPress={() => {
            setSortBy('priority');
            setShowSortPicker(false);
          }}
        >
          <Text style={[styles.sortOptionText, sortBy === 'priority' && styles.selectedSort]}>
            Priority
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortOption, styles.cancelSort]}
          onPress={() => setShowSortPicker(false)}
        >
          <Text style={styles.cancelSortText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
    </>
  );
};

const styles = StyleSheet.create({
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },
  emptyListContainer: {
    
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
    marginRight: 8,
  },
  checkboxContainer: {
    marginRight: 12,
    padding: 4, 
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary, 
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskTextContainer: {
    flex: 1, 
    flexDirection: 'column',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskTime: {
    fontSize: 12, 
    color: '#999',
    marginLeft: 'auto', 
    paddingLeft: 8, 
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },

  bottomSheet: {
    
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,

  },
  bottomSheetIndicator: {
    backgroundColor: '#DDDDDD',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
    backgroundColor: 'white',
  },
  input: {
    fontSize: 20,
    
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  desc:{
    fontSize: 14,
    paddingVertical: 10,
    minHeight: 60,
    textAlignVertical: 'top', 
    marginBottom: 15,
  },
  taskDetails:{
    flexDirection:'row',
    flexWrap: 'wrap', 
    alignItems: 'center',
    marginVertical: 10, 
    gap: 10, 
  },
  detailButton:{
    flexDirection:'row',
    alignItems:'center', 
    gap: 5, 
    backgroundColor: colors.buttonBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5, 
  },
  detailButtonText:{
    color: colors.secondText,
    fontSize: 13,
  },
  bottomSheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25, 
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10, 
    gap: 8,
  },
  deleteButton: {
    backgroundColor: colors.negative,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortingHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,

  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  sortButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sortPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sortPicker: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  sortOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedSort: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  cancelSort: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  cancelSortText: {
    color: colors.negative,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default TodoList;