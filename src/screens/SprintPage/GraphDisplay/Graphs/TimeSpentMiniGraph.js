import React, { Component } from "react";
import { Loader } from "semantic-ui-react";
import TimeAgo from "react-timeago";

import { XYPlot, Hint, LineMarkSeries } from "react-vis";

import { getTimeLogs } from "../../../../utils/api";

class TimeSpentMiniGraph extends Component {
  state = {
    timeSpentData: null,
    timeSpentProjection: null,
    hoveredNode: null,
  };

  componentDidMount() {
    const { sprint } = this.props;
    this.onMount(sprint);
  }

  componentDidUpdate(prevProps) {
    const { sprint } = this.props;
    if (sprint != prevProps.sprint) {
      this.onMount(sprint);
    }
  }

  onMount = sprint => {
    sprint &&
      getTimeLogs(sprint.id).then(logs => {
        this.setState(
          {
            logs: logs.filter(log => log.time_stat === "time_spent"),
          },
          () => {
            this.constructTimeSpent();
            this.constructProjectedTimeSpent(sprint);
          }
        );
      });
  };

  constructTimeSpent = () => {
    const { sprint } = this.props;
    const { logs } = this.state;
    const startDate = new Date(sprint.start_date);

    const timeSpentData = [{ x: startDate, y: 0 }];

    let total = 0;
    logs.forEach(log => {
      total = total + log.time_delta;
      const timestamp = new Date(log.created_at);
      timeSpentData.push({
        x: timestamp,
        y: total,
      });
    });

    // Add a projection point for total time spent at the moment
    // Only if current sprint is going on
    const now = new Date();
    const end = new Date(sprint.end_date);
    if (end > now) {
      timeSpentData.push({
        x: new Date(),
        y: total,
      });
    }

    this.setState({
      timeSpentData,
    });
  };

  constructProjectedTimeSpent = () => {
    const { sprint } = this.props;

    const startDate = new Date(sprint.start_date);
    const dateMap = {
      0: 35,
      1: 0,
      2: 5,
      3: 10,
      4: 15,
      5: 20,
      6: 25,
    };

    const projection = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate.getTime());
      day.setDate(startDate.getDate() + i);
      projection.push({
        x: day,
        y: dateMap[day.getDay()],
      });
    }
    const nextMonday = new Date(startDate.getTime());
    nextMonday.setDate(startDate.getDate() + 7);
    projection.push({
      x: nextMonday,
      y: 45,
    });

    this.setState({
      timeSpentProjection: projection,
    });
  };

  render() {
    const { sprint } = this.props;
    const { timeSpentProjection, timeSpentData, hoveredNode } = this.state;

    const currWeek = new Date(sprint.end_date) > new Date();

    if (!timeSpentProjection || !timeSpentData) {
      return (
        <Loader active inline>
          Loading
        </Loader>
      );
    }

    const lastPoint = timeSpentData[timeSpentData.length - 2];

    return (
      <div>
        <XYPlot width={275} height={225}>
          <LineMarkSeries
            color="white"
            size="3"
            onValueMouseOver={hoveredNode => this.setState({ hoveredNode })}
            onValueMouseOut={() => this.setState({ hoveredNode: null })}
            data={timeSpentProjection}
          />
          <LineMarkSeries
            color="red"
            size="1"
            onValueMouseOver={hoveredNode => this.setState({ hoveredNode })}
            onValueMouseOut={() => this.setState({ hoveredNode: null })}
            data={timeSpentData}
          />

          {!hoveredNode ? (
            <Hint
              align={{ vertical: "top", horizontal: "left" }}
              value={lastPoint}
            >
              <div
                style={{
                  background: "black",
                  textAlign: "left",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                <p>{"Hours Spent: " + Math.round(lastPoint.y)}</p>
                {currWeek ? (
                  <TimeAgo date={lastPoint.x} />
                ) : (
                  "Time: " +
                  lastPoint.x.toLocaleTimeString() +
                  " on " +
                  lastPoint.x.toDateString()
                )}
              </div>
            </Hint>
          ) : (
            <Hint value={hoveredNode}>
              <div
                style={{
                  background: "black",
                  textAlign: "left",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                <p>{hoveredNode.y + " hours spent"}</p>
                {"Time: " +
                  hoveredNode.x.toLocaleTimeString() +
                  " on " +
                  hoveredNode.x.toDateString()}
                {/* <TimeAgo date={hoveredNode.x} /> */}
              </div>
            </Hint>
          )}
        </XYPlot>
      </div>
    );
  }
}

export default TimeSpentMiniGraph;
