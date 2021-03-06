const fetch = require('node-fetch');
const firebase = require("firebase-admin");
const express = require('express');
const ejs = require("ejs");
const body_parser = require('body-parser');
const { uuid } = require('uuidv4');
const {format} = require('util');
const multer  = require('multer');

const ViberBot  = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const UrlMessage = require('viber-bot').Message.Url;
const TextMessage = require('viber-bot').Message.Text;
const RichMediaMessage = require('viber-bot').Message.RichMedia;
const KeyboardMessage = require('viber-bot').Message.Keyboard;
const PictureMessage = require('viber-bot').Message.Picture;
const session = require('express-session');

const APP_URL = process.env.APP_URL;


const app = express(); 
const uuidv4 = uuid();

app.use('/css', express.static('css'));
app.set('trust proxy', 1);
app.use(session({secret: 'effystonem'}));
let sess;

let currentUser = {};

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits :{
    fileSize: 50 * 1024 * 1024  //no larger than 5mb
  }

});


let actionKeyboard = {
        "Type": "keyboard",
        "Revision": 1,
        "Buttons": [
            {
                "Columns": 6,
                "Rows": 1,
                "BgColor": "#2db9b9",
                "BgMediaType": "gif",
                "BgMedia": "http://www.url.by/test.gif",
                "BgLoop": true,
                "ActionType": "reply",
                "ActionBody": "measurement",               
                "Text": "Measurement",
                "TextVAlign": "middle",
                "TextHAlign": "center",
                "TextOpacity": 60,
                "TextSize": "regular"
            },

            {
                "Columns": 6,
                "Rows": 1,
                "BgColor": "#2db9b9",
                "BgMediaType": "gif",
                "BgMedia": "http://www.url.by/test.gif",
                "BgLoop": true,
                "ActionType": "reply",
                "ActionBody": "make-order",               
                "Text": "Order",
                "TextVAlign": "middle",
                "TextHAlign": "center",
                "TextOpacity": 60,
                "TextSize": "regular"
            },

              {
                "Columns": 6,
                "Rows": 1,
                "BgColor": "#2db9b9",
                "BgMediaType": "gif",
                "BgMedia": "http://www.url.by/test.gif",
                "BgLoop": true,
                "ActionType": "reply",
                "ActionBody": "design-catalogue",               
                "Text": "View Catalogue",
                "TextVAlign": "middle",
                "TextHAlign": "center",
                "TextOpacity": 60,
                "TextSize": "regular"
            },

            {
                "Columns": 6,
                "Rows": 1,
                "BgColor": "#2db9b9",
                "BgMediaType": "gif",
                "BgMedia": "http://www.url.by/test.gif",
                "BgLoop": true,
                "ActionType": "reply",
                "ActionBody": "track my order",               
                "Text": "Track Order",
                "TextVAlign": "middle",
                "TextHAlign": "center",
                "TextOpacity": 60,
                "TextSize": "regular"
            },
                 
        ]
    };



// Creating the bot with access token, name and avatar
const bot = new ViberBot({
    authToken: process.env.AUTH_TOKEN, // <--- Paste your token here
    name: "Viber Bot",  // <--- Your bot name here
    avatar: "https://firebasestorage.googleapis.com/v0/b/tailorbot-925d1.appspot.com/o/logo.jpg?alt=media&token=ba1066f8-ce7b-47aa-8d00-e80612e8a2fb" // It is recommended to be 720x720, and no more than 100kb.
});

app.use("/viber/webhook", bot.middleware());

app.use(body_parser.json());
app.use(body_parser.urlencoded());

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');



app.get('/',function(req,res){    
    res.send('your app is up and running');
});



app.get('/login',function(req,res){    
    sess = req.session;

    if(sess.login){
       res.send('You are already login. <a href="logout">logout</a>');
    }else{
      res.render('login.ejs');
    } 
    
});


