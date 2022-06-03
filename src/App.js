import './App.css';

const welcome = {
  greetings: "Hey",
  name: "React"
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

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    };

  const searchedStories = stories.filter((story) => story.title.includes(searchTerm))

  return (
    <div className="App">
      <h1>My Hacker Stories</h1>
      
      <Search />
      <hr/>

      <List stories={stories}/>
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

const Search = () => {
  const handleChange = (event) => {
    console.log(event);
  };

  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" onChange={handleChange} />
    </div>
  )
}

export default App;
