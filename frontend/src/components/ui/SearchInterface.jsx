import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const SearchInterface = ({ userRole = 'admin' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  const mockData = {
    movies: [
      { id: 1, title: 'Pathaan', type: 'movie', description: 'Action Thriller - 2023' },
      { id: 2, title: 'Jawan', type: 'movie', description: 'Action Drama - 2023' },
      { id: 3, title: 'Dunki', type: 'movie', description: 'Comedy Drama - 2023' },
    ],
    theaters: [
      { id: 1, name: 'PVR Cinemas', type: 'theater', description: 'Mumbai - 8 Screens' },
      { id: 2, name: 'INOX Megaplex', type: 'theater', description: 'Delhi - 12 Screens' },
      { id: 3, name: 'Cinepolis', type: 'theater', description: 'Bangalore - 6 Screens' },
    ],
    collections: [
      { id: 1, reference: 'COL-2023-001', type: 'collection', description: '₹2,45,000 - Pending' },
      { id: 2, reference: 'COL-2023-002', type: 'collection', description: '₹1,85,000 - Approved' },
    ],
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer?.current) {
      clearTimeout(debounceTimer?.current);
    }

    if (searchQuery?.trim()?.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer?.current) {
        clearTimeout(debounceTimer?.current);
      }
    };
  }, [searchQuery]);

  const performSearch = (query) => {
    const lowerQuery = query?.toLowerCase();
    const results = [];

    if (userRole === 'admin' || userRole === 'manager') {
      const movieResults = mockData?.movies?.filter((movie) => movie?.title?.toLowerCase()?.includes(lowerQuery))?.map((movie) => ({ ...movie, category: 'Movies' }));
      results?.push(...movieResults);
    }

    if (userRole === 'admin') {
      const theaterResults = mockData?.theaters?.filter((theater) => theater?.name?.toLowerCase()?.includes(lowerQuery))?.map((theater) => ({ ...theater, category: 'Theaters' }));
      results?.push(...theaterResults);

      const collectionResults = mockData?.collections?.filter((collection) => collection?.reference?.toLowerCase()?.includes(lowerQuery))?.map((collection) => ({ ...collection, category: 'Collections' }));
      results?.push(...collectionResults);
    }

    setSearchResults(results);
    setShowResults(results?.length > 0);
    setIsSearching(false);
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');

    switch (result?.type) {
      case 'movie': navigate('/movie-manager-dashboard', { state: { movieId: result?.id } });
        break;
      case 'theater': navigate('/exhibitor-portal', { state: { theaterId: result?.id } });
        break;
      case 'collection': navigate('/admin-dashboard', { state: { collectionId: result?.id } });
        break;
      default:
        break;
    }
  };

  const groupedResults = searchResults?.reduce((acc, result) => {
    if (!acc?.[result?.category]) {
      acc[result.category] = [];
    }
    acc?.[result?.category]?.push(result);
    return acc;
  }, {});

  return (
    <div className="search-interface" ref={searchRef}>
      <div className="search-input-wrapper">
        <Icon name="Search" size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search movies, theaters, collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          onFocus={() => searchResults?.length > 0 && setShowResults(true)}
          className="search-input"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="Loader2" size={18} className="animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {showResults && (
        <div className="search-results">
          {Object.entries(groupedResults)?.map(([category, items]) => (
            <div key={category}>
              <div className="search-result-category">{category}</div>
              {items?.map((item) => (
                <div
                  key={`${item?.type}-${item?.id}`}
                  onClick={() => handleResultClick(item)}
                  className="search-result-item"
                >
                  <div className="search-result-title">
                    {item?.title || item?.name || item?.reference}
                  </div>
                  <div className="search-result-description">{item?.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;