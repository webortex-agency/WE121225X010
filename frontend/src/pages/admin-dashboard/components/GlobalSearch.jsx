import { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Mock data for search
  const mockData = {
    movies: [
      { id: 'MOV-2025-001', name: 'Pathaan', type: 'movie', collections: 157500000 },
      { id: 'MOV-2025-002', name: 'Jawan', type: 'movie', collections: 125000000 },
      { id: 'MOV-2025-003', name: 'Tiger 3', type: 'movie', collections: 98000000 }
    ],
    theaters: [
      { id: 'TH-001', name: 'GOWRI Theater', address: 'Ananthapur, AP', type: 'theater', assignedMovies: ['MOV-2025-001'] },
      { id: 'TH-002', name: 'PVR Cinemas Phoenix', address: 'Mumbai, Maharashtra', type: 'theater', assignedMovies: ['MOV-2025-001', 'MOV-2025-002'] },
      { id: 'TH-003', name: 'INOX Megaplex', address: 'Delhi, NCR', type: 'theater', assignedMovies: ['MOV-2025-002'] }
    ],
    users: [
      { id: 'USR-001', name: 'Rajesh Kumar', email: 'manager@moviedist.com', role: 'manager', type: 'user', movieAssignment: 'MOV-2025-001' },
      { id: 'USR-002', name: 'Priya Sharma', email: 'producer@moviedist.com', role: 'producer', type: 'user', movieAssignment: 'MOV-2025-001' },
      { id: 'USR-003', name: 'Admin User', email: 'admin@moviedist.com', role: 'admin', type: 'user', movieAssignment: null }
    ],
    financialData: [
      { id: 'FIN-001', date: '2023-12-12', theater: 'GOWRI Theater', amount: 245000, type: 'financial' },
      { id: 'FIN-002', date: '2023-12-11', theater: 'PVR Cinemas Phoenix', amount: 185000, type: 'financial' },
      { id: 'FIN-003', date: '2023-12-10', theater: 'INOX Megaplex', amount: 165000, type: 'financial' }
    ]
  };

  // Perform search
  const performSearch = (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = [];
      const lowerTerm = term.toLowerCase();

      // Search movies
      mockData.movies.forEach(movie => {
        if (movie.name.toLowerCase().includes(lowerTerm) || movie.id.toLowerCase().includes(lowerTerm)) {
          results.push({
            ...movie,
            matchType: 'name',
            category: 'Movies'
          });
        }
      });

      // Search theaters
      mockData.theaters.forEach(theater => {
        if (theater.name.toLowerCase().includes(lowerTerm) || theater.address.toLowerCase().includes(lowerTerm)) {
          results.push({
            ...theater,
            matchType: 'name',
            category: 'Theaters'
          });
        }
      });

      // Search users
      mockData.users.forEach(user => {
        if (user.name.toLowerCase().includes(lowerTerm) || user.email.toLowerCase().includes(lowerTerm)) {
          results.push({
            ...user,
            matchType: 'name',
            category: 'Users'
          });
        }
      });

      // Search financial data
      mockData.financialData.forEach(data => {
        if (data.theater.toLowerCase().includes(lowerTerm) || data.date.includes(term)) {
          results.push({
            ...data,
            matchType: 'theater',
            category: 'Financial Data'
          });
        }
      });

      // Group results by category and limit to 10 total
      const groupedResults = results.slice(0, 10);
      setSearchResults(groupedResults);
      setIsSearching(false);
      setShowResults(true);
    }, 300);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  // Handle result click
  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchTerm('');
    
    // Navigate based on result type
    switch (result.type) {
      case 'movie':
        console.log(`Navigate to movie: ${result.id}`);
        break;
      case 'theater':
        console.log(`Navigate to theater: ${result.id}`);
        break;
      case 'user':
        console.log(`Navigate to user: ${result.id}`);
        break;
      case 'financial':
        console.log(`Navigate to financial data: ${result.id}`);
        break;
      default:
        console.log(`Navigate to: ${result.id}`);
    }
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) && 
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get icon for result type
  const getResultIcon = (type) => {
    switch (type) {
      case 'movie': return 'Film';
      case 'theater': return 'Building2';
      case 'user': return 'User';
      case 'financial': return 'IndianRupee';
      default: return 'Search';
    }
  };

  // Format result description
  const getResultDescription = (result) => {
    switch (result.type) {
      case 'movie':
        return `Collections: ₹${result.collections.toLocaleString()}`;
      case 'theater':
        return result.address;
      case 'user':
        return `${result.role} - ${result.email}`;
      case 'financial':
        return `${result.date} - ₹${result.amount.toLocaleString()}`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Search" size={24} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Global Search</h2>
      </div>

      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search anything... (movies, theaters, users, financial data)"
            className="w-full pl-12 pr-4 py-3 text-lg border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
          />
          {isSearching && (
            <Icon 
              name="Loader2" 
              size={20} 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground animate-spin" 
            />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div 
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <button
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <Icon name={getResultIcon(result.type)} size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {result.name || result.theater}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full flex-shrink-0">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {getResultDescription(result)}
                  </p>
                  {result.id && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {result.id}
                    </p>
                  )}
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
          <div 
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center"
          >
            <Icon name="Search" size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Search Examples */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-medium text-foreground">Search Examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="Film" size={16} className="text-blue-500" />
              <span className="text-muted-foreground">Movies:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">Pathaan</code>
              <code className="bg-muted px-2 py-1 rounded text-xs">MOV-2025</code>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Building2" size={16} className="text-green-500" />
              <span className="text-muted-foreground">Theaters:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">GOWRI</code>
              <code className="bg-muted px-2 py-1 rounded text-xs">Ananthapur</code>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="User" size={16} className="text-purple-500" />
              <span className="text-muted-foreground">Users:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">Rajesh</code>
              <code className="bg-muted px-2 py-1 rounded text-xs">manager@</code>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="IndianRupee" size={16} className="text-orange-500" />
              <span className="text-muted-foreground">Financial:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">2023-12-12</code>
              <code className="bg-muted px-2 py-1 rounded text-xs">GOWRI</code>
            </div>
          </div>
        </div>
      </div>

      {/* Search Features */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">Search Features:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Real-time search as you type</li>
          <li>• Case-insensitive partial matches</li>
          <li>• Maximum 10 results displayed</li>
          <li>• Grouped by category (Movies, Theaters, Users, Financial)</li>
          <li>• Click any result to navigate directly</li>
          <li>• Response time under 500ms</li>
        </ul>
      </div>
    </div>
  );
};

export default GlobalSearch;
