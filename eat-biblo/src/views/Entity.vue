<template>
  <div class="home" style="padding: 2em;" v-if="entityData!==null">



    <router-link style="float: right; z-index: 100; background-color: lemonchiffon;"  class="button" :to="'/'">Return To Index</router-link>



    
    <template v-if="type=='people' || type=='publisher' || type=='published'">


      <template v-if="wikidata===null">
        <div style="text-align:left">
          <h1 class="is-size-2">          
            {{label}}
          </h1>
        <div style="margin-bottom: 2em;"><a target="_blank" :href="'http://base.semlab.io/entity/'+qid">View on SemLab_Wikibase</a></div>


        </div>


      </template>

      <div style="flex:1" id="panels">
        
      </div>


    <table class="table is-striped is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Title</th>
          <th>Creators</th>
          <th>Date</th>
          <th>Type</th>
          <th>Publisher</th>
          <th>Published In</th>

          <th>Pub City</th>
          <th>Pages</th>
          <th>Id</th>
          <th>Source</th>
          <th>Article</th>
          <th></th>


        </tr>
      </thead>    
      <tbody>

        <tr v-for="d in filteredData" v-bind:key="d.uri">


          <td>

            <router-link class="title-link" :to="`/document/${d.uri.split('/')[4]}`">
            <div style="font-weight: bold;" v-for="(t,idx) in d.titles" v-bind:key="idx+t">
            
              {{t}}

            </div>
            </router-link>

          </td>

          <td>
            <div v-for="(c,idx) in d.creators" v-bind:key="idx+c">
              <router-link :to="`/people/${c.uri.split('/')[4]}`">{{ c.label }}</router-link>
            </div>
          </td>
          <td><div v-for="(d,idx) in d.reportDate" v-bind:key="idx+d">{{d}}</div></td>

          <td><div v-for="(d,idx) in d.instanceOf" class="nowrap" v-bind:key="idx+d">{{d.label}}</div></td>
          <td>
            <div v-for="(c,idx) in d.pubs" v-bind:key="idx+c">
              <router-link :to="`/publisher/${c.uri.split('/')[4]}`">{{ c.label }}</router-link>
            </div>
          </td>
          <td><div v-for="(d,idx) in d.pubIn" v-bind:key="idx+d">
            <router-link :to="`/published/${d.uri.split('/')[4]}`">{{ d.label }}</router-link>

          </div></td>          
          <td>
            <div v-for="(c,idx) in d.pubPlaces" v-bind:key="idx+c">
              {{ c.label }}
            </div>
          </td>

          <td><div v-for="(d,idx) in d.pageNumbers" v-bind:key="idx+d">{{d}}</div></td>
          <td><div v-for="(d,idx) in d.localIds" v-bind:key="idx+d">{{d}}</div></td>

          <td><div v-for="s in d.sources" v-bind:key="s"><span class="tag nowrap" :class="'source-'+s" :title="sourceInfo(s).label">{{sourceInfo(s).short}}</span></div></td>

          <td class="nowrap">
            <div v-for="u in articleUrls(d)" v-bind:key="u"><a target="_blank" rel="noopener" :href="u" :title="'Open the article at ' + hostOf(u)">article&nbsp;&#8599;</a></div>
            <div v-if="hasSummary(d)"><router-link :to="`/document/${d.qid}`" title="Read the summary of the article">summary</router-link></div>
          </td>

          <td><a target="_blank" :href="d.uri">data</a></td>


        </tr>
      </tbody>

    </table>






    </template>

    <template v-if="type=='document'">


      


      <div class="container is-fluid">
          <div class="columns">
            <div class="column" style="text-align: left;">

              <h1 class="is-size-2">
                <div style="font-weight: bold;" v-for="(t,idx) in entityData.titles" v-bind:key="idx+t">

                {{t}}

                </div>

              </h1>

              <div style="margin-bottom: 2em;"><a target="_blank" :href="entityData.uri">View on SemLab_Wikibase</a></div>

              <div>
                <dl>
                    


                    <dt>Authors</dt>
                    <dd>

                      <div v-for="(c,idx) in entityData.creators" v-bind:key="idx+c">
                        <router-link :to="`/people/${c.uri.split('/')[4]}`">{{ c.label }}</router-link>
                      </div>

                    </dd>


                    <dt>Date</dt>
                    <dd>
                        <div v-for="(d,idx) in entityData.reportDate" v-bind:key="idx+d">{{d}}</div>
                    </dd>


                    <dt>Type</dt>
                    <dd>
                        <div v-for="(d,idx) in entityData.instanceOf" v-bind:key="idx+d">{{d.label}}</div>
                    </dd>


                    <dt>Publishers</dt>
                    <dd>
                      <div v-for="(c,idx) in entityData.pubs" v-bind:key="idx+c">
                        <router-link :to="`/publisher/${c.uri.split('/')[4]}`">{{ c.label }}</router-link>
                      </div>

                      <div class="no-data" v-if="entityData.pubs.length===0">
                          No Data
                      </div>


                    </dd>
                    <dt>Published In</dt>
                    <dd>
                      <div v-for="(c,idx) in entityData.pubIn" v-bind:key="idx+c">
                        {{ c.label }}
                      </div>

                      <div class="no-data" v-if="entityData.pubIn.length===0">
                          No Data
                      </div>


                    </dd>


                    <dt>Publisher Place</dt>
                    <dd>
                      <div v-for="(c,idx) in entityData.pubPlaces" v-bind:key="idx+c">
                        {{ c.label }}
                      </div>
                      <div class="no-data" v-if="entityData.pubPlaces.length===0">
                          No Data
                      </div>


                    </dd>

                    <dt>Page Number</dt>
                    <dd>
                      <div v-for="(d,idx) in entityData.pageNumbers" v-bind:key="idx+d">{{d}}</div>
                      <div class="no-data" v-if="entityData.pageNumbers.length===0">
                          No Data
                      </div>                    

                    </dd>

                    <dt>Number of Pages</dt>
                    <dd>
                      <div v-for="(d,idx) in entityData.numberPages" v-bind:key="idx+d">{{d}}</div>
                      <div class="no-data" v-if="entityData.numberPages.length===0">
                          No Data
                      </div>                    

                    </dd>

                    <dt>Citation Number</dt>
                    <dd>
                      <div v-for="(d,idx) in entityData.localIds" v-bind:key="idx+d">{{d}}</div>
                      <div class="no-data" v-if="entityData.localIds.length===0">
                          No Data
                      </div>                         
                    </dd>

                    <dt>Source</dt>
                    <dd>
                      <div v-for="s in entityData.sources" v-bind:key="s">
                        <router-link :to="{path: '/', query: {source: s}}" :title="'All references from this source'">{{ sourceInfo(s).label }}</router-link>
                      </div>
                      <div class="no-data" v-if="entityData.sources.length===0">
                          No Data
                      </div>
                    </dd>



                </dl>



              </div>

            </div>
            <div class="column" style="text-align: left;">

              <!-- the article itself, when it is in the wikibase: why it matters, where to read it, and its summary -->
              <div class="article-box" v-for="a in entityData.articles" v-bind:key="a.uri">

                <div class="article-label" v-if="entityData.articles.length>1">{{ a.label }}</div>

                <template v-if="a.relevance">
                  <h2 class="article-heading">Relevance to E.A.T.</h2>
                  <p class="article-text">{{ a.relevance }}</p>
                </template>

                <h2 class="article-heading">Read the article</h2>
                <div class="article-text" v-for="u in a.urls" v-bind:key="u">
                  <a target="_blank" rel="noopener" :href="u">{{ hostOf(u) }} &#8599;</a>
                </div>
                <div class="article-text no-data" v-if="a.urls.length===0">No link recorded</div>

                <h2 class="article-heading" v-if="a.blocks.length>0">{{ isSummary(a) ? 'Summary' : 'Text' }}</h2>
                <div class="article-text no-data" v-if="a.blocks.length>0 && summaries[a.qid]===undefined">Loading&hellip;</div>
                <div class="article-text no-data" v-else-if="a.blocks.length>0 && summaries[a.qid].length===0">Could not be loaded</div>
                <template v-else-if="a.blocks.length>0">
                  <div class="content summary-block" v-for="b in summaries[a.qid]" v-bind:key="b.uri">
                    <ul v-if="b.bullets">
                      <li v-for="(l,idx) in b.lines" v-bind:key="idx">{{ l }}</li>
                    </ul>
                    <template v-else>
                      <p v-for="(l,idx) in b.lines" v-bind:key="idx">{{ l }}</p>
                    </template>
                    <div class="summary-note" v-if="b.partial">Only the opening of this part could be loaded.</div>
                  </div>
                </template>
                <p class="summary-note" v-if="a.rights">{{ a.rights }}</p>
                <p class="summary-note"><a target="_blank" :href="a.uri">Article record on SemLab_Wikibase</a></p>

              </div>

            </div>
          </div>

      </div>




    </template>





  </div>
  <div v-else>Loading Data</div>
