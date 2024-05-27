import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, StyleSheet, ImageBackground, TextInput } from 'react-native';
import { database } from '../../Firebase/FirebaseConfig';
import { ref, get } from 'firebase/database';
import { Icon } from 'react-native-elements';
import Friends from './Friends';
import Posts from './Posts';

function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [selectedButton, setSelectedButton] = useState('AllUsers');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRef = ref(database, 'Users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userList = Object.keys(userData).map(key => ({
            key: key,
            id: userData[key].id,
            username: userData[key].username,
            image: userData[key].image
          }));
          setUsers(userList);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [selectedButton]);

  const navigateToDetailScreen = (user) => {
    navigation.navigate('DetailedScreen', { user, type: 'all' });
  };

  const handleToggleEditMode = () => {
    navigation.navigate('Profile')
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToDetailScreen(item)} style={styles.itemContainer}>
      <View>
        {item.image ? (
          <ImageBackground source={{ uri: item.image }} style={styles.image}></ImageBackground>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="person" type="material" size={50} color="skyblue" />
          </View>
        )}
      </View>
      <View>
        <Text style={styles.name}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../images/background.jpg')} style={styles.backgroundImage}>
      <View style={styles.header}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>ChatPulse</Text>
          <Icon
            name='edit'
            type='material'
            color='skyblue'
            onPress={handleToggleEditMode}
            containerStyle={{ alignSelf: 'flex-end', paddingBottom: 15 }}
          />
        </View>
        <View style={styles.headerr}>
          <TouchableOpacity onPress={() => setSelectedButton('AllUsers')}>
            <View>
              <Text
                style={[
                  styles.headerText,
                  selectedButton === 'AllUsers' && styles.selectedHeaderButton,
                ]}
              >
                AllUsers
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedButton('Friends')}>
            <View>
              <Text
                style={[
                  styles.headerText,
                  selectedButton === 'Friends' && styles.selectedHeaderButton,
                ]}
              >
                Friends
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedButton('Posts')}>
            <View>
              <Text
                style={[
                  styles.headerText,
                  selectedButton === 'Posts' && styles.selectedHeaderButton,
                ]}
              >
                Posts
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {selectedButton === 'AllUsers' && (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={{marginTop:120}}
        />
      )}
      {selectedButton === 'Friends' && (<Friends />)}
      {selectedButton === 'Posts' && (<Posts />)}
      <View style={styles.container}></View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  
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

export default HomeScreen;
