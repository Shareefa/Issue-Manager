import React, { Component } from "react";
import { Menu, Icon, Input, Form } from "semantic-ui-react";
import SprintDropDown from "../SprintDropDown/SprintDropDown";

import { setStatus, setBlocked } from "../../utils/api/api";
import { networkInterfaces } from "os";

class Status extends Component {
  state = {
    status: null,
    blocked: false
  };

  componentWillReceiveProps(nextProps) {
    const { status, blocked } = nextProps;
    this.setState({
      status: status,
      blocked: blocked
    });
  }

  componentDidMount() {
    const { status, blocked } = this.props;
    this.setState({
      status: status,
      blocked: blocked
    });
  }

  handleItemClick = (e, { name }) => {
    const { issueId } = this.props;
    this.setState({ status: name });
    setStatus(issueId, name);
  };

  handleBlock = () => {
    const { issueId } = this.props;
    const { blocked } = this.state;
    this.setState({ blocked: !blocked });
    setBlocked(issueId, !blocked);
  };

  render() {
    const { status, blocked } = this.state;

    return (
      <Menu icon="labeled" compact size="mini">
        <Menu.Item
          name="In queue"
          active={status === "In queue"}
          onClick={this.handleItemClick}
        >
          <Icon name="clock" />
        </Menu.Item>

        <Menu.Item
          name="In progress"
          active={status === "In progress"}
          onClick={this.handleItemClick}
        >
          <Icon name="play" />
        </Menu.Item>
        <Menu.Item
          name="Paused"
          active={status === "Paused"}
          onClick={this.handleItemClick}
        >
          <Icon name="pause" />
        </Menu.Item>

        <Menu.Item
          name="Done"
          active={status === "Done"}
          onClick={this.handleItemClick}
        >
          <Icon name="check" />
        </Menu.Item>
        <Menu.Item name="block" active={blocked} onClick={this.handleBlock}>
          <Icon name="ban" />
        </Menu.Item>
      </Menu>
    );
  }
}

export default Status;