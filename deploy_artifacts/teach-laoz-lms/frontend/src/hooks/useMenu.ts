import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import type { MenuItem } from '../services/apiService';

export function useMenu() {
  const [courses, setCourses] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await apiService.getMenu();
        setCourses(data.courses);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch menu'));
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { courses, loading, error };
}
