import React, { Component } from "react";
import { Button, Table, Header, Icon, Grid } from "semantic-ui-react";
import TimeAgo from "react-timeago";

import { getTimeLogs, deleteLog } from "../../utils/api/api";

class SprintTable extends Component {
  state = {
    spentLogs: [],
    remainLogs: [],
  };

  componentDidMount() {
    const { sprintId } = this.props;
    console.log(sprintId);
    getTimeLogs(sprintId).then(logs => {
      const spentLogs = logs
        .filter(log => log.time_stat === "time_spent")
        .reverse();
      const remainLogs = logs
        .filter(log => log.time_stat === "time_remaining")
        .reverse();
      this.setState({
        logs,
        spentLogs,
        remainLogs,
      });
    });
  }

  handleDeleteLog = id => {
    const { spentLogs, remainLogs } = this.state;
    deleteLog(id);
    this.setState({
      spentLogs: spentLogs.filter(log => log.id !== id),
      remainLogs: remainLogs.filter(log => log.id !== id),
    });
  };

  renderLog = log => {
    const { id, time_delta, name, created_at } = log;
    return (
      <Table.Row key={id}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell textAlign="center">
          <TimeAgo date={created_at} />
        </Table.Cell>
        <Table.Cell textAlign="center">{time_delta}</Table.Cell>
        <Table.Cell textAlign="center">
          {new Date(created_at).toLocaleString()}
        </Table.Cell>
        <Table.Cell textAlign="center">
          <Button onClick={() => this.handleDeleteLog(id)} icon>
            <Icon name="trash" />
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  };

  renderTable = logs => (
    <Table celled compact fixed size="large">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={3}>Issue</Table.HeaderCell>
          <Table.HeaderCell textAlign="center" width={3}>
            Created
          </Table.HeaderCell>
          <Table.HeaderCell textAlign="center" width={3}>
            Delta
          </Table.HeaderCell>
          <Table.HeaderCell textAlign="center" width={5}>
            Date
          </Table.HeaderCell>
          <Table.HeaderCell textAlign="center" width={2}>
            Delete
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{logs.map(this.renderLog)}</Table.Body>
    </Table>
  );

  render() {
    const { spentLogs, remainLogs } = this.state;
    return (
      <Grid divided columns={2}>
        <Grid.Column>
          <Header as="h3">Time Spent</Header>
          {this.renderTable(spentLogs)}
        </Grid.Column>
        <Grid.Column>
          <Header as="h3">Time Remaining</Header>
          {this.renderTable(remainLogs)}
        </Grid.Column>
      </Grid>
    );
  }
}

export default SprintTable;