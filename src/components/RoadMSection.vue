<template>
    <div class="outer__sty">
        <div class="outerSelect__sty">
            <!-- 搜尋縣市 -->
            <v-select
                :items="countryItems"
                v-model="selectcountryItem"
                item-text="name"
                item-value="value"
                label="縣 / 市"
                outlined
                solo
                dense
                hide-details="auto"
                @change="getSelectCountry"
                class="py-4 px-4 input__sty"
            ></v-select>
            <!-- 搜尋自行車道 -->
            <v-text-field
                label="搜尋自行車道"
                v-model="roadText"
                outlined
                solo
                dense
                hide-details="auto"
                append-icon="mdi-magnify"
                class="mb-3 px-4 input__sty"
                v-show="show.roadText"
                @keyup.enter="searchRoad"
            ></v-text-field>
        </div>
        <v-card
            width="100%"
            height="40vh"
            class="pt-6 outerCard__sty"
        >
            <!-- 附近的自行車道 -->
            <!-- 熱門推薦 -->
            <p class="mx-3 mb-2 title__sty">熱門推薦</p>
            <v-card
                max-width="368"
                class="mb-3 mx-3 innerCard__sty"
                v-for="(item, idx) in shapData"
                :key="idx"
                @click="getRoadGeo(idx)"
            >
                <v-list-item class="grow">
                    <v-list-item-content>
                        <v-list-item-title class="wrap-text title__sty">{{item.Town}}</v-list-item-title>
                    </v-list-item-content>
                    <v-spacer></v-spacer>
                    <v-list-item-content>
                        <v-list-item-title class="text-right titleStatus__sty">約 {{item.CyclingLength/1000}} km</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider class="mx-4"></v-divider>
                <v-list-item>
                    <v-list-item-content class="pb-0">
                        <v-list-item-title class="wrap-text cardTitle__sty">
                            {{item.RouteName}}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list>
                    <v-list-item>
                        <v-list-item-title class="wrap-text cardText__sty">{{item.RoadSectionStart}}</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon v-if="item.Direction === '雙向'">mdi-swap-horizontal</v-icon>
                            <v-icon v-else>mdi-trending-neutral</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="text-right wrap-text cardText__sty">{{item.RoadSectionEnd}}</v-list-item-title>
                    </v-list-item>
                    <!-- <v-list-item-content class="text-center px-3 py-1">
                        <v-btn class="white--text btn__sty">附近景點或餐廳</v-btn>
                    </v-list-item-content> -->
                </v-list>
            </v-card>
        </v-card>
    </div>
</template>

<script>
    import jsSHA from "jssha"
    import WKT from "terraformer-wkt-parser"

    export default {
        name: 'RoadSection',
        components: {
        },
        props: [],

        data() {
            return {
                selectcountryItem: 'Taipei',
                roadText: null,
                countryItems: [
                    { name: '臺北市', value: 'Taipei' },
                    { name: '新北市', value: 'NewTaipei' },
                    { name: '桃園市', value: 'Taoyuan' },
                    { name: '新竹市', value: 'Hsinchu' },
                    { name: '苗栗縣', value: 'MiaoliCounty' },
                    { name: '台中市', value: 'Taichung' },
                    { name: '嘉義市', value: 'Chiayi' },
                    { name: '臺南市', value: 'Tainan' },
                    { name: '高雄市', value: 'Kaohsiung' },
                    { name: '屏東縣', value: 'PingtungCounty' },
                    { name: '金門縣', value: 'KinmenCounty' },
                ],
                show: {
                    roadText: true
                },
                shapData: [],
            }
        },
        computed: {
        },
        methods: {
            // 選縣市
            getSelectCountry(e) {
                this.selectcountryItem = e;
                this.show.roadText = true;
                // call search api
                this.mapData();
            },
            // 關鍵字
            searchRoad() {
                if (this.roadText !== null) {
                    const keyword = this.roadText.trim();
                    // this.roadText = null;
                    if (!keyword) {
                        return false;
                    } else {
                        this.mapData();
                    }
                } else {
                    return false;
                }
            },
            // api
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
            getShapeData() {
                let filter = '';
                if (this.roadText !== null) {
                    filter = `$filter=contains(RouteName%2C%20'${this.roadText}')&`;
                } else {
                    filter = `$top=30&`;
                }
                return new Promise((resolve, reject) => {
                    this.axios.get(
                        `https://ptx.transportdata.tw/MOTC/v2/Cycling/Shape/${this.selectcountryItem}?${filter}$format=JSON`, {
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
                    this.shapData = await this.getShapeData();
                    this.getRoadGeo(0);
                } catch (err) {
                    console.log(err);
                    alert(`錯誤: ${err}`)
                }
            },
            // 取得所選區塊
            getRoadGeo(idx) {
                let wkts = this.shapData[idx].Geometry;
                const wkttogeojson = WKT.parse(wkts);
                console.log(wkttogeojson);
                this.$emit('listenToChildEvent', wkttogeojson);
            }
        },
        mounted() {
            this.mapData();
        },
        watch: {
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
    html
        overflow: hidden !important
    .title__sty, .titleStatus__sty, cardTitle__sty, .cardText__sty
        font-family: $primary-text
        font-style: normal
    .title__sty, .titleStatus__sty
        font-weight: 500
        font-size: 14px
        line-height: 20px
    .outer__sty
        width: 90%
    .outerSelect__sty
        float: right
    .outerCard__sty 
        flex-grow: 1
        overflow: auto
        position: absolute
        top: 45vh
        left: 50%
        transform: translateX(-45%)
    .cardText__sty
        font-weight: normal
        font-size: 12px
        line-height: 16px
    .title__sty
        color: $primary-colors-G
    .titleStatus__sty
        color: $primary-colors-Y
    .wrap-text
        white-space: normal !important
    .cardTitle__sty
        color: #333333
        font-weight: bold
        font-size: 20px
        line-height: 28px
    .cardText__sty
        color: #7B7B7B
    .v-btn:not(.v-btn--round).v-size--default.btn__sty
        width: 336px
        height: 45px
    .theme--light.v-btn.v-btn--has-bg.btn__sty
        background: $primary-colors-Y
        box-shadow: 0px 2px 4px rgba(103, 103, 103, 0.5)
        border-radius: 8px
</style>
