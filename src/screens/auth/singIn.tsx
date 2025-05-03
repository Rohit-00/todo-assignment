import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import app from '../../../utils/firebase';
import { colors } from '../../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../../utils/firebase';
const SignInScreen = ({ navigation }:any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const provider = new GoogleAuthProvider();

  const signInWithEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user.uid);
    } catch (error:any) {
      Alert.alert('Error', error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user.uid);
    } catch (error:any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar style="auto" />
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidView}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>

        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        

        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={signInWithEmail}
          activeOpacity={0.8}
        >
          <Text style={styles.signUpButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signInLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </KeyboardAvoidingView> 
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      keyboardAvoidView: {
        flex: 1,
      },
      formContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingBottom: 40,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
      },
      input: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        fontSize: 16,
        borderWidth:1,
        borderColor:colors.border
      },
      signUpButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
      },
      signUpButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
      },
      signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
      },
      signInText: {
        color: '#666',
      },
      signInLink: {
        color: '#00c853',
        fontWeight: '600',
      },
      dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
      },
      divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
      },
      dividerText: {
        paddingHorizontal: 10,
        color: '#666',
      },
      googleButton: {
        flexDirection: 'row',
        backgroundColor: colors.secondBackground,
        borderRadius: 15,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
      },
      googleLogo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
      },
      googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
      },
    });

export default SignInScreen;