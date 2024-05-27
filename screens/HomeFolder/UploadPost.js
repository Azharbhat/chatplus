import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,Image } from 'react-native'; // Import ActivityIndicator
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { database } from '../../Firebase/FirebaseConfig';
import { ref, push, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';
import { NavigationContext } from '@react-navigation/native';

const decodeJwtToken = (token) => {
  try {
    if (!token) {
      console.error('Token is null or empty');
      return null;
    }
    const payload = token.split('.')[1];
    const decodedPayload = decodeURIComponent(atob(payload));
    const decodedToken = JSON.parse(decodedPayload);
    if (!decodedToken || !decodedToken.sub) {
      console.error('Decoded token is null or missing "sub" property');
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export default function UploadPost({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [userKey, setUserKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('chatXTokken');
      if (userToken) {
        const decodedToken = decodeJwtToken(userToken);
        const userId = decodedToken.sub;
        console.log(userId)
        const databaseRef = ref(database, 'Users');
        const snapshot = await get(databaseRef);
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.id === userId) {
              setUser(user);
              setEditedUser(user);
              setUserKey(childSnapshot.key); // Set the key of the user
            }
          });
        } else {
          console.warn('No data available in the database');
        }
      }
    } catch (error) {
      console.warn('Error checking user login:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    reloadUserData();
  }, []);

  const handleUpload = async () => {
    try {
      // Check if title and content are not empty
      if (!title.trim() || !content.trim()) {
        Alert.alert('Error', 'Title and content are required.');
        return;
      }

      // Upload post data to the database
      const postData = {
        user:user.username,
        title: title.trim(),
        content: content.trim(),
        image: imageUri || '', // If image is not selected, set it to an empty string
        timestamp: new Date().toISOString(), // Add timestamp
      };
      const postRef = ref(database, 'posts');
      await push(postRef, postData);

      // Navigate back to Posts screen after uploading
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload post. Please try again later.');
    }
  };

  const selectImage = async (imageKey) => {
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

      const fileUri = pickerResult.assets[0].uri;
      const base64String = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      setImageUri(`data:image/jpeg;base64,${base64String}`);
      setEditedUser(prevState => ({
        ...prevState,
        [imageKey]: `data:image/jpeg;base64,${base64String}`
      }));
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload Post</Text>
      <Text style={styles.heading}>{user.username}</Text>
      {/* Input fields for title and content */}
      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter content"
        value={content}
        onChangeText={setContent}
        multiline
      />
      {/* Button to select image */}
      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      {/* Display selected image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {/* Button to upload post */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Background color
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black', // Heading color
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // Border color
    borderRadius: 5,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 150, // Adjust as needed
    textAlignVertical: 'top', // Start text from top
  },
  imageButton: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 5,
    marginBottom: 20,
  },
});

