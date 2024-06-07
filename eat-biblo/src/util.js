

const {  Document } = require("flexsearch");



// var index = new Index();




const util = {

	index : new Document({
		tokenize: "forward",
		resolution: 3,
		document: {
			id: "id",        
			index: ["creator","title", "publisher",'place', "dates"]
		}
	}),

	allData: [],
	numLookup: {},
	
	sparqlEndpoint: 'https://query.semlab.io/proxy/wdqs/bigdata/namespace/wdq/sparql',

	queriesAllData: `

		select ?item ?itemLabel ?instance ?instanceLabel ?creator ?creatorLabel ?title ?date ?publisher ?publisherLabel ?publishedIn ?publishedInLabel ?pubPlace ?pubPlaceLabel ?localId ?reportedDate ?pageNumber ?numberPages ?description where{

			?item wdt:P11 wd:Q20517 .
			?item wdt:P1 wd:Q19069 .

			optional{?item wdt:P1 ?instance }
			optional{?item wdt:P74 ?creator }
			optional{?item wdt:P82 ?title }
			optional{?item wdt:P98 ?date }
			optional{?item wdt:P84 ?publisher } 
			optional{?item wdt:P104 ?pubPlace }
			optional{?item wdt:P17 ?localId }
			optional{?item wdt:P134 ?reportedDate }
			optional{?item wdt:P87 ?pageNumber }
			optional{?item wdt:P101 ?numberPages }

			
			optional{?item wdt:P130 ?description}
			optional{?item wdt:P103 ?publishedIn}



			SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } # Helps get the label in your language, if not, then en language
		}`,


	sparqlOptions: {
        headers: new Headers({'Accept' : 'application/json'}),
        mode: 'cors'
    },


	getAllData: async function(){

		const response = await fetch(`${this.sparqlEndpoint}?` + new URLSearchParams({query: this.queriesAllData}), this.sparqlOptions)
		const data = await response.json();



		let lookup = {}

		for (let d of data.results.bindings){

			if (!lookup[d.item.value]){
				lookup[d.item.value] = {
					creators: [],
					instanceOf: [],
					titles: [],
					localIds: [],
					pageNumbers: [],
					numberPages: [],

					pubPlaces: [],
					pubIn: [],
					pubs: [],
					reportDate: [],
					date: null,
					uri: d.item.value,

				}
			}

			if (d.date){
				lookup[d.item.value].date = d.date.value
			}



			if (d.creator && d.creatorLabel){

				if (lookup[d.item.value].creators.filter((v)=>{ return (v.uri == d.creator.value) }).length==0){
					lookup[d.item.value].creators.push({'label':d.creatorLabel.value,'uri':d.creator.value})
				}
			}



			if (d.instance && d.instanceLabel){				
				if (lookup[d.item.value].instanceOf.filter((v)=>{ return (v.label == d.instanceLabel.value) }).length==0){
					lookup[d.item.value].instanceOf.push({'label':d.instanceLabel.value,'uri':d.instance.value})
				}
			}



			if (d.itemLabel){
				if (lookup[d.item.value].titles.indexOf(d.itemLabel.value)==-1){
					lookup[d.item.value].titles.push(d.itemLabel.value)
				}
			}
			if (d.localId){
				if (lookup[d.item.value].localIds.indexOf(d.localId.value)==-1){
					lookup[d.item.value].localIds.push(d.localId.value)
				}
			}

			if (d.pageNumber){
				if (lookup[d.item.value].pageNumbers.indexOf(d.pageNumber.value)==-1){
					lookup[d.item.value].pageNumbers.push(d.pageNumber.value)
				}
			}
			if (d.numberPages){
				if (lookup[d.item.value].numberPages.indexOf(d.numberPages.value)==-1){
					lookup[d.item.value].numberPages.push(d.numberPages.value)
				}
			}			

			if (d.publishedIn && d.publishedInLabel){
				if (lookup[d.item.value].pubIn.filter((v)=>{ return (v.uri == d.publishedIn.value) }).length==0){
					if (!d.publishedInLabel.value.match(/Q[0-9]+/)){
						lookup[d.item.value].pubIn.push({'label':d.publishedInLabel.value,'uri':d.publishedIn.value})
					}
				}
			}

			if (d.pubPlace && d.pubPlaceLabel){
				if (lookup[d.item.value].pubPlaces.filter((v)=>{ return (v.uri == d.pubPlace.value) }).length==0){
					lookup[d.item.value].pubPlaces.push({'label':d.pubPlaceLabel.value,'uri':d.pubPlace.value})
				}
			}

			if (d.publisher && d.publisherLabel){

				if (lookup[d.item.value].pubs.filter((v)=>{ return (v.uri == d.publisher.value) }).length==0){
					lookup[d.item.value].pubs.push({'label':d.publisherLabel.value,'uri':d.publisher.value})
				}
			}
			if (d.reportedDate){
				if (lookup[d.item.value].reportDate.indexOf(d.reportedDate.value)==-1){

					lookup[d.item.value].reportDate.push(d.reportedDate.value)
				}
			}


			if (d.title){
				if (lookup[d.item.value].titles.indexOf(d.title.value)==-1){
					lookup[d.item.value].titles.push(d.title.value)
				}
			}



			
		}


		// move evrything to a array and build index
		let allData = []

		for (let key in lookup){

			let id = lookup[key].uri.replace('http://base.semlab.io/entity/Q','')
			let qid = lookup[key].uri.replace('http://base.semlab.io/entity/','')
			id = parseInt(id)

			lookup[key].qid=qid

			allData.push(lookup[key])

			this.numLookup[id] = lookup[key]

			this.index.add({ 
				id: id, 
				creator: lookup[key].creators.map(v => v.label),
				title: lookup[key].titles,
				publisher: lookup[key].pubs.map(v => v.label),
				place: lookup[key].pubPlaces.map(v => v.label),
				dates: lookup[key].reportedDate,

			});

		}



		// start off sorting by date
		allData = allData.sort(function(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(a.date) - new Date(b.date);
		});		


		this.allData = allData




		// console.log(lookup)

		// console.log(this.index.search({query: 'york', suggest:true}))
		return this.allData

	},


	filter: function(value){




		let r = this.index.search({query: value, suggest:true})

		let results = []
		for (let i of r){


			for (let ii of i.result){
				if (results.indexOf(ii)===-1){
					results.push(ii)
				}
			}

		}

		let newData = []
		for (let id of results){
			newData.push(this.numLookup[id])
		}
		newData = newData.sort(function(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(a.date) - new Date(b.date);
		});	


		return newData

	},


	getWikidata: async function(qid){


		let queriesFindWikidata = `
			SELECT ?wikiid ?item ?itemLabel ?wikiuri

			WHERE 
			{
			  VALUES ?item {wd:${qid}}
			  optional{
			    ?item wdt:P8 ?wikiid
			  }
		      optional{
			    ?item wdt:P9 ?wikiuri
			  }

  			  
  			  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } # Helps get the label in your language, if not, then en language


			}



		`


		const response = await fetch(`${this.sparqlEndpoint}?` + new URLSearchParams({query: queriesFindWikidata}), this.sparqlOptions)
		const data = await response.json();

		console.log(data)

		if (data && data.results && data.results.bindings && data.results.bindings[0]){

			let rdata = {label:null,wikidata:null}

			rdata.label = data.results.bindings[0].itemLabel.value

			if (data.results.bindings[0].wikiid && data.results.bindings[0].wikiid.value){
				rdata.wikidata = data.results.bindings[0].wikiid.value
			}
			if (data.results.bindings[0].wikiuri && data.results.bindings[0].wikiuri.value){
				rdata.wikidata = data.results.bindings[0].wikiuri.value.split('/')[4]
			}

			return rdata
			
		}else{


			return false
		}




	}









}


export default util;