import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Linking, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../firebaseConfig'; // Firebase config
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Store API key in env

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 8.69917,
    longitude: 77.71453,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCurrentLocation({ latitude, longitude });
    fetchAddress(latitude, longitude);
    setMapRegion({ latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      setAddress(data.results?.[0]?.formatted_address || 'No address found');
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Error fetching address');
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !age || !currentLocation) return;
    try {
      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser), { name, email, age, location: currentLocation, address });
        setEditingUser(null);
      } else {
        await addDoc(collection(db, 'users'), { name, email, age, location: currentLocation, address });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setAge('');
    setCurrentLocation(null);
    setAddress('');
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>📛 Name: {item.name}</Text>
      <Text style={styles.cardText}>📧 Email: {item.email}</Text>
      <Text style={styles.cardText}>🎂 Age: {item.age}</Text>
      <Text style={styles.cardText}>📍 Location: {item.address}</Text>
      {item.location && (
        <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`)}>
          <Text style={{ color: 'blue' }}>🔗 View on Map</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.header}>Profile Management</Text>
        <TextInput style={styles.input} placeholder="Enter name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Enter email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Enter age" value={age} onChangeText={setAge} keyboardType="numeric" />

        <Text style={styles.addressText}>Address: {address || 'No address selected'}</Text>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={mapRegion} onPress={handleMapPress}>
            {currentLocation && <Marker coordinate={currentLocation} title="Selected Location" />}
          </MapView>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{editingUser ? 'Update User' : 'Add User'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollViewContainer: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: "#fff" },
  button: { backgroundColor: "#27ae60", padding: 12, borderRadius: 5, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  mapContainer: { marginBottom: 20 },
  map: { width: "100%", height: 300 },
  addressText: { fontSize: 16, marginBottom: 10 },
  card: { backgroundColor: "#ecf0f1", padding: 15, borderRadius: 8, marginBottom: 10 },
  cardText: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
});