app.get('/logout',function(req,res){ 
    //sess = req.session;   
    req.session.destroy(null);  
    res.redirect('login');
});

app.post('/login',function(req,res){    
    sess = req.session;

    let username = req.body.username;
    let password = req.body.password;

    if(username == 'admin' && password == process.env.ADMIN_PW){
      sess.username = 'admin';
      sess.login = true;
      res.redirect('/admin/orders');
    }else{
      res.send('login failed');
    }   
});


app.get('/customerinfo',function(req,res){   
      let data = {
        user_name: currentUser.name,
      } 
     res.render('customerinfo.ejs', {data:data});
});




app.post('/customerinfo',function(req,res){   
    
    currentUser.name = req.body.name;
    currentUser.phone = req.body.phone;
 
 

    let data = {
        viberid: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
   
    }

   

    db.collection('customers').add(data)
    .then(()=>{
            let data = {
                   "receiver":currentUser.id,
                   "min_api_version":1,
                   "sender":{
                      "name":"Viber Bot",
                      "avatar":"http://avatar.example.com"
                   },
                   "tracking_data":"tracking data",
                   "type":"text",
                   "text": "Thank you!"+req.body.name
                }                

                fetch('https://chatapi.viber.com/pa/send_message', {
                    method: 'post',
                    body:    JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': process.env.AUTH_TOKEN },
                })
                .then(res => res.json())
                .then(json => console.log('JSON', json))

    }).catch((error)=>{
        console.log('ERROR:', error);
    });
       
});

app.get('/custotmer/37Jwl1AVUMopE6gBhEe9', async (req,res) => {
    const usersRef = db.collection('customer');
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }  
    let data = [];
    snapshot.forEach(doc => {

        let user = {};
        user.id = doc.id;
        user.name = doc.data().name;
        user.phone = doc.data().phone;         
        user.design = doc.data().design;
        user.specialinstruction = doc.data().specialinstruction;
        data.push(user);        
    });   
 
    res.render('measurement.ejs', {data:data}); 
    
});



app.get('/measurement',function(req,res){   
      let data = {
        name: currentUser.name,
      } 
     res.render('measurement.ejs', {data:data});
});


app.post('/measurement',function(req,res){   
    
    currentUser.bicep= req.body.bicep;
    currentUser.bust = req.body.bust;
    currentUser.central_back = req.body.central_back;
    currentUser.hip = req.body.hip;
    currentUser.shoulder = req.body.shoulder;
    currentUser.sleeve = req.body.sleeve;
    currentUser.waist = req.body.waist;
    currentUser.waist_to_ankle = req.body.waist_to_ankle;
    currentUser.comment = req.body.comment;

    let data = {
        viberid: currentUser.id,
        name:currentUser.name,
        bicep: currentUser.bicep,
        bust: currentUser.bust,
        central_back: currentUser.central_back,
        hip: currentUser.hip,
        shoulder:currentUser.shoulder,
        sleeve:currentUser.sleeve,
        waist:currentUser.waist,
        waist_to_ankle:currentUser.waist_to_ankle,
        comment:currentUser.comment
    }

console.log('MEASUREMENT', data);
   

    db.collection('measurements').add(data)
    .then(()=>{
            let data = {
                   "receiver":currentUser.id,
                   "min_api_version":1,
                   "sender":{
                      "name":"Viber Bot",
                      "avatar":"http://avatar.example.com"
                   },
                   "tracking_data":"tracking data",
                   "type":"text",
                   "text": "Thank you!"+currentUser.name,
                }                

                fetch('https://chatapi.viber.com/pa/send_message', {
                    method: 'post',
                    body:    JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': process.env.AUTH_TOKEN },
                })
                .then(res => res.json())
                .then(json => console.log('JSON', json))

    }).catch((error)=>{
        console.log('ERROR:', error);
    });
       
});


