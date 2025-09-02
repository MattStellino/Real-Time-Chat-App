import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { searchMessages, formatDate } from '../lib/chatUtils';
import { closeSearchInChat } from '../actions/chatActions';

const SearchInChat = ({ chatId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  
  const { messages } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Search when query changes
    if (query.trim()) {
      const searchResults = searchMessages(messages, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, messages]);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeSearchInChat());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dispatch]);

  const handleResultClick = (result) => {
    // Find the message element in the main chat
    const messageElement = document.querySelector(`[data-message-id="${result.messageId}"]`);
    
    if (messageElement) {
      // Scroll to message
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Highlight the message
      setHighlightedMessageId(result.messageId);
      messageElement.classList.add('search-highlight');

      // Remove highlight after 1.5 seconds
      setTimeout(() => {
        messageElement.classList.remove('search-highlight');
        setHighlightedMessageId(null);
      }, 1500);
    }

    // Close search overlay
    dispatch(closeSearchInChat());
  };

  const handleClose = () => {
    dispatch(closeSearchInChat());
  };

  const getSnippet = (result) => {
    const content = result.content || '';
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    const index = contentLower.indexOf(queryLower);
    if (index === -1) return content;

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    
    let snippet = content.slice(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    // Highlight the search term
    const regex = new RegExp(`(${query})`, 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');

    return snippet;
  };

  return (
    <div className="search-in-chat-overlay">
      <div className="search-in-chat-container">
        <div className="search-header">
          <div className="search-input-container">
            <i className="pi pi-search search-icon"></i>
            <InputText
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="search-input"
            />
            {query && (
              <Button
                icon="pi pi-times"
                className="clear-button"
                onClick={() => setQuery('')}
                text
              />
            )}
          </div>
          <Button
            icon="pi pi-times"
            className="close-button"
            onClick={handleClose}
            text
          />
        </div>

        <div className="search-results" ref={resultsRef}>
          {query && results.length === 0 && (
            <div className="no-results">
              <i className="pi pi-search"></i>
              <p>No messages found for "{query}"</p>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="results-header">
              <p>{results.length} message{results.length !== 1 ? 's' : ''} found</p>
            </div>
          )}

          {results.map((result) => (
            <div
              key={result.messageId}
              className={`search-result ${highlightedMessageId === result.messageId ? 'highlighted' : ''}`}
              onClick={() => handleResultClick(result)}
            >
              <div className="result-content">
                <div className="result-snippet">
                  <span dangerouslySetInnerHTML={{ __html: getSnippet(result) }} />
                </div>
                {result.hasAttachments && (
                  <div className="result-attachment">
                    <i className="pi pi-paperclip"></i>
                    <span>Attachment</span>
                  </div>
                )}
              </div>
              <div className="result-meta">
                <span className="result-sender">
                  {result.sender?.username || 'Unknown'}
                </span>
                <span className="result-timestamp">
                  {formatDate(result.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!query && (
          <div className="search-placeholder">
            <i className="pi pi-search"></i>
            <p>Search messages in this chat</p>
            <small>Type to find messages, attachments, or media</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInChat;
