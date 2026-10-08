import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login } from '@/api/user'
import { getToken, setToken, removeToken, setUserInfo, getUserInfo, removeUserInfo } from '@/utils/cookies'
import store from '@/store'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'
export interface IUserState {
  token: string
  name: string
  avatar: string
  storeId: string
  introduction: string
  userInfo: any
  roles: string[]
  username: string
}

@Module({ 'dynamic': true, store, 'name': 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  public introduction = ''
  public userInfo = {}
  public roles: string[] = []
  public username = Cookies.get('username') || ''

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_USERINFO(userInfo: any) {
    this.userInfo = { ...userInfo }
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_USERNAME(name: string) {
    this.username = name
    }

  @Action
  public async Login(userInfo: { username: string, password: string }) {
    let { username, password } = userInfo
    username = username.trim()
    this.SET_USERNAME(username)
    Cookies.set('username', username)
    const { data } = await login({ username, password })
    if (String(data.code) === '1') {
      this.SET_TOKEN(data.data.token)
      setToken(data.data.token)
      this.SET_USERINFO(data.data)
      Cookies.set('user_info', data.data)
      return data
    } else {
      return Message.error(data.msg)
    }
  }

  @Action
  public ResetToken () {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo () {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }

    const data = JSON.parse(<string>getUserInfo())
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }

    this.SET_ROLES(['admin'])
    this.SET_USERINFO(data)
    this.SET_NAME(data.username)
  }

  @Action
  public async LogOut () {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
    Cookies.remove('username')
    Cookies.remove('user_info')
    removeUserInfo()
  }
}

export const UserModule = getModule(User)
