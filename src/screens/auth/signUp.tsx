import React, { useEffect, useState } from 'react';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, updateProfile  } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../../utils/colors';
import { auth } from '../../../utils/firebase';
import * as Google from 'expo-auth-session/providers/google';
const SignUpScreen = ({ navigation }:any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSignUp = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      await updateProfile(userCredential.user, {
        displayName: username
      });
  
    } catch (error: any) {
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
        <Text style={styles.title}>Sign Up</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        
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
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Sign In</Text>
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

export default SignUpScreen;