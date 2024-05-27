import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { auth, database } from '../../Firebase/FirebaseConfig';
import { ref, get, update } from 'firebase/database';
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { decode, encode } from 'base-64';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
// Initialize base-64 library
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

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



export default function Profile({navigation}) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [image, setImage] = useState(null);
  const [userKey, setUserKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('chatXTokken');
      if (userToken) {
        const decodedToken = decodeJwtToken(userToken);
        const userId = decodedToken.sub;
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
  

  const handleToggleEditMode = () => {
    setEditMode(prevMode => !prevMode);
  };

  const handleSave = async () => {
    try {
      if (user) {
        const userRef = ref(database, `Users/${userKey}`);
        await update(userRef, editedUser);
        setUser(editedUser);
        setEditMode(false);
      } else {
        console.log("No authenticated user found");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
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
      setImage(`data:image/jpeg;base64,${base64String}`);
      setEditedUser(prevState => ({
        ...prevState,
        [imageKey]: image
      }));
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleChange = (key, value) => {
    setEditedUser(prevState => ({
      ...prevState,
      [key]: value
    }));
  };
  const handleLogoutMode = async () => {
    try {
      await AsyncStorage.removeItem('chatXTokken');
      navigation.navigate('Login')
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };
  
  if (isLoading) {
    // Show animation instead of loading text
    return (
      <View style={styles.loadingContainer}>
        <Animatable.Text animation="fadeIn" style={styles.loadingText}>Loading...</Animatable.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.userContainer}>
        {user && !editMode ? (
          <>
          <View style={{display:'flex',flexDirection:'row',width:'100%',justifyContent:'space-between'}}>
          <Icon
              name='logout'
              type='material'
              color='red'
              onPress={handleLogoutMode}
              containerStyle={{ alignSelf: 'flex-start' }}
            />
            <Icon
              name='edit'
              type='material'
              color='#517fa4'
              onPress={handleToggleEditMode}
              containerStyle={{ alignSelf: 'flex-end' }}
            />
          </View>
          


            <ImageBackground source={{ uri: user.image }} style={styles.image}></ImageBackground>
            <View style={styles.userInfoContainer}>
              <Icon name='person' type='material' color='#517fa4' />
              <Text style={styles.userInfo}>Name: {user.username}</Text>
            </View>
            
          </>
        ) : (
          <>
            <Icon
              name='cancel'
              type='material'
              color='#517fa4'
              onPress={handleToggleEditMode}
              containerStyle={{ alignSelf: 'flex-end' }}
            />
            <TouchableOpacity onPress={() => { selectImage("image") }} style={styles.imageSelectIcon}>
              <Icon name='add' type='material' color='green' />
            </TouchableOpacity>

            <ImageBackground source={{ uri: editedUser?.image }} style={styles.image}></ImageBackground>

            <Icon name='person' type='material' color='#517fa4' />
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={editedUser?.username || ''}
              onChangeText={value => handleChange('username', value)}
            />
           

            <TouchableOpacity
              onPress={handleSave}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'green', borderRadius: 25, padding: 5, justifyContent: 'center' }}>
              <Text style={{ color: 'white', marginRight: 5 }}>Update</Text>
              <Icon
                name='check'
                type='material'
                color='#fff'
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop:'50%',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
