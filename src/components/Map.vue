<template>
    <div class="Map">
        <!-- :bounds="bounds" -->
        <l-map
            ref="map"
            :zoom="zoom"
            :center="getCenter"
            style="height: 92vh"
        >
            <l-tile-layer
                :url="url"
                :attribution="attribution"
            />
            <!-- 您的位置 -->
            <l-marker ref="yourMarker" :lat-lng="getCenter">
                <l-popup content="您的位置" />
            </l-marker>
            <!-- 附近的車 -->
            <v-marker-cluster>
                <l-marker
                    ref="nearByMarker"
                    v-for="(item, idx) in nearByData"
                    :key="item.StationUID"
                    :lat-lng="[item.StationPosition[0], item.StationPosition[1]]"
                    @click="showSelect(idx)"
                >
                    <!-- 暫停營運 無車可借 車位滿了 正常租借 -->
                    <l-icon
                        :icon-url="item.status === 0 ? icon.type.black : item.AvailableRentBikes === 0 ? icon.type.yellow : item.AvailableReturnBikes === 0 ? icon.type.red : icon.type.green"
                        :icon-size="icon.iconSize"
                    />
                </l-marker>
            </v-marker-cluster>
        </l-map>
    </div>
</template>

<script>
    import jsSHA from "jssha"
    // import { latLngBounds } from "leaflet";
    import { LMap, LTileLayer, LMarker, LPopup, LIcon } from "vue2-leaflet";
    // 載入 markercluster 並啟用
    import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';

    export default {
        name: 'Map',
        props: ['getCenter', 'getSelectPos'],
        components: {
            LMap,
            LTileLayer,
            LMarker,
            LPopup,
            LIcon,
            'v-marker-cluster': Vue2LeafletMarkerCluster,
        },

        data() {
            return {
                zoom: 15,
                url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_MAPBOX}`,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                icon: {
                    type: {
                        black: require('@/assets/marker_BBike.png'),
                        green: require('@/assets/marker_GBike.png'),
                        red: require('@/assets/marker_RBike.png'),
                        yellow: require('@/assets/marker_YBike.png'),
                        fullBlack: require('@/assets/marker_FBBike.png'),
                        fullGreen: require('@/assets/marker_FGBike.png'),
                        fullRed: require('@/assets/marker_FRBike.png'),
                        fullYellow: require('@/assets/marker_FYBike.png'),
                    },
                    iconSize: [45, 50],
                },
                // maxZoom: 18,
                // data
                stationData: [],
                availabilityData: [],
                nearByData: [],

                // bounds: latLngBounds([
                //     [this.getSelectPos[0], this.getSelectPos[1]],
                //     // this.getSelectPos
                // ]),
            }
        },
        computed: {
        },
        methods: {
            showNowPos() {
                this.$nextTick(() => {
                    this.$refs.yourMarker.mapObject.openPopup()
                })
            },
            getAuthorizationHeader() {
                //  填入自己 ID、KEY 開始
                let AppID = process.env.VUE_APP_API_ID;
                let AppKey = process.env.VUE_APP_API_KEY;
                //  填入自己 ID、KEY 結束
                let GMTString = new Date().toGMTString();
                let ShaObj = new jsSHA('SHA-1', 'TEXT');
                ShaObj.setHMACKey(AppKey, 'TEXT');
                ShaObj.update('x-date: ' + GMTString);
                let HMAC = ShaObj.getHMAC('B64');
                let Authorization = `hmac username="${AppID}",algorithm="hmac-sha1",headers="x-date",signature="${HMAC}"`
                return { 'Authorization': Authorization, 'X-Date': GMTString };
            },
            getStationData() {
                return new Promise((resolve, reject) => {
                    this.axios.get(
                        `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$spatialFilter=nearby(${this.getCenter[0]}%2C%20${this.getCenter[1]}%2C%201000)&$format=JSON`, {
                            headers: this.getAuthorizationHeader()
                        }
                    )
                        .then((response) => {
                            resolve(response.data);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            getAvailabilityData() {
                return new Promise((resolve, reject) => {
                    this.axios.get(
                        `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$spatialFilter=nearby(${this.getCenter[0]}%2C%20${this.getCenter[1]}%2C%201000)&$format=JSON`, {
                            headers: this.getAuthorizationHeader()
                        }
                    )
                        .then((response) => {
                            resolve(response.data);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            async mapData() {
                try {
                    this.stationData = await this.getStationData();
                    this.availabilityData = await this.getAvailabilityData();
                    let availabilityDataMap = new Map(this.availabilityData.map(({StationUID, AvailableRentBikes}) => ([StationUID, AvailableRentBikes])));
                    this.stationData = this.stationData.map(obj => ({...obj, AvailableRentBikes:availabilityDataMap.get(obj.StationUID) || ''}));
                    availabilityDataMap = new Map(this.availabilityData.map(({StationUID, AvailableReturnBikes}) => ([StationUID, AvailableReturnBikes])));
                    this.stationData = this.stationData.map(obj => ({...obj, AvailableReturnBikes:availabilityDataMap.get(obj.StationUID) || ''}));
                    availabilityDataMap = new Map(this.availabilityData.map(({StationUID, ServiceStatus}) => ([StationUID, ServiceStatus])));
                    this.stationData = this.stationData.map(obj => ({...obj, ServiceStatus:availabilityDataMap.get(obj.StationUID) || ''}));
                    availabilityDataMap = new Map(this.availabilityData.map(({StationUID, ServiceType}) => ([StationUID, ServiceType])));
                    this.stationData = this.stationData.map(obj => ({...obj, ServiceType:availabilityDataMap.get(obj.StationUID) || ''}));
                    // console.log(this.stationData);
                    this.stationData.forEach((item) => {
                        this.nearByData.push({
                            StationUID: item.StationUID,
                            StationAddress: item.StationAddress.Zh_tw,
                            StationPosition: [item.StationPosition.PositionLat, item.StationPosition.PositionLon],
                            ServiceType: item.ServiceType,
                            AvailableRentBikes: item.AvailableRentBikes,
                            AvailableReturnBikes: item.AvailableReturnBikes,
                            ServiceStatus: item.ServiceStatus,
                            MarkStatus: false
                        })
                    })
                    this.$emit('listenToChildEvent', this.stationData);
                } catch (err) {
                    console.log(err);
                    alert(`錯誤: ${err}`)
                }
            },
            showSelect(idx) {
                // this.stationData[idx].MarkStatus = !this.stationData[idx].MarkStatus;
                let getData = [];
                getData.push(this.stationData[idx]);
                this.$emit('listenToChildEvent', getData);
            },
        },
        mounted() {
            this.showNowPos();
            this.mapData();
        },
        watch: {
            getSelectPos(val) {
                console.log(val);
                // this.bounds.latLngBounds = ([
                //     [val[0], val[1]]
                // ])
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
</style>
