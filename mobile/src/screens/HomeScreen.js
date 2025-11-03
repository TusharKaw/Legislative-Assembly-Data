import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Appbar, Menu } from 'react-native-paper';
import api from '../config/api';

export default function HomeScreen({ navigation }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [sessionNames, setSessionNames] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedSessionDate, setSelectedSessionDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionNameMenuVisible, setSessionNameMenuVisible] = useState(false);
  const [sessionDateMenuVisible, setSessionDateMenuVisible] = useState(false);

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

  const renderMemberCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MemberDetails', { member: item })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>Constituency: {item.constituency}</Paragraph>
          <Paragraph>Session: {item.sessionName}</Paragraph>
          <Paragraph>Date: {new Date(item.sessionDate).toLocaleDateString()}</Paragraph>
          <View style={styles.row}>
            <Chip icon="clock-outline" style={styles.chip}>
              {item.timeTaken} min
            </Chip>
          </View>
          <Paragraph numberOfLines={2} style={styles.speech}>
            {item.speechGiven}
          </Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Delhi Legislative Council" />
        <Appbar.Action 
          icon="login" 
          onPress={() => navigation.navigate('Login')} 
        />
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
  speech: {
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

