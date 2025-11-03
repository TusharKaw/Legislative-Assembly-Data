import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, Platform, Image } from 'react-native';
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
  Menu,
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

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
    partyLogoUri: '',
    image: null,
    imageUri: '',
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [partyMenuVisible, setPartyMenuVisible] = useState(false);
  
  // Party options with their logo paths
  const getPartyLogoSource = (partyName) => {
    if (!partyName) return null;
    
    try {
      if (partyName === 'BJP') {
        return require('../../assets/bjp.webp');
      } else if (partyName === 'AAP') {
        return require('../../assets/aap.jpg');
      }
    } catch (error) {
      console.error('Error loading party logo:', error);
    }
    
    return null;
  };
  
  const getPartyLogoUri = (partyName) => {
    if (!partyName) return '';
    
    const logoSource = getPartyLogoSource(partyName);
    if (logoSource) {
      if (Platform.OS === 'web') {
        // For web, try to resolve the asset source
        try {
          const resolved = Image.resolveAssetSource(logoSource);
          return resolved?.uri || '';
        } catch (error) {
          // Fallback to public folder path
          return `/assets/${partyName === 'BJP' ? 'bjp.webp' : 'aap.jpg'}`;
        }
      } else {
        // For mobile, use require with proper asset resolution
        return Image.resolveAssetSource(logoSource).uri;
      }
    }
    return '';
  };
  
  const partyOptions = [
    { name: 'BJP' },
    { name: 'AAP' },
  ];
  
  // Handle party selection
  const handlePartySelect = (partyName) => {
    const logoUri = getPartyLogoUri(partyName);
    setFormData({
      ...formData,
      partyName,
      partyLogoUri: logoUri,
    });
    setPartyMenuVisible(false);
  };

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
        partyLogoUri: member.partyLogoUrl 
          ? (member.partyLogoUrl.startsWith('http') ? member.partyLogoUrl : `http://127.0.0.1:5000${member.partyLogoUrl}`)
          : (member.partyName ? getPartyLogoUri(member.partyName) : ''),
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
      
      // Handle party logo - upload asset file to backend
      if (formData.partyName) {
        try {
          if (Platform.OS === 'web') {
            // For web, fetch from assets folder
            const logoPath = `/assets/${formData.partyName === 'BJP' ? 'bjp.webp' : 'aap.jpg'}`;
            const response = await fetch(logoPath);
            if (response.ok) {
              const blob = await response.blob();
              const file = new File([blob], `${formData.partyName.toLowerCase()}.${formData.partyName === 'BJP' ? 'webp' : 'jpg'}`, { 
                type: blob.type || (formData.partyName === 'BJP' ? 'image/webp' : 'image/jpeg') 
              });
              submitData.append('partyLogo', file);
            } else {
              console.warn('Could not fetch logo from:', logoPath);
            }
          } else {
            // For mobile, upload from assets
            const logoAsset = formData.partyName === 'BJP' 
              ? require('../../assets/bjp.webp')
              : require('../../assets/aap.jpg');
            
            const logoPath = Image.resolveAssetSource(logoAsset).uri;
            const filename = formData.partyName === 'BJP' ? 'bjp.webp' : 'aap.jpg';
            
            submitData.append('partyLogo', {
              uri: logoPath,
              type: formData.partyName === 'BJP' ? 'image/webp' : 'image/jpeg',
              name: filename,
            });
          }
        } catch (error) {
          console.error('Error processing party logo:', error);
          // Continue without logo if there's an error
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

  const handleDelete = (member) => {
    console.log('handleDelete called with member:', member);
    
    if (!member) {
      console.error('No member provided');
      Alert.alert('Error', 'Invalid member data');
      return;
    }
    
    if (!member._id) {
      console.error('Member missing _id:', member);
      Alert.alert('Error', 'Member ID is missing');
      return;
    }
    
    console.log('Setting member to delete:', member.name, 'ID:', member._id);
    setMemberToDelete(member);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete || !memberToDelete._id) {
      Alert.alert('Error', 'Invalid member data');
      setDeleteDialogVisible(false);
      setMemberToDelete(null);
      return;
    }

    console.log('Delete confirmed. Attempting to delete member:', memberToDelete._id);
    try {
      const response = await api.delete(`/members/${memberToDelete._id}`);
      console.log('Delete response:', response.data);
      Alert.alert('Success', 'Member deleted successfully');
      setDeleteDialogVisible(false);
      setMemberToDelete(null);
      await loadMembers();
    } catch (error) {
      console.error('Delete error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        memberId: memberToDelete._id,
        url: `/members/${memberToDelete._id}`
      });
      Alert.alert(
        'Error', 
        error.response?.data?.message || error.message || `Failed to delete member: ${memberToDelete.name}`
      );
      setDeleteDialogVisible(false);
      setMemberToDelete(null);
    }
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
            onPress={() => {
              console.log('Delete button clicked for:', item);
              handleDelete(item);
            }}
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
            <View style={styles.input}>
              <Menu
                visible={partyMenuVisible}
                onDismiss={() => setPartyMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setPartyMenuVisible(true)}
                    style={styles.partyButton}
                    icon="chevron-down"
                    contentStyle={styles.partyButtonContent}
                  >
                    {formData.partyName || 'Select Party'}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => {
                    handlePartySelect('');
                    setPartyMenuVisible(false);
                  }}
                  title="No Party"
                  leadingIcon="close"
                />
                {partyOptions.map((party) => (
                  <Menu.Item
                    key={party.name}
                    onPress={() => handlePartySelect(party.name)}
                    title={party.name}
                    leadingIcon="flag"
                  />
                ))}
              </Menu>
              {formData.partyName && (
                <View style={styles.partyLogoPreview}>
                  {(() => {
                    const logoSource = getPartyLogoSource(formData.partyName);
                    if (logoSource) {
                      if (Platform.OS === 'web') {
                        // For web, use Image component with require
                        return <Image source={logoSource} style={styles.partyLogoImage} resizeMode="contain" />;
                      } else {
                        // For mobile, use Avatar.Image
                        return <Avatar.Image size={50} source={logoSource} />;
                      }
                    }
                    return null;
                  })()}
                  <Paragraph style={styles.partyLogoText}>{formData.partyName} Logo</Paragraph>
                </View>
              )}
            </View>
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
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave} mode="contained">
              {editingMember ? 'Update' : 'Add'}
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setMemberToDelete(null);
          }}
        >
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete {memberToDelete?.name}?
            </Paragraph>
            <Paragraph style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
              This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDeleteDialogVisible(false);
              setMemberToDelete(null);
            }}>
              Cancel
            </Button>
            <Button 
              onPress={confirmDelete}
              mode="contained"
              buttonColor="#d32f2f"
            >
              Delete
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
  partyButton: {
    marginBottom: 10,
  },
  partyButtonContent: {
    justifyContent: 'flex-start',
  },
  partyLogoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  partyLogoText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  partyLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

