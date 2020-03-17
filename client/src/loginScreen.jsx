import React, {Component} from "react";

import {socket} from './socket'
import "./App.css";
import UsernameSelection from "./usernameSelection";
import MenuScreen from "./menuScreen";


class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SignIn: false,
            newUser: true,
            userName: "",
            id: "",
            email: ""
        };
        this.goToLobby = this.goToLobby.bind(this);
        this.googleSDK = this.googleSDK.bind(this);
        this.prepareLoginButton = this.prepareLoginButton.bind(this);
    }

    componentDidMount() {
        console.log("component did mount!");
        this.googleSDK();

        socket.on("user database check", (username) => {
            console.log("checking if user exists");
            // if the user "exists" in database, then not a new user and will go straight to main menu
            // otherwise, go to the username selection
            if (username !== "") {
                this.setState({
                    newUser: false,
                    userName: username
                })
            } else {
                // this else statement is a little redundant since newUser is initialized to be true
                // but for better readability, i'll keep it in
                this.setState({
                    newUser: true
                })
            }
            this.goToLobby();
        })
    }

    goToLobby() {
        this.setState(state => ({
            SignIn: true
        }));
    }

    googleSDK() {

        window['googleSDKLoaded'] = () => {
            window['gapi'].load('auth2', () => {
                this.auth2 = window['gapi'].auth2.init({
                    client_id: '855332695584-bdpq7iidn0g11ehf2l3h5r3s61cs922m.apps.googleusercontent.com',
                    cookiepolicy: 'single_host_origin',
                    scope: 'profile email'
                });
                this.prepareLoginButton();
            });
            // this.prepareLoginButton();
            // this.auth2.then(() => {
            //     this.setState({
            //       SignIn: this.auth2.isSignedIn.get(),
            //     });
            //   });
            //   });

        }

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://apis.google.com/js/platform.js?onload=googleSDKLoaded";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'google-jssdk'));

    }

    prepareLoginButton = () => {
        console.log(this.refs.googleLoginBtn);

        this.auth2.attachClickHandler(this.refs.googleLoginBtn, {},
            (googleUser) => {
                console.log("BUTTON PRESSED");
                let profile = googleUser.getBasicProfile();
                console.log('Token || ' + googleUser.getAuthResponse().id_token);
                console.log('ID: ' + profile.getId());
                console.log('Name: ' + profile.getName());
                console.log('Image URL: ' + profile.getImageUrl());
                console.log('Email: ' + profile.getEmail());

                // send event to server to check whether the user exists in our database
                console.log("emitting check to server");
                socket.emit("user exists check", profile.getEmail());

                // i removed the signin = true portion and will do it once i get a check if the user exists
                this.setState({
                    userName: profile.getName(),
                    id: profile.getId(),
                    email: profile.getEmail()
                })

            }, (error) => {

                // alert(JSON.stringify(error, undefined, 2));
                // If you close the popup, it still says that user is signedin
                console.log(this.auth2.isSignedIn.get());
                console.log("USERNAME: " + this.state.userName);
            })
    };

    render() {
        let comp;
        if (this.state.SignIn === false) {
            comp = <div className="GameWindow">
                <div className="LoginScreen">
                    <h1>Hide.IO</h1>
                    <button type="button" className="btn btn-primary" onClick={this.goToLobby}>Facebook</button>
                    <button type="button" className="btn btn-danger" ref="googleLoginBtn">Google</button>
                    <button type="button" className="btn btn-success" onClick={this.goToLobby}>Github</button>
                </div>
            </div>
        } else {
            // comp = <MenuScreen name={this.state.userName} id={this.state.id}/>
            // comp = <Lobby/>
            if(this.state.newUser){
                comp = <UsernameSelection email={this.state.email}/>;
            }else{
                comp = <MenuScreen name={this.state.userName} email={this.state.email}/>;
            }

        }
        return <div>{comp}</div>;
    }
}

export default LoginScreen;
