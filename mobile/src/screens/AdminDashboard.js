import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, Platform } from 'react-native';
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
  Avatar,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../App';
import api from '../config/api';

export default function AdminDashboard({ navigation, route }) {
  const { logout, isAuthenticated } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Check authentication on mount and redirect if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('adminToken');
      if (!token || !isAuthenticated) {
        navigation.replace('Login');
      }
    };
    checkAuth();
  }, [isAuthenticated, navigation]);
  
  const [formData, setFormData] = useState({
    name: '',
    constituency: '',
    sessionName: '',
    sessionDate: '',
    speechGiven: '',
    timeTaken: '',
    partyName: '',
    partyLogo: '',
    partyLogoUri: '',
    image: null,
    imageUri: '',
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

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
      partyName: '',
      partyLogo: '',
      partyLogoUri: '',
      image: null,
      imageUri: '',
    });
    setValidationErrors({});
    setEditingMember(null);
  };

  const pickImage = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'image') {
          setFormData({
            ...formData,
            image: result.assets[0],
            imageUri: result.assets[0].uri,
          });
        } else if (type === 'logo') {
          setFormData({
            ...formData,
            partyLogo: result.assets[0].uri,
            partyLogoUri: result.assets[0].uri,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
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
        partyName: member.partyName || '',
        partyLogo: member.partyLogoUrl || '',
        partyLogoUri: member.partyLogoUrl 
          ? (member.partyLogoUrl.startsWith('http') ? member.partyLogoUrl : `http://127.0.0.1:5000${member.partyLogoUrl}`)
          : '',
        image: null,
        imageUri: member.imageUrl 
          ? (member.imageUrl.startsWith('http') ? member.imageUrl : `http://127.0.0.1:5000${member.imageUrl}`)
          : '',
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

  // Validation functions
  const validateName = (text) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    return /^[A-Za-z\s\-']+$/.test(text);
  };

  const validateDate = (text) => {
    // Only allow numbers and date separators (YYYY-MM-DD format)
    return /^[0-9\-]+$/.test(text) && text.length <= 10;
  };

  const validateTime = (text) => {
    // Only allow numbers
    return /^[0-9]+$/.test(text);
  };

  const validateInput = (field, value) => {
    const errors = { ...validationErrors };
    
    if (field === 'name' || field === 'constituency' || field === 'sessionName' || field === 'partyName') {
      if (value && !validateName(value)) {
        errors[field] = 'Only letters, spaces, hyphens, and apostrophes are allowed';
      } else {
        delete errors[field];
      }
    } else if (field === 'sessionDate') {
      if (value && !validateDate(value)) {
        errors[field] = 'Invalid date format. Use YYYY-MM-DD (numbers and hyphens only)';
      } else {
        delete errors[field];
      }
    } else if (field === 'timeTaken') {
      if (value && !validateTime(value)) {
        errors[field] = 'Only numbers are allowed';
      } else {
        delete errors[field];
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate all fields
    const nameFields = ['name', 'constituency', 'sessionName', 'partyName'];
    const hasNameErrors = nameFields.some(field => 
      formData[field] && !validateName(formData[field])
    );
    
    if (formData.sessionDate && !validateDate(formData.sessionDate)) {
      validateInput('sessionDate', formData.sessionDate);
      Alert.alert('Validation Error', 'Please fix the validation errors');
      return;
    }
    
    if (formData.timeTaken && !validateTime(formData.timeTaken)) {
      validateInput('timeTaken', formData.timeTaken);
      Alert.alert('Validation Error', 'Please fix the validation errors');
      return;
    }
    
    if (hasNameErrors) {
      Alert.alert('Validation Error', 'Name fields can only contain letters, spaces, hyphens, and apostrophes');
      return;
    }

    if (!formData.name || !formData.constituency || !formData.sessionName || 
        !formData.sessionDate || !formData.speechGiven || !formData.timeTaken) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('constituency', formData.constituency);
      submitData.append('sessionName', formData.sessionName);
      submitData.append('sessionDate', formData.sessionDate);
      submitData.append('speechGiven', formData.speechGiven);
      submitData.append('timeTaken', formData.timeTaken);
      submitData.append('partyName', formData.partyName || '');
      
      // Handle image upload - works for both mobile and web
      if (formData.imageUri) {
        if (Platform.OS === 'web') {
          // For web, if it's a local blob URL, fetch and convert to File
          try {
            if (formData.imageUri.startsWith('blob:') || formData.imageUri.startsWith('http://localhost') || formData.imageUri.startsWith('file://')) {
              const response = await fetch(formData.imageUri);
              const blob = await response.blob();
              const file = new File([blob], 'member-image.jpg', { type: blob.type || 'image/jpeg' });
              submitData.append('image', file);
            } else {
              // If it's already a File object or external URL
              submitData.append('image', formData.imageUri);
            }
          } catch (error) {
            console.error('Error processing image for web:', error);
            // Fallback: try to append as-is
            submitData.append('image', formData.imageUri);
          }
        } else {
          // For mobile, use the standard React Native FormData format
          submitData.append('image', {
            uri: formData.imageUri,
            type: 'image/jpeg',
            name: 'member-image.jpg',
          });
        }
      }
      
      // Handle party logo upload
      if (formData.partyLogoUri) {
        if (Platform.OS === 'web') {
          // For web, if it's a local blob URL, fetch and convert to File
          try {
            if (formData.partyLogoUri.startsWith('blob:') || formData.partyLogoUri.startsWith('http://localhost') || formData.partyLogoUri.startsWith('file://')) {
              const response = await fetch(formData.partyLogoUri);
              const blob = await response.blob();
              const file = new File([blob], 'party-logo.png', { type: blob.type || 'image/png' });
              submitData.append('partyLogo', file);
            } else {
              // If it's already a File object or external URL
              submitData.append('partyLogo', formData.partyLogoUri);
            }
          } catch (error) {
            console.error('Error processing logo for web:', error);
            // Fallback: try to append as-is
            submitData.append('partyLogo', formData.partyLogoUri);
          }
        } else {
          // For mobile, use the standard React Native FormData format
          submitData.append('partyLogo', {
            uri: formData.partyLogoUri,
            type: 'image/png',
            name: 'party-logo.png',
          });
        }
      }

      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, submitData);
        Alert.alert('Success', 'Member updated successfully');
      } else {
        await api.post('/members', submitData);
        Alert.alert('Success', 'Member added successfully');
      }
      closeDialog();
      loadMembers();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (member) => {
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
              const response = await api.delete(`/members/${member._id}`);
              Alert.alert('Success', 'Member deleted successfully');
              await loadMembers();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(
                'Error', 
                error.response?.data?.message || error.message || 'Failed to delete member. Please try again.'
              );
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
        <Appbar.Action 
          icon="arrow-left" 
          onPress={() => {
            navigation.navigate('Home');
          }} 
        />
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
              label="Name *"
              value={formData.name}
              onChangeText={(text) => {
                // Filter out invalid characters in real-time
                const filtered = text.replace(/[^A-Za-z\s\-']/g, '');
                setFormData({ ...formData, name: filtered });
                validateInput('name', filtered);
              }}
              mode="outlined"
              style={styles.input}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
            <TextInput
              label="Constituency *"
              value={formData.constituency}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z\s\-']/g, '');
                setFormData({ ...formData, constituency: filtered });
                validateInput('constituency', filtered);
              }}
              mode="outlined"
              style={styles.input}
              error={!!validationErrors.constituency}
              helperText={validationErrors.constituency}
            />
            <TextInput
              label="Session Name *"
              value={formData.sessionName}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z\s\-']/g, '');
                setFormData({ ...formData, sessionName: filtered });
                validateInput('sessionName', filtered);
              }}
              mode="outlined"
              style={styles.input}
              error={!!validationErrors.sessionName}
              helperText={validationErrors.sessionName}
            />
            <TextInput
              label="Session Date (YYYY-MM-DD) *"
              value={formData.sessionDate}
              onChangeText={(text) => {
                // Only allow numbers and hyphens
                const filtered = text.replace(/[^0-9\-]/g, '');
                // Limit to 10 characters (YYYY-MM-DD)
                const limited = filtered.length > 10 ? filtered.slice(0, 10) : filtered;
                setFormData({ ...formData, sessionDate: limited });
                validateInput('sessionDate', limited);
              }}
              mode="outlined"
              style={styles.input}
              placeholder="2024-01-15"
              error={!!validationErrors.sessionDate}
              helperText={validationErrors.sessionDate || 'Format: YYYY-MM-DD'}
            />
            <TextInput
              label="Speech Given *"
              value={formData.speechGiven}
              onChangeText={(text) => setFormData({ ...formData, speechGiven: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <TextInput
              label="Time Taken (minutes) *"
              value={formData.timeTaken}
              onChangeText={(text) => {
                // Only allow numbers
                const filtered = text.replace(/[^0-9]/g, '');
                setFormData({ ...formData, timeTaken: filtered });
                validateInput('timeTaken', filtered);
              }}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!validationErrors.timeTaken}
              helperText={validationErrors.timeTaken || 'Only numbers are allowed'}
            />
            <TextInput
              label="Party Name"
              value={formData.partyName}
              onChangeText={(text) => {
                const filtered = text.replace(/[^A-Za-z\s\-']/g, '');
                setFormData({ ...formData, partyName: filtered });
                validateInput('partyName', filtered);
              }}
              mode="outlined"
              style={styles.input}
              error={!!validationErrors.partyName}
              helperText={validationErrors.partyName}
            />
            <View style={styles.imageSection}>
              <Title style={styles.sectionTitle}>Member Photo</Title>
              {formData.imageUri ? (
                <View style={styles.imagePreview}>
                  <Avatar.Image size={100} source={{ uri: formData.imageUri }} />
                  <Button onPress={() => pickImage('image')} mode="outlined" style={styles.imageButton}>
                    Change Photo
                  </Button>
                </View>
              ) : (
                <Button onPress={() => pickImage('image')} mode="outlined" icon="camera" style={styles.imageButton}>
                  Upload Photo
                </Button>
              )}
            </View>
            <View style={styles.imageSection}>
              <Title style={styles.sectionTitle}>Party Logo</Title>
              {formData.partyLogoUri || formData.partyLogo ? (
                <View style={styles.imagePreview}>
                  <Avatar.Image size={60} source={{ uri: formData.partyLogoUri || formData.partyLogo }} />
                  <Button onPress={() => pickImage('logo')} mode="outlined" style={styles.imageButton}>
                    Change Logo
                  </Button>
                </View>
              ) : (
                <Button onPress={() => pickImage('logo')} mode="outlined" icon="image" style={styles.imageButton}>
                  Upload Party Logo
                </Button>
              )}
            </View>
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
  imageSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  imagePreview: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imageButton: {
    marginTop: 10,
  },
});

