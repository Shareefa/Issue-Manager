import _ from "lodash";
import React, { Component } from "react";

import { Icon, Button, Form, TextArea, Table, Loader } from "semantic-ui-react";

import Status from "../../Status/Status";
import TimeCounter from "../../TimeCounter/TimeCounter";

import {
  updateIssueNotes,
  updateSprintNotes,
  updateShowNotes,
  updateSprintQuote,
} from "../../../utils/api/api";

const statusMap = {
  "In queue": 1,
  "In progress": 0,
  Paused: 2,
  Done: 3,
};

class IssueDisplay extends Component {
  state = {
    selectedSprint: null,
    issueList: [],
    notes: "",
    showNoteList: {},
    editNoteList: {},
    issueNoteList: {},
    issueStatusList: {},
    totalTimeSpent: 0,
    totalTimeRemaining: 0,
    totalTimeEstimate: 0,
    sortByColumn: null,
    direction: null,
    editQuote: false,
    quote: "",
    displayTimelogs: false,
  };

  componentDidMount() {
    const { selectedSprint, issues } = this.props;
    const showNoteList = {};
    const editNoteList = {};
    const issueNoteList = {};
    issues.map(issue => (showNoteList[issue.id] = !!issue.show_notes));
    issues.map(issue => (editNoteList[issue.id] = false));
    issues.map(issue => (issueNoteList[issue.id] = issue.notes));

    // Issues, note toggle array, summing times for footer
    this.setState(
      {
        selectedSprint,
        issueList: issues,
        showNoteList,
        editNoteList,
        issueNoteList,
        totalTimeEstimate:
          issues.length > 0 &&
          issues.map(i => i.time_estimate).reduce((a, b) => a + b),
        totalTimeSpent:
          issues.length > 0 &&
          issues
            .filter(i => !i.bad)
            .map(i => i.time_spent)
            .reduce((a, b) => a + b),
        totalTimeRemaining:
          issues.length > 0 &&
          issues.map(i => i.time_remaining).reduce((a, b) => a + b),
      },
      this.handleStatusSort
    );
  }

  handleTimeTotals = (timeStat, delta) => {
    if (timeStat === "time_spent") {
      this.setState({
        totalTimeSpent: this.state.totalTimeSpent + delta,
      });
    } else if (timeStat === "time_remaining") {
      this.setState({
        totalTimeRemaining: this.state.totalTimeRemaining + delta,
      });
    } else if (timeStat === "time_estimate") {
      this.setState({
        totalTimeEstimate: this.state.totalTimeEstimate + delta,
      });
    }
  };

  mapProjectId = id => {
    const { projects } = this.props;
    const project = projects.find(proj => proj.id === id);
    return project ? project.name : "";
  };

  mapSprintId = id => {
    const { sprints } = this.props;
    const sprint = sprints.find(spr => spr.id === id);
    return sprint;
  };

  handleStatusSort = () => {
    const { issueList } = this.state;
    this.setState({
      issueList: issueList.sort(
        (a, b) => statusMap[a.status] - statusMap[b.status]
      ),
      direction: "ascending",
      sortByColumn: "status",
    });
  };

  updateStatus = (id, status) => {
    const { issueList } = this.state;
    const idx = issueList.findIndex(issue => issue.id === id);
    issueList[idx].status = status;
    this.setState({
      issueList,
    });
    this.handleStatusSort();
  };

  handleSort = clickedColumn => () => {
    const { sortByColumn, issueList, direction } = this.state;
    if (sortByColumn !== clickedColumn) {
      if (clickedColumn === "status") {
        this.handleStatusSort();
        return;
      }

      if (clickedColumn.includes("time")) {
        this.setState({
          sortByColumn: clickedColumn,
          issueList: _.sortBy(issueList, [clickedColumn]).reverse(),
          direction: "ascending",
        });
        return;
      }

      this.setState({
        sortByColumn: clickedColumn,
        issueList: _.orderBy(
          issueList,
          [user => user.name.toLowerCase()],
          ["asc"]
        ),
        direction: "descending",
      });

      return;
    }

    this.setState({
      issueList: issueList.reverse(),
      direction: direction === "ascending" ? "descending" : "ascending",
    });
  };

  // Resort after status is clicked. Not implementable currently because
  // the state management is handled by the Status component
  handleResort = () => {
    const { sortByColumn, issueList } = this.state;
    if (sortByColumn === "status") {
      this.handleStatusSort();
      return;
    }

    if (sortByColumn.includes("time")) {
      this.setState({
        sortByColumn: sortByColumn,
        issueList: _.sortBy(issueList, [sortByColumn]).reverse(),
        direction: "ascending",
      });
    }

    this.setState({
      sortByColumn: sortByColumn,
      issueList: _.sortBy(issueList, [sortByColumn]),
      direction: "descending",
    });
  };

  handleSprintNotes = (event, { value }) => {
    this.setState({
      notes: value,
    });
  };

