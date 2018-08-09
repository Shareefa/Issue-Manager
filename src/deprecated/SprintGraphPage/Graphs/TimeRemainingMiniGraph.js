import React, { Component } from "react";
import { Segment, Loader } from "semantic-ui-react";

import {
  XYPlot,
  XAxis,
  YAxis,
  Hint,
  LineMarkSeries,
  LineSeries
} from "react-vis";

class TimeRemainingMiniGraph extends Component {
  state = {
    timeRemainingProjection: null,
    timeRemainingData: null,
    hoveredNode: null
  };

  componentDidMount() {
    const { logs, sprint, totalTimeEstimate } = this.props;
    if (logs && sprint && totalTimeEstimate) {
      this.constructTimeRemaining(logs, sprint, totalTimeEstimate);
      this.constructProjectedTimeRemaining(sprint, totalTimeEstimate);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { logs, sprint, totalTimeEstimate } = nextProps;
    if (logs && sprint && totalTimeEstimate) {
      this.constructTimeRemaining(logs, sprint, totalTimeEstimate);
      this.constructProjectedTimeRemaining(sprint, totalTimeEstimate);
    }
  }

  constructTimeRemaining = (logs, sprint, totalTimeEstimate) => {
    const timeRemainingData = [];

    const startDate = new Date(sprint.start_date);
    const day = new Date(startDate.getTime());
    day.setDate(startDate.getDate());
    timeRemainingData.push({
      x: day,
      y: totalTimeEstimate
    });

    let total = totalTimeEstimate;
    logs.forEach(log => {
      total = total + log.time_delta;
      const timestamp = new Date(log.created_at);
      timeRemainingData.push({ x: timestamp, y: total });
    });

    this.setState({
      timeRemainingData
    });
  };

  constructProjectedTimeRemaining = (sprint, totalTimeEstimate) => {
    const startDate = new Date(sprint.start_date);
    const dateMap = {
      1: 1,
      2: 8 / 9,
      3: 7 / 9,
      4: 6 / 9,
      5: 5 / 9,
      6: 4 / 9,
      0: 2 / 9
    };

    const projection = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate.getTime());
      day.setDate(startDate.getDate() + i);
      projection.push({
        x: day,
        y: totalTimeEstimate * dateMap[day.getDay()]
      });
    }
    const nextMonday = new Date(startDate.getTime());
    nextMonday.setDate(startDate.getDate() + 7);
    projection.push({
      x: nextMonday,
      y: 0
    });

    this.setState({
      timeRemainingProjection: projection
    });
  };

  render() {
    const {
      hoveredNode,
      timeRemainingProjection,
      timeRemainingData
    } = this.state;

    if (!timeRemainingData || !timeRemainingProjection) {
      return (
        <Loader active inline>
          Loading
        </Loader>
      );
    }

    const lastPoint = timeRemainingData[timeRemainingData.length - 1];

    return (
      <XYPlot width={275} height={225}>
        <LineMarkSeries
          color="white"
          size="3"
          onValueMouseOver={hoveredNode => this.setState({ hoveredNode })}
          onValueMouseOut={() => this.setState({ hoveredNode: null })}
          data={timeRemainingProjection}
        />
        <LineMarkSeries
          color="red"
          size="1"
          onValueMouseOver={hoveredNode => this.setState({ hoveredNode })}
          onValueMouseOut={() => this.setState({ hoveredNode: null })}
          data={timeRemainingData}
        />

        {!hoveredNode ? (
          <Hint
            value={lastPoint}
            align={{ vertical: "bottom", horizontal: "left" }}
          >
            <div
              style={{
                background: "black",
                textAlign: "left",
                padding: "5px",
                borderRadius: "5px"
              }}
            >
              <p>{"Remaining Hours: " + Math.round(lastPoint.y)}</p>
              {"Time: " +
                lastPoint.x.toLocaleTimeString() +
                " on " +
                lastPoint.x.toDateString()}
            </div>
          </Hint>
        ) : null}

        {hoveredNode ? (
          <Hint value={hoveredNode}>
            <div
              style={{
                background: "black",
                textAlign: "left",
                padding: "5px",
                borderRadius: "5px"
              }}
            >
              <p>{"Hours: " + Math.round(hoveredNode.y)}</p>
              {"Time: " +
                hoveredNode.x.toLocaleTimeString() +
                " on " +
                hoveredNode.x.toDateString()}
            </div>
          </Hint>
        ) : null}
      </XYPlot>
    );
  }
}

export default TimeRemainingMiniGraph;