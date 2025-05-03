import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SignInScreen from './src/screens/auth/singIn';
const Stack = createNativeStackNavigator();
import SignUpScreen from './src/screens/auth/signUp';
import { useEffect, useState } from 'react';
import HomeScreen from './src/screens/main/home';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function App() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);
 if(loading){
  return(<Text>Loading...</Text>)
 }
  return (
    <GestureHandlerRootView>
    <NavigationContainer>

      <Stack.Navigator initialRouteName={user?'Home':'SignUp'} screenOptions={{headerShown:false,animation:'fade'}}>
        {user?
        (
          <>
        <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ):(
          <>
           <Stack.Screen name="SignUp" component={SignUpScreen} />
           <Stack.Screen name="SignIn" component={SignInScreen} />
          </>
        )
      }
     
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
