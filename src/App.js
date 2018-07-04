import React, { Component } from "react";
import "./App.css";
import { Button, Modal, Input, Form } from "semantic-ui-react";
import ReactDatePicker from "react-datepicker";
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";

import SprintModal from "./components/SprintModal/SprintModal";

// import { createSprint, foo } from "./utils/api/api";
import getSprints from "./utils/api/api";

class App extends Component {
  state = {
    sprints: []
  };

  test = async () => {
    const foo = await getSprints();
    console.log("app");
    console.log(foo);
    // .then(foo => foo.body)
    // .then(body => {
    //   const reader = body.getReader();
    //   console.log(reader.read());
    // });
  };

  render() {
    return (
      <div className="App">
        <SprintModal />
        <Button onClick={this.test} />
      </div>
    );
  }
}

export default App;
