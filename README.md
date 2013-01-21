starlist
========

A little webapp written in Node as an exercise for learning Node.

# Scrap paper

Sample list document:

	{
		"title": "A new list",
		"owner": "b",
		"created_at": new Date(),
		"items" : [ 	
			{ 	
				"content" : "Item #1", 	
				"created_at" : new Date(),
				"created_by": "b",
				"completed": false,
				"archived": false
			}, 	
			{ 	
				"content" : "Item #2!!", 	
				"created_at" : new Date(),
				"created_by": "d",
				"completed": false,
				"archived": false
			}, 	
			{ 	
				"content" : "<b>something else</b>", 	
				"created_at" : new Date(),
				"created_by": "b",
				"completed": false,
				"archived": false
			} 
		],
		"shared_with": [ 
			"d"
		]
	}

And the same doc in a single line:

 	{ "title": "A new list", "owner": "b", "created_at": new Date(), "items" : [ { "content" : "Item #1", "created_at" : new Date(), "created_by": "b", "completed": false, "archived": false }, { "content" : "Item #2!!", "created_at" : new Date(), "created_by": "d", "completed": false, "archived": false }, { "content" : "<b>something else</b>", "created_at" : new Date(), "created_by": "b", "completed": false, "archived": false } ], "shared_with": [ "d" ] }