app.get('/order',function(req,res){   
      let data = {
        name: currentUser.name,
      } 
     res.render('order.ejs', {data:data});
});


app.post('/order',function(req,res){   
    
   
    let data = {
        viberid: currentUser.id,
        name:currentUser.name,
        comment:req.body.comment,
        order_date:new Date()
    }

 
   

    db.collection('orders').add(data)
    .then(()=>{
            let data = {
                   "receiver":currentUser.id,
                   "min_api_version":1,
                   "sender":{
                      "name":"Viber Bot",
                      "avatar":"http://avatar.example.com"
                   },
                   "tracking_data":"tracking data",
                   "type":"text",
                   "text": "Thank you!"+currentUser.name,
                }                

                fetch('https://chatapi.viber.com/pa/send_message', {
                    method: 'post',
                    body:    JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': process.env.AUTH_TOKEN },
                })
                .then(res => res.json())
                .then(json => console.log('JSON', json))

    }).catch((error)=>{
        console.log('ERROR:', error);
    });
       
});


app.get('/custotmer', async (req,res) => {
    const usersRef = db.collection('customer');
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }  
    let data = [];
    snapshot.forEach(doc => {

        let user = {};
        user.id = doc.id;
        user.bicep = doc.data().name;
        user.bust = doc.data().bust;         
        user.central_back = doc.data().central_back;
        user.hip = doc.data().hip;
        user.shoulder = doc.data().shoulder;
        user.Sleeve = doc.data().Sleeve;
        user.waist = doc.data().waist;
        user.waist_to_ankle = doc.data().waist_to_ankle;
        user.comment=doc.data().comment;
        data.push(user);        
    });   
 
    res.render('measurement.ejs', {data:data}); 
    
});

app.get('/designtype',function(req,res){   
      let data = {
        user_name: currentUser.name,
      } 
     res.render('designtype.ejs', {data:data});
});




app.get('/admin/orders', async (req,res) => {

     sess = req.session;
    console.log('SESS:', sess); 
    if(sess.login){
        
        const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.get();
    if (snapshot.empty) {
      res.send('No matching documents.');
    
    }  
    let data = [];
    snapshot.forEach(doc => {

        let order = {};
        order=doc.data();
        order.id = doc.id;
        
        console.log('DATETIME INSIDE ADMIN ORDER',);
        
       order.order_date = doc.data().order_date.toDate().toDateString();


        data.push(order);        
    });   
    console.log('INSIDE ADMIN ORDER', data);
    res.render('orderlist.ejs', {data:data}); 
    }else{
      res.send('you are not authorized to view this page');
    }  


    
    
});


app.get('/admin/orderdetails/:doc_id', async (req,res) => {

     sess = req.session;
    console.log('SESS:', sess); 
    if(sess.login){
        
        let doc_id = req.params.doc_id;
    let orderRef = db.collection('orders').doc(doc_id);
    let order = await orderRef.get();
    let data = {}
    if (!order.exists) {
          console.log('No order!');        
        } else { 

            data= order.data();   
          data.doc_id = order.id; 
         
          
          let d = new Date(order.data().order_date._seconds);
          d = d.toString();
          data.order_date = d;
          
        }
res.render('orderdetails.ejs', {data:data});

    }else{
      res.send('you are not authorized to view this page');
    }   

    
    
});

/*
app.post('/admin/updateorder', function(req,res){
  console.log('REQ:', req.body); 

  

  let data = {
    
    status:req.body.status,
    comment:req.body.comment
  }

  db.collection('orders').doc(req.body.doc_id)
  .update(data).then(()=>{
      res.redirect('/admin/orders');
  }).catch((err)=>console.log('ERROR:', error)); 
 
});
*/

