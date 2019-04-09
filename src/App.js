import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import {
  PATH_BASE,
  PATH_SEARCH,
  PARAMS_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
  DEFAULT_QUERY,
  DEFAULT_HPP,
} from './constants';
import './App.css';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
  const updatedHits = [ ...oldHits, ...hits ];
  return {
    results: {
      ...results,
      [searchKey]: { hits: updatedHits, page }
    },
    isLoading: false
  };
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAMS_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    fetch(url)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        this.setSearchTopStories(result);
      })
      .catch(e => this.setState({ error: e }));
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    // this.setState(prevState => {
    //   const { searchKey, results } = prevState;
    //   const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    //   const updatedHits = [ ...oldHits, ...hits ];

    //   return {
    //     results: {
    //       ...results,
    //       [searchKey]: { hits: updatedHits, page }
    //     },
    //     isLoading: false
    //   };
    // });
    this.setState(updateSearchTopStoriesState(hits, page));
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const updatedHits = hits.filter(item => item.objectID !== id);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  render() {
    const {
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
    } = this.state;
    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            搜索
          </Search>
        </div>
        { error ?
          <div className="interactions">
            <p>{error}</p>
          </div> :
          <Table
            list={list}
            onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          { isLoading
            ? <Loading />
            : <ButtonWithLoading
                isLoading={isLoading}
                onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
              >
                More
              </ButtonWithLoading>
          }
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">{children}</button>
  </form>

// class Search extends Component {
//   render() {
//     const { value, onChange, onSubmit, children } = this.props;
//     return (
//       <form onSubmit={onSubmit}>
//         <input
//           type="text"
//           value={value}
//           onChange={onChange}
//           ref={(node) => { this.input = node; }}
//         />
//         <button type="submit">{children}</button>
//       </form>
//     );
//   }

//   componentDidMount() {
//     if (this.input) {
//       this.input.focus();
//     }
//   }
// }

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// const Table = ({ list, sortKey, isSortReverse, onSort, onDismiss }) => {
//   const sortedList = SORTS[sortKey](list);
//   const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
//   return (
//     <div className="table">
//       <div className="table-header">
//         <span style={{ width: '5%' }}>序号</span>
//         <span style={{ width: '40%' }}>
//           <Sort
//             sortKey={'TITLE'}
//             activeSortKey={sortKey}
//             isSortReverse={isSortReverse}
//             onSort={onSort}>
//             标题
//           </Sort>
//         </span>
//         <span style={{ width: '25%' }}>
//           <Sort
//             sortKey={'AUTHOR'}
//             activeSortKey={sortKey}
//             isSortReverse={isSortReverse}
//             onSort={onSort}>
//             作者
//           </Sort>
//         </span>
//         <span style={{ width: '10%' }}>
//           <Sort
//             sortKey={'COMMENTS'}
//             activeSortKey={sortKey}
//             isSortReverse={isSortReverse}
//             onSort={onSort}>
//             评论
//           </Sort>
//         </span>
//         <span style={{ width: '10%' }}>
//           <Sort
//             sortKey={'POINTS'}
//             activeSortKey={sortKey}
//             isSortReverse={isSortReverse}
//             onSort={onSort}>
//             点赞
//           </Sort>
//         </span>
//         <span style={{ width: '10%' }}>出版社</span>
//       </div>
//       {reverseSortedList.map((item, index) =>
//         <div key={item.objectID} className="table-row">
//           <span style={{ width: '5%' }}>{index + 1}</span>
//           <span style={{ width: '40%' }}>
//             <a href={item.url}>{item.title}</a>
//           </span>
//           <span style={{ width: '25%' }}>{item.author}</span>
//           <span style={{ width: '10%' }}>{item.num_comments}</span>
//           <span style={{ width: '10%' }}>{item.points}</span>
//           <span style={{ width: '10%' }}>
//             <Button
//               className="button-inline"
//               onClick={() => onDismiss(item.objectID)}>
//               Dismiss
//             </Button>
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const { list, onDismiss } = this.props;
    const { sortKey, isSortReverse } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: '5%' }}>序号</span>
          <span style={{ width: '40%' }}>
            <Sort
              sortKey={'TITLE'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}>
              标题
            </Sort>
          </span>
          <span style={{ width: '25%' }}>
            <Sort
              sortKey={'AUTHOR'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}>
              作者
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'COMMENTS'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}>
              评论
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'POINTS'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
              onSort={this.onSort}>
              点赞
            </Sort>
          </span>
          <span style={{ width: '10%' }}>出版社</span>
        </div>
        {reverseSortedList.map((item, index) =>
          <div key={item.objectID} className="table-row">
            <span style={{ width: '5%' }}>{index + 1}</span>
            <span style={{ width: '40%' }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '25%' }}>{item.author}</span>
            <span style={{ width: '10%' }}>{item.num_comments}</span>
            <span style={{ width: '10%' }}>{item.points}</span>
            <span style={{ width: '10%' }}>
              <Button
                className="button-inline"
                onClick={() => onDismiss(item.objectID)}>
                Dismiss
              </Button>
            </span>
          </div>
        )}
      </div>
    );
  }
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const Button = ({ onClick, className, children }) =>
  <button
    type="button"
    className={className}
    onClick={onClick}>
    {children}
  </button>

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const Loading = () =>
  <div>Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, activeSortKey, isSortReverse, onSort, children }) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );
  let icon = '';
  if (sortKey === activeSortKey) {
    icon = isSortReverse ? '↑' : '↓';
  }
  return  (
    <Button
      className={sortClass}
      onClick={() => onSort(sortKey)}>
      {children}
      {icon}
    </Button>
  );
}

// ↓

export default App;
