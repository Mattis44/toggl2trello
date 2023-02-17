import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Setup from './Setup';
import Board from './Board';
import axios from 'axios';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
const fullUrl = window.location.host;
const [url, port] = fullUrl.split(':');
const apiUrl = `http://${url}:${parseInt(port) + 1}/api-key`;

const root = ReactDOM.createRoot(document.getElementById('root'));

function AppWrapper() {
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [isBoardCompleted, setIsBoardCompleted] = useState(false);

  useEffect(() => {
    axios.get(apiUrl)
      .then(res => {
        const { TRELLO_API_KEY, TRELLO_API_TOKEN, TRELLO_BOARD_ID, TRELLO_BUSY_LABEL_ID } = res.data.Trello[0];
        if (TRELLO_API_KEY && TRELLO_API_TOKEN) {
          setIsSetupCompleted(true);
          if (TRELLO_BOARD_ID && TRELLO_BUSY_LABEL_ID) {
            setIsBoardCompleted(true);
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route
          path="/app"
          render={() => (isSetupCompleted && isBoardCompleted ? <App /> : <Redirect to="/" />)}
        />
        <Route path="/board" 
        render={() => (isSetupCompleted ? <Board /> : <Redirect to="/" />)}
         />


        {
          isSetupCompleted ? (
            isBoardCompleted ? (
              <Route path="/" component={App} />
            ) : (
              <Route path="/" component={Board} />
            )
          ) : (
            <Route path="/" component={Setup} />
          )
        }
      </Switch>
    </BrowserRouter>
  );
}


root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
