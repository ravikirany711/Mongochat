const mongo=require('mongodb').MongoClient;
const client=require('socket.io').listen(4000).sockets;

//we are here connecting to mongo
mongo.connect('mongodb://127.0.0.1/mongochat',function(err,db){
	if(err){
		throw err
	}else{
		console.log('MongoDB connected')
	}

	//Connnecting to socket.io
	client.on('connection',function(socket){
		let chat=db.collection('chats')

	//create a function to send the information and status
	sendStatus=function(s){
		socket.emit('status',s)

	}

	//Get chats from the mongo collection
	chat.find.limit(100).sort({_id:1}).toArray(function(err,res){
		if(err){
			throw err
		}

		//Emit the messages
		socket.emit('output',res)

	})

	//Handle input events
	socket.on('input',function(data){
		let name=data.name
		let message=data.message


		//check for  name and message
		if(name == '' || message ==''){

		//send error status
			sendStatus('please enter a name and message')


		}else{
			//insert the name and message in the database
			chat.insert({name:name,message:message},function(){
				client.emit('output',[data])

			//send a status object after emitting the data
			sendStatus({
				message:'Message sent',
				clear:true
			})



			})

		}
	})

	//Handle clear
	socket.on('clear',function(data){
		//Remove all the chats from the collection
		chat.remove({},function(){
			//Emit that the event is cleared
			socket.emit('cleared')
		})
	})






	})



});
