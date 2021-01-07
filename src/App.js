import React from "react";
import "./styles.css";
import { Dropdown, List, Image, Loader } from "semantic-ui-react";
const sorted = [
  { key: 1, text: "Score", value: "score" },
  { key: 2, text: "Comments", value: "num_comments" },
  { key: 3, text: "Time", value: "created_utc" }
];
const order = [
  { key: 1, text: "Ascendent", value: "asc" },
  { key: 2, text: "Descendent", value: "desc" }
];
class AppList extends React.Component {
  state = {
    entries: [],
    loading: false
  };
  _order = order[0].value;
  _sorted = sorted[0].value;
  _subreddit = "music";
  _date = new Date();
  setOrder = (value) => (this._order = value);
  setSort = (value) => (this._sorted = value);
  setSubreddit = (value) => (this._subreddit = value);
  setDate(value) {
    var newDate = new Date(value);
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    if (newDate > currentDate) {
      newDate = currentDate;
    }
    this._date = newDate;
  }
  search() {
    this.setDate(this._date.getTime());
    var nextDay = new Date(this._date.getTime());
    nextDay.setDate(nextDay.getDate() + 1);
    var __date = (this._date.getTime() / 1000).toFixed(0);
    var __nexDate = (nextDay.getTime() / 1000).toFixed(0);
    var link =
      "https://api.pushshift.io/reddit/submission/search/?after=" +
      __date +
      "&before=" +
      __nexDate +
      "&sort_type=" +
      this._sorted +
      "&sort=" +
      this._order +
      "&size=100&subreddit=" +
      this._subreddit;
    console.log(link);
    this.setState({
      loading: true
    });
    fetch(link)
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          loading: false,
          entries: data["data"]
        })
      );
  }
  displayListPosts = () =>
    this.state.entries.map((el, i) => (
      // Maybe, there is a better key :D
      <List.Item key={el["id"]} style={{ margin: 10 }} target="_blank">
        {el["preview"] !== undefined &&
          el["preview"]["images"] !== undefined &&
          el["preview"]["images"][0]["source"] !== undefined && (
            <Image
              style={{ height: "60px" }}
              src={el["preview"]["images"][0]["source"]["url"].replace(
                "amp;s",
                "s"
              )}
            />
          )}
        <List.Content>
          <List.Header as="a" href={el["full_link"]}>
            {el["title"]}
          </List.Header>
          <List.Description>{el["selftext"]}</List.Description>
          <List.Description>
            {new Date(parseInt(el["created_utc"], 10) * 1000)
              .toISOString()
              .substr(0, 16)
              .replace("T", " ")}{" "}
            • [
            <a href={"https://www.reddit.com/user/" + el["author"]}>
              {el["author"]}
            </a>
            ] • [<a href={el["url"]}>{el["domain"]}</a>]
          </List.Description>
        </List.Content>
      </List.Item>
    ));
  render() {
    return this.state.loading ? (
      <Loader active inline="centered" />
    ) : (
      <List animated celled verticalAlign="middle" align="start">
        {this.displayListPosts()}
      </List>
    );
  }
}

class MainView extends React.Component {
  constructor(props) {
    super(props);
    var curr = new Date();
    curr.setDate(curr.getDate() - 1);
    this.date = curr.toISOString().substr(0, 10);
    this.myRef = React.createRef();
  }
  render() {
    return (
      <div className="App">
        <h5 style={{ margin: 20 }}>Search by date:</h5>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridGap: 20,
            margin: 20
          }}
        >
          <input
            type="date"
            defaultValue={this.date}
            className="form-control"
            onChange={(event) => this.myRef.current.setDate(event.target.value)}
          />
          <Dropdown
            header="Sort by:"
            onChange={(e, { value }) => this.myRef.current.setSort(value)}
            selection
            options={sorted}
            placeholder="Choose an option"
            defaultValue={sorted[0].value}
          />
          <Dropdown
            header="Order:"
            onChange={(e, { value }) => this.myRef.current.setOrder(value)}
            selection
            options={order}
            placeholder="Choose an option"
            defaultValue={order[0].value}
          />
        </div>
        <h5>Subreddit: (Ex: music)</h5>
        <div className="input-group">
          <input
            type="text"
            placeholder="Subreddit"
            onChange={(event) =>
              this.myRef.current.setSubreddit(event.target.value)
            }
          />
          <button
            onClick={() => this.myRef.current.search()}
            className="input-group-addon"
          >
            Search
          </button>
        </div>
        <div
          className="content"
          style={{
            width: "100%",
            height: "100%"
          }}
        >
          <AppList ref={this.myRef} />
        </div>
      </div>
    );
  }
}

export default function App() {
  return <MainView />;
}
