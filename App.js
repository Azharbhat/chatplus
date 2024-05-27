import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './Firebase/FirebaseConfig';
import HomeScreen from "./screens/HomeFolder/HomeScreen";
import Profile from './screens/profile/Profile';
import Login from './screens/Login/Login';
import Register from './screens/Login/Register';
import DetailedScreen from './screens/HomeFolder/DetailedScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UploadPost from './screens/HomeFolder/UploadPost';
import Friends from './screens/HomeFolder/Friends';
import Posts from './screens/HomeFolder/Posts';

const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
    <Stack.Screen name="DetailedScreen" component={DetailedScreen} options={{ headerShown: false }} />
    <Stack.Screen name="UploadPost" component={UploadPost} options={{ headerShown: false }} />
    <Stack.Screen name="Friends" options={{ headerShown: false }}>
      {(props) => <Friends {...props} />}
    </Stack.Screen>
    <Stack.Screen name="Posts" options={{ headerShown: false }}>
      {(props) => <Posts {...props} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const userLoggedIn = await AsyncStorage.getItem('chatXTokken');
        setIsLoggedIn(!!userLoggedIn); // Convert stored value to boolean
      } catch (error) {
        console.error('Error checking user authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="skyblue" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack.Navigator>
          {isLoggedIn ? (
            <Stack.Screen name="HomeStack" component={HomeStack} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="AuthStack" component={AuthStack} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
};

export default App;
