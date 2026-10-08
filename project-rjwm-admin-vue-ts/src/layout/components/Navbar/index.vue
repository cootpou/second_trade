<template>
  <div class="navbar">
    <div class="statusBox">
      <hamburger
        id="hamburger-container"
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb class="breadcrumb-container" />
    </div>

    <div class="right-menu">
      <div class="avatar-wrapper">
        <div :class="shopShow ? 'userInfo' : ''" @mouseenter="toggleShow" @mouseleave="mouseLeaves">
          <el-button type="primary" :class="shopShow ? 'active' : ''">
            {{ name }}<i class="el-icon-arrow-down" />
          </el-button>
          <div v-if="shopShow" class="userList">
            <p class="outLogin" @click="logout">
              退出登录<i />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AppModule } from '@/store/modules/app'
import { UserModule } from '@/store/modules/user'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import Cookies from 'js-cookie'

@Component({
  name: 'Navbar',
  components: {
    Breadcrumb,
    Hamburger,
  },
})
export default class extends Vue {
  private shopShow = false

  get sidebar() {
    return AppModule.sidebar
  }

  get device() {
    return AppModule.device.toString()
  }

  get name() {
    if ((UserModule.userInfo as any).username) {
      return (UserModule.userInfo as any).username
    }
    try {
      return JSON.parse(Cookies.get('user_info') as any).username
    } catch (e) {
      return ''
    }
  }

  private toggleSideBar() {
    AppModule.ToggleSideBar(false)
  }

  private async logout() {
    this.$store.dispatch('LogOut').then(() => {
      this.$router.replace({ path: '/login' })
    })
  }

  toggleShow() {
    this.shopShow = true
  }
  mouseLeaves() {
    this.shopShow = false
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  position: relative;
  background: #ffc100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;

  .statusBox {
    height: 100%;
    align-items: center;
    display: flex;
  }
  .hamburger-container {
    padding: 0 12px 0 20px;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
  .breadcrumb-container {
    float: left;
  }
  .right-menu {
    float: right;
    margin-right: 20px;
    color: #333333;
    font-size: 14px;
  }
  .avatar-wrapper {
    margin-top: 14px;
    margin-left: 18px;
    position: relative;
    float: right;
    width: 120px;
    text-align: left;

    .el-button--primary {
      background: rgba(255, 255, 255, 0.52);
      border-radius: 4px;
      padding-top: 0px;
      padding-bottom: 0px;
      position: relative;
      width: 120px;
      padding-left: 12px;
      text-align: left;
      border: 0 none;
      height: 32px;
      line-height: 32px;
      &.active {
        background: rgba(250, 250, 250, 0);
        border: 0 none;
        .el-icon-arrow-down {
          transform: rotate(-180deg);
        }
      }
    }
  }
}
.el-icon-arrow-down {
  width: 8px;
  height: 8px;
  margin-left: 16px;
  position: absolute;
  right: 16px;
  top: 12px;
}
.userInfo {
  background: #fff;
  position: absolute;
  top: 0px;
  left: 0;
  z-index: 99;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14);
  width: 100%;
  border-radius: 4px;
  line-height: 32px;
  padding: 0 0 5px;
  height: 60px;
  .userList {
    width: 95%;
    padding-left: 5px;
  }
  p {
    cursor: pointer;
    height: 32px;
    line-height: 32px;
    padding: 0 5px 0 7px;
    i {
      margin-left: 10px;
      vertical-align: middle;
      margin-top: 4px;
      float: right;
    }
    &:hover {
      background: #f6f1e1;
    }
  }
}
</style>
