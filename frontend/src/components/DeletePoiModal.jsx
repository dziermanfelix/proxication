import './Modal.css';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { usePoi } from '../contexts/PoiContext';

const DeletePoiModal = () => {
  const { accessToken } = useAuth();
  const {
    selectedPoi,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteCancel,
    isDeleting,
    setIsDeleting,
    handleCloseModal,
    loadPois,
  } = usePoi();

  const handleDeleteConfirm = async () => {
    if (!selectedPoi || !accessToken) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pois/${selectedPoi.id}/`, {
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

  return (
    <>
      {showDeleteConfirm && selectedPoi && (
        <div className='modal-overlay' onClick={handleDeleteCancel}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h2 className='modal-title'>Delete Point of Interest</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete {selectedPoi.name}? This action cannot be undone.
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
};
export default DeletePoiModal;
