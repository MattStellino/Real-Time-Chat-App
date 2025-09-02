import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AutoComplete } from 'primereact/autocomplete';
import { setSelectedChat, ensureChatInSidebar } from '../actions/chatActions';
import { openOrCreateDM } from '../lib/api';

const TopSearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);

  // --- helpers ---
  const normalizeResponseToArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.users && Array.isArray(data.users)) return data.users;
    if (data?.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  const mapToSuggestions = (arr) =>
    arr
      .filter((u) => (u._id || u.id) !== user?._id) // exclude self
      .map((u) => {
        const id = u._id || u.id;
        const username = u.username || u.name || u.email || 'unknown';
        return {
          ...u,
          id,
          _id: id, // keep _id for your existing code paths
          displayName: username, // used by AutoComplete field + input display
  
        };
      });

  // --- search ---
  const searchUsers = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      if (!user || !token) {
        console.error('[TopSearch] Missing user/token, aborting search.');
        return;
      }

      // cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);

        // Try your existing endpoint first
        let resp = await fetch(
          `http://localhost:5000/api/user/search?query=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            signal: abortControllerRef.current.signal,
          }
        );

        // Fallbacks if your server uses different paths
        if (resp.status === 404) {
          const fallbacks = [
            `http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`,
            `http://localhost:5000/api/users?query=${encodeURIComponent(query)}`,
            `http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`,
          ];
          for (const url of fallbacks) {
            try {
              resp = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal,
              });
              if (resp.ok) break;
            } catch (e) {
              // continue to next fallback
            }
          }
        }

        if (!resp.ok) {
          console.error('[TopSearch] search HTTP error:', resp.status, resp.statusText);
          setSuggestions([]);
          return;
        }

        const data = await resp.json();
        const arr = normalizeResponseToArray(data);
        const formatted = mapToSuggestions(arr);
        setSuggestions(formatted);
        // Optional: quick visibility log
        // console.debug('[TopSearch] results:', formatted.length);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('[TopSearch] search error:', err);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [token, user]
  );

  const handleSearch = (e) => {
    const q = e.query ?? '';
    setSearchValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(q), 300);
  };

  // --- selection: IMPORTANT: e.value is the selected item ---
  const handleSelect = async (e) => {

    const selected = e?.value;
    const selectedId = selected?._id || selected?.id;

    

    if (!selectedId) {
      console.error('[TopSearch] Invalid selection payload:', e);
      return;
    }
    if (user && selectedId === user._id) {
      
      return;
    }

    try {
      
      const chat = await openOrCreateDM(selectedId, token, chats);
      
      
      if (!chat || !(chat._id || chat.id)) {
        console.error('[TopSearch] openOrCreateDM returned invalid chat:', chat);
        return;
      }

      // Ensure chat is visible in sidebar before selecting
      
      dispatch(ensureChatInSidebar(chat));

      // Select chat
      
      dispatch(setSelectedChat(chat));

      // Clear and close
      setSearchValue('');
      setSuggestions([]);
      
    } catch (error) {
      console.error('[TopSearch] Error opening/creating DM:', error);
    }
  };

  const itemTemplate = (u) => {
    if (!u) return null;
    const initial = (u.displayName || '?').charAt(0).toUpperCase();
    return (
      <div className="search-result-item">
        <div className="search-result-avatar">{initial}</div>
        <div className="search-result-info">
          <div className="search-result-name">{u.displayName || 'Unknown User'}</div>
          <div className="search-result-handle">@{u.username || u.displayName || 'unknown'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="top-search">
      <AutoComplete
        value={searchValue}
        suggestions={suggestions}
        completeMethod={handleSearch}
        onChange={(e) => setSearchValue(e.value)}
        onSelect={handleSelect}   // <-- important
        itemTemplate={itemTemplate}
        field="displayName"                       // <-- important
        placeholder="Search users..."
        className="top-search-autocomplete"
        inputClassName="top-search-input"
        panelClassName="top-search-panel"
        loading={loading}
        loadingIcon="pi pi-spinner pi-spin"
        emptyMessage="No users found."
        forceSelection={false}
        dropdown={false}
        showClear={false}
        appendTo={document.body}
        style={{ width: '100%' }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setSearchValue('');
            setSuggestions([]);
          }
          e.stopPropagation();
        }}
        onKeyPress={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      />

    </div>
  );
};

export default TopSearch;
