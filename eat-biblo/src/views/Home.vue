<template>
  <div class="home">




<div class="container is-fluid">
    <div class="columns">
      <div class="column" style="text-align: left;">

        <h1 class="is-size-2">E.A.T. Bibliography</h1>
        <div style="background: whitesmoke; padding: 0.5em; border-radius: 0.2em;">
          Below is a bibliography from the from the <a href="https://semlab.io/">Semantic Lab @ Pratt</a> E.A.T. Bibliography project. The E.A.T. Bibliography provides a list of over 600 bibliographic references to material published by E.A.T. and articles on E.A.T. activities from 1965 to 1980. The Semantic Lab has converted this bibliographic information into linked data with the goal of enhancing the E.A.T. + LOD knowledge base and providing a unified access point to E.A.T. sources. Project documentation can be found on our <a href="https://base.semlab.io/wiki/Item_talk:Q20517#The_E.A.T._Bibliography_Project_Wikibase_Project_Page">Wikibase</a>.
        </div>

        <div style="font-size: 0.85em; padding: 0.5em"><a href="https://query.semlab.io/#select%20%3Fitem%20%3FitemLabel%20%3Finstance%20%3FinstanceLabel%20%3Fcreator%20%3FcreatorLabel%20%3Ftitle%20%3Fdate%20%3Fpublisher%20%3FpublisherLabel%20%3FpubPlace%20%3FpubPlaceLabel%20%3FlocalId%20%3FreportedDate%20%3Fpagenumber%20%3Fdescription%20where%7B%0A%20%20%20%20%0A%20%20%3Fitem%20wdt%3AP11%20wd%3AQ20517%20.%0A%20%20%3Fitem%20wdt%3AP1%20wd%3AQ19069%20.%0A%20%20%0A%20%0A%20optional%7B%3Fitem%20wdt%3AP1%20%3Finstance%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP74%20%3Fcreator%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP82%20%3Ftitle%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP98%20%3Fdate%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP84%20%3Fpublisher%20%7D%20%0A%20optional%7B%3Fitem%20wdt%3AP104%20%3FpubPlace%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP17%20%3FlocalId%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP134%20%3FreportedDate%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP87%20%3Fpagenumber%20%7D%0A%20optional%7B%3Fitem%20wdt%3AP130%20%3Fdescription%7D%0A%20%20%20%20%20%20%20%20%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%20%23%20Helps%20get%20the%20label%20in%20your%20language%2C%20if%20not%2C%20then%20en%20language%0A%0A%20%20%0A%20%20%0A%20%20%7D">Source query for data</a></div>
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
          <th>Creators</th>
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

          <td><div v-for="(d,idx) in d.pageNumbers" v-bind:key="idx+d">{{d}}</div></td>
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