app.post('/admin/updateorder', upload.single('image'), function(req,res){
    

  let data = {    
    status:req.body.status,
    comment:req.body.comment
  }
 console.log('INSIDE UPDATEORDER', data); 
  
  let file = req.file;
  
  if (file) {
      uploadImageToStorage(file).then((img_url) => {
        data.image = img_url;
        console.log('FILE URL', data.image);
        db.collection('orders').doc(req.body.doc_id)
          .update(data).then(()=>{
              res.redirect('/admin/orders');
          }).catch((err)=>console.log('ERROR:', error)); 
           
      }).catch((error) => {
        console.error(error);
      });
    }     


 
});



app.get('/admin/addstock/:merchant_id', async (req,res) => {  
    let data = { };        

    let userRef = db.collection('users').doc(req.params.merchant_id);
    let user = await userRef.get();
    if (!user.exists) {
      console.log('No such user!');        
    } else {      
      data.merchant_id = user.id; 
      data.merchant_name = user.data().name;
    }
    res.render('addstock.ejs', {data:data}); 
    
});



app.post('/admin/addstock/', async (req,res) => {  
   
    let today = new Date();
    let merchant_id = req.body.merchant_id;

    let data = {
        batch: req.body.item_batch,
        type:req.body.item_type,
        qty:parseInt(req.body.item_qty),
        price:parseInt(req.body.item_price),
        received_date:req.body.item_received_date,
        comment:req.body.comment,    
        created_on:today   
    }
   

    db.collection('users').doc(merchant_id).collection('stocks').add(data)
    .then(()=>{
          res.json({success:'success'});  

    }).catch((error)=>{
        console.log('ERROR:', error);
    }); 
    
});



app.get('/admin/stocklist/:merchant_id', async (req,res) => { 
    

    const stocksRef = db.collection('users').doc(req.params.merchant_id).collection('stocks').where("qty", ">", 0);
    const snapshot = await stocksRef.get();
    if (snapshot.empty) {
      console.log('No stocks.');
      res.send('No stocks');
    }  

    let data = [];

    snapshot.forEach(doc => {
        let batch = {};

        batch.id = doc.id;
        batch.batch = doc.data().batch;
        batch.type = doc.data().type;
        batch.qty = doc.data().qty;
        batch.price = doc.data().price;
        batch.received_date = doc.data().received_date;
        batch.comment = doc.data().comment;      
        
        data.push(batch);        
    });   


    let merchant = { };        

    let userRef = db.collection('users').doc(req.params.merchant_id);
    let user = await userRef.get();
    if (!user.exists) {
      console.log('No such user!');        
    } else {    
      merchant.merchant_id = user.id;      
      merchant.merchant_name = user.data().name;
    }
 
    res.render('stocklist.ejs', {data:data, merchant:merchant});    
    
});



app.post('/admin/stocklist', async (req,res) => {     
    
    let today = new Date();
    let merchant_id = req.body.merchant_id; 

    let data = {
        date: req.body.date,
        batch_id: req.body.batch_id,
        type: req.body.type,
        qty: parseInt(req.body.qty),
        amount:parseInt(req.body.qty)*parseInt(req.body.price),
        created_on:today   
    }   

    let instock = parseInt(req.body.instock) -  parseInt(req.body.qty);
   
    
    db.collection('users').doc(merchant_id).collection('sales').add(data)
    .then(()=>{
          
          db.collection('users').doc(merchant_id).collection('stocks')
          .doc(req.body.batch_id).update({qty:instock})
              .then(()=>{
                  res.redirect('/admin/stocklist/'+merchant_id);
              }).catch((err)=>console.log('ERROR:', err));   

    }).catch((error)=>{
        console.log('ERROR:', error);
    }); 
    
});


