<template>
  <div id="app">


    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

/* which source a reference comes from */
.tag.source-eb { background-color: #e8e8e8; color: #363636; }
.tag.source-cv { background-color: #fdf0c8; color: #5c4700; }
.tag.source-news { background-color: #dcebfb; color: #0d3c6e; }
</style>
