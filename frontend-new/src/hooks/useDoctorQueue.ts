import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { doctorApi } from '../services/api/doctor';
import {
  type DoctorQueueItem,
  type DoctorQueueResponse,
  transformQueueItemToPatientAppt
} from '../services/types/doctor';

interface UseDoctorQueueResult {
  // Raw queue data from API
  queue: DoctorQueueItem[];
  // Transformed data compatible with existing UI components
  appointments: ReturnType<typeof transformQueueItemToPatientAppt>[];
  // Queue stats
  stats: {
    total: number;
    emergency: number;
    urgent: number;
    normal: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  // Doctor availability
  isAvailable: boolean;
  isTogglingAvailability: boolean;
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  // Actions
  refetch: () => Promise<void>;
  toggleAvailability: () => Promise<void>;
}

export function useDoctorQueue(): UseDoctorQueueResult {
  const { token } = useSelector((state: RootState) => state.auth);
  const [queue, setQueue] = useState<DoctorQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data: DoctorQueueResponse = await doctorApi.getQueue(token);

      // Sort: Emergency > Urgent > Normal
      const priorityOrder: Record<string, number> = {
        EMERGENCY: 3,
        URGENT: 2,
        NORMAL: 1,
      };

      const sorted = (data.queue || []).sort((a, b) => {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setQueue(sorted);
    } catch (err: any) {
      console.error('Failed to fetch doctor queue:', err);
      setError(err.response?.data?.message || 'Failed to load queue');
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAvailability = useCallback(async () => {
    if (!token) return;

    try {
      const data = await doctorApi.getAvailability(token);
      setIsAvailable(data.isAvailable);
    } catch (err: any) {
      console.error('Failed to fetch availability:', err);
      // Default to available if endpoint doesn't exist yet
      setIsAvailable(true);
    }
  }, [token]);

  const toggleAvailability = useCallback(async () => {
    if (!token) return;

    try {
      setIsTogglingAvailability(true);
      const newStatus = !isAvailable;
      const data = await doctorApi.setAvailability(newStatus, token);
      setIsAvailable(data.isAvailable);
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      throw err;
    } finally {
      setIsTogglingAvailability(false);
    }
  }, [token, isAvailable]);

  // Initial fetch and window focus refresh
  useEffect(() => {
    fetchQueue();
    fetchAvailability();

    const handleFocus = () => {
      fetchQueue();
      fetchAvailability();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchQueue, fetchAvailability]);

  // Transform queue items to UI-friendly format
  const appointments = useMemo(() => {
    return queue.map(transformQueueItemToPatientAppt);
  }, [queue]);

  // Compute stats
  const stats = useMemo(() => {
    const total = queue.length;
    const emergency = queue.filter(q => q.priority === 'EMERGENCY').length;
    const urgent = queue.filter(q => q.priority === 'URGENT').length;
    const normal = queue.filter(q => q.priority === 'NORMAL').length;
    const pending = queue.filter(q =>
      q.status === 'IN_QUEUE' || q.status === 'ASSIGNED'
    ).length;
    const inProgress = queue.filter(q => q.status === 'IN_CONSULTATION').length;
    const completed = queue.filter(q =>
      q.status === 'COMPLETED' || q.status === 'PENDING_PHARMACY'
    ).length;

    return {
      total,
      emergency,
      urgent,
      normal,
      pending,
      inProgress,
      completed,
    };
  }, [queue]);

  return {
    queue,
    appointments,
    stats,
    isAvailable,
    isTogglingAvailability,
    isLoading,
    error,
    refetch: fetchQueue,
    toggleAvailability,
  };
}
