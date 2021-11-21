<template>
  <div>
    <Header />
    <!-- v-if="bikeData.length !== 0" -->
    <Section
      class="screen_sty"
      style="position: absolute; z-index: 500;"
      :getData="bikeData"
      @listenToSectionChildEvent="getSearchDatafromChild"
    />
    <!-- 手機 -->
    <MSection
      class="screenM_sty"
      style="position: absolute; z-index: 500;"
      :getData="bikeData"
      @listenToSectionChildEvent="getSearchDatafromChild"
    />
    <Map
      :getCenter="center"
      :getSelectPos="selectPos"
      @listenToChildEvent="getDatafromChild"
      v-if="center.length !== 0"
    />
  </div>
</template>

<script>
  import Header from '../components/Header'
  import Section from '../components/Section'
  import MSection from '../components/MSection'
  import Map from '../components/Map'

  // import jsSHA from "jssha"

  export default {
    name: 'Home',

    components: {
      Header,
      Section,
      MSection,
      Map
    },
    computed: {
    },
    data: () => ({
      // center: [25.09108, 121.5598],
      center: [],
      // data
      bikeData: [],
      // 所選卡片經緯度
      selectPos: [],
    }),
    methods: {
      init() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(this.showPosition);
        } else {
          this.center = [25.09108, 121.5598];
        }
      },
      showPosition(position) {
        this.center = [position.coords.latitude, position.coords.longitude];
        this.selectPos = [position.coords.latitude, position.coords.longitude];
      },
      getDatafromChild(item) {
        // console.log(item);
        this.bikeData = item;
      },
      getSearchDatafromChild(item) {
        // this.bikeData = item;
       this.selectPos = item;
      },
    },
    mounted() {
      this.init();
    }
  }
</script>

<style lang="sass" scoped>
  @media only screen and (min-width: 601px)
    .screenM_sty
      display: none
    .screen_sty
      display: inline-block
  @media only screen and (max-width: 600px)
    .screen_sty
      display: none
    .screenM_sty
      display: inline-block
</style>
