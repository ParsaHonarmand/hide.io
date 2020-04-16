import React from "react";
import {HashRouter, Switch, Route} from "react-router-dom";

import ProtectedRoute from "./assets/ProtectedRoute.jsx";
import {auth} from "./assets/auth";
import {socket} from "./assets/socket";
import UsernameSelection from "./Login/UsernameSelection";
import {LoginScreen} from "./Login/LoginScreen";
import MenuScreen from "./Menu/MenuScreen";
import PlayerProfile from "./Menu/PlayerProfile";
import Instructions from "./Menu/Instructions";

import ViewLobbies from "./Lobby/ViewLobbies";
import CreateLobby from "./Lobby/CreateLobby";
import JoinCode from "./Lobby/JoinCode";
import Room from "./Lobby/Room";
import Game from "./Game/Game";
import Sound from "react-sound";
import Music from "./sounds/Music"
import getSong from "./sounds/gameMusic";


class Router extends React.Component {
    constructor() {
        super();
        this.state = ({
            networkError: false,
            soundState: Sound.status.STOPPED,
        });
        this.waitForClicks = this.waitForClicks.bind(this);
    }

    waitForClicks() {
        if (!(this.state.soundState === Sound.status.PLAYING))
            setTimeout(() => {this.setState({soundState: Sound.status.PLAYING}) }, 5000)
    }

    componentDidMount() {
        console.log("Router component did mount!!!!===================");
        /*
        these are placecd in router so that now the other paths will not exist if one attempts to go into them
        they will also be placed in other components such that if they are in Game for example when the
        server disconnects, it will automatically go on its own to main menu, and not linger
        */
        socket.on("reconnect", attemptNumber => {
            console.log("Eureka! Reconnected to server on try", attemptNumber);
            this.setState({
                networkError: false
            })
        });

        socket.on("reconnect_error", (error) => {
            // console.log("Error! Disconnected from server", error);
            console.log("Error! Can't connect to server :(");
            this.setState({
                networkError: true
            })
        });
    }

    componentWillUnmount() {
        console.log("UNMOUNTED ROUTER OH NOOOOO ==============");
    }

    render() {
        // get a song to play
        return (
            <HashRouter>
                <div className="App">
                    <Switch>
                        <Route path="/" exact component={LoginScreen}/>

                        <ProtectedRoute path="/UsernameSelection" component={UsernameSelection}/>
                        <ProtectedRoute path="/MainMenu" component={MenuScreen}/>
                        <ProtectedRoute path="/LobbyScreen" component={ViewLobbies}/>
                        <ProtectedRoute path="/Profile" component={PlayerProfile}/>
                        <ProtectedRoute path="/Instructions" component={Instructions}/>
                        <ProtectedRoute path="/CreateLobby" component={CreateLobby}/>
                        <ProtectedRoute path="/JoinByCode" component={JoinCode}/>
                        <ProtectedRoute path="/Room" component={Room}/>
                        <ProtectedRoute path="/Game" component={Game}/>

                        <Route path="*" component={() => "404 NOT FOUND"}/>
                    </Switch>
                    <Sound
                        volume={60}
                        url={getSong()}
                        autoload={false}
                        playStatus= {this.state.soundState}
                        muted={"muted"}
                        loop={true}
                        onLoad={this.waitForClicks()}
                    />
                </div>
            </HashRouter>
        );
    }
}

export {Router, auth};
