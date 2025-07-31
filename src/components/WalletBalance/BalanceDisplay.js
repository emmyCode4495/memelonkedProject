import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const BalanceDisplay = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await fetchBalance(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Your BONK Balance</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshBalance}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={16} 
            color={web3Colors.primary} 
            style={refreshing ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceRow}>
        <MaterialCommunityIcons name="dog" size={24} color={web3Colors.bonk} />
        <Text style={styles.balanceAmount}>
          {balanceLoading || refreshing ? 'Refreshing...' : 
           userBonkBalance !== null ? `${userBonkBalance.toLocaleString()}` : '0'}
        </Text>
      </View>
      
      {lastFetched && (
        <Text style={styles.balanceTimestamp}>
          Last updated: {new Date(lastFetched).toLocaleTimeString()}
        </Text>
      )}
      
      {error && (
        <Text style={styles.balanceError}>
          Failed to fetch balance. Tap refresh to try again.
        </Text>
      )}
    </View>
  );
};

export default BalanceDisplay

const styles = StyleSheet.create({
      balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  refreshButton: {
    padding: 4,
  },
  
  balanceTimestamp: {
    fontSize: 10,
    color: web3Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  balanceError: {
    fontSize: 10,
    color: web3Colors.accent,
    marginTop: 4,
  },
})