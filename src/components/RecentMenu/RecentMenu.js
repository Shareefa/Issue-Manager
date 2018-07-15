import React, { Component } from "react";
import "./RecentMenu.css";
import { Menu, Grid, Button, Modal, Input, Form } from "semantic-ui-react";
import { Link } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

class RecentMenu extends Component {
  renderSprints = sprint => {
    const { selectedSprint } = this.props;
    return (
      <Menu.Item
        content={sprint.name}
        index={sprint.id}
        active={selectedSprint && selectedSprint.name === sprint.name}
        onClick={this.props.handleSprintMenuClick}
        href={`/sprint/${sprint.id}`}
      />
    );
  };

  renderIssue = issue => {
    const { selectedIssue } = this.props;
    return (
      <Menu.Item
        content={issue.name}
        index={issue.issue_id}
        active={selectedIssue && selectedIssue == issue.issue_id}
        onClick={this.props.handleIssueMenuClick}
        href={`/issue/${issue.issue_id}`}
      />
    );
  };

  render() {
    const { sprints, recentIssues } = this.props;

    sprints.sort((a, b) => {
      return new Date(a.start_date) - new Date(b.start_date);
    });

    return (
      <div>
        <Menu vertical>
          <Menu.Item>
            <Menu.Header>Recent Sprints</Menu.Header>

            <Menu.Menu>
              {sprints.slice(0, 3).map(sprint => this.renderSprints(sprint))}
            </Menu.Menu>
          </Menu.Item>
        </Menu>
        <Menu vertical>
          <Menu.Item>
            <Menu.Header>Recent Issues</Menu.Header>

            <Menu.Menu>
              {recentIssues &&
                recentIssues.map(issue => this.renderIssue(issue))}
            </Menu.Menu>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default RecentMenu;