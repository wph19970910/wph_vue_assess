import { login,regist ,logout, getUserInfo } from '@/api/user'
import { setToken, getToken } from '@/libs/util'
import { Modal,Message } from 'iview'

export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    headPic: '',
    token: getToken(),
    access: '',
    hasGetInfo: false
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, userName) {
      state.userName = userName
    },
    setPassword (state, password) {
      state.password = password
    },
    setHeadPic (state, headPic) {
      state.headPic = headPic
    },
    setPhone (state, phone) {
      state.phone = phone
    },
    setName (state, name) {
      state.name = name
    },
    setTeacherId (state, teacherId) {
      state.teacherId = teacherId
    },
    setSubjectId (state, subjectId) {
      state.subjectId = subjectId
    },
    setAccess (state, access) {
      state.access = access
    },
    setNewsCount(state,newsCount){
      state.newsCount = newsCount
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, {userName, password}) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        }).then(res => {
          console.log("111111"+JSON.stringify(res))
          if(res.data.result){
            if(res.data.result.error){
              Message.error(res.data.result.error);
            }
          }
          // 
          const data = res.data
          commit('setToken', data.result.token)
          console.log(data)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          resolve()
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getUserInfo(state.token).then(res => {
            console.log(JSON.stringify(res))
            const data = res.data
            if (null != data.result.manager.headPic) {
              commit('setAvator', 'http://localhost:8081/picture/'+data.result.manager.headPic)
            }else {
              commit('setAvator', 'http://localhost:8081/picture/'+'1.png')
            }
            
            commit('setUserName', data.result.manager.username)
            commit('setHeadPic', data.result.manager.headPic)
            commit('setPhone', data.result.manager.phone)
            commit('setUserId', data.result.manager.id)
            commit('setName', data.result.manager.name)
            commit('setPassword', data.result.manager.password)
            commit('setTeacherId', data.result.manager.teacherId)
            commit('setSubjectId', data.result.manager.subjectId)
            commit('setAccess', data.result.roles)
            commit('setNewsCount', data.result.count)
            commit('setHasGetInfo', true)
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