app.get('/admin/salesrecord/:merchant_id', async (req,res) => { 
    

    const salesRef = db.collection('users').doc(req.params.merchant_id).collection('sales').orderBy('date', 'desc');
    const snapshot = await salesRef.get();
    if (snapshot.empty) {
      res.send('No sales record');
    }  

    let data = [];

    snapshot.forEach(doc => {
        let sale = {};

        sale.id = doc.id;
        sale.date = doc.data().date;
        sale.batch_id = doc.data().batch_id;
        sale.type = doc.data().type;
        sale.qty = doc.data().qty;
        sale.amount = doc.data().amount;
        
        data.push(sale);        
    });   


    let merchant = { };        

    let userRef = db.collection('users').doc(req.params.merchant_id);
    let user = await userRef.get();
    if (!user.exists) {
      console.log('No such user!');        
    } else {    
      merchant.merchant_id = user.data().viberid;      
      merchant.merchant_name = user.data().name;
    }
 
    res.render('salesrecord.ejs', {data:data, merchant:merchant});    
    
});


app.get('/admin/payment/:merchant_id', async (req,res) => {  

    let total_sale = 0;
    let total_paid = 0;
    let payment_logs = [];

    const salesRef = db.collection('users').doc(req.params.merchant_id).collection('sales');
    const snapshot = await salesRef.get();
    if (snapshot.empty) {
      total_sale = 0;
      res.send('No sales.');      
    } else{    
        snapshot.forEach(doc => {   
        total_sale += doc.data().amount;                   
    });
    } 

       

    const paymentsRef = db.collection('users').doc(req.params.merchant_id).collection('payments').orderBy('date', 'desc');
    const snapshot2 = await paymentsRef.get();
    if (snapshot2.empty) {
      total_paid = 0;
      console.log('No payments.');      
    } else{
        snapshot2.forEach(doc => {        
            total_paid += doc.data().amount;  

            let payment = {};
            payment.date = doc.data().date; 
            payment.amount = doc.data().amount; 
            payment_logs.push(payment);             
        }); 
    }

    

    let merchant = { };        

    let userRef = db.collection('users').doc(req.params.merchant_id);
    let user = await userRef.get();
    if (!user.exists) {
      console.log('No such user!');        
    } else {    
      merchant.merchant_id = user.id;      
      merchant.merchant_name = user.data().name;
    }

    merchant.total_sale = total_sale;
    merchant.total_paid = total_paid;
    merchant.payment_logs = payment_logs;
    merchant.total_balance = total_sale - total_paid;
 
 

    res.render('paymentrecord.ejs', {merchant:merchant}); 
    
});


app.post('/admin/savepayment', async (req,res) => {     
    
    let today = new Date();
    let merchant_id = req.body.merchant_id; 

    let data = {
        amount: parseInt(req.body.amount),
        date: req.body.date,        
       
        created_on:today   
    }       
   
    
    db.collection('users').doc(merchant_id).collection('payments').add(data)
    .then(()=>{  
        res.redirect('/admin/payment/'+merchant_id);   

    }).catch((error)=>{
        console.log('ERROR:', error);
    }); 
    
});







app.get('/newpage',function(req,res){ 
     let data = {
        title:"Hello",
        name:"Effy"
     }   
     res.render('newpage.ejs', data);
});

app.post('/test',function(req,res){

    console.log('USER ID', currentUser.id);

    
    let data = {
       "receiver":currentUser.id,
       "min_api_version":1,
       "sender":{
          "name":"Viber Bot",
          "avatar":"http://avatar.example.com"
       },
       "tracking_data":"tracking data",
       "type":"text",
       "text": "Thank you!"+req.body.name
    }

    

    fetch('https://chatapi.viber.com/pa/send_message', {
        method: 'post',
        body:    JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': process.env.AUTH_TOKEN },
    })
    .then(res => res.json())
    .then(json => console.log(json))   
    
});




