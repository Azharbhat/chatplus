import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity,Image, StyleSheet, ScrollView, ImageBackground, Text, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { auth, database } from '../../Firebase/FirebaseConfig';
import { ref, push } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { BackgroundImage } from 'react-native-elements/dist/config';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState(''); // New state for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);

  const handleRegistration = async () => {
    try {
      // Validation
      if (!username || !email || !password) {
        Alert.alert('Validation Error', 'Please fill in all the fields.');
        return;
      }
  
      // Validate email format
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address.');
        return;
      }
  
      // Validate username to contain only letters
      const usernameRegex = /^[a-zA-Z]+$/;
      if (!usernameRegex.test(username)) {
        Alert.alert('Validation Error', 'Username should contain only letters.');
        return;
      }
  
      // Sign up
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully!')
  
      // Store user data in AsyncStorage
      const userData = {
        id: user.uid,
        username,
        email,
        password,
        image: image ? image : '',
      };
  
      await AsyncStorage.setItem('chatXTokken', user.stsTokenManager.accessToken); // Store user data
  
      const userRef = ref(database, 'Users');
      push(userRef, userData);
      // Display success message
      alert('Success', 'User registered successfully!');
    } catch (error) {
      console.error('Registration error:', error.message);
      alert('Error', error.message);
    }
  };
  

  const selectImage = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        console.log('Permission to access camera roll is required!');
        return;
      }
  
      let pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (pickerResult.cancelled === true) {
        console.log('Image selection cancelled');
        return;
      }
  
      // Get the file URI
      const fileUri = pickerResult.assets[0].uri;
  
      // Read the file contents as a base64 string
      const base64String = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
  
      // Set the base64 string as the image data
      setImage(`data:image/jpeg;base64,${base64String}`);
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../images/background.jpg')} style={styles.imageBackground}>
        <View style={[styles.formContainer, styles.glassContainer]}>
          {/* Username TextInput */}
          <Text style={styles.title}>ChatPulse</Text>
          <Text style={styles.title}>Register</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
          />
          {/* Email TextInput */}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
          />
          {/* Password TextInput */}
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          {/* Image Picker Button */}
          <TouchableOpacity style={styles.imagePickerButton} onPress={selectImage}>
            <Ionicons name="image" size={24} color="black" />
            <Text style={styles.imagePickerText}>Select profile</Text>
          </TouchableOpacity>
          {image && (
            <Text>Image selected</Text>
          )}
  
          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{}} onPress={()=>{navigation.navigate('Login')}}>
            <Text style={{color:'green'}}>Login</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  glassContainer: {
    width:392,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  imagePickerText: {
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    fontWeight: 'bold',
    color: 'violet',
  },
});

export default RegisterScreen;
