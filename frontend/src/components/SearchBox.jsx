import { useState, useEffect, useRef } from 'react';
import './SearchBox.css';

function SearchBox({ map, onLodgingPlacesChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showLodgingFilter, setShowLodgingFilter] = useState(false);
  const [lodgingPlaces, setLodgingPlaces] = useState([]);
  const [isLoadingLodging, setIsLoadingLodging] = useState(false);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = async (searchQuery) => {
    if (!searchQuery.trim() || !map) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
          `access_token=${accessToken}&limit=8&types=place`
      );
      const data = await response.json();
      setResults(data.features.slice(0, 8));
      setShowResults(true);
    } catch (error) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchCities(value);
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const searchLodgingPlaces = async (cityCenter, cityBounds) => {
    if (!map || !cityCenter) return;

    setIsLoadingLodging(true);
    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    try {
      const [lng, lat] = cityCenter;
      const proximity = `proximity=${lng},${lat}`;
      const bbox = cityBounds?.length === 4 ? `&bbox=${cityBounds.join(',')}` : '';

      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/hotel.json?` +
        `access_token=${accessToken}&autocomplete=false&types=place,poi&${proximity}${bbox}&limit=50`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mapbox API error:', response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && Array.isArray(data.features)) {
        setLodgingPlaces(data.features);
        onLodgingPlacesChange?.(data.features);
      } else {
        setLodgingPlaces([]);
        onLodgingPlacesChange?.([]);
      }
    } catch (error) {
      console.error('Error searching for hotels:', error);
      setLodgingPlaces([]);
      onLodgingPlacesChange?.([]);
    } finally {
      setIsLoadingLodging(false);
    }
  };

  const handleCityResultClick = (result) => {
    const [lng, lat] = result.center;
    setQuery(result.place_name);
    setSelectedCity({ ...result, center: [lng, lat], bbox: result.bbox });
    setShowResults(false);

    map.flyTo({ center: [lng, lat], zoom: 12, duration: 1500 });

    if (showLodgingFilter) {
      searchLodgingPlaces([lng, lat], result.bbox);
    } else {
      clearLodging();
    }
  };

  const handleLodgingFilterToggle = (e) => {
    const enabled = e.target.checked;
    setShowLodgingFilter(enabled);

    if (enabled && selectedCity) {
      searchLodgingPlaces(selectedCity.center, selectedCity.bbox);
    } else {
      clearLodging();
    }
  };

  const clearLodging = () => {
    setLodgingPlaces([]);
    onLodgingPlacesChange?.([]);
  };

  const handleClearCity = () => {
    setSelectedCity(null);
    setQuery('');
    setShowLodgingFilter(false);
    clearLodging();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchCities(query);
    }
  };

  return (
    <div className='search-box-container' ref={resultsRef}>
      {selectedCity && (
        <div className='selected-city-banner'>
          <span className='selected-city-label'>City:</span>
          <span className='selected-city-name'>{selectedCity.place_name}</span>
          <button type='button' className='clear-city-btn' onClick={handleClearCity} title='Clear city selection'>
            ×
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className='search-box-form'>
        <input
          type='text'
          value={query}
          onChange={handleInputChange}
          placeholder='Search for a city...'
          className='search-box-input'
          autoComplete='off'
        />
        {isSearching && <div className='search-box-spinner'></div>}
      </form>
      {selectedCity && (
        <div className='lodging-filter-container'>
          <label className='lodging-filter-label'>
            <input
              type='checkbox'
              checked={showLodgingFilter}
              onChange={handleLodgingFilterToggle}
              className='lodging-filter-checkbox'
            />
            <span className='lodging-filter-text'>
              Show lodging places
              {isLoadingLodging && <span className='lodging-loading'> (loading...)</span>}
            </span>
          </label>
          {showLodgingFilter && !isLoadingLodging && (
            <div className='lodging-count'>
              {lodgingPlaces.length > 0 ? (
                <>
                  Found {lodgingPlaces.length} lodging {lodgingPlaces.length === 1 ? 'place' : 'places'}
                </>
              ) : (
                <span style={{ color: '#666', fontStyle: 'italic' }}>
                  No lodging places found in this area. Try a different city.
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {showResults && results.length > 0 && (
        <div className='search-box-results'>
          {results.map((result, index) => (
            <div
              key={result.id || index}
              className='search-box-result-item'
              onClick={() => handleCityResultClick(result)}
            >
              <div className='search-box-result-name'>{result.place_name}</div>
              {result.properties?.category && (
                <div className='search-box-result-type'>{result.properties.category}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {showResults && !isSearching && results.length === 0 && query.trim() && (
        <div className='search-box-results'>
          <div className='search-box-no-results'>No results found</div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;
