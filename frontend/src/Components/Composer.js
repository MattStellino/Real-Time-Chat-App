import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chip } from 'primereact/chip';
import { logout } from '../actions/authActions';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../lib/uploadFile';
import { validateFile, getFileType, formatFileSize, MAX_ATTACHMENTS } from '../lib/mimeLimits';
import { makeClientId } from '../lib/clientId';
import './Composer.css';

const Composer = ({ onMessageSent }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const composerRef = useRef(null);

  // Check if any uploads are in progress
  const hasUploadingAttachments = attachments.some(att => att.status === 'uploading');
  const hasValidAttachments = attachments.some(att => att.status === 'done');
  const canSend = (newMessage.trim() || hasValidAttachments) && !isSending && !hasUploadingAttachments;

  // Handle file processing
  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newAttachments = [];
    
    fileArray.forEach(file => {
      // Check if we've reached the limit
      if (attachments.length + newAttachments.length >= MAX_ATTACHMENTS) {
        setError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
        return;
      }
      
      const validation = validateFile(file);
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      if (validation.valid) {
        newAttachments.push({
          localId,
          file,
          status: 'queued',
          progress: 0,
          server: null,
          error: null,
          previewUrl: URL.createObjectURL(file),
          type: getFileType(file)
        });
      } else {
        newAttachments.push({
          localId,
          file,
          status: 'error',
          progress: 0,
          server: null,
          error: validation.reason,
          previewUrl: URL.createObjectURL(file),
          type: getFileType(file)
        });
      }
    });
    
    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      setError('');
    }
  }, [attachments.length]);

  // Upload a single attachment
  const uploadAttachment = useCallback(async (attachment) => {
    if (attachment.status !== 'queued') return;
    
    setAttachments(prev => prev.map(att => 
      att.localId === attachment.localId 
        ? { ...att, status: 'uploading', progress: 0 }
        : att
    ));
    
    const signalRef = { current: null };
    
    try {
      const serverResponse = await uploadFile(attachment.file, {
        onProgress: (progress) => {
          setAttachments(prev => prev.map(att => 
            att.localId === attachment.localId 
              ? { ...att, progress }
              : att
          ));
        },
        token: token, // Pass the token from Redux
        signalRef: signalRef
      });
      
      setAttachments(prev => prev.map(att => 
        att.localId === attachment.localId 
          ? { 
              ...att, 
              status: 'done', 
              progress: 100, 
              server: serverResponse,
              xhrRef: null
            }
          : att
      ));
    } catch (error) {
      setAttachments(prev => prev.map(att => 
        att.localId === attachment.localId 
          ? { 
              ...att, 
              status: 'error', 
              error: error.message,
              xhrRef: null
            }
          : att
      ));
    }
  }, [token]);

  // Start uploading queued attachments
  useEffect(() => {
    const queuedAttachments = attachments.filter(att => att.status === 'queued');
    queuedAttachments.forEach(attachment => {
      uploadAttachment(attachment);
    });
  }, [attachments, uploadAttachment]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    event.target.value = '';
  }, [processFiles]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Handle paste
  const handlePaste = useCallback((e) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Remove attachment
  const removeAttachment = useCallback((localId) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.localId === localId);
      if (attachment && attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter(att => att.localId !== localId);
    });
  }, []);

  // Retry upload
  const retryUpload = useCallback((localId) => {
    setAttachments(prev => prev.map(att => 
      att.localId === localId 
        ? { ...att, status: 'queued', error: null }
        : att
    ));
  }, []);

  // Cancel upload
  const cancelUpload = useCallback((localId) => {
    setAttachments(prev => prev.map(att => {
      if (att.localId === localId && att.xhrRef) {
        att.xhrRef.abort();
      }
      return att.localId === localId 
        ? { ...att, status: 'canceled', xhrRef: null }
        : att;
    }));
  }, []);

  // Send message
  const sendMessage = async (event) => {
    // Handle Enter key press
    if (event && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        await submitMessage();
      }
    }
  };

  const submitMessage = async () => {
    if (!canSend || !selectedChat) return;
    
    const messageToSend = newMessage.trim();
    const validAttachments = attachments.filter(att => att.status === 'done');
    
    // Don't send if no content and no valid attachments
    if (!messageToSend && validAttachments.length === 0) {
      return;
    }
    
    setError('');
    setIsSending(true);
    
    try {
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const clientGeneratedId = makeClientId();
      const requestBody = {
        content: messageToSend,
        chatId: selectedChat._id,
        clientGeneratedId
      };

      // Add attachments if any
      if (validAttachments.length > 0) {
        requestBody.attachments = validAttachments.map(att => {
          return {
            id: att.server.id,
            url: att.server.url,
            type: att.server.type,
            filename: att.server.filename,
            size: att.server.size,
            mimeType: att.server.mimeType
          };
        });
      }

      

      const response = await fetch('http://localhost:5000/api/message', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send the Message';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Clear state after successful send
      setNewMessage('');
      setAttachments([]);
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Send message error:', error);
      
      if (error.message.includes('token') || error.message.includes('Unauthorized')) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => {
          dispatch(logout());
          navigate('/');
        }, 2000);
      } else {
        setError(error.message || 'Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (error) setError('');
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  if (!selectedChat) {
    return null;
  }

  return (
    <div 
      ref={composerRef}
      className={`composer ${isFocused ? 'composer--focused' : ''} ${isDragOver ? 'composer--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="composer__attachments">
          {attachments.map((attachment) => (
            <div key={attachment.localId} className="composer__attachment">
              <div className="composer__attachment-preview">
                {attachment.type === 'image' ? (
                  <img 
                    src={attachment.previewUrl} 
                    alt={attachment.file.name}
                    className="composer__attachment-thumbnail"
                  />
                ) : (
                  <div className="composer__attachment-video">
                    <div className="composer__attachment-video-icon">📹</div>
                    <div className="composer__attachment-video-label">Video</div>
                  </div>
                )}
                
                {/* Progress bar */}
                {attachment.status === 'uploading' && (
                  <div className="composer__attachment-progress">
                    <div 
                      className="composer__attachment-progress-bar"
                      style={{ width: `${attachment.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Error message */}
                {attachment.status === 'error' && (
                  <div className="composer__attachment-error">
                    {attachment.error}
                  </div>
                )}
                
                {/* Actions */}
                <div className="composer__attachment-actions">
                  {attachment.status === 'uploading' && (
                    <Button
                      icon="pi pi-times"
                      className="composer__attachment-action"
                      onClick={() => cancelUpload(attachment.localId)}
                      aria-label="Cancel upload"
                      size="small"
                    />
                  )}
                  
                  {attachment.status === 'error' && (
                    <Button
                      icon="pi pi-refresh"
                      className="composer__attachment-action"
                      onClick={() => retryUpload(attachment.localId)}
                      aria-label="Retry upload"
                      size="small"
                    />
                  )}
                  
                  <Button
                    icon="pi pi-times"
                    className="composer__attachment-action"
                    onClick={() => removeAttachment(attachment.localId)}
                    aria-label="Remove attachment"
                    size="small"
                  />
                </div>
              </div>
              
              <div className="composer__attachment-info">
                <div className="composer__attachment-name">{attachment.file.name}</div>
                <div className="composer__attachment-size">{formatFileSize(attachment.file.size)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="composer__pill">
        <Button 
          type="button" 
          icon="pi pi-paperclip" 
          className="composer__attach"
          onClick={handleAttach}
          aria-label="Attach file"
          tooltip="Attach file"
          tooltipOptions={{ position: 'top' }}
        />
        <InputTextarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={sendMessage}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          autoResize
          rows={1}
          className="composer__input"
          placeholder="Type a message"
          maxLength={1000}
        />
        <Button 
          type="button" 
          icon={isSending ? "pi pi-spinner pi-spin" : "pi pi-send"}
          className="composer__send"
          disabled={!canSend}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            submitMessage();
          }}
          aria-label="Send message"
          tooltip="Send message"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
      
      {/* Status messages */}
      {hasUploadingAttachments && (
        <div className="composer__status">
          Finishing uploads...
        </div>
      )}
      
      {error && (
        <div className="composer__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Composer;