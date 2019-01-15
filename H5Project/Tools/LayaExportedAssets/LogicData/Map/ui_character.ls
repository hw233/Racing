{
	"type":"Scene",
	"props":{
		"name":"ui_character",
		"enableFog":false,
		"fogStart":0,
		"fogRange":300
	},
	"customProps":{
		"skyBox":{},
		"lightmaps":[],
		"ambientColor":[
			0.212,
			0.227,
			0.259
		],
		"fogColor":[
			0.5,
			0.5,
			0.5
		]
	},
	"child":[
		{
			"type":"Camera",
			"props":{
				"isStatic":false,
				"name":"Main Camera",
				"clearFlag":1,
				"orthographic":false,
				"fieldOfView":45,
				"nearPlane":0.3,
				"farPlane":1000
			},
			"customProps":{
				"layer":0,
				"translate":[
					-0.74,
					1.12,
					-4
				],
				"rotation":[
					0,
					1,
					0,
					0
				],
				"scale":[
					1,
					1,
					1
				],
				"viewport":[
					0,
					0,
					1,
					1
				],
				"clearColor":[
					0.1921569,
					0.3019608,
					0.4745098,
					0
				]
			},
			"components":{},
			"child":[]
		},
		{
			"type":"DirectionLight",
			"props":{
				"isStatic":false,
				"name":"Directional Light",
				"intensity":1,
				"lightmapBakedType":0
			},
			"customProps":{
				"layer":0,
				"translate":[
					0,
					3,
					0
				],
				"rotation":[
					0.1093816,
					0.8754261,
					0.4082179,
					-0.2345697
				],
				"scale":[
					1,
					1,
					1
				],
				"color":[
					1,
					0.9568627,
					0.8392157
				]
			},
			"components":{},
			"child":[]
		}
	]
}