//firebase initialize
firebase.initializeApp({
  credential: firebase.credential.cert({
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "project_id": process.env.FIREBASE_PROJECT_ID,
  }),
  databaseURL:process.env.FIREBASE_DB_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

let db = firebase.firestore(); 
let bucket = firebase.storage().bucket();




app.listen(process.env.PORT || 8080, () => {
    console.log(`webhook is listening`);
    bot.setWebhook(`${process.env.APP_URL}/viber/webhook`).catch(error => {
        console.log('Can not set webhook on following server. Is it running?');
        console.error(error);
        process.exit(1);
    });
});
 


bot.onError(err => console.log('ON ERR: ',err));


bot.onSubscribe(response => {
    say(response, `Hi there ${response.userProfile.name}. I am ${bot.name}! Feel free to ask me if a web site is down for everyone or just you. Just send me a name of a website and I'll do the rest!`);
});

let KEYBOARD_JSON = {
        "Type": "keyboard",
        "DefaultHeight": true,
        "Buttons": [{
            "Columns": 6,
            "Rows": 1,
            "ActionType": "reply", // type of action
            "ActionBody": "register", // the value of the keyboard
            "Text": "Register", //this is text in keyboard
            "TextSize": "regular"
        }]
    };

const message = new TextMessage("Welcome to my tea shop",KEYBOARD_JSON,null,null,null,3);

bot.onConversationStarted((userProfile, isSubscribed, context) =>     
    bot.sendMessage(userProfile,message)
);


/*
bot.onTextMessage(/^hi|hello$/i, (message, response) =>
    response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am robot`)));

bot.onTextMessage(/^mingalarbar$/i, (message, response) =>
    response.send(new TextMessage(`Mingalarbar. Welcome to MCC`)));
 */



bot.onTextMessage(/^track my order$/i, async (message, response) => {
    
    
    const ordersRef = db.collection('orders').where("viberid", "==", currentUser.id).limit(1);
    const snapshot = await ordersRef.get();
    

    if (snapshot.empty) {
        res.send('no data');
    }else{
      let data = []; 

      let comment = '';
      let status = '';
      let image = '';
      snapshot.forEach(doc => {         
        comment = doc.data().comment;
        status = doc.data().status; 
        image = doc.data().image;       
      });
        console.log('TRACK IMAGE', image);

      let bot_message = new TextMessage(`Your order is ${status}. ${comment}`, actionKeyboard);    
      response.send(bot_message);

      if(image){
        let bot_message = new PictureMessage(image);
        response.send(bot_message);
    }


    

    }
});


bot.onTextMessage(/./, (message, response) => {

    const text = message.text.toLowerCase();

    console.log('MESSAGE:', message);
    //console.log('USER', response.userProfile);

    currentUser.id = response.userProfile.id;
    currentUser.name = response.userProfile.name;

    console.log('CURRENT USER', currentUser);

    
    switch(text){
        case "register":
            registerUser(message, response);
            break;
        case "measurement":
            showMeasurementForm(message, response);
            break;
        case "make-order":
            showOrderForm(message, response);
            break;
        case "design-catalogue":
            showDesignType(message, response);
            break;
        case "my-stock":
            checkStock(message, response);
            break;
        
        case "my-balance":
            checkBalance(message, response);
            break;
        case "menu":
            showMenu(message, response);
            break;
        case "text":
            textReply(message, response);
            break; 
        case "url":
            urlReply(message, response);
            break;
        case "picture":
            pictureReply(message, response);
            break;
        case "rich media":
            richMediaReply(message, response);
            break;  
        case "keyboard":
            keyboardReply(message, response);
            break;           
        case "who am i":
            whoAmI(message, response);
            break;       
        default:
            defaultReply(message, response);
            
                
            
    }
});


/*
bot.onTextMessage(/view/, (message, response) => {
   viewTasks(message, response);  
});*/

const whoAmI = (message, response) => {
    response.send(new TextMessage(`Hello ${response.userProfile.name}! It's so nice to meet you`));
}

const textReply = (message, response) => {
    let bot_message = new TextMessage(`You have sent message: ${message.text}`);    
    response.send(bot_message);
}

const urlReply = (message, response) => {    

    let bot_message = new UrlMessage(process.env.APP_URL + '/test/');   
    response.send(bot_message);
}

const pictureReply = (message, response) => {
    const bot_message = new PictureMessage('https://firebasestorage.googleapis.com/v0/b/tailorbot-925d1.appspot.com/o/1605174458458_2 tree.jpg?alt=media&token=a5860198-9f4d-435c-a295-59c484037fcc');

    response.send(bot_message).catch(error=>{
        console.error('ERROR', error);
        process.exit(1);
    });
}

const richMediaReply = (message, response) => {
    const SAMPLE_RICH_MEDIA = {
    "ButtonsGroupColumns": 6,
    "ButtonsGroupRows": 7,
    "BgColor": "#FFFFFF",
    "Buttons": [
        {
        "Columns":6,
        "Rows":5,
        "ActionType":"none",           
        "Image":"https://upload.wikimedia.org/wikipedia/en/6/69/Effy_Stonem.jpg"
        }, 
        {
        "Columns":6,
                "Rows":1,
                "Text": "sample text",
                "ActionType":"none",
                "TextSize":"medium",
                "TextVAlign":"middle",
                "TextHAlign":"left"
        },
        {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody": "click",
            "Text":"Click",
            "TextSize":"large",
            "TextVAlign":"middle",
            "TextHAlign":"middle",
        },

         {
            "Columns":6,
            "Rows":1,
            "ActionType":"reply",
            "ActionBody": "click",
            "Text":"Click",
            "TextSize":"large",
            "TextVAlign":"middle",
            "TextHAlign":"middle",
        }
    ]
    };

    let bot_message = new RichMediaMessage(SAMPLE_RICH_MEDIA);
    
    response.send(bot_message).catch(error=>{
        console.error('ERROR', error);
        process.exit(1);
    });

}

//https://developers.viber.com/docs/tools/keyboard-examples/

const keyboardReply = (message, response) => {
    let SAMPLE_KEYBOARD = {
        "Type": "keyboard",
        "Revision": 1,
        "Buttons": [
            {
                "Columns": 6,
                "Rows": 1,
                "BgColor": "#2db9b9",
                "BgMediaType": "gif",
                "BgMedia": "http://www.url.by/test.gif",
                "BgLoop": true,
                "ActionType": "open-url",
                "ActionBody": "https://en.wikipedia.org/wiki/Effy_Stonem",
                "Image": "https://upload.wikimedia.org/wikipedia/en/6/69/Effy_Stonem.jpg",
                "Text": "Key text",
                "TextVAlign": "middle",
                "TextHAlign": "center",
                "TextOpacity": 60,
                "TextSize": "regular"
            }
        ]
    };

    let bot_message = new KeyboardMessage(SAMPLE_KEYBOARD);
    console.log('KEYBOARD: ', bot_message);
    response.send(bot_message);
}



const registerUser = async (message, response) => {   

    const userRef = db.collection('customers');    
    const snapshot = await userRef.where('viberid', '==', currentUser.id).limit(1).get();

    if (snapshot.empty) {
        console.log('No such document!');
        let bot_message1 = new TextMessage(`Click on following link to fill Your Information`, ); 
        let bot_message2 = new UrlMessage(APP_URL + '/customerinfo');   
        response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
    }else{

        snapshot.forEach(doc => {
            currentUser.name = doc.data().name;
             currentUser.phone = doc.data().phone;           
        });
        


          let bot_message3 = new TextMessage(`You are already registered`, actionKeyboard);    
          response.send(bot_message3);
    }  
  
}

const   showMeasurementForm = async (message, response) => {

     let bot_message1 = new TextMessage(`Click on following link to fill your measurement`, ); 
        let bot_message2 = new UrlMessage(APP_URL + '/measurement/');   
        response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
}

const   showOrderForm = async (message, response) => {

     let bot_message1 = new TextMessage(`Click on following link to fill your order`, ); 
        let bot_message2 = new UrlMessage(APP_URL + '/order/');   
        response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
}

const   showDesignType = async (message, response) => {

     let bot_message1 = new TextMessage(`Click on following link to find your design`, ); 
        let bot_message2 = new UrlMessage(APP_URL + '/designtype/');   
        response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
}



const checkBalance = async (message, response) => {

    
    
    let total_sale = 0;
    let total_paid = 0;
    let payment_history_message = "";


    let user_id = '';

    const userRef = db.collection('users');    
    const snapshot = await userRef.where('viberid', '==', currentUser.id).limit(1).get();

    if (snapshot.empty) {
        console.log('No such document!');
        let bot_message1 = new TextMessage(`Click on following link to register`, ); 
        let bot_message2 = new UrlMessage(APP_URL + '/register/');   
        response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
    }else{
        snapshot.forEach(doc => {
            user_id = doc.id;         
        });
     }
    
    

    const salesRef = db.collection('users').doc(user_id).collection('sales');
    const snapshot2 = await salesRef.get();
    if (snapshot2.empty) {
        total_sale = 0;
        let bot_message = new TextMessage(`You have no sales`);    
        response.send(bot_message);       
    } else{    
        snapshot2.forEach(doc => {   
        total_sale += doc.data().amount;                   
    });
    } 

    console.log('TOTAL SALE:', total_sale);

       

    const paymentsRef = db.collection('users').doc(user_id).collection('payments').orderBy('date', 'desc').limit(5);
    const snapshot3 = await paymentsRef.get();
    if (snapshot3.empty) {
      total_paid = 0;           
    } else{
        snapshot3.forEach(doc => {        
            total_paid += doc.data().amount; 
          
            date = doc.data().date; 
            amount = doc.data().amount; 

            payment_history_message += `Amount: ${amount} is paid on ${date}\n`;
                       
        }); 
    }

    console.log('TOTAL PAID:', total_paid);

    let total_balance = total_sale - total_paid;

    console.log('TOTAL BALANCE:', total_balance);

    let bot_message1 = new TextMessage(`Your total sale is ${total_sale} and total paid is ${total_paid}. Your balance is ${total_balance}`);    
    let bot_message2 = new TextMessage(`${payment_history_message}`);



      
    response.send(bot_message1).then(()=>{
        return response.send(bot_message2);
    });  
    
}


const showMenu = async (message, response) => {

const userRef = db.collection('customers');   
const snapshot = await userRef.where('viberid', '==', currentUser.id).limit(1).get();
if (snapshot.empty) {
   let bot_message1 = new TextMessage(`Click on following link to fill Your Information`, ); 
    let bot_message2 = new UrlMessage(APP_URL + '/customerinfo');    
    response.send(bot_message1).then(()=>{
            return response.send(bot_message2);
        });
}else{
    snapshot.forEach(doc => {
            currentUser.name = doc.data().name;
             currentUser.phone = doc.data().phone;           
        });
  let bot_message = new TextMessage(`Please select your activity in keyboard menu`, actionKeyboard);    
    response.send(bot_message);

}


    
}


const uploadImageToStorage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${Date.now()}_${file.originalname}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
         metadata: {
            firebaseStorageDownloadTokens: uuidv4
          }
      }
    });

    blobStream.on('error', (error) => {
      console.log('BLOB:', error);
      reject('Something is wrong! Unable to upload at the moment.');
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      //const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
      const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuidv4}`);
      console.log("image url:", url);
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
}


function defaultReply(message, response){
    response.send(new TextMessage(`I don't quite understand your command`)).then(()=>{
                return response.send(new TextMessage(`Another line of text`)).then(()=>{
                   return response.send(new TextMessage(`Another another line of text`)).then(()=>{
                    return response.send(new TextMessage(`If you forget who you are, type 'who am i'`));
                   }); 
                });
            });
}


