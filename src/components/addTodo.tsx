import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../utils/colors';
import { getPriorityColor } from '../../utils/helpers';

interface AddtodoProps {
    addTodo: (text:string,desc:string,selectedDate:Date,selectedTime:Date,priority:string,isDaily:boolean) => void;
}
const AddTodo:React.FC<AddtodoProps> = ({addTodo}) => {
const [form, setForm] = useState<FormState>({
        text: '',
        desc: '',
        date: new Date(),
        time: new Date(),
        priority: 'low',
        isDaily: false
      });
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);


const pickerRef:any = useRef(null);


const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setForm(prev => ({ ...prev, date }));
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setForm(prev => ({ ...prev, time }));
    }
  };


const openPriorityPicker = () => {
    pickerRef.current?.focus();
  };
console.log()
  return (
    <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      value={form.text}
      onChangeText={(text) => setForm(prev => ({ ...prev, text }))}
      placeholder="Do some work..."
      autoFocus={true}
      onSubmitEditing={()=>addTodo(form.text,form.desc,form.date,form.time,form.priority,form.isDaily)}
    />
    <TextInput
      style={styles.desc}
      value={form.desc}
      onChangeText={(desc) => setForm(prev => ({ ...prev, desc }))}
      placeholder="Description"
      onSubmitEditing={()=>addTodo(form.text,form.desc,form.date,form.time,form.priority,form.isDaily)}
    />
    <View style={styles.taskDetails}>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={openPriorityPicker}
      >
        <Feather
          name="flag"
          size={14}
          color={getPriorityColor(form.priority)}
        />
        <Text style={[
          styles.detailButtonText,
          { color: getPriorityColor(form.priority) }
        ]}>
          {form.priority.charAt(0).toUpperCase() + form.priority.slice(1)}
        </Text>
        <Picker
          ref={pickerRef}
          selectedValue={form.priority}
          onValueChange={(priority) => setForm(prev => ({ ...prev, priority }))}
          style={{ height: 0, width: 0, opacity: 0 }}
        >
          <Picker.Item label="Low Priority" value="low" color={getPriorityColor('low')} />
          <Picker.Item label="Medium Priority" value="medium" color={getPriorityColor('medium')} />
          <Picker.Item label="High Priority" value="high" color={getPriorityColor('high')} />
        </Picker>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Feather name="calendar" size={14} color={colors.secondText} />
        <Text style={styles.detailButtonText}>
          {form.date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Feather name="clock" size={14} color={colors.secondText} />
        <Text style={styles.detailButtonText}>
          {form.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={form.isDaily ? styles.dailyButton : styles.detailButton}
        onPress={() => setForm(prev => ({ ...prev, isDaily: !prev.isDaily }))}
      >
        <Text style={form.isDaily ? styles.dailyButtonText : styles.checkboxLabel}>
          Daily
        </Text>
      </TouchableOpacity>
    </View>

    {showDatePicker && (
      <DateTimePicker
        value={form.date}
        mode="date"
        display="default"
        onChange={handleDateChange}
        minimumDate={new Date()}
      />
    )}

    {showTimePicker && (
      <DateTimePicker
        value={form.time}
        mode="time"
        display="default"
        onChange={handleTimeChange}
      />
    )}

    <TouchableOpacity
      style={styles.addTaskButton}
      onPress={()=>addTodo(form.text,form.desc,form.date,form.time,form.priority,form.isDaily)}
    >
      <Text style={styles.addTaskButtonText}>Add</Text>
    </TouchableOpacity>
  </View>
  )
}

export default AddTodo

const styles = StyleSheet.create({
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
})