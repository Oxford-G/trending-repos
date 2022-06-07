import './App.css';
import React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
          // state.page === 0
          //   ? action.payload
          //   : state.data.concat(action.payload),
        // page: action.payload.page,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
        (story) => action.payload.id !== story.id
        ),
      };
    case 'UPDATE_PAGE':
      return {
        ...state,
        page: state.page + 1
      };
    default:
      throw new Error();
  }
};

 const API_ENDPOINT = "https://api.github.com/search/repositories?q=created:>2021-08-13&sort=stars&order=desc"
 const API_BASE = 'https://api.github.com/search/repositories';
 const PARAM_SEARCH = 'q=created:>';
 const API_SORT = 'sort=stars';
 const PARAM_ORDER = 'order=desc';
 const PARAM_PAGE = 'page=';


 const getUrl = (searchTerm, page) =>
  `${API_BASE}?${PARAM_SEARCH}${searchTerm}&${API_SORT}&${PARAM_ORDER}&${PARAM_PAGE}${page}`;

 const getInUrl = (searchTerm) => 
  `${API_BASE}?${PARAM_SEARCH}${searchTerm}&${API_SORT}&${PARAM_ORDER}`

  const extractSearchTerm = (url) => url.substring(url.indexOf('>') + 1, url.indexOf('3') + 1)

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    '2021-08-13'
  );
  
  const [url, setUrl] = React.useState(API_ENDPOINT);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.items,
        // payload: {
        //   list: result.data.items,
          // page: result.data.page,
        // },
      });
    } catch {
      dispatchStories({ 
        type: 'STORIES_FETCH_FAILURE'
      });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(getInUrl(searchTerm));

    event.preventDefault();
  };

  const handleMore = () => {
    dispatchStories({ type: 'UPDATE_PAGE' });
    const lastSearchTerm = extractSearchTerm(url);
    const urls = getUrl(lastSearchTerm, stories.page + 1);
    setUrl(urls);
  };

  return (
    <div>
       <nav>TRENDING REPOS</nav>
      <div className='container'>
        <h1>My Github Trending repos</h1>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit}
        />

        <hr />

        {stories.isError ? (
          <p className='error'>The input is not a recognized date/time format. 
            Please provide an ISO 8601 date/time value, such as YYYY-MM-DD.</p>
          ) : (
          <List list={stories.data} onRemoveItem={handleRemoveStory} />
          ) }
        
        {stories.isLoading ? (
          <p className='loading'>Loading ...</p>
        ) : (
        <button type="button" onClick={handleMore} className='page'>
          More
        </button>
        )}    
      </div>
    </div>
  );
}

const SORTS = {
  NONE: (list) => list,
  NAME: (list) => sortBy(list, 'name'),
  STAR: (list) => sortBy(list, 'stargazers_count'),
  ISSUES: (list) => sortBy(list, 'open_issues'),
};

const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState(
    {sortKey: 'NONE',
    isReverse: false,}
  );

  const handleSort = (sortKey) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey: sortKey, isReverse: isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    
    <ul>
      <li className="sort_container">
        <span className="sort_by">SORT BY</span>
        <span className="sort_name">
          <button type="button" onClick={() => handleSort('NAME')}>
            NAME
          </button>
        </span>
        <span className="sort_star">
          <button type="button" onClick={() => handleSort('STAR')}>
            STAR
          </button>
        </span>
        <span className="sort_issues">
          <button type="button" onClick={() => handleSort('ISSUES')}>
            ISSUES
          </button>
        </span>
        <span className="sort_action">Actions</span>
      </li>

      {sortedList.map((item) => (
        <Item
          key={item.id}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </ul>
  );
};

const Item = ({ item, onRemoveItem }) => (
  <li className="profile">

    <span className="image">
      <img src={item.owner.avatar_url} alt="avartar"/>
    </span>

    <span className="text_body">
      <span className="name">
        <a href={item.url}>{item.name}</a>
      </span>
      <span className="description">{item.description}</span>
      <span className="star">Stars: {item.stargazers_count}</span>
      <span className="issues">Issues: {item.open_issues}</span>
      <span className="login">Submitted by {item.owner.login}</span>
    </span>

    <span className="button">
      <button type="button" onClick={() => onRemoveItem(item)}>
        Delete
      </button>
    </span>
  </li>
);

  const InputWithLabel = ({
    id,
    value,
    type = 'text',
    onInputChange,
    isFocused,
    children,
  }) => {
    const inputRef = React.useRef();
  
    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused]);
  
    return (
      <>
        <label htmlFor={id}>{children}</label>
        &nbsp;
        <input
          id={id}
          ref={inputRef}
          type={type}
          value={value}
          onChange={onInputChange}
          placeholder="YYYY-MM-DD"
        />
      </>
    );
  };

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search By Date:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>

  </form>
);

export default App;
