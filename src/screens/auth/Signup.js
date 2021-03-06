import React, {Component} from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions} from 'react-native';
import {Input, Button} from 'react-native-elements'

import Icon from 'react-native-vector-icons/FontAwesome';

import {auth} from '../../config/FirebaseConfig';
import {doCreateUser} from '../../config/db';

import  Utils from '../../utils/utils';

import colorStyle from '../../styles/colors';
import authStyle from '../../styles/auth';
import BG_IMAGE from '../../assets/images/authBg.jpg';

export default class Signin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fontLoaded: false,
            email: '',
            email_valid: true,
            password: '',
            password_valid: true,
            name_valid: true,
            login_failed: false,
            showLoading: false,
            errorMessage: false,
            validateEmailInfo: 'Please enter a valid email address',
            validatePasswordInfo: 'Please enter a valid password',
            validateNameMessage: 'Please enter a valid name',
        };
    }

    async componentDidMount() {
        this.setState({fontLoaded: true});
    }

    registerUserAndWaitEmailVerification(email, password) {
        var self = this;
        return new Promise(function (resolve, reject) {
            auth.createUserWithEmailAndPassword(email, password).then(function (userCredential) {
                if (userCredential.user) {
                    // Create a user in your own accessible Firebase Database too
                    var uid = userCredential.user.uid;
                    doCreateUser(uid, self.state.name, email)
                        .then(() => {
                            userCredential.user.updateProfile({displayName: self.state.name}).then(function () {
                                self.props.navigation.navigate('ConfirmEmail', {
                                    user: userCredential.user,
                                    email: email
                                });
                            }, function (error) {
                                console.log('Update Profile error', error)
                            });
                        })
                        .catch(error => {
                            self.setState({
                                errorMessage: 'Error',
                                showLoading: false,
                            });
                        });
                    //
                }
            })
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    switch (errorCode) {
                        case 'auth/email-already-in-use':
                        case 'auth/invalid-email':
                        case 'auth/operation-not-allowed':
                        case 'auth/weak-password':
                            self.setState({
                                errorMessage: errorMessage,
                                showLoading: false,
                            });
                            break;
                        default:
                            self.setState({
                                errorMessage: 'Error',
                                showLoading: false,
                            });
                    }
                });

        });
    }


    handleSignup = (e) => {
        e.preventDefault();
        //
        const {
            email,
            password,
            name,
        } = this.state;


        if (name == null || name == '') {
            this.setState({
                errorMessage: this.state.validateNameMessage,
            });
            return false;
        }

        this.setState({showLoading: true});

        var self = this;

        setTimeout(() => {
            // LayoutAnimation.easeInEaseOut();
            self.registerUserAndWaitEmailVerification(email, password);

        }, 1500);
        //

    }

    navigateToSignin = () => {
        this.props.navigation.navigate('Signin', {});
    }
    navigateToPolicy = ()=>{
        this.props.navigation.navigate('Policy', {});

    }
    navigateToTerms= ()=>{
        this.props.navigation.navigate('Terms', {});

    }
    setEmail = (text) => {
        this.setState({errorMessage: '', email: text});
    }

    setName = (text) => {
        this.setState({errorMessage: '', name: text});
    }

    setPassword = (text) => {
        this.setState({errorMessage: '', password: text});
    }


    render() {
        const {email, name, password, email_valid, name_valid, password_valid, showLoading} = this.state;
        const {isConnected} = this.props.screenProps;

        if (!isConnected) {
            return Utils.renderOffline();
        }
        return (
            <View style={authStyle.container}>
                <ImageBackground
                    source={BG_IMAGE}
                    style={authStyle.bgImage}
                >
                    { this.state.fontLoaded ?
                        <View style={authStyle.loginView}>
                            <View style={authStyle.loginTitle}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={authStyle.titleText}>MY PEACEFUL</Text>
                                    <Text style={authStyle.plusText}>+</Text>
                                </View>
                                <View style={{marginTop: -10}}>
                                    <Text style={authStyle.titleText}>PLACE</Text>
                                </View>
                            </View>
                            <View style={authStyle.loginInput}>
                                <Input
                                    leftIcon={
                  <Icon
                    name='envelope-o'
                    color='rgba(171, 189, 219, 1)'
                    size={25}
                  />
                }
                                    selectionColor={colorStyle.white}
                                    containerStyle={{marginVertical: 5}}
                                    onChangeText={(email) => this.setEmail(email)}
                                    value={email}
                                    inputStyle={{marginLeft: 10, color: 'white'}}
                                    keyboardAppearance="light"
                                    placeholder="Email"
                                    autoFocus={false}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    ref={ input => this.emailInput = input }
                                    onSubmitEditing={() => {
                  this.setState({email_valid: Utils.validateEmail(email)});
                  this.passwordInput.focus();
                }}
                                    blurOnSubmit={false}
                                    placeholderTextColor={colorStyle.grey5}
                                    errorStyle={{textAlign: 'center', fontSize: 12}}
                                    errorMessage={email_valid ? null : "Please enter a valid email address"}
                                />
                                <Input
                                    leftIcon={
                  <Icon
                    name='user-o'
                    color='rgba(171, 189, 219, 1)'
                    size={25}
                  />
                }
                                    selectionColor={colorStyle.white}
                                    containerStyle={{marginVertical: 5}}
                                    onChangeText={(name) => this.setName(name)}
                                    value={name}
                                    inputStyle={{marginLeft: 10, color: 'white'}}
                                    keyboardAppearance="light"
                                    placeholder="Name"
                                    autoFocus={false}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    ref={ input => this.nameInput = input }
                                    blurOnSubmit={false}
                                    placeholderTextColor={colorStyle.grey5}
                                    errorStyle={{textAlign: 'center', fontSize: 12}}
                                    errorMessage={name_valid ? null : "Please enter your name or nickname"}
                                />
                                <Input
                                    leftIcon={
                  <Icon
                    name='lock'
                    color='rgba(171, 189, 219, 1)'
                    size={25}
                  />
                }
                                    selectionColor={colorStyle.white}
                                    containerStyle={{marginVertical: 5}}
                                    onChangeText={(password) => this.setPassword(password)}
                                    onSubmitEditing={() => {
                  this.setState({password_valid: Utils.validPassword(password)});
                  this.passwordInput.focus();
                }}
                                    value={password}
                                    inputStyle={{marginLeft: 10, color: 'white'}}
                                    secureTextEntry={true}
                                    keyboardAppearance="light"
                                    placeholder="Password"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="default"
                                    returnKeyType="done"
                                    ref={ input => this.passwordInput = input}
                                    blurOnSubmit={true}
                                    placeholderTextColor={colorStyle.grey5}
                                    errorStyle={{textAlign: 'center', fontSize: 12}}
                                    errorMessage={password_valid ? null : "Please enter a valid password"}
                                />
                            </View>
                            <Button
                                title='SIGN UP'
                                activeOpacity={1}
                                underlayColor="transparent"
                                onPress={this.handleSignup}
                                loading={showLoading}
                                loadingProps={{size: 'small', color: 'white'}}
                                disabled={ !email_valid && !name_valid && password.length < 6}
                                buttonStyle={authStyle.button}
                                containerStyle={{marginVertical: 10}}
                                titleStyle={{color: 'white'}}
                            />
                            <View style={authStyle.footerView}>
                                <Button
                                    title="Have an Account?"
                                    clear
                                    activeOpacity={0.5}
                                    titleStyle={{color: 'white', fontSize: 15}}
                                    containerStyle={{marginTop: -10}}
                                    onPress={this.navigateToSignin}
                                />
                                <Button
                                    title="Privacy Policy"
                                    clear
                                    activeOpacity={0.5}
                                    titleStyle={{color: 'white', fontSize: 15}}
                                    containerStyle={{marginTop: -10}}
                                    onPress={this.navigateToPolicy}
                                />
                                <Button
                                    title="Terms of Service"
                                    clear
                                    activeOpacity={0.5}
                                    titleStyle={{color: 'white', fontSize: 15}}
                                    containerStyle={{marginTop: -10}}
                                    onPress={this.navigateToTerms}
                                />
                            </View>
                        </View> :
                        <Text>Loading...</Text>
                    }
                </ImageBackground>
            </View>
        );
    }
}

