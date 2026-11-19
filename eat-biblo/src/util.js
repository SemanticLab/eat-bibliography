

const {  Document } = require("flexsearch");



// var index = new Index();




const util = {

	index : new Document({
		tokenize: "forward",
		resolution: 3,
		document: {
			id: "id",        
			index: ["creator","title", "publisher",'place', "dates", "about"]
		}
	}),

	allData: [],
	numLookup: {},
	loading: null,

	// what the index page was last showing, so it comes back the same after visiting an entry
	homeState: {source: 'all', text: ''},

	// the documents the references were taken from (P24 of each reference)
	sources: [
		{key: 'eb', qid: 'Q20512', label: 'Original bibliography', short: 'Bibliography', about: 'the original printed bibliography'},
		{key: 'cv', qid: 'Q32484', label: 'Billy Klüver CV', short: 'Klüver CV', about: "Billy Klüver's curriculum vitae"},
		{key: 'news', qid: 'Q41983', label: 'Newspaper search', short: 'Newspapers', about: 'a 2026 search of newspaper archives'},
	],
	
	sparqlEndpoint: 'https://query.semlab.io/proxy/wdqs/bigdata/namespace/wdq/sparql',

	queriesAllData: `

		select ?item ?itemLabel ?instance ?instanceLabel ?creator ?creatorLabel ?title ?date ?publisher ?publisherLabel ?publishedIn ?publishedInLabel ?pubPlace ?pubPlaceLabel ?localId ?reportedDate ?pageNumber ?numberPages ?description ?parent where{

			?item wdt:P11 wd:Q20517 .
			?item wdt:P1 wd:Q27513 .

			optional{?item wdt:P1 ?instance }
			optional{?item wdt:P91 ?creator }
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
			optional{?item wdt:P24 ?parent}



			SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } # Helps get the label in your language, if not, then en language
		}`,


	// the article each reference points to, when the article itself is in the wikibase:
	// where it can be read, why it is relevant to E.A.T., and the note on its text
	queriesArticles: `

		select ?item ?doc ?docLabel ?url ?relevance ?rights ?block where{

			?item wdt:P11 wd:Q20517 .
			?item wdt:P1 wd:Q27513 .
			?item wdt:P247 ?doc .

			optional{?doc wdt:P249 ?url }
			optional{?doc wdt:P130 ?relevance }
			optional{?doc wdt:P142 ?rights }
			optional{?block wdt:P24 ?doc . ?block wdt:P1 wd:Q2013 }

			SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
		}`,


	sparqlOptions: {
        headers: new Headers({'Accept' : 'application/json'}),
        mode: 'cors'
    },


	query: async function(sparql){
		const response = await fetch(`${this.sparqlEndpoint}?` + new URLSearchParams({query: sparql}), this.sparqlOptions)
		return await response.json();
	},

	// one load shared by every page that asks for it
	getAllData: function(){
		if (!this.loading){
			this.loading = this.loadAllData().catch((e)=>{ this.loading = null; throw e })
		}
		return this.loading
	},

	sourceOf: function(parentUri){
		let qid = parentUri.split('/').pop()
		let s = this.sources.filter((v)=>{ return v.qid == qid })[0]
		return (s) ? s.key : 'other'
	},

	sourceInfo: function(key){
		return this.sources.filter((v)=>{ return v.key == key })[0] || {key: 'other', label: 'Other', short: 'Other'}
	},

	loadAllData: async function(){

		const [data, articleData] = await Promise.all([this.query(this.queriesAllData), this.query(this.queriesArticles)])



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
					sources: [],
					articles: [],
					date: null,
					uri: d.item.value,

				}
			}

			if (d.parent){
				let key = this.sourceOf(d.parent.value)
				if (lookup[d.item.value].sources.indexOf(key)==-1){
					lookup[d.item.value].sources.push(key)
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
			}else if (d.date && d.date.value && d.date.value.indexOf("T")>-1){


				lookup[d.item.value].reportDate.push(d.date.value.split("T")[0])


			}


			if (d.title){
				if (lookup[d.item.value].titles.indexOf(d.title.value)==-1){
					lookup[d.item.value].titles.push(d.title.value)
				}
			}



			
		}


		// attach the articles
		for (let d of articleData.results.bindings){
			let ref = lookup[d.item.value]
			if (!ref){ continue }
			let article = ref.articles.filter((v)=>{ return (v.uri == d.doc.value) })[0]
			if (!article){
				article = {uri: d.doc.value, qid: d.doc.value.split('/').pop(), label: (d.docLabel) ? d.docLabel.value : '', urls: [], relevance: null, rights: null, blocks: []}
				ref.articles.push(article)
			}
			if (d.url && article.urls.indexOf(d.url.value)==-1){ article.urls.push(d.url.value) }
			if (d.relevance){ article.relevance = d.relevance.value }
			if (d.rights){ article.rights = d.rights.value }
			if (d.block && article.blocks.indexOf(d.block.value)==-1){ article.blocks.push(d.block.value) }
		}
		// an article record with no link, no note and no text has nothing to show
		for (let key in lookup){
			lookup[key].articles = lookup[key].articles.filter((a)=>{ return (a.urls.length>0 || a.relevance || a.blocks.length>0) })
		}


		// move evrything to a array and build index
		let allData = []

		for (let key in lookup){

			let id = lookup[key].uri.replace('http://base.semlab.io/entity/Q','')
			let qid = lookup[key].uri.replace('http://base.semlab.io/entity/','')
			id = parseInt(id)

			lookup[key].qid=qid

			// a few references are also filed under a second parent document; show the source they belong to
			if (lookup[key].sources.length>1){
				lookup[key].sources = lookup[key].sources.filter((v)=>{ return v != 'other' })
			}

			allData.push(lookup[key])

			this.numLookup[id] = lookup[key]

			this.index.add({ 
				id: id, 
				creator: lookup[key].creators.map(v => v.label),
				title: lookup[key].titles,
				publisher: lookup[key].pubs.map(v => v.label),
				place: lookup[key].pubPlaces.map(v => v.label),
				dates: lookup[key].reportDate,
				about: lookup[key].articles.map(v => v.relevance).filter(v => v),

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

		if (!value || value.trim()==''){
			return this.allData
		}


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


	hostOf: function(url){
		try{
			return new URL(url).hostname.replace(/^www\./,'')
		}catch(e){
			return url
		}
	},

	// The text of an article's blocks. For articles in copyright each block's text file holds a summary
	// in bullet points; it is read from the URL in the block's "block text URL" (P20).
	getBlocks: async function(docQid){

		const data = await this.query(`
			select ?block ?n ?textUrl ?preview where{
				?block wdt:P24 wd:${docQid} .
				?block wdt:P1 wd:Q2013 .
				optional{?block wdt:P17 ?n }
				optional{?block wdt:P20 ?textUrl }
				optional{?block wdt:P19 ?preview }
			}`)

		let blocks = {}
		for (let d of data.results.bindings){
			if (!blocks[d.block.value]){
				blocks[d.block.value] = {uri: d.block.value, n: (d.n) ? parseInt(d.n.value) : 0, textUrl: (d.textUrl) ? d.textUrl.value : null, preview: (d.preview) ? d.preview.value : null, lines: [], bullets: false, partial: false}
			}
		}
		blocks = Object.values(blocks).sort((a,b)=>{ return a.n - b.n })

		await Promise.all(blocks.map(async (b)=>{
			let text = null
			if (b.textUrl){
				try{
					const r = await fetch(b.textUrl.replace(/^http:/,'https:'))
					if (r.ok){ text = await r.text() }
				}catch(e){
					text = null
				}
			}
			if (text === null && b.preview){
				// the wikibase keeps only the first 400 characters
				text = b.preview.replace(/ {3}/g,'\n')
				b.partial = true
			}
			let lines = (text || '').split('\n').map((l)=>{ return l.trim() }).filter((l)=>{ return l != '' })
			b.bullets = lines.length > 0 && lines.filter((l)=>{ return /^[-•*]\s+/.test(l) }).length == lines.length
			b.lines = lines.map((l)=>{ return l.replace(/^[-•*]\s+/,'') })
		}))

		return blocks.filter((b)=>{ return b.lines.length > 0 })

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