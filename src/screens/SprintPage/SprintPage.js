import React, { Component } from "react";
import { connect } from "react-redux";
import { HotKeys } from "react-hotkeys";
import {
  Icon,
  Grid,
  Button,
  Menu,
  TextArea,
  Header,
  Container,
  Loader,
  Divider,
} from "semantic-ui-react";

import GraphDisplay from "./GraphDisplay/GraphDisplay";
import TimelogDisplay from "./TimelogDisplay/TimelogDisplay";
import IssueDisplay from "./IssueDisplay/IssueDisplay";
import ScratchpadDisplay from "./ScratchpadDisplay/ScratchpadDisplay";
import CalendarDisplay from "./CalendarDisplay/CalendarDisplay";
import Editor from "./ScratchpadDisplay/components/Editor/Editor";

import * as CommonActions from "../../commonActions";
import * as Actions from "./sprintPageActions";
import "./SprintPage.css";

import { updateSprintQuote } from "../../utils/api";

class SprintDisplay extends Component {
  state = {
    issueList: [],
    display: "issue",
    quote: "",
    editQuote: false,
    scratchpadPage: null,
  };

  componentDidMount() {
    const { match } = this.props;
    this.props.getSprintIssues(match.params.id);
    this.props.getSprint(match.params.id);
    this.props.getPages();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (prevProps.match.params.id !== match.params.id) {
      this.props.getSprintIssues(match.params.id);
      this.props.getSprint(match.params.id);
    }
  }

  handleSaveSprintQuote = () => {
    const { selectedSprint } = this.props;
    const { quote } = this.state;
    this.toggleEditSprintQuote();
    updateSprintQuote(quote || selectedSprint.quote, selectedSprint.id).then(
      res => {
        if (!res || res.status !== "Success") {
          this.props.error("Failed to save quote");
        }
      }
    );
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

  overrideMousetrap(HotKeys) {
    //define previous stopCallback handler for mousetrap
    HotKeys.__mousetrap__.stopCallback = function(e, element, combo) {
      // if the element has the class "mousetrap" then no need to stop
      if ((" " + element.className + " ").indexOf(" mousetrap ") > -1) {
        return false;
      }
      // stop for input, select, and textarea
      return (
        element.tagName === "INPUT" ||
        element.tagName === "SELECT" ||
        element.tagName === "TEXTAREA" ||
        (element.contentEditable && element.contentEditable === "true")
      );
    };
  }

  keyMap = {
    changeToIssues: "1",
    changeToGraphs: "2",
    changeToTimelogs: "3",
    changeToScratchpad: "4",
    changeToCalendar: "5",
  };

  handlers = {
    changeToIssues: () => this.setState({ display: "issue" }),
    changeToGraphs: () => this.setState({ display: "graph" }),
    changeToTimelogs: () => this.setState({ display: "timelog" }),
    changeToScratchpad: () => this.setState({ display: "scratchpad" }),
    changeToCalendar: () => this.setState({ display: "calendar" }),
  };

  renderName = (name, id) => (
    <div>
      {name}
      <a href={`/issue/${id}`}>
        <Icon color="red" className="super" name="plus" size="small" />
      </a>
    </div>
  );

  renderPageMenu = page => {
    const { scratchpadPage } = this.state;
    return (
      <Menu.Item
        name={page.name}
        active={scratchpadPage && scratchpadPage.id === page.id}
        key={page.id}
        onClick={() => {
          {
            this.setState({ scratchpadPage: page, display: "scratchpad" });
          }
        }}
      />
    );
  };

  render() {
    const { editQuote, quote, display, scratchpadPage } = this.state;
    const {
      projectList,
      sprintList,
      issueList,
      selectedSprint,
      pages,
    } = this.props;

    console.log(scratchpadPage);

    if (!selectedSprint) {
      return <Loader active inline />;
    }

    let displayComponent;
    switch (display) {
      case "graph":
        displayComponent = (
          <GraphDisplay selectedSprint={selectedSprint} issueList={issueList} />
        );
        break;
      case "timelog":
        displayComponent = (
          <TimelogDisplay sprintId={selectedSprint && selectedSprint.id} />
        );
        break;
      case "scratchpad":
        displayComponent = <ScratchpadDisplay selectedPage={scratchpadPage} />;
        break;
      case "calendar":
        displayComponent = <CalendarDisplay />;
        break;
      case "issue":
        displayComponent = (
          <IssueDisplay
            issueList={issueList}
            selectedSprint={selectedSprint}
            projects={projectList}
            sprints={sprintList}
            issues={issueList}
          />
        );
        break;
      default:
        displayComponent = null;
    }

    return (
      <HotKeys
        keyMap={this.keyMap}
        handlers={this.handlers}
        ref={this.overrideMousetrap}
      >
        <div>
          <Grid verticalAlign="top" columns={2} stretched>
            <Grid.Column textAlign="left" width={4}>
              <Grid.Row>
                <Header floated="left" as="h1">
                  {selectedSprint && selectedSprint.name}
                  <Header.Subheader>
                    {editQuote ? (
                      <div>
                        <TextArea
                          onChange={this.handleSprintQuoteChange}
                          defaultValue={quote || selectedSprint.quote}
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
                      <div onClick={this.toggleEditSprintQuote}>
                        {quote || selectedSprint.quote || "no quote"}
                      </div>
                    )}
                  </Header.Subheader>
                </Header>
              </Grid.Row>
            </Grid.Column>
            <Grid.Column width={6}>
              <Menu pointing>
                {pages && pages.map(page => this.renderPageMenu(page))}
                <Menu.Item
                  name="Archive"
                  active={scratchpadPage && scratchpadPage.name === "archive"}
                  key={-1}
                  position="right"
                  onClick={() => {
                    this.setState({
                      scratchpadPage: { name: "archive", id: "archive" },
                    });
                    this.setState({ display: "scratchpad" });
                  }}
                />
              </Menu>
            </Grid.Column>
            <Grid.Column width={6}>
              <Container>
                <Menu pointing compact style={{ float: "right" }}>
                  <Menu.Item
                    name="issue"
                    active={display === "issue"}
                    onClick={() =>
                      this.setState({ display: "issue", scratchpadPage: null })
                    }
                  />
                  <Menu.Item
                    name="graph"
                    active={display === "graph"}
                    onClick={() =>
                      this.setState({ display: "graph", scratchpadPage: null })
                    }
                  />
                  <Menu.Item
                    name="timelog"
                    active={display === "timelog"}
                    onClick={() =>
                      this.setState({
                        display: "timelog",
                        scratchpadPage: null,
                      })
                    }
                  />
                  <Menu.Item
                    name="calendar"
                    active={display === "calendar"}
                    onClick={() =>
                      this.setState({
                        display: "calendar",
                        scratchpadPage: null,
                      })
                    }
                  />
                </Menu>
              </Container>
            </Grid.Column>
          </Grid>
          <Divider />

          {displayComponent}

          <Editor
            sprintScratchpad
            autoSize
            id={selectedSprint.id}
            content={selectedSprint.notes}
          />
        </div>
      </HotKeys>
    );
  }
}
const mapStateToProps = state => ({
  sprintList: state.commonData.sprintList.data,
  issueList: state.commonData.sprintIssues.data,
  selectedSprint: state.commonData.sprint.data && state.commonData.sprint.data,
  projectList: state.commonData.projects.data || [],
  pages: state.sprintPage.pages.data,
});

const mapDispatchToProps = {
  getSprintIssues: CommonActions.getSprintIssues,
  getSprint: CommonActions.getSprint,
  getPages: Actions.getPages,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SprintDisplay);
