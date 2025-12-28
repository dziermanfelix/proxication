import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoi } from '../contexts/PoiContext';
import { API_BASE_URL } from '../config';
import './Modal.css';

const CreatePoiModal = () => {
  const { accessToken } = useAuth();
  const {
    showPoiModal,
    selectedPoi,
    clickedCoords,
    handleDeleteClick,
    isUpdating,
    isDeleting,
    handleCloseModal,
    poiName,
    setPoiName,
    poiDescription,
    setPoiDescription,
    setIsUpdating,
    loadPois,
  } = usePoi();
  const [isCreating, setIsCreating] = useState(false);
  const isEditMode = selectedPoi !== null;
  const isLoading = isCreating || isUpdating || isDeleting;

  const handleCreatePoi = async (e) => {
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
        const newPoi = await response.json();
        await loadPois();
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

  const handleUpdatePoi = async (e) => {
    e.preventDefault();
    if (!poiName.trim() || !selectedPoi || !accessToken) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${selectedPoi.id}/`, {
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
        const updatedPoi = await response.json();
        await loadPois();
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

  return (
    <>
      {showPoiModal && (
        <div className='modal-overlay' onClick={handleCloseModal}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h2 className='modal-title'>{isEditMode ? 'Update Point of Interest' : 'Create Point of Interest'}</h2>
            <form onSubmit={isEditMode ? handleUpdatePoi : handleCreatePoi} className='modal-form'>
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
                  <button
                    type='button'
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    className='btn btn-danger btn-delete'
                  >
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
    </>
  );
};
export default CreatePoiModal;
