import { useState, useEffect, useCallback } from 'react';
import { guidesService, Guide, SearchGuidesParams, getErrorMessage } from '../services';

interface UseGuidesResult {
  guides: Guide[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFeaturedGuidesResult {
  guides: Guide[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseGuideResult {
  guide: Guide | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook to search guides with filters
export const useGuides = (params?: SearchGuidesParams): UseGuidesResult => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guidesService.searchGuides(params);
      if (response.success) {
        // Transform API response to include computed name
        const transformedGuides = response.data.map((guide) => ({
          ...guide,
          name: guide.user
            ? `${guide.user.firstName} ${guide.user.lastName}`
            : guide.name || 'Guía',
          avatar: guide.user?.avatar || guide.avatar,
        }));
        setGuides(transformedGuides);
      } else {
        setError('Error al cargar guías');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return { guides, loading, error, refetch: fetchGuides };
};

// Hook to get featured guides
export const useFeaturedGuides = (): UseFeaturedGuidesResult => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guidesService.getFeaturedGuides();
      if (response.success) {
        const transformedGuides = response.data.map((guide) => ({
          ...guide,
          name: guide.user
            ? `${guide.user.firstName} ${guide.user.lastName}`
            : guide.name || 'Guía',
          avatar: guide.user?.avatar || guide.avatar,
        }));
        setGuides(transformedGuides);
      } else {
        setError('Error al cargar guías destacados');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  return { guides, loading, error, refetch: fetchGuides };
};

// Hook to get a single guide by ID
export const useGuide = (guideId: string): UseGuideResult => {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuide = useCallback(async () => {
    if (!guideId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await guidesService.getGuide(guideId);
      if (response.success) {
        const transformedGuide = {
          ...response.data,
          name: response.data.user
            ? `${response.data.user.firstName} ${response.data.user.lastName}`
            : response.data.name || 'Guía',
          avatar: response.data.user?.avatar || response.data.avatar,
        };
        setGuide(transformedGuide);
      } else {
        setError('Error al cargar guía');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchGuide();
  }, [fetchGuide]);

  return { guide, loading, error, refetch: fetchGuide };
};

