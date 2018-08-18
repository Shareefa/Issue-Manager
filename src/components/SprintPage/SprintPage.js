import React, { Component } from "react";

import "./SprintPage.css";
import {
  Icon,
  Grid,
  Button,
  Form,
  TextArea,
  Header,
  Progress,
  Container,
  Loader,
  Divider,
} from "semantic-ui-react";

import GraphDisplay from "./GraphDisplay/GraphDisplay";
import TimelogDisplay from "./TimelogDisplay/TimelogDisplay";
import IssueDisplay from "./IssueDisplay/IssueDisplay";

import {
  getSprint,
  updateSprintNotes,
  updateSprintQuote,
} from "../../utils/api/api";

class SprintDisplay extends Component {
  state = {
    selectedSprint: null,
    issueList: [],
    displayTimelogs: false,
    displayGraphs: false,
    displayIssues: true,
    notes: "",
    quote: "",
    editQuote: false,
    isSprintNoteSaving: false,
    isSaving: false,
  };

  componentDidMount() {
    const { match, sprints } = this.props;
    this.onMount(match, sprints);
  }

  componentWillReceiveProps(nextProps) {
    const { match, sprints } = nextProps;
    this.onMount(match, sprints);
  }

  onMount = (match, sprints) => {
    const defaultSprint = this.getDefaultSprint(sprints);
    const defaultSprintId = defaultSprint ? defaultSprint.id : null;

    // If the id is part of the url params, use that, otherwise, display default sprint
    const id = match.params.id ? match.params.id : defaultSprintId;

    getSprint(id).then(issues => {
      const selectedSprint = sprints.find(spr => spr.id === parseInt(id, 10));

      // Issues, note toggle array, summing times for footer
      this.setState({
        selectedSprint,
        issueList: issues,
      });

      // SPRINT notes
      this.setState({
        notes: selectedSprint ? selectedSprint.notes : "",
        quote: selectedSprint ? selectedSprint.quote : "",
      });
    });
  };

