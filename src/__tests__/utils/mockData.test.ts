import {
  MOCK_GUIDES,
  MOCK_TOURS,
  CATEGORIES,
  LANGUAGES,
  LOCATIONS,
} from '../../constants/mockData';

describe('Mock Data', () => {
  describe('MOCK_GUIDES', () => {
    it('should have at least one guide', () => {
      expect(MOCK_GUIDES.length).toBeGreaterThan(0);
    });

    it('should have guides with required properties', () => {
      MOCK_GUIDES.forEach((guide) => {
        expect(guide).toHaveProperty('id');
        expect(guide).toHaveProperty('name');
        expect(guide).toHaveProperty('location');
        expect(guide).toHaveProperty('rating');
        expect(guide).toHaveProperty('reviewCount');
        expect(guide).toHaveProperty('languages');
        expect(guide).toHaveProperty('specialties');
        expect(guide).toHaveProperty('pricePerHour');
        expect(guide).toHaveProperty('verified');
        expect(guide).toHaveProperty('available');
        expect(guide).toHaveProperty('bio');
      });
    });

    it('should have guides with valid ratings (0-5)', () => {
      MOCK_GUIDES.forEach((guide) => {
        expect(guide.rating).toBeGreaterThanOrEqual(0);
        expect(guide.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should have guides with positive prices', () => {
      MOCK_GUIDES.forEach((guide) => {
        expect(guide.pricePerHour).toBeGreaterThan(0);
      });
    });

    it('should have guides with at least one language', () => {
      MOCK_GUIDES.forEach((guide) => {
        expect(guide.languages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('MOCK_TOURS', () => {
    it('should have at least one tour', () => {
      expect(MOCK_TOURS.length).toBeGreaterThan(0);
    });

    it('should have tours with required properties', () => {
      MOCK_TOURS.forEach((tour) => {
        expect(tour).toHaveProperty('id');
        expect(tour).toHaveProperty('guideId');
        expect(tour).toHaveProperty('title');
        expect(tour).toHaveProperty('description');
        expect(tour).toHaveProperty('duration');
        expect(tour).toHaveProperty('price');
        expect(tour).toHaveProperty('location');
        expect(tour).toHaveProperty('categories');
      });
    });

    it('should have tours with positive prices', () => {
      MOCK_TOURS.forEach((tour) => {
        expect(tour.price).toBeGreaterThan(0);
      });
    });

    it('should have tours linked to existing guides', () => {
      const guideIds = MOCK_GUIDES.map((g) => g.id);
      MOCK_TOURS.forEach((tour) => {
        expect(guideIds).toContain(tour.guideId);
      });
    });
  });

  describe('CATEGORIES', () => {
    it('should have at least one category', () => {
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have categories with id, name, and icon', () => {
      CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
      });
    });
  });

  describe('LANGUAGES', () => {
    it('should have at least one language', () => {
      expect(LANGUAGES.length).toBeGreaterThan(0);
    });

    it('should include common languages', () => {
      expect(LANGUAGES).toContain('Español');
      expect(LANGUAGES).toContain('Inglés');
    });
  });

  describe('LOCATIONS', () => {
    it('should have at least one location', () => {
      expect(LOCATIONS.length).toBeGreaterThan(0);
    });

    it('should include major Spanish cities', () => {
      expect(LOCATIONS).toContain('Madrid');
      expect(LOCATIONS).toContain('Barcelona');
    });
  });
});
