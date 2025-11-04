import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
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

  // Get party logo source from assets if no URL exists
  const getPartyLogoSource = (partyName) => {
    if (!partyName) return null;
    
    try {
      if (partyName === 'BJP') {
        return require('../../assets/bjp.webp');
      } else if (partyName === 'AAP') {
        return require('../../assets/aap.jpg');
      }
    } catch (error) {
      console.error('Error loading party logo from assets:', error);
    }
    
    return null;
  };

  const renderMemberCard = ({ item }) => {
    // Construct proper image URLs - check if already full URL or needs backend prefix
    const imageUrl = item.imageUrl 
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `http://127.0.0.1:5000${item.imageUrl}`)
      : null;
    
    // Get logo URL from backend OR fallback to asset
    let logoUrl = null;
    let logoSource = null;
    
    if (item.partyLogoUrl) {
      // If logo URL exists in database, use it
      logoUrl = item.partyLogoUrl.startsWith('http') 
        ? item.partyLogoUrl 
        : `http://127.0.0.1:5000${item.partyLogoUrl}`;
    } else if (item.partyName) {
      // Fallback to asset logo if partyName exists but no logo URL
      logoSource = getPartyLogoSource(item.partyName);
    }
    
    // Logo is displayed from backend URL or asset fallback
    
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MemberDetails', { member: item })}
      >
        <Card style={styles.card} elevation={3}>
          {imageUrl && (
            <Card.Cover source={{ uri: imageUrl }} style={styles.memberImage} />
          )}
          <Card.Content style={styles.cardContent}>
            {/* Header with Name and Party Logo */}
            <View style={styles.headerSection}>
              <View style={styles.nameSection}>
                <Title style={styles.memberName}>{item.name}</Title>
                {item.partyName && (
                  <View style={styles.partyBadge}>
                    <Paragraph style={styles.partyNameText}>{item.partyName}</Paragraph>
                  </View>
                )}
              </View>
              {(logoUrl || logoSource) && (
                <View style={styles.logoContainer}>
                  {logoUrl ? (
                    <Avatar.Image size={50} source={{ uri: logoUrl }} />
                  ) : logoSource ? (
                    Platform.OS === 'web' ? (
                      <Image source={logoSource} style={styles.partyLogoImage} resizeMode="contain" />
                    ) : (
                      <Avatar.Image size={50} source={logoSource} />
                    )
                  ) : null}
                </View>
              )}
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <IconButton icon="map-marker" size={18} iconColor="#666" />
                <View style={styles.infoTextContainer}>
                  <Paragraph style={styles.infoLabel}>Constituency</Paragraph>
                  <Paragraph style={styles.infoValue}>{item.constituency}</Paragraph>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <IconButton icon="calendar" size={18} iconColor="#666" />
                <View style={styles.infoTextContainer}>
                  <Paragraph style={styles.infoLabel}>Session</Paragraph>
                  <Paragraph style={styles.infoValue}>{item.sessionName}</Paragraph>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <IconButton icon="calendar-clock" size={18} iconColor="#666" />
                <View style={styles.infoTextContainer}>
                  <Paragraph style={styles.infoLabel}>Date</Paragraph>
                  <Paragraph style={styles.infoValue}>
                    {new Date(item.sessionDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Paragraph>
                </View>
              </View>
            </View>

            {/* Time Taken Badge */}
            <View style={styles.timeBadgeContainer}>
              <Chip 
                icon="clock-outline" 
                style={styles.timeChip}
                textStyle={styles.timeChipText}
              >
                {item.timeTaken} minutes
              </Chip>
            </View>

            {/* Speech Preview */}
            <View style={styles.speechContainer}>
              <View style={styles.speechHeaderContainer}>
                <IconButton icon="text-box" size={20} iconColor="#1976d2" />
                <Paragraph style={styles.speechLabel}>Speech Preview</Paragraph>
              </View>
              <View style={styles.speechPreviewContainer}>
                <Paragraph numberOfLines={3} style={styles.speechPreview}>
                  {item.speechGiven}
                </Paragraph>
              </View>
              <Button
                mode="contained-tonal"
                icon="text-box-outline"
                onPress={(e) => {
                  e.stopPropagation();
                  showSpeech(item);
                }}
                style={styles.showSpeechButton}
                contentStyle={styles.showSpeechButtonContent}
              >
                Read Full Speech
              </Button>
            </View>

            {/* View Details Button */}
            <Button
              mode="contained"
              icon="arrow-right"
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('MemberDetails', { member: item });
              }}
              style={styles.viewDetailsButton}
              contentStyle={styles.viewDetailsButtonContent}
            >
              View Full Details
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated>
        <Menu
          visible={hamburgerMenuVisible}
          onDismiss={() => setHamburgerMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="menu" 
              onPress={() => setHamburgerMenuVisible(true)}
              iconColor="#ffffff"
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
        <Appbar.Content 
          title="Delhi Legislative Council" 
          titleStyle={styles.appbarTitle}
        />
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
    backgroundColor: '#f0f2f5',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 1,
    backgroundColor: '#f8f9fa',
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
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    padding: 16,
  },
  memberImage: {
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameSection: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 28,
  },
  partyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  partyNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoContainer: {
    marginLeft: 8,
  },
  partyLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoGrid: {
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  timeBadgeContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timeChip: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  timeChipText: {
    color: '#e65100',
    fontWeight: '600',
    fontSize: 13,
  },
  speechContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
  },
  speechHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  speechLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  speechPreviewContainer: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  speechPreview: {
    fontSize: 14,
    lineHeight: 20,
    color: '#424242',
    fontStyle: 'italic',
  },
  showSpeechButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  showSpeechButtonContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewDetailsButton: {
    borderRadius: 8,
    elevation: 2,
  },
  viewDetailsButtonContent: {
    paddingVertical: 6,
  },
  speechDialog: {
    maxHeight: '80%',
    borderRadius: 16,
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
    color: '#1a1a1a',
  },
  emptyCard: {
    marginTop: 50,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
  },
  appbar: {
    backgroundColor: '#1976d2',
    elevation: 4,
  },
  appbarTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 20,
  },
});

