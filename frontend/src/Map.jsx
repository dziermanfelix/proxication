import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from './config';
import './Map.css';

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [poiName, setPoiName] = useState('');
  const [poiDescription, setPoiDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPOI, setEditingPOI] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    map.current.on('click', (e) => {
      setEditingPOI(null);
      setClickedCoords([e.lngLat.lng, e.lngLat.lat]);
      setShowModal(true);
    });

    loadPOIs();
  }, []);

  useEffect(() => {
    if (accessToken && map.current) {
      loadPOIs();
    }
  }, [accessToken]);

  const handleEditPOI = (poi) => {
    setEditingPOI(poi);
    setPoiName(poi.name);
    setPoiDescription(poi.description || '');
    setClickedCoords([parseFloat(poi.longitude), parseFloat(poi.latitude)]);
    setShowModal(true);
  };

  const displayPOIs = (pois) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pois.forEach((poi) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'poi-marker';
      markerElement.title = poi.name;
      markerElement.dataset.poiId = poi.id;
      markerElement.dataset.poiData = JSON.stringify(poi);

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const poiData = JSON.parse(markerElement.dataset.poiData);
        handleEditPOI(poiData);
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([parseFloat(poi.longitude), parseFloat(poi.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="poi-popup">
                <h3 class="poi-popup-title">${poi.name}</h3>
                ${poi.description ? `<p class="poi-popup-description">${poi.description}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  };

  const loadPOIs = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pois/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const pois = await response.json();
        displayPOIs(pois);
      }
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  const handleCreatePOI = async (e) => {
    e.preventDefault();
    if (!poiName.trim() || !clickedCoords || !accessToken) return;

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: poiName.trim(),
          description: poiDescription.trim() || '',
          latitude: parseFloat(clickedCoords[1].toFixed(6)),
          longitude: parseFloat(clickedCoords[0].toFixed(6)),
        }),
      });

      if (response.ok) {
        const newPOI = await response.json();
        await loadPOIs();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error creating POI: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error creating POI:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePOI = async (e) => {
    e.preventDefault();
    if (!poiName.trim() || !editingPOI || !accessToken) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${editingPOI.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: poiName.trim(),
          description: poiDescription.trim() || '',
          latitude: parseFloat(clickedCoords[1].toFixed(6)),
          longitude: parseFloat(clickedCoords[0].toFixed(6)),
        }),
      });

      if (response.ok) {
        const updatedPOI = await response.json();
        await loadPOIs();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error updating POI: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error updating POI:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingPOI || !accessToken) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${editingPOI.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok || response.status === 204) {
        await loadPOIs();
        setShowDeleteConfirm(false);
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error deleting POI: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error deleting POI:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPoiName('');
    setPoiDescription('');
    setClickedCoords(null);
    setEditingPOI(null);
  };

  const isEditMode = editingPOI !== null;
  const isLoading = isCreating || isUpdating || isDeleting;

  return (
    <>
      <div ref={mapContainer} className='map-container' />

      {showModal && (
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h2 className='modal-title'>{isEditMode ? 'Update Point of Interest' : 'Create Point of Interest'}</h2>
            <form onSubmit={isEditMode ? handleUpdatePOI : handleCreatePOI} className='modal-form'>
              <div className='form-group'>
                <label htmlFor='poi-name' className='form-label'>
                  Name *
                </label>
                <input
                  id='poi-name'
                  type='text'
                  value={poiName}
                  onChange={(e) => setPoiName(e.target.value)}
                  required
                  className='form-input'
                  autoFocus
                />
              </div>
              <div className='form-group'>
                <label htmlFor='poi-description' className='form-label'>
                  Description
                </label>
                <textarea
                  id='poi-description'
                  value={poiDescription}
                  onChange={(e) => setPoiDescription(e.target.value)}
                  rows={3}
                  className='form-textarea'
                />
              </div>
              <div className='coordinates-info'>
                Coordinates: {clickedCoords?.[1]?.toFixed(6)}, {clickedCoords?.[0]?.toFixed(6)}
              </div>
              <div className='modal-actions'>
                {isEditMode && (
                  <button type='button' onClick={handleDeleteClick} disabled={isLoading} className='btn btn-danger'>
                    Delete
                  </button>
                )}
                <button type='button' onClick={handleCloseModal} disabled={isLoading} className='btn btn-secondary'>
                  Cancel
                </button>
                <button type='submit' disabled={isLoading || !poiName.trim()} className='btn btn-primary'>
                  {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update POI' : 'Create POI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && editingPOI && (
        <div className='modal-overlay' onClick={handleDeleteCancel}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h2 className='modal-title'>Delete Point of Interest</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete {editingPOI.name}? This action cannot be undone.
            </p>
            <div className='modal-actions'>
              <button type='button' onClick={handleDeleteCancel} disabled={isDeleting} className='btn btn-secondary'>
                Cancel
              </button>
              <button type='button' onClick={handleDeleteConfirm} disabled={isDeleting} className='btn btn-danger'>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Map;