</template>









<script>
// @ is an alias to /src

import util from "@/util"


// from https://github.com/thisismattmiller/wiki-knowledge-panel/blob/master/wkp.js

var wikiCards = {
    
    
    prefLangs: ["en","es","zh","tl","vi","ar","fr","de","ko"],
    
    init: function(prefLanguage){
        
        // find all the possible cards
        document.querySelectorAll(".wiki-knowledge-card").forEach((wc)=>{
            
            wc.innerHTML = ""
            
            this.parseQId(wc.dataset.qid, (data)=>{
                        
                // find the first lang we should use, pick a default one if one of our prefs arent found
                var useLang = data[Object.keys(data)[0]]
                for (let lang in wikiCards.prefLangs){                
                    if (Object.keys(data).indexOf(wikiCards.prefLangs[lang]) > -1){                        
                        useLang = data[wikiCards.prefLangs[lang]]
                        break
                    }              
                }
                
                // if we passed a lang code, assume it is present in the data and look for it
                if (prefLanguage){
                   for (let key in data){
                       if (key ==prefLanguage){
                           useLang = data[key]
                       }
                   }               
                }

                // now build the interface for that lang
                wikiCards.downloadKnowledgeCard(useLang)
                
            })
            


        })
        
        
        
        
        
    },
    
    downloadKnowledgeCard: function(data){
        
        data.articleText = ""
        data.thumbUrl = ""
        
        // grab the thumb and atricle text
        wikiCards.utilGetJson(data.articleInfoUrl,function(articleData){
            if (articleData && articleData.query && articleData.query.pages && Object.keys(articleData.query.pages).length > 0){

                var d = articleData.query.pages[Object.keys(articleData.query.pages)[0]]
                if (d && d.extract){
                    data.articleText = d.extract
                }
            }
            
              console.log('>>>>',data.thumbInfoUrl)
             wikiCards.utilGetJson(data.thumbInfoUrl,function(articleData){
                 if (articleData && articleData.query && articleData.query.pages && Object.keys(articleData.query.pages).length > 0){
     
                     var d = articleData.query.pages[Object.keys(articleData.query.pages)[0]]
                     // test if it is a landscape or portrait image
                     if (d && d.thumbnail && d.thumbnail.source){
                         if (d.thumbnail.height > d.thumbnail.width){
                            data.thumbType = 'p'
                         }else{
                            data.thumbType = 'l'
                         }
                         
                         data.thumbUrl = d.thumbnail.source
                     }
                 }
                 
                 
                 
                 wikiCards.buildKnowledgeCard(data)
                 
                 
             },function(){})            
            
            
        },function(){})
        
    },
    
    buildKnowledgeCard: function(data){
        console.log(data)
        // look for the right place to build the card
        document.querySelectorAll(".wiki-knowledge-card").forEach((wc)=>{
            
            if (wc.dataset.qid == data.qid){
            
                if (data.thumbUrl != ""){
                    var image = document.createElement('div')
                    if (data.thumbType=="l"){
                        image.classList.add('knowledge-card-wiki-image')
                    }else{
                        image.classList.add('knowledge-card-wiki-image-portrait')
                    }
                    image.style.backgroundImage = 'url(' + data.thumbUrl + ')';
                    image.setAttribute('alt','Image of ' + data.title +' from Wikipedia')
                    image.setAttribute('title','Image of ' + data.title +' from Wikipedia')
                    
                    wc.appendChild(image)
               }
                if (data.title){
                    data.title = data.title.replace("(artist)",'')
                    var title = document.createElement('div')
                    title.classList.add('knowledge-card-wiki-title')
                    title.classList.add('is-size-2')
                    title.innerHTML = data.title
                    wc.appendChild(title)                    
                    
                }
                if (data.articleText != ""){
                    var cutoff = 500
                    var text = document.createElement('div')
                    text.classList.add('knowledge-card-wiki-text')
                    if (data.articleText.length>cutoff){
                        text.innerHTML = data.articleText.substring(0,cutoff) + '...'    
                    }else{
                        text.innerHTML = data.articleText
                    }
                    
                    wc.appendChild(text)
               }
               
                var wikiMenu = document.createElement('div')
                wikiMenu.classList.add('knowledge-card-wiki-menu')
                wikiMenu.innerHTML=""
                var wikiLinks = document.createElement('div')
                
                wikiLinks.classList.add('knowledge-card-wiki-wikiLinks')
                
                var wikipediaLink = document.createElement('a')
                wikipediaLink.setAttribute('href',data.link)
                wikipediaLink.setAttribute('title','Data from Wikipedia')
                wikipediaLink.innerHTML="Wikipedia"
                wikiLinks.appendChild(wikipediaLink)

                var wikidataLink = document.createElement('a')
                wikipediaLink.setAttribute('title','Data from Wikidata')
                wikidataLink.setAttribute('href','https://www.wikidata.org/entity/' + data.qid)
                wikidataLink.innerHTML="Wikidata"
                wikiLinks.appendChild(wikidataLink)
                
                wikiMenu.appendChild(wikiLinks)

                var wikiLangs = document.createElement('div')
                wikiLangs.innerHTML = "Languages:&nbsp;"
                wikiCards.prefLangs.forEach((l)=>{
                    
                    if (Object.keys(data.allData).indexOf(l) >-1){
                        if (data.lang == l){
                            var llink = document.createElement('span')
                            llink.style.marginRight='5px'
                            llink.innerHTML=l
                            wikiLangs.appendChild(llink)                                                        
                        }else{
                            llink = document.createElement('a')
                            llink.innerHTML=l
                            llink.setAttribute('href','#')

                            llink.addEventListener('click',function (event)
                                {
                                    wikiCards.init(event.target.innerText)
                                    event.preventDefault();
                                }  ); 
                            
                            
                            wikiLangs.appendChild(llink)                            
                            
                        }

                    }
                    
                })
                
                var langSelect = document.createElement('select')
                Object.keys(data.allData).forEach((l)=>{
                    var langOpt = document.createElement('option')
                    langOpt.setAttribute('value',l)
                    langOpt.innerHTML=l
                    if (data.lang == l){
                        langOpt.setAttribute('selected',true)
                    }
                    langSelect.appendChild(langOpt)
                })
                
                langSelect.addEventListener('change',function (event)
                {
                    wikiCards.init(event.target.value)
                    event.preventDefault();
                }  );                 
                
                wikiLangs.appendChild(langSelect)                            
                
                wikiMenu.appendChild(wikiLangs)
                
                
                
                
                
                
                wc.appendChild(wikiMenu)
                
            }
        
        
        })
        
        
    },
    
    parseQId: function(qid,callback){
        
        this.utilGetJson('https://www.wikidata.org/wiki/Special:EntityData/'+qid+'.json',function(data){
           
            if (data && data.entities && data.entities[qid]){
                // var labels = data.entities[qid].labels
                var sitelinks = data.entities[qid].sitelinks
                data = {}
                
                Object.keys(sitelinks).forEach((sl)=>{
                    var lang = sl.split('wiki')[0]
                    if (lang.indexOf('_old')>-1){
                        return false;
                    }
                    var articleTitle = sitelinks[sl].url.split('/wiki/')[1]
                    var articleServer = sitelinks[sl].url.split('/wiki/')[0]
                    var wikiThumb = articleServer + '/w/api.php?action=query&titles=' + articleTitle  + '&prop=pageimages&format=json&pithumbsize=640&origin=*'

                    var articleText = articleServer + '/w/api.php?format=json&action=query&prop=extracts&exintro=1&explaintext=1&titles=' + articleTitle + '&origin=*'
                    var title = sitelinks[sl].title
                    var link = sitelinks[sl].url
                    
                    if (link.indexOf('wikipedia')>-1){                       
                       data[lang] = {
                           qid : qid,
                           lang : lang,
                           titleEncoded: articleTitle,
                           server: articleServer,
                           thumbInfoUrl: wikiThumb,
                           articleInfoUrl: articleText,
                           title: title,
                           link: link,
                           allData: data
                       }
                    }                    
                })
                console.log(data)
                callback(data)
            }
            
            
        },
        function(){console.log("Error loading data")}
        )
        
        
        
    },
        
    utilGetJson: function(url,doneCb, errorCb){
    
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        
        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            doneCb(data)
          } else {
            // We reached our target server, but it returned an error
            errorCb(request.responseText)
          }
        };
        
        request.onerror = function() {
          // There was a connection error of some sort
          errorCb()
        };
        
        request.send();



        
    }
    
    
    
}















