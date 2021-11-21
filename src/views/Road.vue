<template>
    <div>
        <Header />
        <RoadSection
            class="screen_sty"
            style="position: absolute; z-index: 500;"
            @listenToChildEvent = "getDatafromChild"
        />
        <RoadMSection
            class="screenM_sty"
            style="position: absolute; z-index: 500;"
            @listenToChildEvent = "getDatafromChild"
        />
        <RoadMap
            :getCenter="center"
            :getRouteData="routeData"
            v-if="center.length !== 0"
        />
    </div>
</template>

<script>
    import Header from '../components/Header'
    import RoadSection from '../components/RoadSection'
    import RoadMSection from '../components/RoadMSection'
    import RoadMap from '../components/RoadMap'

    // import jsSHA from "jssha"

    export default {
        name: 'Home',

        components: {
            Header,
            RoadSection,
            RoadMSection,
            RoadMap
        },
        computed: {
        },
        data: () => ({
            // center: [25.09108, 121.5598],
            center: [],
            // data
            routeData: [],
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
            },
            getDatafromChild(geoData) {
                console.log(geoData);
                this.routeData = geoData;
            }
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