  getDefaultSprint = sprints => {
    const d = new Date();
    if (d.getDay() !== 1) {
      // Get last monday unless today is Monday
      d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7) - 7);
    }

    const options = { month: "2-digit", day: "2-digit", year: "2-digit" };
    const lastMonday = d.toLocaleDateString("en-US", options);
    return sprints.find(sprint => sprint.start_date === lastMonday);
  };

  handleSprintNotes = (event, { value }) => {
    this.setState({
      notes: value,
    });
  };

  handleSaveSprintNotes = () => {
    const { notes, selectedSprint } = this.state;
    this.setState({ isSprintNoteSaving: true });
    updateSprintNotes(notes, selectedSprint.id).then(res => {
      if (!res || res.status !== "Success") {
        this.props.error("Failed to save notes");
      } else {
        this.setState({ isSprintNoteSaving: false });
      }
    });
  };

  handleSaveSprintQuote = () => {
    const { quote, selectedSprint } = this.state;
    this.toggleEditSprintQuote();
    this.setSaving(true);
    updateSprintQuote(quote, selectedSprint.id).then(res => {
      if (!res || res.status !== "Success") {
        this.props.error("Failed to save quote");
      } else {
        this.setSaving(false);
      }
    });
  };

  setSaving = saveState => {
    this.setState({
      isSaving: saveState,
    });
  };

  handleSprintQuoteChange = (event, { value }) => {
    this.setState({
      quote: value,
    });
  };

  projectedProgress = () => {
    const { selectedSprint } = this.state;
    const now = new Date();
    const sprintEnd = new Date(selectedSprint && selectedSprint.end_date);
    const delta = sprintEnd - now;

    // Sprint has past, so set projected to 100%
    if (delta / 1000 / 3600 / 24 < 0) {
      return 100;
    }

    // 5hrs per weekday, 10 hours per weekend
    const dateMap = {
      1: 5,
      2: 10,
      3: 15,
      4: 20,
      5: 25,
      6: 35,
      0: 45,
    };
    return Math.round((dateMap[new Date().getDay()] / 45) * 100);
  };

  toggleEditSprintQuote = () => {
    this.setState({
      editQuote: !this.state.editQuote,
    });
  };

  renderTextArea = () => {
    return (
      <TextArea
        onChange={this.handleSprintNotes}
        style={{
          minHeight: 350,
          backgroundColor: "#282828",
          color: "#BEBEBE",
          fontSize: 17,
        }}
        placeholder="Sprint notes..."
        value={this.state.notes}
      />
    );
  };

  renderName = (name, id) => (
    <div>
      {name}
      <a href={`/issue/${id}`}>
        <Icon color="red" className="super" name="plus" size="small" />
      </a>
    </div>
  );

  render() {
    const {
      issueList,
      selectedSprint,
      editQuote,
      quote,
      displayTimelogs,
      displayGraphs,
      isSprintNoteSaving,
      isSaving,
    } = this.state;
    const { projects, sprints } = this.props;

    if (!selectedSprint) {
      return <Loader active inline />;
    }

    let display;
    if (displayTimelogs) {
      display = (
        <TimelogDisplay sprintId={selectedSprint && selectedSprint.id} />
      );
    } else if (displayGraphs) {
      display = <GraphDisplay selectedSprint={selectedSprint} />;
    } else {
      display = (
        <IssueDisplay
          issueList={issueList}
          selectedSprint={selectedSprint}
          projects={projects}
          sprints={sprints}
          issues={issueList}
          saving={this.setSaving}
        />
      );
    }

    return (
      <div>
        <Grid verticalAlign="top" columns={2} stretched>
          <Grid.Column textAlign="left" width={4}>
            <Grid.Row>
              <Header floated="left" as="h1">
                {selectedSprint && selectedSprint.name}
                <Header.Subheader>
                  <Icon
                    style={{
                      position: "relative",
                      left: "280px",
                      top: "20px",
                    }}
                    loading={isSaving}
                    name={isSaving ? "redo" : "check"}
                  />
                  {editQuote ? (
                    <div>
                      <TextArea
                        onChange={this.handleSprintQuoteChange}
                        defaultValue={quote}
                      />
                      <Button
                        color="black"
                        floated="right"
                        onClick={this.handleSaveSprintQuote}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Container onClick={this.toggleEditSprintQuote}>
                      {quote || "you idiot"}
                    </Container>
                  )}
                </Header.Subheader>
              </Header>
            </Grid.Row>
            <Divider />
            <Grid.Row>
              <Button
                onClick={() =>
                  this.setState({
                    displayGraphs: false,
                    displayTimelogs: false,
                  })
                }
                color="black"
                floated="left"
              >
                {"Issues"}
              </Button>
              <Button
                onClick={() =>
                  this.setState({ displayGraphs: true, displayTimelogs: false })
                }
                color="black"
                floated="left"
              >
                {"Graphs"}
              </Button>
              <Button
                onClick={() =>
                  this.setState({ displayGraphs: false, displayTimelogs: true })
                }
                color="black"
                floated="left"
              >
                {"Timelogs"}
              </Button>
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={12}>
            <Container>
              {/* <Progress
                percent={Math.round((totalTimeSpent / 45) * 100)}
                progress
                color="black"
                size="small"
                label="Time Spent"
              />
              <Progress
                percent={Math.round(
                  (1 - totalTimeRemaining / totalTimeEstimate) * 100
                )}
                progress
                color="black"
                label="Task Progress"
                size="small"
              />
              <Progress
                percent={this.projectedProgress()}
                progress
                color="black"
                size="small"
                label="Projected"
              /> */}
            </Container>
          </Grid.Column>
        </Grid>

        {display}

        <Form>
          <Form.Field control={this.renderTextArea} label="Sprint Notes" />
        </Form>
        <br />
        <div>
          <Button
            floated="left"
            color="red"
            onClick={this.handleSaveSprintNotes}
          >
            Save notes
          </Button>
          <Icon
            style={{
              position: "relative",
              left: "10px",
              top: "8px",
              float: "left",
            }}
            loading={isSprintNoteSaving}
            name={isSprintNoteSaving ? "redo" : "check"}
          />
        </div>
      </div>
    );
  }
}

export default SprintDisplay;
