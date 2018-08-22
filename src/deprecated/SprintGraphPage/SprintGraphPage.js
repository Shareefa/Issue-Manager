import React, { Component } from "react";
import { Header, Grid, Divider, Loader } from "semantic-ui-react";

import { getSprint, getTimeLogs } from "../../utils/api";
import TimeRemainingGraph from "./Graphs/TimeRemainingGraph";
import TimeSpentGraph from "./Graphs/TimeSpentGraph";
import DayBarGraph from "./Graphs/DayBarGraph";

// Shows the progress of the sprint through two main graphs
// TimeRemaining and Time Spent
// Also has a small bar graph for time spent on issue per day
class SprintGraphPage extends Component {
  state = {
    selectedSprint: null,
    sprints: null,
  };

  componentDidMount() {
    const { match, sprints } = this.props;
    const sprintId = match.params.id;

    // Use the id from URL to get all timelogs
    getTimeLogs(sprintId).then(logs => {
      this.setState({
        timeSpentLogs: logs.filter(log => log.time_stat === "time_spent"),
        timeRemainingLogs: logs.filter(
          log => log.time_stat === "time_remaining"
        ),
      });
    });

    const selectedSprint = sprints.find(
      sprint => sprint.id === parseInt(sprintId, 10)
    );

    this.setState({
      selectedSprint,
    });

    // Need to call getSprint to get total time estimate for graphs
    getSprint(sprintId).then(issues => {
      this.setState({
        totalTimeEstimate:
          issues.length > 0 &&
          issues.map(i => i.time_estimate).reduce((a, b) => a + b),
        issues,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { match, sprints } = nextProps;

    const sprintId = match.params.id;
    const selectedSprint = sprints.find(
      sprint => sprint.id === parseInt(sprintId, 10)
    );
    // const selectedSprint = sprints.find(sprint => sprint.id == sprintId);

    this.setState({
      selectedSprint,
    });

    getSprint(sprintId).then(issues => {
      this.setState({
        totalTimeEstimate:
          issues.length > 0 &&
          issues.map(i => i.time_estimate).reduce((a, b) => a + b),
      });
    });
  }

  render() {
    const {
      timeRemainingLogs,
      selectedSprint,
      totalTimeEstimate,
      timeSpentLogs,
      issues,
    } = this.state;

    if (
      !timeRemainingLogs ||
      !timeSpentLogs ||
      !totalTimeEstimate ||
      !selectedSprint
    ) {
      return (
        <Loader active inline>
          Loading
        </Loader>
      );
    }

    return (
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Header as="h2">Time Spent</Header>
            <TimeSpentGraph logs={timeSpentLogs} sprint={selectedSprint} />
          </Grid.Column>
          <Grid.Column>
            <Header as="h2">Time Remaining</Header>
            <TimeRemainingGraph
              logs={timeRemainingLogs}
              sprint={selectedSprint}
              totalTimeEstimate={totalTimeEstimate}
            />
          </Grid.Column>
        </Grid.Row>
        <Divider />

        <Grid.Row columns={3}>
          <Grid.Column>
            <Header as="h2">Monday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={1} />
          </Grid.Column>
          <Grid.Column>
            <Header as="h2">Tuesday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={2} />
          </Grid.Column>
          <Grid.Column>
            <Header as="h2">Wednesday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={3} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={3}>
          <Grid.Column>
            <Header as="h2">Thursday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={4} />
          </Grid.Column>
          <Grid.Column>
            <Header as="h2">Friday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={5} />
          </Grid.Column>
          <Grid.Column>
            <Header as="h2">Saturday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={6} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={3}>
          <Grid.Column />
          <Grid.Column>
            <Header as="h2">Sunday</Header>
            <DayBarGraph logs={timeSpentLogs} issues={issues} day={7} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default SprintGraphPage;
