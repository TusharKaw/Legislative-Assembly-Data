import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

export default function MemberDetailsScreen({ route }) {
  const { member } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{member.name}</Title>
          
          <View style={styles.section}>
            <Paragraph style={styles.label}>Constituency:</Paragraph>
            <Paragraph style={styles.value}>{member.constituency}</Paragraph>
          </View>

          <View style={styles.section}>
            <Paragraph style={styles.label}>Session Name:</Paragraph>
            <Paragraph style={styles.value}>{member.sessionName}</Paragraph>
          </View>

          <View style={styles.section}>
            <Paragraph style={styles.label}>Session Date:</Paragraph>
            <Paragraph style={styles.value}>
              {new Date(member.sessionDate).toLocaleDateString()}
            </Paragraph>
          </View>

          <View style={styles.section}>
            <Paragraph style={styles.label}>Time Taken:</Paragraph>
            <Chip icon="clock-outline" style={styles.chip}>
              {member.timeTaken} minutes
            </Chip>
          </View>

          <View style={styles.section}>
            <Paragraph style={styles.label}>Speech Given:</Paragraph>
            <Card style={styles.speechCard}>
              <Card.Content>
                <Paragraph>{member.speechGiven}</Paragraph>
              </Card.Content>
            </Card>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  chip: {
    alignSelf: 'flex-start',
  },
  speechCard: {
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
});

