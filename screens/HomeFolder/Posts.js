import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { database } from '../../Firebase/FirebaseConfig';
import { ref, onValue, update,get, push } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode, encode } from 'base-64';

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

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
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

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        const reversedPosts = postsArray.reverse(); // Reverse the order of posts
        setPosts(reversedPosts);
      } else {
        setPosts([]);
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, []);
  

  const formatTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp);
    const timeString = dateObj.toLocaleTimeString(); // Get time string
    const dateString = dateObj.toLocaleDateString(); // Get date string
    return `${timeString} - ${dateString}`; // Concatenate time and date
  };

  const handleLike = (postId) => {
    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex !== -1) {
      const updatedPosts = [...posts];
      const currentUserLiked = updatedPosts[postIndex].likes?.includes(user.id) || updatedPosts[postIndex].dislikes?.includes(user.id); // Check if the current user already liked
      if (!currentUserLiked) {
        if (!updatedPosts[postIndex].likes) {
          updatedPosts[postIndex].likes = []; // Initialize likes array if it doesn't exist
        }
        updatedPosts[postIndex].likes.push(user.id); // Add current user to likes array
        setPosts(updatedPosts);
        update(ref(database, `posts/${postId}`), {
          likes: updatedPosts[postIndex].likes,
        });
      }
    }
  };
  
  const handleDislike = (postId) => {
    const postIndex = posts.findIndex((post) => post.id === postId);
    if (postIndex !== -1) {
      const updatedPosts = [...posts];
      const currentUserDisliked = updatedPosts[postIndex].likes?.includes(user.id) ||updatedPosts[postIndex].dislikes?.includes(user.id); // Check if the current user already disliked
      if (!currentUserDisliked) {
        if (!updatedPosts[postIndex].dislikes) {
          updatedPosts[postIndex].dislikes = []; // Initialize dislikes array if it doesn't exist
        }
        updatedPosts[postIndex].dislikes.push(user.id); // Add current user to dislikes array
        setPosts(updatedPosts);
        update(ref(database, `posts/${postId}`), {
          dislikes: updatedPosts[postIndex].dislikes,
        });
      }
    }
  };
  
  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainerr}
        onPress={() => navigation.navigate('UploadPost')}
      >
        <Text style={styles.icon}>+</Text>
      </TouchableOpacity>
      <FlatList
        contentContainerStyle={styles.flatListContainer}
        data={posts}
        renderItem={({ item }) => (
          <View
            style={styles.postContainer}
            onPress={() => {
              /* Handle post press */
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.title}>{item.user}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>

            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => handleLike(item.id)}>
                <Icon name="thumbs-o-up" size={30} color="green" />
                <Text>{item.likes ? item.likes.length : 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDislike(item.id)}>
                <Icon name="thumbs-o-down" size={30} color="red" />
                <Text>{item.dislikes ? item.dislikes.length : 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        style={{ marginTop: 120 }}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    height: '110%',
    padding: 10,
  },
  postContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'skyblue',
  },
  content: {
    fontSize: 16,
    color: 'black',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    color: 'white',
  },
  image: {
    width: '100%',
    height: 400, // Adjust height as needed
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  flatListContainer: {
    flexGrow: 1,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconContainerr:{
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'skyblue',
    paddingVertical: 15,
    paddingHorizontal:20,
    borderRadius: 75,
    zIndex:1
  }
});
