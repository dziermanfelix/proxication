import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import './Modal.css';
import DeletePoiModal from './DeletePoiModal';

const CreatePoiModal = ({ clickedCoords, setClickedCoords, editingPoi, setEditingPoi, loadPois, setShowModal }) => {
  const { accessToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [poiName, setPoiName] = useState('');
  const [poiDescription, setPoiDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = editingPoi !== null;
  const isLoading = isCreating || isUpdating || isDeleting;

  useEffect(() => {
    if (editingPoi) {
      setPoiName(editingPoi.name || '');
      setPoiDescription(editingPoi.description || '');
    } else {
      setPoiName('');
      setPoiDescription('');
    }
  }, [editingPoi]);

  const handleCloseModal = () => {
    setShowModal(false);
    setPoiName('');
    setPoiDescription('');
    setClickedCoords(null);
    setEditingPoi(null);
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

  const handleUpdatePOI = async (e) => {
    e.preventDefault();
    if (!poiName.trim() || !editingPoi || !accessToken) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${editingPoi.id}/`, {
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

  const handleDeleteConfirm = async () => {
    if (!editingPoi || !accessToken) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${editingPoi.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok || response.status === 204) {
        await loadPois();
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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
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
                <button type='button' onClick={handleDeleteClick} disabled={isLoading} className='btn btn-danger btn-delete'>
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

      <DeletePoiModal
        showDeleteConfirm={showDeleteConfirm}
        editingPoi={editingPoi}
        handleDeleteCancel={handleDeleteCancel}
        handleDeleteConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};
export default CreatePoiModal;
