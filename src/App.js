import './App.css';
import React from 'react';
import axios from 'axios';

const useSemiPersistentState = (key, initialState) => {
  const isMounted = React.useRef(false);

  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {

      isMounted.current = true;

    } else {
        localStorage.setItem(key, value)
    }

  }, [value, key])

  return [value, setValue];
}

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
        data: action.payload,
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
    default:
      throw new Error();
  }
};

// const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const API_ENDPOINT = `https://api.github.com/search/repositories?q=created:>${searchTerm}&sort=stars&order=desc`

function App() {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', '2021-08-13');

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  // const handleSearch = (event) => {
  //   setSearchTerm(event.target.value);
  //   localStorage.setItem('search', event.target.value);
  // };

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,{ data: [], isLoading: false, isError: false });

  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false);

  // const searchedStories = stories.data.filter((story) => 
  //   story.name.toLowerCase().includes(searchTerm.toLowerCase())
  // )
  
  const handleFetchStories = React.useCallback(() => { 
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    // fetch(url)
    //   .then((response) => response.json())
    axios.get(url)
      .then((result) => {
        dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.items,
        });
      })
      .catch(() =>
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  //end of filter state and delete callback

  return (
    <div className="App">
      <h1>My Hacker Stories</h1>
      
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr/>

      {stories.isError && <p>{searchTerm} is not a recognized date/time format. 
        Please provide an ISO 8601 date/time value, such as YYYY-MM-DD.</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
        ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
}

const List = React.memo(({list, onRemoveItem}) => {
  return (
    <ul>
      {list.map((item) =>
        { return (
          <Item key={item.id} item={item} onRemoveItem={onRemoveItem} />
        );
      })}
    </ul>
  );
})

const Item = ({item, onRemoveItem} ) => {

  const handleRemoveItem = () => {
    onRemoveItem(item);
  };

  return (
    <li>
      <span>
      <a href={item.url}>{item.name}</a>
      </span>
      <span>{item.description}</span>
      <span>{item.stargazers_count}</span>
      <span>{item.open_issues}</span>
      <span>{item.login}</span>
      <span>
        <button type="button" onClick={()=>handleRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
  )};

const InputWithLabel = ({id, children, value, onInputChange, isFocused, type}) => {

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      <input id={id} type={type} value={value} onChange={onInputChange} ref={inputRef}/>
    </>
  )
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>

  </form>
);

export default App;
