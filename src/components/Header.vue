<template>
  <v-app-bar
    dense
    app
    color="white"
    class="header__sty"
  >
    <div class="d-flex align-center">
      <v-img
        alt="Logo"
        class="shrink mr-2"
        contain
        src="../assets/logo.png"
        transition="scale-transition"
      />
    </div>
    <v-spacer></v-spacer>
    <div class="screen_sty">
      <v-btn outlined class="btn__sty mr-2" to="/">借 / 還車</v-btn>
      <v-btn outlined class="btn__sty" to="/road">自行車道</v-btn>
    </div>
    <div class="screenM_sty" style="width: 130px; z-index: 500">
      <v-select
        :items="items"
        v-model="selectItem"
        outlined
        solo
        dense
        hide-details="auto"
        @change="goUrl"
      ></v-select>
    </div>
  </v-app-bar>
</template>

<script>
  export default {
    name: 'Header',

    data: () => ({
      items: [
        '借 / 還車',
        '自行車道'
      ],
      selectItem: null
    }),
    computed: {
    },
    methods: {
      goUrl(e) {
        // console.log(e);
        if (e === '借 / 還車') {
          if (this.$route.path === '/') {
            return false;
          } else {
            this.$router.push('/');
          }
        } else {
          if (this.$route.path === '/road') {
            return false;
          } else {
            this.$router.push('/road');
          }
        }
      },
      init() {
        if (this.$route.path === '/') {
          this.selectItem = '借 / 還車';
        } else {
          this.selectItem = '自行車道';
        }
      }
    },
    mounted() {
      this.init();
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
  .v-sheet.v-app-bar.v-toolbar:not(.v-sheet--outlined).header__sty
    box-shadow: 0px 1px 4px rgba(157, 157, 157, 0.25)
  .v-btn--outlined.btn__sty
    color: $primary-colors-Y
  .v-btn--active.btn__sty
    background: $primary-colors-Y
    color: #ffffff
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
