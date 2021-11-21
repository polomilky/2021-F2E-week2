<template>
    <v-card
        max-width="400"
        height="80vh"
        class="ml-6 mt-6 pb-2 outerCard__sty"
    >
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
        <!-- 輸入路名或站名 -->
        <v-text-field
            label="輸入路名或站名"
            v-model="keywordText"
            outlined
            solo
            dense
            hide-details="auto"
            append-icon="mdi-magnify"
            class="mb-3 px-4 input__sty"
            v-show="show.keyword"
            @keyup.enter="searchKey"
        ></v-text-field>
        <v-card
            max-width="368"
            class="mb-3 mx-3 innerCard__sty"
            v-for="(item, idx) in cardData"
            :key="item.StationUID"
            @click="getBike(idx)"
        >
            <v-list-item class="grow">
                <v-list-item-content>
                    <v-list-item-title class="title__sty">{{item.StationName.Zh_tw.split('_')[0]}}</v-list-item-title>
                </v-list-item-content>
                <v-spacer></v-spacer>
                <v-list-item-content>
                    <v-list-item-title class="text-right titleStatus__sty">{{item.ServiceStatus === 1 ? '正常營運' : item.ServiceStatus === 2 ? '暫停營運' : '停止營運'}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider class="mx-4"></v-divider>
            <v-list-item class="grow">
                <v-list-item-content class="cardTitle__posSty">
                    <v-list-item-title class="wrap-text cardTitle__sty">{{item.StationName.Zh_tw.split('_')[1]}}</v-list-item-title>
                    <v-list-item-title class="wrap-text cardContent__sty">{{item.StationAddress.Zh_tw}}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="text-center">
                    <v-list-item-title class="cardText__sty">可借</v-list-item-title>
                    <v-list-item-title class="cardNum__sty">{{item.AvailableRentBikes !== '' ? item.AvailableRentBikes : 0}}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="text-center">
                    <v-list-item-title class="cardText__sty">空位</v-list-item-title>
                    <v-list-item-title class="cardNum__sty">{{item.AvailableReturnBikes !== '' ? item.AvailableReturnBikes : 0}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-card>
    </v-card>
</template>

<script>
    import jsSHA from "jssha"

    export default {
        name: 'Section',
        components: {
        },
        props: ['getData'],

        data() {
            return {
                // 關鍵字
                keywordText: null,
                // 關鍵字站點id
                keywordID: null,
                selectcountryItem: null,
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
                    keyword: false
                },
                stationData: [],
                availabilityDataMap: [],
                nearByData: [],
                cardData: [],
            }
        },
        computed: {
        },
        methods: {
            // 選縣市
            getSelectCountry(e) {
                this.selectcountryItem = e;
                this.show.keyword = true;
                // call search api
                this.mapData();
            },
            // 關鍵字
            searchKey() {
                if (this.keywordText !== null) {
                    const keyword = this.keywordText.trim();
                    // this.keywordText = null;
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
            getStationData() {
                let filter = '';
                if (this.keywordText !== null) {
                    filter = `$filter=contains(StationName%2Fzh_tw%2C%27${this.keywordText}%27)&`;
                } else {
                    filter = `$top=30&`;
                }
                return new Promise((resolve, reject) => {
                    this.axios.get(
                        `https://ptx.transportdata.tw/MOTC/v2/Bike/Station/${this.selectcountryItem}?${filter}$format=JSON`, {
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
                        `https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/${this.selectcountryItem}?$format=JSON`, {
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
                    this.keywordID = this.stationData.StationUID;
                    this.availabilityData = await this.getAvailabilityData(this.keywordID);
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
                    this.cardData = this.stationData;
                    // this.$emit('listenToChildEvent', this.stationData);
                } catch (err) {
                    console.log(err);
                    alert(`錯誤: ${err}`)
                }
            },
            // 取得所選區塊
            getBike(idx) {
                this.$emit('listenToSectionChildEvent', [this.cardData[idx].StationPosition.PositionLat, this.cardData[idx].StationPosition.PositionLon]);
            }
        },
        mounted() {
        },
        watch: {
            getData(val) {
                this.cardData = val;
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
    html
        overflow: hidden !important
    .title__sty, .titleStatus__sty, cardTitle__sty, .cardContent__sty, .cardText__sty, .cardNum__sty
        font-family: $primary-text
        font-style: normal
    .title__sty, .titleStatus__sty
        font-weight: 500
        font-size: 14px
        line-height: 20px
    .outerCard__sty 
        flex-grow: 1
        overflow: auto
    .cardContent__sty, .cardText__sty
        font-weight: normal
        font-size: 12px
        line-height: 17px
    .title__sty
        color: #7B7B7B
    .titleStatus__sty
        color: $primary-colors-G
    .wrap-text
        white-space: normal !important
    .cardTitle__posSty
        flex: 3
    .cardTitle__sty
        color: #333333
        font-weight: bold
        font-size: 20px
        line-height: 29px
    .cardContent__sty, .cardText__sty
        color: #7B7B7B
    .cardNum__sty
        font-weight: bold
        font-size: 20px
        line-height: 29px
        color: $primary-colors-Y
</style>
