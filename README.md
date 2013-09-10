starlist
========

A little webapp written in Node as an exercise for learning Node.

### Get it running

Install the dependencies

	npm install

Start mongo

	mongod

Start the app

	node app

Head to http://localhost:3000/

### Hash a password

Start the node shell in a directory where bcrypt dependency is available

	node

Load bcrypt

	var bcrypt = require('bcrypt');

Hash your password

	bcrypt.hashSync("password", 10);

Save the resulting hash for the next step

### Create a user

Open the mongo shell and 'use' the starlist db
	
	mongo
	use starlist

Insert your new user

	db.users.insert( {"userId": "b", "password": "<hash from previous step>", "firstName": "Bruce", "lastName": "Lefebvre" } );

### Sample list document

	{
		"_id": new ObjectID(),
		"title": "A new list",
		"owner": "b",
		"created_at": new Date(),
		"shared_with": [ 
			"d"
		],
		"items" : [ 	
			{ 	
				"_id": new ObjectID(),
				"content" : "Item #1", 	
				"created_at" : new Date(),
				"created_by": "b",
				"completed": false,
				"archived": false
			}, 	
			{ 	
				"_id": new ObjectID(),
				"content" : "Item #2!!", 	
				"created_at" : new Date(),
				"created_by": "d",
				"completed": false,
				"archived": false
			}, 	
			{ 	
				"_id": new ObjectID(),
				"content" : "<b>something else</b>", 	
				"created_at" : new Date(),
				"created_by": "b",
				"completed": false,
				"archived": false
			} 
		]
	}

And the same doc in a single line:

 	{ "title": "A new list", "owner": "b", "created_at": new Date(), "items" : [ { "content" : "Item #1", "created_at" : new Date(), "created_by": "b", "completed": false, "archived": false }, { "content" : "Item #2!!", "created_at" : new Date(), "created_by": "d", "completed": false, "archived": false }, { "content" : "<b>something else</b>", "created_at" : new Date(), "created_by": "b", "completed": false, "archived": false } ], "shared_with": [ "d" ] }