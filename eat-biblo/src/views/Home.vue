<template>
  <div class="home">




<div class="container is-fluid">
    <div class="columns">
      <div class="column" style="text-align: left;">

        <h1 class="is-size-2">E.A.T. Bibliography</h1>
        <div style="background: whitesmoke; padding: 0.5em; border-radius: 0.2em;">
          The E.A.T. Bibliography [1] contains a comprehensive list of bibliographic references related to the avant-garde movement <span style="font-style: italic;">Experiments in Art and Technology (E.A.T.)</span>. This online version includes a subset of 447 references covering the period 1965-1969. Driven by SPARQL queries, it was developed by the <a href="https://semlab.io/">Semantic Lab</a>, which converted these references into linked open data. Project documentation is available on the <a href="https://base.semlab.io/wiki/Item_talk:Q20517#The_E.A.T._Bibliography_Project_Wikibase_Project_Page">Wikibase Project Page</a>. 
          <p style="font-size:0.75em; margin-top: 0.5em;"> 
          [1] Klüver, B. (1980). E.A.T. bibliography: August 12, 1965-January 18, 1980. New York: Experiments in Art and Technology. 
          </p>


        </div>

        <div style="font-size: 0.85em; padding: 0.5em"><a href="https://query.semlab.io/#%0A%09%09select%20%3Fitem%20%3FitemLabel%20%3Finstance%20%3FinstanceLabel%20%3Fcreator%20%3FcreatorLabel%20%3Ftitle%20%3Fdate%20%3Fpublisher%20%3FpublisherLabel%20%3FpublishedIn%20%3FpublishedInLabel%20%3FpubPlace%20%3FpubPlaceLabel%20%3FlocalId%20%3FreportedDate%20%3FpageNumber%20%3FnumberPages%20%3Fdescription%20where%7B%0A%0A%09%09%09%3Fitem%20wdt%3AP11%20wd%3AQ20517%20.%0A%09%09%09%3Fitem%20wdt%3AP1%20wd%3AQ27513%20.%0A%0A%09%09%09optional%7B%3Fitem%20wdt%3AP1%20%3Finstance%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP91%20%3Fcreator%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP82%20%3Ftitle%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP98%20%3Fdate%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP84%20%3Fpublisher%20%7D%20%0A%09%09%09optional%7B%3Fitem%20wdt%3AP104%20%3FpubPlace%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP17%20%3FlocalId%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP134%20%3FreportedDate%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP87%20%3FpageNumber%20%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP101%20%3FnumberPages%20%7D%0A%0A%09%09%09%0A%09%09%09optional%7B%3Fitem%20wdt%3AP130%20%3Fdescription%7D%0A%09%09%09optional%7B%3Fitem%20wdt%3AP103%20%3FpublishedIn%7D%0A%0A%0A%0A%09%09%09SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%20%23%20Helps%20get%20the%20label%20in%20your%20language%2C%20if%20not%2C%20then%20en%20language%0A%09%09%7D">Source query for data</a></div>
      </div>
      <div class="column">
       

      </div>
    </div>

</div>




<div class="container is-fluid">
    <div class="columns">
      <div class="column">
        <input class="input is-normal" autofocus v-model="filter" type="text" placeholder="Filter">


      </div>
      <div class="column">
       

      </div>
    </div>

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
    }



  ,

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
        
        this.filteredData = this.allData
        console.log(this.allData)
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

</style>
