<template>
  <div class="home">




<div class="container is-fluid">
    <div class="columns">
      <div class="column" style="text-align: left;">

        <h1 class="is-size-2">E.A.T. Bibliography</h1>
        <div style="background: whitesmoke; padding: 0.5em; border-radius: 0.2em;">
          The E.A.T. Bibliography [1] contains a comprehensive list of bibliographic references related to the avant-garde movement <span style="font-style: italic;">Experiments in Art and Technology (E.A.T.)</span>. This online version brings together <template v-if="allData.length>0">{{allData.length.toLocaleString()}} references from three sources: {{count('eb')}} from the original bibliography, covering the period 1965-1969; {{count('cv')}} from Billy Klüver's curriculum vitae; and {{count('news')}} press articles found in a 2026 search of newspaper archives, each with a summary and a link to the article.</template><template v-else>references from three sources.</template> Driven by SPARQL queries, it was developed by the <a href="https://semlab.io/">Semantic Lab</a>, which converted these references into linked open data. Project documentation is available on the <a href="https://base.semlab.io/wiki/Item_talk:Q20517#The_E.A.T._Bibliography_Project_Wikibase_Project_Page">Wikibase Project Page</a>. 
          <p style="font-size:0.75em; margin-top: 0.5em;"> 
          [1] Klüver, B. (1980). E.A.T. bibliography: August 12, 1965-January 18, 1980. New York: Experiments in Art and Technology. 
          </p>


        </div>

        <div style="font-size: 0.85em; padding: 0.5em"><a :href="queryLink">Source query for data</a></div>
      </div>
      <div class="column">
       

      </div>
    </div>

</div>




<div class="container is-fluid">
    <div class="columns">
      <div class="column is-one-third">
        <input class="input is-normal" autofocus v-model="filter" type="text" placeholder="Filter">


      </div>
      <div class="column" style="text-align: left;">

        <div class="buttons has-addons source-buttons" role="group" aria-label="Show references from">
          <button class="button" :class="{'is-dark is-selected': source=='all'}" :aria-pressed="String(source=='all')" @click="setSource('all')">All <span class="source-count">{{allData.length}}</span></button>
          <button v-for="s in sources" v-bind:key="s.key" class="button" :class="{'is-dark is-selected': source==s.key}" :aria-pressed="String(source==s.key)" :title="'Only references from ' + s.about" @click="setSource(s.key)">{{s.label}} <span class="source-count">{{count(s.key)}}</span></button>
        </div>

      </div>
    </div>
    <div class="showing" v-if="allData.length>0">Showing {{filteredData.length.toLocaleString()}} of {{allData.length.toLocaleString()}} references</div>

</div>


    <table class="table is-striped is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Title</th>
          <th>Authors</th>
          <th>Date</th>
          <th>Type</th>
          <th>Publisher</th>
          <th>Published In</th>
          <th>Pub City</th>
          <th>Pages</th>
          <th>Id</th>
          <th>Source</th>
          <th>Summary</th>
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

          <td><div v-for="(d,idx) in d.instanceOf" v-bind:key="idx+d" class="nowrap">{{d.label}}</div></td>
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

          <td><div v-for="(d,idx) in d.numberPages" v-bind:key="idx+d">{{d}}</div></td>
          <td><div v-for="(d,idx) in d.localIds" v-bind:key="idx+d">{{d}}</div></td>

          <td><div v-for="s in d.sources" v-bind:key="s"><span class="tag nowrap" :class="'source-'+s" :title="sourceInfo(s).label">{{sourceInfo(s).short}}</span></div></td>

          <td class="nowrap">
            <!-- the summary page also carries the link to the article, so the list shows only one of the two -->
            <div v-if="hasSummary(d)"><router-link :to="`/document/${d.qid}`" title="Summary of the article, with a link to it">summary</router-link></div>
            <template v-else>
              <div v-for="u in articleUrls(d)" v-bind:key="u"><a target="_blank" rel="noopener" :href="u" :title="'Open the article at ' + hostOf(u)">article&nbsp;&#8599;</a></div>
            </template>
          </td>

          <td><a target="_blank" :href="d.uri">data</a></td>


        </tr>
      </tbody>

    </table>

  </div>
</template>





<script>
// @ is an alias to /src

import util from "@/util"




export default {
  name: 'Home',
  components: {

  },

  data() {
    return {

      allData: [],
      filteredData: [],
      timeout: null,
      filterDebounced: '',
      source: 'all',
      sources: util.sources,
      queryLink: 'https://query.semlab.io/#' + encodeURIComponent(util.queriesAllData),
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
            this.applyFilters()
          }, 300)
        }
      }
    }



  ,

  watch: {
    // the source can also be set from the address, e.g. #/?source=news
    '$route' (to) {
      let wanted = this.validSource(to.query.source)
      if (wanted != this.source){
        this.source = wanted
        this.applyFilters()
      }
    }
  },

  methods: {

    validSource: function(key){
      return (util.sources.filter((s)=>{ return s.key == key }).length>0) ? key : 'all'
    },

    count: function(key){
      return this.allData.filter((d)=>{ return d.sources.indexOf(key)>-1 }).length
    },

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

    setSource: function(key){
      this.source = key
      this.applyFilters()
      let query = (key == 'all') ? {} : {source: key}
      if ((this.$route.query.source || 'all') != key){
        this.$router.replace({path: '/', query: query}).catch(()=>{})
      }
    },

    // the text filter and the source filter together
    applyFilters: function(){
      let rows = util.filter(this.filterDebounced)
      if (this.source != 'all'){
        rows = rows.filter((d)=>{ return d.sources.indexOf(this.source)>-1 })
      }
      this.filteredData = rows
      util.homeState = {source: this.source, text: this.filterDebounced}
    }

  },

  created: async function(){

      if (this.allData.length==0){
        this.allData = await util.getAllData()
        for (let d of this.allData){
          // dedupe the title
          if (d && d.titles){
              let existingTitle = ""
              d.titles = d.titles.filter((v) =>{

                if (existingTitle.indexOf(v) === -1){
                    existingTitle = existingTitle + v
                    return true
                }else{
                    return false
                }


              })
          }


          
        }
        
        // come back to what was showing before, unless the address asks for a source
        this.filterDebounced = util.homeState.text
        this.source = (this.$route.query.source) ? this.validSource(this.$route.query.source) : util.homeState.source
        this.applyFilters()
        if (this.source != 'all' && this.$route.query.source != this.source){
          this.$router.replace({path: '/', query: {source: this.source}}).catch(()=>{})
        }
      }    

  }
}
</script>


<style scoped>

  .title-link{
    color:#363636
  }
  .title-link:hover{
    text-decoration: underline;
  }
  .nowrap{
    white-space: nowrap;
  }
  .source-buttons{
    margin-bottom: 0;
  }
  .source-count{
    margin-left: 0.5em;
    font-size: 0.8em;
    opacity: 0.7;
  }
  .showing{
    text-align: left;
    font-size: 0.85em;
    color: #4a4a4a;
    padding: 0 0 0.75em 0.1em;
  }
</style>
