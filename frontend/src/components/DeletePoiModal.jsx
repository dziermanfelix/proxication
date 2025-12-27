import './Modal.css';

const DeletePoiModal = ({ showDeleteConfirm, editingPoi, handleDeleteCancel, handleDeleteConfirm, isDeleting }) => {
  return (
    <>
      {showDeleteConfirm && editingPoi && (
        <div className='modal-overlay' onClick={handleDeleteCancel}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h2 className='modal-title'>Delete Point of Interest</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Are you sure you want to delete {editingPoi.name}? This action cannot be undone.
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
