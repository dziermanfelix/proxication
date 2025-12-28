import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const PoiContext = createContext(null);

export const usePoi = () => {
  const context = useContext(PoiContext);
  if (!context) {
    throw new Error('usePoi must be used within a PoiProvider');
  }
  return context;
};

export const PoiProvider = ({ children }) => {
  const { accessToken } = useAuth();

  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPoiModal, setShowPoiModal] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poiName, setPoiName] = useState('');
  const [poiDescription, setPoiDescription] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPois = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const pois = await response.json();
        setPois(pois);
      } else {
        setError('Failed to load POIs');
      }
    } catch (error) {
      console.error('Error loading POIs:', error);
      setError('Error loading POIs');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadPois();
  }, [loadPois]);

  useEffect(() => {
    if (selectedPoi) {
      setPoiName(selectedPoi.name || '');
      setPoiDescription(selectedPoi.description || '');
    } else {
      setPoiName('');
      setPoiDescription('');
    }
  }, [selectedPoi]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleCloseModal = () => {
    setShowPoiModal(false);
    setPoiName('');
    setPoiDescription('');
    setClickedCoords(null);
    setSelectedPoi(null);
  };

  const value = {
    pois,
    setPois,
    loading,
    error,
    loadPois,
    showPoiModal,
    setShowPoiModal,
    clickedCoords,
    setClickedCoords,
    selectedPoi,
    setSelectedPoi,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteClick,
    handleDeleteCancel,
    isUpdating,
    setIsUpdating,
    isDeleting,
    setIsDeleting,
    poiName,
    setPoiName,
    poiDescription,
    setPoiDescription,
    handleCloseModal,
  };

  return <PoiContext.Provider value={value}>{children}</PoiContext.Provider>;
};
