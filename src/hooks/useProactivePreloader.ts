import { useEffect } from 'react';
import { getArtists } from '@/services/userService';

// Proactive pre-fetch strategy to mitigate network/connection instability issues.
// Fetches critical data on connectivity restore or component initialization.
export const useProactivePreloader = () => {
    useEffect(() => {
        const prefetchCriticalData = async () => {
            console.log("[Data] Proactively prefetching critical data");
            try {
                // Prefetch artists list as a representative critical resource
                await getArtists();
                // We could add more critical resources here, 
                // e.g., TrendingNFTs, user-specific data via AuthContext, etc.
            } catch (error) {
                console.warn("[Data] Proactive pre-fetching failed, network may still be unstable", error);
            }
        };

        const handleOnline = () => {
            console.log("[Connectivity] Network restored, triggering proactive data pre-fetch.");
            prefetchCriticalData();
        };

        window.addEventListener('online', handleOnline);
        
        // Initial fetch on app start
        prefetchCriticalData();

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);
};
