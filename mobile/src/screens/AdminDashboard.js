import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  FAB,
  Dialog,
  Portal,
  Appbar,
} from 'react-native-paper';
import { AuthContext } from '../../App';
import api from '../config/api';

export default function AdminDashboard({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    constituency: '',
    sessionName: '',
    sessionDate: '',
    speechGiven: '',
    timeTaken: '',
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load members');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      constituency: '',
      sessionName: '',
      sessionDate: '',
      speechGiven: '',
      timeTaken: '',
    });
    setEditingMember(null);
  };

  const openDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        constituency: member.constituency,
        sessionName: member.sessionName,
        sessionDate: new Date(member.sessionDate).toISOString().split('T')[0],
        speechGiven: member.speechGiven,
        timeTaken: member.timeTaken.toString(),
      });
    } else {
      resetForm();
    }
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.constituency || !formData.sessionName || 
        !formData.sessionDate || !formData.speechGiven || !formData.timeTaken) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, formData);
        Alert.alert('Success', 'Member updated successfully');
      } else {
        await api.post('/members', formData);
        Alert.alert('Success', 'Member added successfully');
      }
      closeDialog();
      loadMembers();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = (member) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/members/${member._id}`);
              Alert.alert('Success', 'Member deleted successfully');
              loadMembers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete member');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const renderMemberCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Constituency: {item.constituency}</Paragraph>
        <Paragraph>Session: {item.sessionName}</Paragraph>
        <Paragraph>Date: {new Date(item.sessionDate).toLocaleDateString()}</Paragraph>
        <View style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => openDialog(item)}
            style={styles.editButton}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Admin Dashboard" />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      <FlatList
        data={members}
        renderItem={renderMemberCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyText}>No members yet</Title>
              <Paragraph style={styles.emptyText}>Tap the + button to add a member</Paragraph>
            </Card.Content>
          </Card>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => openDialog()}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>
            {editingMember ? 'Edit Member' : 'Add New Member'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Constituency"
              value={formData.constituency}
              onChangeText={(text) => setFormData({ ...formData, constituency: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Session Name"
              value={formData.sessionName}
              onChangeText={(text) => setFormData({ ...formData, sessionName: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Session Date (YYYY-MM-DD)"
              value={formData.sessionDate}
              onChangeText={(text) => setFormData({ ...formData, sessionDate: text })}
              mode="outlined"
              style={styles.input}
              placeholder="2024-01-15"
            />
            <TextInput
              label="Speech Given"
              value={formData.speechGiven}
              onChangeText={(text) => setFormData({ ...formData, speechGiven: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <TextInput
              label="Time Taken (minutes)"
              value={formData.timeTaken}
              onChangeText={(text) => setFormData({ ...formData, timeTaken: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave} mode="contained">
              {editingMember ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 10,
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