  handleIssueNotes = (id, value) => {
    const { issueNoteList } = this.state;
    issueNoteList[id] = value;
    this.setState({
      issueNoteList,
    });
  };

  handleSaveSprintNotes = () => {
    const { notes, selectedSprint } = this.state;
    this.props.saving(true);
    updateSprintNotes(notes, selectedSprint.id).then(res => {
      if (!res || res.status !== "Success") {
        this.props.error("Failed to save notes");
      } else {
        this.props.saving(false);
      }
    });
  };

  handleShowNotes = id => {
    const { showNoteList } = this.state;
    showNoteList[id] = !showNoteList[id];
    this.setState({
      showNoteList,
    });
    updateShowNotes(id, showNoteList[id] ? 1 : 0);
  };

  handleEditNotes = id => {
    const { editNoteList } = this.state;
    editNoteList[id] = !editNoteList[id];
    this.setState({
      editNoteList,
    });
  };

  handleSaveIssueNotes = (id, notes) => {
    this.handleEditNotes(id);
    this.props.saving(true);
    updateIssueNotes(id, notes).then(res => {
      if (!res || res.status !== "Success") {
        this.props.error("Failed to save issue notes");
      } else {
        this.props.saving(false);
      }
    });
  };

  handleSprintQuoteChange = (event, { value }) => {
    this.setState({
      quote: value,
    });
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

  renderIssue = issue => {
    const {
      name,
      id,
      status,
      time_spent,
      time_estimate,
      time_remaining,
      project_id,
      blocked,
      bad,
    } = issue;

    return (
      <Table.Body key={id}>
        <Table.Row>
          <Table.Cell onClick={() => this.handleShowNotes(id)} collapsing>
            {this.renderName(name, id)}
          </Table.Cell>
          <Table.Cell onClick={() => this.handleShowNotes(id)} collapsing>
            {this.mapProjectId(project_id)}
          </Table.Cell>
          <Table.Cell collapsing>
            <Status
              update={this.updateStatus}
              error={this.props.error}
              issueId={id}
              blocked={blocked === "true"}
              status={status}
            />
          </Table.Cell>
          <Table.Cell textAlign="center" collapsing>
            <TimeCounter
              timeTotals={this.handleTimeTotals}
              issueId={id}
              inc={true}
              stat="time_spent"
              time={time_spent}
              bad={bad}
            />
          </Table.Cell>
          <Table.Cell textAlign="center" collapsing>
            <TimeCounter
              timeTotals={this.handleTimeTotals}
              issueId={id}
              inc={false}
              stat="time_remaining"
              time={time_remaining}
              bad={0}
            />
          </Table.Cell>
          <Table.Cell
            onClick={() => this.handleShowNotes(id)}
            textAlign="center"
            collapsing
          >
            {time_estimate}
          </Table.Cell>
        </Table.Row>
        {this.state.showNoteList[id] && (
          <Table.Row>
            <Table.Cell colSpan="6">
              {this.state.editNoteList[id] ? (
                <Form>
                  <TextArea
                    onChange={(event, { value }) =>
                      this.handleIssueNotes(id, value)
                    }
                    style={{
                      minHeight: 350,
                      backgroundColor: "#282828",
                      color: "#BEBEBE",
                    }}
                    placeholder="Issue notes..."
                    value={this.state.issueNoteList[id]}
                  />
                  <Button
                    floated="left"
                    color="red"
                    onClick={() =>
                      this.handleSaveIssueNotes(
                        id,
                        this.state.issueNoteList[id]
                      )
                    }
                  >
                    Save
                  </Button>
                </Form>
              ) : (
                <div
                  onClick={() => this.handleEditNotes(id)}
                  className="linebreak"
                >
                  {this.state.issueNoteList[id] || "Notes: "}
                </div>
              )}
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    );
  };

  render() {
    const { selectedSprint } = this.props;
    const {
      issueList,
      totalTimeSpent,
      totalTimeRemaining,
      totalTimeEstimate,
    } = this.state;

    if (!selectedSprint) {
      return <Loader active inline />;
    }

    return (
      <Table sortable fixed celled size="large" compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell onClick={this.handleSort("name")} width={4}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell onClick={this.handleSort("project_id")} width={3}>
              Project
            </Table.HeaderCell>
            <Table.HeaderCell onClick={this.handleSort("status")} width={6}>
              Status
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={this.handleSort("time_spent")}
              width={2}
              textAlign="center"
            >
              Time Spent
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={this.handleSort("time_remaining")}
              width={2}
            >
              Time Remaining
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={this.handleSort("time_estimate")}
              width={2}
            >
              Time Estimate
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {issueList.map(this.renderIssue)}
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="3" />
            <Table.HeaderCell textAlign="center" colSpan="1">
              {totalTimeSpent}
              {" hours"}
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="center" colSpan="1">
              {totalTimeRemaining}
              {" hours"}
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="center" colSpan="1">
              {totalTimeEstimate}
              {" hours"}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default IssueDisplay;
