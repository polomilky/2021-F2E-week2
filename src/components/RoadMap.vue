<template>
    <div class="Map">
        <div id="map-road" class="mapRoad"></div>
    </div>
</template>

<script>

    export default {
        name: 'Map',
        props: ['getCenter', 'getRouteData'],
        components: {
        },

        data() {
            return {
                map: null,
                MapUrl: `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_MAPBOX}`,
                posData: this.getRouteData,
                newPosData: [],
            }
        },
        computed: {
        },
        methods: {
            async initMap() {
                this.map = this.$utils.map.createMap("map-road");
                // 地圖中心位置
                this.map.setView(this.getCenter, 13);
                // 加入圖層
                this.$utils.map.createTileLayer(this.map, this.MapUrl, {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    titleSize: 512,
                    // zoomOffset: -1
                });
                // 畫線
                this.drawPolyLine();
            },
            // 畫線
            drawPolyLine() {
                const myStyle = {
                    "color": "#ff0000",
                    "weight": 5,
                    "opacity": 0.65
                };
                this.newPosData = [];
                this.posData.coordinates[0].forEach((item) => {
                    this.newPosData.push([item[1], item[0]]);
                })
                this.$utils.map.createPolyLine(
                    this.map,
                    this.newPosData,
                    myStyle
                );
            },
            // 刪除上一個線
        },
        mounted() {
            this.initMap();
        },
        watch: {
            getRouteData(val) {
                this.posData = val;
                // 畫線
                this.drawPolyLine();
            }
        }
    }
</script>

<style lang="sass" scoped>
    $primary-colors-Y: #F1A923
    $primary-colors-R: #D9661F
    $primary-colors-W: #FCECD0
    $primary-colors-G: #9FB07A
    $primary-colors-B: #528370
    $primary-text: 'Noto Sans TC'

    .mapRoad
        height: 92vh
</style>
