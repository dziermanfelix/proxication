import { createContext, useContext, useState, useEffect } from 'react';

const PoiContext = createContext(null);

export const usePoi = () => {
  const context = useContext(PoiContext);
  if (!context) {
    throw new Error('usePoi must be used within a PoiProvider');
  }
  return context;
};

export const PoiProvider = ({ children }) => {
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poiName, setPoiName] = useState('');
  const [poiDescription, setPoiDescription] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
