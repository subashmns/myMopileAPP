import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  const addUser = async () => {
    if (!name.trim() || !email.trim() || !age.trim()) return;
    await addDoc(collection(db, "users"), { name, email, age });

    setEmail("");
    setAge("");
    setName("");
    fetchUsers();
  };

  const updateUser = async () => {
    if (!name.trim() || !email.trim() || !age.trim() || !editingUser) return;
    const userRef = doc(db, "users", editingUser);
    await updateDoc(userRef, { name, email, age });
    setEditingUser(null);
    setName("");
    setEmail("");
    setAge("");
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Management</Text>
      
      <TextInput style={styles.input} placeholder="Enter name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Enter email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Enter age" value={age} onChangeText={setAge} keyboardType="numeric" />
      
      <TouchableOpacity style={styles.button} onPress={editingUser ? updateUser : addUser}>
        <Text style={styles.buttonText}>{editingUser ? "Update User" : "Add User"}</Text>
      </TouchableOpacity>
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>📛 Name: {item.name}</Text>
            <Text style={styles.cardText}>📧 Email: {item.email}</Text>
            <Text style={styles.cardText}>🎂 Age: {item.age}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#3498db" }]}
                onPress={() => {
                  setEditingUser(item.id);
                  setName(item.name);
                  setEmail(item.email);
                  setAge(item.age);
                }}
              >
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
                onPress={() => deleteUser(item.id)}
              >
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#ecf0f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  actionText: {
    fontSize: 16,
    color: "#fff",
  },
});
