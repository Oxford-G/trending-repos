import './App.css';
import React from 'react';

const welcome = {
  greetings: "Hey",
  name: "React"
}

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [value, key])

  return [value, setValue];
}

function App() {

  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    localStorage.setItem('search', event.target.value);
    };

  const searchedStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="App">
      <h1>My Hacker Stories</h1>
      
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
        type="text"
        isFocused
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr/>

      <List stories={searchedStories}/>
    </div>
  );
}

function List({stories}) {
  return (
    <ul>
      {stories.map(function (item) {
        return (
          <Item key={item.objectID} item={item} />
        );
      })}
    </ul>
  );
}

const Item = ({item} ) => (
  <li>
  <span>
  <a href={item.url}>{item.title}</a>
  </span>
  <span>{item.author}</span>
  <span>{item.num_comments}</span>
  <span>{item.points}</span>
  </li>
  );

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

export default App;
