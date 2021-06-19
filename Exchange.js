import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput,KeyboardAvoidingView,TouchableOpacity,Alert, ToastAndroid } from 'react-native';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader'

export default class Exchange extends Component{

  constructor(){
    super()
    this.state = {
      userName : firebase.auth().currentUser.email,
      itemName : "",
      description : "",
      IsExchangeRequestActive: "",
      userDocId: "",
      requestId: "",
      requestedItemName: "",
      itemStatus: "",
      docId: ""
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  addItem=(itemName, description)=>{
    var userName = this.state.userName
    exchangeId = this.createUniqueId()
    db.collection("exchange_requests").add({
      "username"    : userName,
      "item_name"   : itemName,
      "description" : description,
      "exchangeId"  : exchangeId
     })

     await this.getItemRequest()
     db.collection('users').where("email_id", "==", userId).get()
     .then()
     .then((snapshot)=>{
       snapshot.forEach((doc)=>{
         db.collection('users').doc(doc.id).update({
           IsExchangeRequestActive: true
         })
       })
     })

     this.setState({
       itemName : '',
       description :''
     })

   
      return Alert.alert(
          'Item ready to exchange',
          '',
          [
            {text: 'OK', onPress: () => {

              this.props.navigation.navigate('HomeScreen')
            }}
          ]
      );
  }

  receivedItems=(itemName)=>{
    var userId = this.state.userName
    var requestId = this.state.requestId
    db.collection('received_items').add({
        "user_id": userId,
        "item_name":itemName,
        "request_id"  : requestId,
        "itemStatus"  : "received",
  
    })
  }

  getIsExchangeRequestActive(){
    db.collection('users')
    .where('email_id', '==', this.state.userName)
    .onSnapshot(querySnapshot =>{
      querySnapshot.forEach(doc=>{
        this.setState({
          IsExchangeRequestActive: doc.data().IsExchangeRequestActive,
          userDocId: doc.id
        })
      })
    })
  }

  getItemRequest =()=>{
  var itemRequest=  db.collection('requested_items')
    .where('user_id','==',this.state.userId)
    .get()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        if(doc.data().item_status !== "received"){
          this.setState({
            requestId : doc.data().request_id,
            requestedItemName: doc.data().item_name,
            itemStatus:doc.data().item_status,
            docId     : doc.id
          })
        }
      })
  })}

  sendNotification=()=>{
  db.collection('users').where('email_id','==',this.state.userName).get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      var name = doc.data().first_name
      var lastName = doc.data().last_name

      // to get the donor id and book nam
      db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          var donorId  = doc.data().donor_id
          var itemName =  doc.data().item_name

          //targert user id is the donor id to send notification to the user
          db.collection('all_notifications').add({
            "targeted_user_id" : donorId,
            "message" : name +" " + lastName + " received the book " + itemName ,
            "notification_status" : "unread",
            "item_name" : itemName
          })
        })
      })
    })
  })
  }

componentDidMount(){
  this.getItemRequest();
  this.getIsExchangeRequestActive();
}

updateExchangeRequestStatus=()=>{
  db.collection('requested_items').doc(this.state.docId)
  .update({
    item_status : 'received'
  })


  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc) => {
      db.collection('users').doc(doc.id).update({
        IsExchangeRequestActive: false
      })
    })
  })
}

  render(){

    if(this.state.IsExchangeRequestActive === true){
      return(
        <View style = {{flex:1,justifyContent:'center'}}>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text>Item Name</Text>
          <Text>{this.state.requestedItemName}</Text>
          </View>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text> Item Status </Text>

          <Text>{this.state.itemStatus}</Text>
          </View>

          <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
          onPress={()=>{
            this.sendNotification()
            this.updateExchangeRequestStatus();
            this.receivedItems(this.state.requestedItemName)
          }}>
          <Text>I recieved the item</Text>
          </TouchableOpacity>
        </View>
      )
    }else{
    return(
      <View style={{flex:1}}>
      <MyHeader title="Add Item"/>
      <KeyboardAvoidingView style={{flex:1,justifyContent:'center', alignItems:'center'}}>
        <TextInput
          style={styles.formTextInput}
          placeholder ={"Item Name"}
          maxLength ={8}
          onChangeText={(text)=>{
            this.setState({
              itemName: text
            })
          }}
          value={this.state.itemName}
        />
        <TextInput
          multiline
          numberOfLines={4}
          style={[styles.formTextInput,{height:100}]}
          placeholder ={"Description"}
          onChangeText={(text)=>{
            this.setState({
              description: text
            })
          }}
          value={this.state.description}

        />
        <TouchableOpacity
          style={[styles.button,{marginTop:10}]}
          onPress = {()=>{this.addItem(this.state.itemName, this.state.description)}}
          >
          <Text style={{color:'#ffff', fontSize:18, fontWeight:'bold'}}>Add Item</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      </View>
    )
  }
}
}


const styles = StyleSheet.create({
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },

})