export default {
  name: 'Home',
  components: {

  },

  data() {
    return {

      allData: [],
      filteredData: [],
      qid: null,
      type: null,
      timeout: null,
      filterDebounced: '',
      entityData: null,
      wikidata: null,
      label: null,
      summaries: {},
    }
  },
    computed: {
     filter: {
        get() {
          return this.filterDebounced
        },
        set(val) {
          if (this.timeout) clearTimeout(this.timeout)
          this.timeout = setTimeout(() => {
            this.filterDebounced = val
            console.log(this.filterDebounced)
            this.filteredData = util.filter(this.filterDebounced)
          }, 300)
        }
      }
    },



  watch: {
    '$route' (to, from) {

      console.log(to,from)
      if (document.getElementById('panels')){
        document.getElementById('panels').innerHTML=''
      }
      this.load()

    }
  },


  created: async function(){


    this.load()


  },
  methods:{

    sourceInfo: function(key){
      return util.sourceInfo(key)
    },

    hostOf: function(url){
      return util.hostOf(url)
    },

    // one link for each article a reference points to, and whether any of them has a summary
    articleUrls: function(d){
      return d.articles.filter((a)=>{ return a.urls.length>0 }).map((a)=>{ return a.urls[0] })
    },

    hasSummary: function(d){
      return d.articles.filter((a)=>{ return a.blocks.length>0 }).length>0
    },

    // bullet points are a summary; anything else is the text itself
    isSummary: function(article){
      let blocks = this.summaries[article.qid]
      if (blocks && blocks.length>0){
        return blocks.filter((b)=>{ return b.bullets }).length>0
      }
      return /summar/i.test(article.rights || '')
    },

    // fetch the block texts of each article linked to this reference
    loadSummaries: function(){
      if (!this.entityData || !this.entityData.articles){ return }
      for (let a of this.entityData.articles){
        if (this.summaries[a.qid]!==undefined || a.blocks.length==0){ continue }
        util.getBlocks(a.qid).then((blocks)=>{
          this.$set(this.summaries, a.qid, blocks)
        }).catch(()=>{
          this.$set(this.summaries, a.qid, [])
        })
      }
    },


    load: async function(){

    // console.log('hello', this.$route.name)
      this.type = this.$route.name
      this.qid = this.$route.params.qid


      if (this.allData.length==0){

        // the componet was just loaded but the util might have it
        if (util.allData.length!==0){
          this.allData=util.allData
        }else{
          // load it
          this.allData = await util.getAllData()
          // console.log("this.allData",this.allData)
        }




      }    

      // find this entitiy if it is a doc


      this.entityData = this.allData.filter((d)=> { return (d.qid === this.qid) })[0]

      // console.log(this.qid, this.entityData)

      // dedupe the title
      if (this.entityData && this.entityData.titles){
          let existingTitle = ""
          this.entityData.titles = this.entityData.titles.filter((v) =>{

            if (existingTitle.indexOf(v) === -1){
                existingTitle = existingTitle + v
                return true
            }else{
                return false
            }


          })
      }



      if (this.type == 'document'){
        this.loadSummaries()
      }

      if (this.type == 'people' || this.type == 'publisher' || this.type == 'published'){


        // this is a person build the lookup data

        let r = await util.getWikidata(this.qid)

        this.wikidata = r.wikidata
        this.label = r.label


        // console.log('this.wikidata',this.wikidata)
        // console.log('this.label',this.label)

        if (this.wikidata != null){

          var x = document.createElement('div')
          x.setAttribute("data-qid",this.wikidata)
          x.classList.add('wiki-knowledge-card')
          document.getElementById('panels').appendChild(x)
          wikiCards.init()  



          window.setTimeout(()=>{
            
            if (document.getElementsByClassName('knowledge-card-wiki-wikiLinks').length>0){

              var wikipediaLink = document.createElement('a')
              wikipediaLink.setAttribute('href','http://base.semlab.io/entity/'+this.qid)

              wikipediaLink.innerHTML="SemLab_Wikibase"
              document.getElementsByClassName('knowledge-card-wiki-wikiLinks')[0].appendChild(wikipediaLink)



            }
          },1000)
          



        }


          let uri = 'http://base.semlab.io/entity/'+this.qid
          


          // also filter
          if (this.type == 'people'){
            this.filteredData = this.allData.filter((d)=> {  
              let creatorUris = d.creators.map((c)=>c.uri)
              if (creatorUris.indexOf(uri)>-1){
                return true
              }

              return false
              
            })
          }else if (this.type == 'published'){
            this.filteredData = this.allData.filter((d)=> {  
              let pubInUris = d.pubIn.map((c)=>c.uri)
              if (pubInUris.indexOf(uri)>-1){
                return true
              }

              return false
              
            })

          }else{
            this.filteredData = this.allData.filter((d)=> {  
              let pubUris = d.pubs.map((c)=>c.uri)
              if (pubUris.indexOf(uri)>-1){
                return true
              }

              return false
              
            })

          }


          // console.log(this.filteredData)




        

      }



    }


  }


}
</script>







