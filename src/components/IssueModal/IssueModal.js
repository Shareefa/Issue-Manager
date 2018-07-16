import React, { Component } from "react";
import "./IssueModal.css";
import { Container, Icon, Button, Modal, Input, Form } from "semantic-ui-react";

import { createIssue } from "../../utils/api/api";
import ProjectDropDown from "../ProjectDropDown/ProjectDropDown";
import SprintDropDown from "../SprintDropDown/SprintDropDown";

class IssueModal extends Component {
  state = {
    name: "",
    timeEstimate: 0,
    projectId: 0,
    sprintId: 0,
    modalOpen: false
  };

  componentWillReceiveProps(nextProps) {
    const { selectedSprint } = nextProps;
    this.setState({
      sprintId: selectedSprint && selectedSprint.id
    });
  }

  handleOpen = () =>
    this.setState({
      modalOpen: true
    });

  handleClose = () =>
    this.setState({
      modalOpen: false
    });

  handleName = (event, { value }) => {
    this.setState({
      name: value
    });
  };

  handleTime = (event, { value }) => {
    this.setState({
      timeEstimate: value
    });
  };

  handleSprintSelect = (event, { value }) => {
    this.setState({
      sprintId: value
    });
  };

  handleProjectSelect = (event, { value }) => {
    this.setState({
      projectId: value
    });
  };

  handleValidate = () => {
    const { name, timeEstimate, sprintId } = this.state;
    return name.length === 0 || timeEstimate === 0 || sprintId === 0;
  };

  handleSubmit = () => {
    const { sprintId, name, timeEstimate, projectId } = this.state;
    const requestObj = {
      sprintId,
      name,
      timeSpent: 0,
      timeEstimate,
      timeRemaining: timeEstimate,
      status: "In queue", //In queue
      blocked: 0, // not blocked
      projectId,
      notes: ""
    };
    createIssue(requestObj);
    this.handleClose();
    this.props.update();
  };

  render() {
    const { modalOpen } = this.state;

    const { sprints, projects, selectedSprint } = this.props;

    return (
      <Modal
        size="mini"
        closeIcon
        centered
        onClose={this.handleClose}
        open={modalOpen}
        trigger={
          <Button icon labelPosition="left" onClick={this.handleOpen} primary>
            <Icon color="red" name="plus" />
            New issue
          </Button>
        }
        className="Modal"
      >
        <Modal.Header textAlign="left">Create Issue</Modal.Header>
        <Container textAlign="left">
          <Form>
            <Form.Field>
              <label>Issue Name</label>
              <Input size="tiny" type="text" onChange={this.handleName} />
            </Form.Field>
            <Form.Field>
              <label>Sprint</label>
              <SprintDropDown
                value={selectedSprint && selectedSprint.id}
                sprints={sprints}
                onChange={this.handleSprintSelect}
              />
            </Form.Field>
            <Form.Field>
              <label>Time Est.</label>
              <Input size="tiny" type="text" onChange={this.handleTime} />
            </Form.Field>
            <Form.Field>
              <label>Project</label>
              <ProjectDropDown
                projects={projects}
                onChange={this.handleProjectSelect}
              />
            </Form.Field>
          </Form>
        </Container>
        <Container textAlign="center">
          <Button
            onClick={this.handleSubmit}
            disabled={this.handleValidate()}
            style={this.padding}
            color="green"
          >
            Create Sprint
          </Button>
        </Container>
      </Modal>
    );
  }
}

export default IssueModal;
