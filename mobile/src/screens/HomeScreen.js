import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Appbar, Menu, Portal, Dialog, IconButton, Avatar, TextInput, Searchbar } from 'react-native-paper';
import { AuthContext } from '../../App';
import api from '../config/api';

export default function HomeScreen({ navigation }) {
  const { isAuthenticated, logout } = useContext(AuthContext);
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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all'); // all, name, partyName, constituency, sessionName, sessionDate
  const [searchCategoryMenuVisible, setSearchCategoryMenuVisible] = useState(false);
  
  // Lazy loading with debounce
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Debounce search query for lazy loading
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay for lazy loading
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [members, selectedSessionName, selectedSessionDate, debouncedSearchQuery, searchCategory]);

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

    // Apply dropdown filters (session name and date)
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

    // Apply search query with selected category
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(member => {
        if (searchCategory === 'all') {
          // Search across all fields
          return (
            member.name?.toLowerCase().includes(query) ||
            member.partyName?.toLowerCase().includes(query) ||
            member.constituency?.toLowerCase().includes(query) ||
            member.sessionName?.toLowerCase().includes(query) ||
            new Date(member.sessionDate).toLocaleDateString().toLowerCase().includes(query)
          );
        } else if (searchCategory === 'name') {
          return member.name?.toLowerCase().includes(query);
        } else if (searchCategory === 'partyName') {
          return member.partyName?.toLowerCase().includes(query);
        } else if (searchCategory === 'constituency') {
          return member.constituency?.toLowerCase().includes(query);
        } else if (searchCategory === 'sessionName') {
          return member.sessionName?.toLowerCase().includes(query);
        } else if (searchCategory === 'sessionDate') {
          return new Date(member.sessionDate).toLocaleDateString().toLowerCase().includes(query);
        }
        return true;
      });
    }

    setFilteredMembers(filtered);
  };

  const clearFilters = () => {
    setSelectedSessionName('');
    setSelectedSessionDate('');
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSearchCategory('all');
  };

  const showSpeech = (member) => {
    setSelectedSpeech(member);
    setSpeechDialogVisible(true);
  };

  const renderMemberCard = ({ item }) => {
    // Construct proper image URLs - check if already full URL or needs backend prefix
    const imageUrl = item.imageUrl 
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `http://127.0.0.1:5000${item.imageUrl}`)
      : null;
    const logoUrl = item.partyLogoUrl 
      ? (item.partyLogoUrl.startsWith('http') ? item.partyLogoUrl : `http://127.0.0.1:5000${item.partyLogoUrl}`)
      : null;
    
    // Debug log to see what data we're getting
    // console.log('Member data:', { name: item.name, imageUrl: item.imageUrl, partyLogoUrl: item.partyLogoUrl, partyName: item.partyName });
    
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
            <>
              <Menu.Item
                onPress={() => {
                  setHamburgerMenuVisible(false);
                  navigation.navigate('AdminDashboard');
                }}
                title="Admin Dashboard"
                leadingIcon="shield-account"
              />
              <Menu.Item
                onPress={async () => {
                  setHamburgerMenuVisible(false);
                  await logout();
                  navigation.replace('Home');
                }}
                title="Logout"
                leadingIcon="logout"
              />
            </>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarRow}>
            <Searchbar
              placeholder="Search members..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchBar, { marginRight: 10 }]}
              icon="magnify"
              onClearIconPress={() => {
                setSearchQuery('');
                setDebouncedSearchQuery('');
              }}
            />
            <Menu
              visible={searchCategoryMenuVisible}
              onDismiss={() => setSearchCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setSearchCategoryMenuVisible(true)}
                  style={styles.categoryButton}
                  icon="filter"
                >
                  {searchCategory === 'all' ? 'All' : 
                   searchCategory === 'name' ? 'Name' :
                   searchCategory === 'partyName' ? 'Party' :
                   searchCategory === 'constituency' ? 'Constituency' :
                   searchCategory === 'sessionName' ? 'Session' :
                   searchCategory === 'sessionDate' ? 'Date' : 'All'}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSearchCategory('all');
                  setSearchCategoryMenuVisible(false);
                }}
                title="All Categories"
                leadingIcon="magnify"
              />
              <Menu.Item
                onPress={() => {
                  setSearchCategory('name');
                  setSearchCategoryMenuVisible(false);
                }}
                title="Name"
                leadingIcon="account"
              />
              <Menu.Item
                onPress={() => {
                  setSearchCategory('partyName');
                  setSearchCategoryMenuVisible(false);
                }}
                title="Party Name"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setSearchCategory('constituency');
                  setSearchCategoryMenuVisible(false);
                }}
                title="Constituency"
                leadingIcon="map-marker"
              />
              <Menu.Item
                onPress={() => {
                  setSearchCategory('sessionName');
                  setSearchCategoryMenuVisible(false);
                }}
                title="Session Name"
                leadingIcon="calendar-text"
              />
              <Menu.Item
                onPress={() => {
                  setSearchCategory('sessionDate');
                  setSearchCategoryMenuVisible(false);
                }}
                title="Session Date"
                leadingIcon="calendar"
              />
            </Menu>
          </View>
        </View>

        {/* Dropdown Filters */}
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
        
        {/* Clear Filters Button */}
        {(selectedSessionName || selectedSessionDate || searchQuery) && (
          <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
            Clear All Filters
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
  searchContainer: {
    marginBottom: 10,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 1,
  },
  categoryButton: {
    minWidth: 80,
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

