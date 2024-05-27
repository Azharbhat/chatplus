import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { database } from '../../Firebase/FirebaseConfig';
import { ref, get } from 'firebase/database';
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

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const navigation = useContext(NavigationContext);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userToken = await AsyncStorage.getItem('chatXTokken');
        const decodedToken = decodeJwtToken(userToken);
        if (!decodedToken) {
          console.warn('Invalid user token');
          return;
        }
        const currentUser = decodedToken.sub;
        const databaseRef = ref(database, 'Users');
        const snapshot = await get(databaseRef);
        if (snapshot.exists()) {
          let userKey = null;
          snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.id === currentUser) {
              userKey = childSnapshot.key; // Get the parent key (ID)
            }
          });
          if (!userKey) {
            console.warn('Current user not found in database');
            return;
          }
          const friendsRef = ref(database, `Users/${userKey}/friends`);
          const friendsSnapshot = await get(friendsRef);
          if (friendsSnapshot.exists()) {
            const friendsData = friendsSnapshot.val();
            const friendIds = Object.keys(friendsData);
            const friendsDetails = await Promise.all(friendIds.map(async (friendId) => {
              const friendDetailsRef = ref(database, `Users/${friendId}`);
              const friendDetailsSnapshot = await get(friendDetailsRef);
              if (friendDetailsSnapshot.exists()) {
                return {
                  key: friendId,
                  id: friendDetailsSnapshot.val().id,
                  username: friendDetailsSnapshot.val().username,
                  image: friendDetailsSnapshot.val().image,
                };
              }
              return null;
            }));
            setFriends(friendsDetails.filter(Boolean));
          } else {
            alert('Go to AllUsers and & add Friends');
          }
        } else {
          console.warn('No data available in the database');
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DetailedScreen', { user:item ,type:'friend' })} style={styles.itemContainer}>
      <View>
        {item.image ? (
          <ImageBackground source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View>
        <Text style={styles.name}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        style={{marginTop:100}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 15,
  
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth:1,
    borderBottomColor:'gray',
    backgroundColor: 'white'
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    overflow: 'hidden',
  },
  placeholder: {
    width: 50,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 25,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    color: 'black',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'violet',
    paddingTop: 30,
    paddingHorizontal: 15,
    position:'absolute',
    top:0,
    width:'100%'
    
  },
  headerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    padding: 10,

  },
  selectedHeaderButton: {
    borderBottomWidth: 3,
    borderBottomColor: 'skyblue',

  },
  headerr: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