<style>
  

dt{
  font-weight: bold;
  font-size: 1.25em;
}
dd{
  margin-left: 2em;
  font-size: 1.25em;
}

.no-data{
  color: darkgray;
}

.article-box{
  background: whitesmoke;
  padding: 1em 1.25em;
  border-radius: 0.2em;
  margin-bottom: 1.5em;
}
.article-label{
  font-weight: bold;
  font-size: 1.1em;
}
.article-heading{
  font-weight: bold;
  font-size: 1.25em;
  margin-top: 0.75em;
}
.article-box .article-heading:first-child{
  margin-top: 0;
}
.article-text{
  font-size: 1.1em;
}
.summary-block{
  font-size: 1.1em;
  margin-bottom: 0.5em !important;
}
.summary-block ul{
  margin-top: 0.25em;
}
.summary-block + .summary-block{
  border-top: 1px solid #dbdbdb;
  padding-top: 0.5em;
}
.summary-note{
  font-size: 0.8em;
  color: #4a4a4a;
  margin-top: 0.5em;
}



.wiki-knowledge-card{

    margin-bottom: 8px;    

    text-align: left;    
}
.wiki-knowledge-card select{
    max-width:40px;
}

.knowledge-card-wiki-image{
    height: 250px;
    max-width: 500px;
    background-size: cover;
    background-repeat: no-repeat;

    background-position: center;     
}
.knowledge-card-wiki-image-portrait{
    height: 250px;
    background-size: contain;
    background-repeat: no-repeat;

    background-position-x: left;
}

.knowledge-card-wiki-title{


}
.knowledge-card-wiki-text{

  margin-bottom: 1rem;

}
.knowledge-card-wiki-menu{
    display:flex;
    margin-bottom: 1rem;
}
.knowledge-card-wiki-menu a{
    margin-right:5px;
}
.knowledge-card-wiki-wikiLinks{
    flex:1;
    line-height: 20px;
}

  .nowrap{
    white-space: nowrap;
  }

</style>
