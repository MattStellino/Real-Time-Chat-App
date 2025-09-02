import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { closeEditContact, updateContactAlias } from '../actions/chatActions';

const EditContactModal = ({ chatId }) => {
  const [displayName, setDisplayName] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const displayNameRef = useRef(null);

  useEffect(() => {
    // Focus input when component mounts
    if (displayNameRef.current) {
      displayNameRef.current.focus();
    }

    // Load existing data
    if (selectedChat) {
      setDisplayName(selectedChat.alias || selectedChat.displayName || '');
      setNote(selectedChat.note || '');
    }
  }, [selectedChat]);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeEditContact());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    } else if (displayName.trim().length > 40) {
      newErrors.displayName = 'Display name must be less than 40 characters';
    }

    if (note.trim().length > 200) {
      newErrors.note = 'Note must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await dispatch(updateContactAlias(chatId, {
        alias: displayName.trim(),
        note: note.trim()
      })).unwrap();

      dispatch(closeEditContact());
    } catch (error) {
      console.error('Failed to update contact:', error);
      setErrors({ general: 'Failed to update contact. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(closeEditContact());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  if (!selectedChat || selectedChat.isGroupChat) {
    return null;
  }

  const otherUser = selectedChat.users?.find(user => user._id !== selectedChat.sender?._id);

  return (
    <div className="edit-contact-overlay">
      <div className="edit-contact-container">
        <div className="edit-contact-header">
          <h2>Edit Contact</h2>
          <Button
            icon="pi pi-times"
            className="close-button"
            onClick={handleCancel}
            text
          />
        </div>

        <div className="edit-contact-content">
          <div className="contact-info">
            <div className="contact-avatar">
              {otherUser?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="contact-details">
              <h3>{otherUser?.username || 'Unknown User'}</h3>
              <p>{otherUser?.email || ''}</p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                Display Name
              </label>
              <InputText
                ref={displayNameRef}
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`form-input ${errors.displayName ? 'p-invalid' : ''}`}
                placeholder="Enter display name"
                onKeyPress={handleKeyPress}
              />
              {errors.displayName && (
                <small className="form-error">{errors.displayName}</small>
              )}
              <small className="form-help">
                This name will be shown in your chat list and messages
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="note" className="form-label">
                Note (Optional)
              </label>
              <InputTextarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`form-input ${errors.note ? 'p-invalid' : ''}`}
                placeholder="Add a note about this contact..."
                rows={3}
                maxLength={200}
              />
              <small className="form-help">
                {note.length}/200 characters
              </small>
              {errors.note && (
                <small className="form-error">{errors.note}</small>
              )}
            </div>

            {errors.general && (
              <div className="form-error-general">
                {errors.general}
              </div>
            )}
          </div>
        </div>

        <div className="edit-contact-footer">
          <Button
            label="Cancel"
            onClick={handleCancel}
            className="cancel-button"
            severity="secondary"
          />
          <Button
            label="Save"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
            className="save-button"
          />
        </div>
      </div>
    </div>
  );
};

export default EditContactModal;
