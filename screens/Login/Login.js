import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Alert } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthentication = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully!');

      // Store user authentication status
      await AsyncStorage.setItem('chatXTokken', user.stsTokenManager.accessToken); // Store user data

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../images/background.jpg')} style={styles.imageBackground}>
        <BlurView intensity={50} style={StyleSheet.absoluteFill}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.glassContainer}>
              <Text style={styles.title}>ChatPulse</Text>
              <Text style={styles.title}>LogIn</Text>
              <Feather name="user" size={60} color="violet" style={styles.icon} />

              <View style={styles.inputContainer}>
                <Feather name="mail" size={24} color="violet" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={24} color="violet" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={20} color="red" style={styles.errorIcon} />
                  <Text style={styles.errorMessageText}>Email/Password incorrect</Text>
                </View>
              ) : null}
              <TouchableOpacity style={[styles.button]} onPress={handleAuthentication}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',width:'100%'}}>
                  <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={{color:'red'}}>Forget password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={{color:'green'}}>Go to Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </BlurView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    fontWeight: 'bold',
    color: 'violet',
  },
  icon: {
    margin: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'violet',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 20,
    color:'black',
    backgroundColor:'transparent',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    display:'flex',
    justifyContent:'center'
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorMessageText: {
    color: 'red',
    fontSize: 16,
  },
});

export default LoginScreen;
