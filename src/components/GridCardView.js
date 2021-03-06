import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, ImageBackground, TouchableHighlight} from 'react-native';
import GridView from 'react-native-super-grid';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-spinkit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import layoutStyle from '../styles/layout';

import imageStyle from '../styles/image'
import {auth, db} from '../config/FirebaseConfig';

import {
    getAudiosByCategoryAndType,
} from '../utils/FetchAudiosByApi';
import {
    upDateRole
} from '../utils/AppPay';
import  Utils from '../utils/utils';

export default class GridCardView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audiosData: [],
            category: this.props.category,
            isLoading: true,
            color: "#FFFFFF",
            size: 100,
            isPaidUser: false,
        }
    }

    onUnlock = data => {
        var unlock = data.unLock;
        if (unlock === true) {
            upDateRole();
            this.setState({isPaidUser: true})
        }
    };

    openAudioModal = (e, audioData, item, isPro) => {
        if (isPro && !this.state.isPaidUser) {
            this.props.navigation.navigate("UnLock", {onUnlock: this.onUnlock});
        } else {
            this.props.navigation.push("PlayList", {audio: audioData});//audioArray
        }
    }

    fetchData = (category, type, isPaidUser) => {
        var self = this;
        return new Promise(function (resolve, reject) {
            // some async operation here
            setTimeout(function () {
                // resolve the promise with some value
                if (!isPaidUser) {
                    getAudiosByCategoryAndType(category, type, 3).then(function (audios) {
                        resolve(audios)
                    });

                } else {
                    getAudiosByCategoryAndType(category, type, 3).then(function (audios) {
                        resolve(audios)
                    });
                }


            }, 500);
        });
    }
    
    async componentDidMount() {
        var self = this;
        const {category, type, isPaidUser} = this.props;

        this.fetchData(category, type, isPaidUser).then(function (audios) {
            self.setState({
                audiosData: audios,
                isLoading: false
            });
        });

        auth.onAuthStateChanged(function (authUser) {
            if (authUser) {
                var userId = auth.currentUser.uid;
                db.ref('/users/' + userId).once('value').then(function (snapshot) {
                    var userrole = (snapshot.val() && snapshot.val().role) || {free_user: true, paid_user: false};
                    var isPaidUser = userrole.paid_user;
                    self.setState({signin: true, authUser, isPaidUser: isPaidUser});

                });
            }else{
                self.setState({signin: false,  isPaidUser: false});

            }

        });
    }


    renderBeginner = () => {
        const {audiosData} =this.state;
        return (
            <View>
                {this.state.isLoading ?
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Spinner
                        style={{marginBottom: 50}}
                        isVisible={this.state.isLoading}
                        size={this.state.size}
                        type="ThreeBounce"
                        color={this.state.color}/>
                    </View> : <View>
                        {Object.keys(audiosData).length <= 0 &&
                        <View style={layoutStyle.centerContainer}>
                            <Text style={layoutStyle.infoText}>No new audios,wait a minute.</Text>
                        </View>                        }
                        {Object.keys(audiosData).length > 0 && Object.keys(this.state.audiosData).map(key => {
                            const items = (this.state.audiosData)[key];
                            return (
                                <GridView
                                    key={key}
                                    itemDimension={130}
                                    items={items}
                                    style={imageStyle.gridView}
                                    renderItem={item => (
                                        <TouchableHighlight
                                            onPress={(e) => this.openAudioModal(e, items, item, false)}
                                        >
                                            <ImageBackground style={imageStyle.imageContainer}
                                                             imageStyle={imageStyle.imageRadiusBorder}
                                                             source={{uri: item.imageDownloadUrl}}>
                                                <LinearGradient colors={['transparent', 'black']}
                                                                start={{x: 0.5, y: 0.4}}
                                                                style={imageStyle.imageGradient}>
                                                    <View style={imageStyle.text}>
                                                        <Text style={imageStyle.title}>{item.audioType}</Text>
                                                        <Text style={imageStyle.subtitle}>{item.name}</Text>
                                                    </View>
                                                </LinearGradient>
                                            </ImageBackground>
                                        </TouchableHighlight>


                                    )}
                                />
                            )

                        })}
                    </View>
                }
            </View>
        )
    }

    renderCategory = () => {
        const {isPaidUser, audiosData} = this.state;
        return (
            <View>
                {this.state.isLoading ?
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Spinner
                        style={{marginBottom: 50}}
                        isVisible={this.state.isLoading}
                        size={this.state.size}
                        type="ThreeBounce"
                        color={this.state.color}/>
                    </View> : <View>
                        {audiosData.length <= 0 &&
                        <View style={layoutStyle.centerContainer}>
                            <Text style={layoutStyle.infoText}>No new audios,wait a minute.</Text>
                        </View>}
                        {audiosData.length > 0 && <GridView
                            itemDimension={130}
                            items={audiosData}
                            style={imageStyle.gridView}
                            renderItem={item => (
                                <TouchableHighlight
                                    onPress={(e) => this.openAudioModal(e, this.state.audiosData, item, true)}
                                >
                                    <ImageBackground style={imageStyle.imageContainer}
                                                     imageStyle={imageStyle.imageRadiusBorder}
                                                     source={{uri: item.imageDownloadUrl}}>
                                        <LinearGradient colors={['transparent', 'black']}
                                                        start={{x: 0.5, y: 0.4}}
                                                        style={imageStyle.imageGradient}>
                                            <View style={imageStyle.text}>
                                                {!isPaidUser && <Ionicons name="ios-lock-outline" size={25} style={{
                                                    position: 'absolute',
                                                    top: 30,
                                                    left: 10
                                                }}/>}
                                                <Text style={imageStyle.title}>{item.audioType}</Text>
                                                <Text style={imageStyle.subtitle}>{item.name}</Text>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </TouchableHighlight>


                            )}
                        />}

                    </View>
                }
            </View>
        )
    }

    render() {
        const {category} = this.props;
        const {isConnected} = this.props.screenProps;

        if (!isConnected) {
            return Utils.renderOffline();
        }
        return (
            <View>
                {
                    (category == 'beginner' ? this.renderBeginner() : this.renderCategory())
                }

            </View>
        )

    }
}
