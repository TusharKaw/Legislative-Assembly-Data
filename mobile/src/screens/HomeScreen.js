import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Appbar, Menu, Portal, Dialog, IconButton, Avatar } from 'react-native-paper';
import { AuthContext } from '../../App';
import api from '../config/api';

export default function HomeScreen({ navigation }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [sessionNames, setSessionNames] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedSessionDate, setSelectedSessionDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionNameMenuVisible, setSessionNameMenuVisible] = useState(false);
  const [sessionDateMenuVisible, setSessionDateMenuVisible] = useState(false);
  const [speechDialogVisible, setSpeechDialogVisible] = useState(false);
  const [selectedSpeech, setSelectedSpeech] = useState(null);
  const [hamburgerMenuVisible, setHamburgerMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, selectedSessionName, selectedSessionDate]);

  const loadData = async () => {
    try {
      const [membersRes, filtersRes] = await Promise.all([
        api.get('/members'),
        api.get('/members/filters')
      ]);
      setMembers(membersRes.data);
      setSessionNames(filtersRes.data.sessionNames);
      setSessionDates(filtersRes.data.sessionDates);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...members];

    if (selectedSessionName) {
      filtered = filtered.filter(m => m.sessionName === selectedSessionName);
    }

    if (selectedSessionDate) {
      const dateStr = new Date(selectedSessionDate).toISOString().split('T')[0];
      filtered = filtered.filter(m => {
        const memberDate = new Date(m.sessionDate).toISOString().split('T')[0];
        return memberDate === dateStr;
      });
    }

    setFilteredMembers(filtered);
  };

  const clearFilters = () => {
    setSelectedSessionName('');
    setSelectedSessionDate('');
  };

  const showSpeech = (member) => {
    setSelectedSpeech(member);
    setSpeechDialogVisible(true);
  };

  const renderMemberCard = ({ item }) => {
    const imageUrl = item.imageUrl 
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `http://127.0.0.1:5000${item.imageUrl}`)
      : null;
    const logoUrl = item.partyLogoUrl 
      ? (item.partyLogoUrl.startsWith('http') ? item.partyLogoUrl : `http://127.0.0.1:5000${item.partyLogoUrl}`)
      : null;
    
    return (
    <Card style={styles.card}>
      <Card.Content>
        {imageUrl && (
          <Card.Cover source={{ uri: imageUrl }} style={styles.memberImage} />
        )}
        <View style={styles.nameRow}>
          <Title style={styles.memberName}>{item.name}</Title>
          {logoUrl && (
            <Avatar.Image size={40} source={{ uri: logoUrl }} />
          )}
        </View>
        {item.partyName && (
          <Paragraph style={styles.partyName}>Party: {item.partyName}</Paragraph>
        )}
        <Paragraph>Constituency: {item.constituency}</Paragraph>
        <Paragraph>Session: {item.sessionName}</Paragraph>
        <Paragraph>Date: {new Date(item.sessionDate).toLocaleDateString()}</Paragraph>
        <View style={styles.row}>
          <Chip icon="clock-outline" style={styles.chip}>
            {item.timeTaken} min
          </Chip>
        </View>
        <View style={styles.speechContainer}>
          <Paragraph numberOfLines={3} style={styles.speechPreview}>
            {item.speechGiven}
          </Paragraph>
          <Button
            mode="text"
            icon="text-box-outline"
            onPress={() => showSpeech(item)}
            style={styles.showSpeechButton}
          >
            Show Speech
          </Button>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('MemberDetails', { member: item })}>
          <Button mode="outlined" style={styles.viewDetailsButton}>
            View Details
          </Button>
        </TouchableOpacity>
      </Card.Content>
    </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Menu
          visible={hamburgerMenuVisible}
          onDismiss={() => setHamburgerMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="menu" 
              onPress={() => setHamburgerMenuVisible(true)}
            />
          }
        >
          {isAuthenticated ? (
            <Menu.Item
              onPress={() => {
                setHamburgerMenuVisible(false);
                navigation.navigate('AdminDashboard');
              }}
              title="Admin Dashboard"
              leadingIcon="shield-account"
            />
          ) : (
            <Menu.Item
              onPress={() => {
                setHamburgerMenuVisible(false);
                navigation.navigate('Login');
              }}
              title="Admin Login"
              leadingIcon="login"
            />
          )}
        </Menu>
        <Appbar.Content title="Delhi Legislative Council" />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Menu
            visible={sessionNameMenuVisible}
            onDismiss={() => setSessionNameMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSessionNameMenuVisible(true)}
                style={styles.filterButton}
                icon="chevron-down"
              >
                {selectedSessionName || 'Session Name'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedSessionName('');
                setSessionNameMenuVisible(false);
              }}
              title="All Sessions"
            />
            {sessionNames.map((name) => (
              <Menu.Item
                key={name}
                onPress={() => {
                  setSelectedSessionName(name);
                  setSessionNameMenuVisible(false);
                }}
                title={name}
              />
            ))}
          </Menu>

          <Menu
            visible={sessionDateMenuVisible}
            onDismiss={() => setSessionDateMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSessionDateMenuVisible(true)}
                style={styles.filterButton}
                icon="chevron-down"
              >
                {selectedSessionDate || 'Session Date'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedSessionDate('');
                setSessionDateMenuVisible(false);
              }}
              title="All Dates"
            />
            {sessionDates.map((date) => (
              <Menu.Item
                key={date}
                onPress={() => {
                  setSelectedSessionDate(date);
                  setSessionDateMenuVisible(false);
                }}
                title={new Date(date).toLocaleDateString()}
              />
            ))}
          </Menu>
        </View>
        {(selectedSessionName || selectedSessionDate) && (
          <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
            Clear Filters
          </Button>
        )}
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMemberCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyText}>No members found</Title>
            </Card.Content>
          </Card>
        }
      />

      <Portal>
        <Dialog 
          visible={speechDialogVisible} 
          onDismiss={() => setSpeechDialogVisible(false)}
          style={styles.speechDialog}
        >
          <Dialog.Title>
            {selectedSpeech?.name} - Speech
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.speechScrollArea}>
            <ScrollView>
              <Dialog.Content>
                <View style={styles.speechHeader}>
                  <Chip icon="clock-outline" style={styles.speechChip}>
                    Time Taken: {selectedSpeech?.timeTaken} minutes
                  </Chip>
                </View>
                <Paragraph style={styles.speechText}>
                  {selectedSpeech?.speechGiven}
                </Paragraph>
              </Dialog.Content>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSpeechDialogVisible(false)}>Close</Button>
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
  filterContainer: {
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    marginTop: 5,
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  chip: {
    marginRight: 10,
  },
  speechContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  speechPreview: {
    marginBottom: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  showSpeechButton: {
    alignSelf: 'flex-start',
  },
  viewDetailsButton: {
    marginTop: 10,
  },
  memberImage: {
    marginBottom: 10,
    height: 150,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  memberName: {
    flex: 1,
    marginRight: 10,
  },
  partyName: {
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  speechDialog: {
    maxHeight: '80%',
  },
  speechScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  speechHeader: {
    marginBottom: 15,
  },
  speechChip: {
    alignSelf: 'flex-start',
  },
  speechText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

