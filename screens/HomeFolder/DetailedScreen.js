import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { database, auth } from '../../Firebase/FirebaseConfig';
import { ref, onValue, off, push, update, get,child} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode, encode } from 'base-64';

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

export default function DetailedScreen({ route }) {
  const { user,type } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [userr, setUserr] = useState(null);
  const [userKey, setUserKey] = useState(null);

  useEffect(() => {
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
              const parentKey = childSnapshot.key; // Get the parent key (ID)
              if (user.id === userId) {
                setUserr(user);
                setUserKey(parentKey); // Set the parent key (ID) state
              }
            });
          } else {
            console.warn('No data available in the database');
          }
        }
      } catch (error) {
        console.warn('Error checking user login:', error);
      }
    };
    
  
    reloadUserData();
  }, []);
  

  useEffect(() => {
    if (userr && user.id) {
      const sortedUserIds = [userr.id, user.id].sort();
      const roomId = sortedUserIds.join('_');
      setRoomId(roomId);
      setCurrentUser(userr.id);
    }
  }, [userr, user.id]);

  useEffect(() => {
    if (roomId) {
      const chatRoomRef = ref(database, `chatRooms/${roomId}/messages`);
      const chatRoomListener = onValue(chatRoomRef, (snapshot) => {
        const roomData = snapshot.val();
        if (roomData) {
          const messagesArray = Object.values(roomData);
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      });

      return () => {
        off(chatRoomRef, 'value', chatRoomListener);
      };
    }
  }, [roomId]);

  const sendMessage = () => {
    if (newMessage.trim() !== '' && roomId) {
      const message = {
        sender: currentUser,
        receiver: user.id,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
        seen: false // Default to false when sending a new message
      };
      push(ref(database, `chatRooms/${roomId}/messages`), message)
        .then(() => {
          console.log('Message sent successfully');
          setNewMessage('');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  };

  // Function to update message seen status
  const updateMessageSeenStatus = (messageId) => {
    update(ref(database, `chatRooms/${roomId}/messages/${messageId}`), { seen: true })
      .then(() => console.log('Message seen status updated'))
      .catch((error) => console.error('Error updating message seen status:', error));
  };

  const addFriend = async () => {
    console.log(userKey)
    try {
      if (!currentUser || !user.id) {
        console.error('Current user or user ID is not available');
        return;
      }
  
      // Check if the current user is already a friend of the displayed user
      const friendListRef = ref(database, `Users/${userKey}/friends`);
      const friendListSnapshot = await get(friendListRef);
      if (friendListSnapshot.exists()) {
        const friendList = friendListSnapshot.val();
        if (friendList && friendList[user.id]) {
          alert('Already friends');
          return;
        }
      }
  
      // Add current user to the friend list of the displayed user
      const updates = {};
      updates[`Users/${userKey}/friends/${user.key}`] = true;
  
      await update(ref(database), updates);
      alert('Added to friend list');
    } catch (error) {
      console.error('Error adding to friend list:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.heading}>{user.username}</Text>
        <Pressable onPress={addFriend} style={({ pressed }) => [styles.addButton, pressed && { backgroundColor: '#DCF8C6' }, { display: type === "friend" ? 'none' : 'flex' }]}>
        <Text style={styles.buttonText}>Add Friend</Text>
        </Pressable>
      </View>
      <View style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Pressable
            key={index}
            style={[
              styles.message,
              {
                alignSelf: message.sender === currentUser ? 'flex-end' : 'flex-start',
                backgroundColor: message.sender === currentUser ? 'skyblue' : '#f0f0f0',
              },
            ]}
            onPress={() => {
              // Update seen status only for received messages
              if (message.sender !== currentUser && !message.seen) {
                updateMessageSeenStatus(message.id);
              }
            }}
          >
            <Text style={{ color: message.sender === currentUser ? '#000' : '#444' }}>{message.text}</Text>
            <Text style={{ color: '#777', fontSize: 10, marginTop: 5 }}>
              {new Date(message.timestamp).toLocaleString()}
              {message.sender !== currentUser && message.seen ? ' \u2714\u2714' : message.sender !== currentUser ? ' \u2714' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <Pressable onPress={sendMessage} style={({ pressed }) => [styles.button, pressed && { backgroundColor: '#DCF8C6' }]}>
          <Text style={styles.buttonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop:10
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    padding: 10,
    backgroundColor: '#DCF8C6',
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#DCF8C6',
    borderRadius: 5,
  },
});