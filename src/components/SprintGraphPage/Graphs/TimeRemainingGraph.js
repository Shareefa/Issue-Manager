import React, { Component } from "react";
import { Segment, Loader } from "semantic-ui-react";

import { XYPlot, XAxis, YAxis, Hint, LineMarkSeries } from "react-vis";

class TimeRemainingGraph extends Component {
  state = {
    timeRemainingProjection: null,
    timeRemainingData: null,
    value: null
  };

  constructTimeRemaining = (
    timeRemainingLogs,
    selectedSprint,
    totalTimeEstimate
  ) => {
    const timeRemainingData = [];

    const startDate = new Date(selectedSprint.start_date);
    const day = new Date(startDate.getTime());
    day.setDate(startDate.getDate());
    timeRemainingData.push({
      x: day,
      y: totalTimeEstimate
    });

    let total = totalTimeEstimate;
    timeRemainingLogs.forEach(log => {
      total = total + log.time_delta;
      const timestamp = new Date(log.created_at);
      timeRemainingData.push({ x: timestamp, y: total });
    });

    this.setState({
      timeRemainingData
    });
  };

  constructProjectedTimeRemaining = (selectedSprint, totalTimeEstimate) => {
    const startDate = new Date(selectedSprint.start_date);
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
    const { timeRemainingProjection, timeRemainingData } = this.state;

    if (!timeRemainingData || !timeRemainingProjection) {
      return (
        // <Segment>
        <Loader />
        // </Segment>
      );
    }

    return (
      <XYPlot width={600} height={400}>
        <XAxis xType="time" position="start" tickTotal={7} />
        <YAxis tickTotal={10} />
        <LineMarkSeries
          color="white"
          onValueMouseOver={value => this.setState({ value })}
          onValueMouseOut={() => this.setState({ value: null })}
          data={timeRemainingProjection}
        />
        <LineMarkSeries
          color="red"
          size={3}
          onValueMouseOver={value => this.setState({ value })}
          onValueMouseOut={() => this.setState({ value: null })}
          data={timeRemainingData}
        />
        {value ? (
          <Hint value={value}>
            <div
              style={{
                background: "black",
                textAlign: "left",
                padding: "5px",
                borderRadius: "5px"
              }}
            >
              <p>{"Hours: " + value.y}</p>
              {"Time: " +
                value.x.toLocaleTimeString() +
                " on " +
                value.x.toDateString()}
            </div>
          </Hint>
        ) : null}
      </XYPlot>
    );
  }
}

export default TimeRemainingGraph;
