import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

// isInternetReachable can be null right after mount until NetInfo finishes its
// first probe — treat that as online rather than flashing the offline screen.
export function useNetworkStatus() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected && state.isInternetReachable !== false)
    })
    return unsubscribe
  }, [])

  return online
}
