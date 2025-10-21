import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COINRepository } from '../storage/COINRepository';
import { COIN } from '../types/COIN';
import COINListItem from '../components/COINListItem';
import EmptyState from '../components/EmptyState';
import CreateCOINModal from '../components/CreateCOINModal';

export default function HomeScreen() {
  const [coins, setCoins] = useState<COIN[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCOINs();
  }, []);

  const loadCOINs = async () => {
    try {
      setIsLoading(true);
      const allCoins = await COINRepository.getAllCOINs();
      setCoins(allCoins);
    } catch (error) {
      console.error('Error loading COINs:', error);
      Alert.alert('Error', 'Failed to load COINs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCOINCreated = (newCOIN: COIN) => {
    // Add new COIN to the top of the list
    setCoins([newCOIN, ...coins]);
    setShowCreateModal(false);
  };

  const handleOpenCOIN = (id: string) => {
    // Placeholder for future functionality
    Alert.alert('COIN Selected', `Opening COIN: ${id}\n\n(Editor coming in future wave)`);
  };

  const renderCOINItem = ({ item }: { item: COIN }) => (
    <COINListItem coin={item} onPress={handleOpenCOIN} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COIN App</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.newButtonText}>+ New COIN</Text>
        </TouchableOpacity>
      </View>

      {/* COIN List */}
      <FlatList
        data={coins}
        renderItem={renderCOINItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          coins.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={isLoading ? null : <EmptyState />}
        showsVerticalScrollIndicator={true}
      />

      {/* Create COIN Modal */}
      <CreateCOINModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCOINCreated={handleCOINCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
  },
});
