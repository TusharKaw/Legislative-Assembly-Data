import React from 'react';
import { View, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { Card, Title, Paragraph, Chip, Avatar } from 'react-native-paper';

export default function MemberDetailsScreen({ route }) {
  const { member } = route.params;

  const imageUrl = member.imageUrl 
    ? (member.imageUrl.startsWith('http') ? member.imageUrl : `http://127.0.0.1:5000${member.imageUrl}`)
    : null;
  
  // Get logo URL from backend OR fallback to asset
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
  
  let logoUrl = null;
  let logoSource = null;
  
  if (member.partyLogoUrl) {
    logoUrl = member.partyLogoUrl.startsWith('http') 
      ? member.partyLogoUrl 
      : `http://127.0.0.1:5000${member.partyLogoUrl}`;
  } else if (member.partyName) {
    logoSource = getPartyLogoSource(member.partyName);
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {imageUrl && (
            <Card.Cover source={{ uri: imageUrl }} style={styles.memberImage} />
          )}
          <View style={styles.headerRow}>
            <Title style={styles.title}>{member.name}</Title>
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
          
          {member.partyName && (
            <View style={styles.section}>
              <Paragraph style={styles.label}>Party:</Paragraph>
              <Paragraph style={styles.value}>{member.partyName}</Paragraph>
            </View>
          )}
          
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
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  memberImage: {
    marginBottom: 15,
    height: 250,
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
  partyLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

