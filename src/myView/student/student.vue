<style>
    .demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }
    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
</style>
<template>
  <div>
    <Card class="mb-10">
      <Row>
        <Col span="12">
          <h3>学生管理</h3>
        </Col>
        <Col span="12" class="text-right">
          <component2 v-if="superAdmin">
            <Button type="primary" @click='addItem'class="mr-10">新建</Button>
          </component2>
          <component2 v-if="superAdmin">
            <Button type="error" @click="myDelete">删除</Button>
          </component2>
        </Col>
      </Row>
    </Card>
    <Card>
    <Row style="margin-bottom: 10px;">
      <!-- <Col span="4">
        <span>审核状态：</span>
        <Select v-model="examineStatu" style="width:100px">
            <Option v-for="item in examineSelect" :value="item.examineCode" :key="item.examineCode">{{ item.examineText }}</Option>
        </Select>
      </Col> -->
          <span>日期范围：</span>
          <DatePicker style="width:160px" type="date" format="yyyy-MM-dd" :value='startTime' @on-change='myStartTime' placeholder="开始日期"></DatePicker>
          <span>~</span>
          <DatePicker style="width:160px;margin-right:20px;" type="date" format="yyyy-MM-dd" :value='endTime' @on-change='myEndTime' placeholder="结束日期"></DatePicker>
          <span>关键字：</span>
          <Input placeholder="请输入姓名/手机号" v-model.trim='searchText' style="width:200px;margin-right:20px;"></Input>
          <Button type="primary" @click='search'>搜索</Button>
    </Row>
        <Table size="large" @on-selection-change="selectOption" stripe ref="selection" :columns="tableCol" :data="tableData">
        </Table>
        <Page class='mt-10 text-right' :total="total" :current='currentPage' :page-size='pageSize' @on-change="changePage" @on-page-size-change="changeSize" show-sizer show-total/>
    </Card>
    
    <Modal
      v-model="saveItem"
      :title="itemTitle"
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="80">
        <input type="hidden" name='id' v-model="formData.id">
        <FormItem label="姓名">
            <Input v-model="formData.name" placeholder="请填写您的姓名" :maxlength="10"></Input>
        </FormItem>
         <span style="color: red;margin-left: 80px;font-size:5px">*手机号为您的登录账号*</span>
        <FormItem label="手机号">
            <Input v-model="formData.phone" placeholder="请填写您的手机号码" :maxlength="11"></Input>
        </FormItem>
         <FormItem label="密码" v-if='addUser'>
            <Input type='password' v-model="formData.password" placeholder="请填写您的密码" :maxlength="11"></Input>
        </FormItem>
        <FormItem label="确认密码" v-if='addUser'>
           <Input type='password' v-model="formData.confirmPwd" placeholder="请确认密码" :maxlength="11"></Input>
       </FormItem>
        <component2 v-if="superAdmin">
          <FormItem label="所在班级" >
             <Row>
                <Col span="12" style="padding-right:10px">
                    <Select v-model="formData.courseId" filterable>
                        <Option v-for="item in courseList" :value="item.id" :key="item.id">{{ item.className }}({{item.cname}})</Option>
                    </Select>
                </Col>
            </Row>
          </FormItem>
        </component2>
      </Form>
      <div slot="footer">
          <Button type="default"  @click="closeSaveItem">关闭</Button>
          <Button type="primary" :disabled='saveItemStatu'  @click="saveItemOk">确认</Button>
      </div>
    </Modal>

     <Modal
      v-model="saveItem1"
      :title="itemTitle1"
      width="60px"
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="80">
        <input type="hidden" name='id' v-model="formData.id">
        <component2 v-if="viewAccessTeacher">
          <FormItem label="评价内容" > 
            <div class="editor-wrapper" >
                <div :id="editorId" ></div>
            </div>
          </FormItem>
          <FormItem label="评分" >
            <div>
               <Row>
                  <Col span="12">
                      <Rate show-text allow-half v-model="formData.customNum">
                          <span style="color: #f5a623">{{ formData.customNum }}</span>
                      </Rate>
                  </Col>
              </Row> 
            </div>
         </FormItem>
        </component2>
      </Form>
      <div slot="footer">
          <Button type="default"  @click="closeSaveItem">关闭</Button>
          <Button type="primary" :disabled='saveItemStatu1'  @click="saveItemOk1">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import Editor from 'wangeditor'
import 'wangeditor/release/wangEditor.min.css'
import { hasOneOf,oneOf } from '@/libs/tools'
import { studentTableData,updateStudent, commentDel,addStudent,getAllCourse,customStudent} from '@/api/data'
export default {
  name: 'Editor',

  props: {
    value: {
      type: String,
      default: ''
    },
    /**
     * 绑定的值的类型, enum: ['html', 'text']
     */
    valueType: {
      type: String,
      default: 'html',
      validator: (val) => {
        return oneOf(val, ['html', 'text'])
      }
    },
    /**
     * @description 设置change事件触发时间间隔
     */
    changeInterval: {
      type: Number,
      default: 200
    },
    /**
     * @description 是否开启本地存储
     */
    cache: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      startTime: '', // 入住日期初始化
      endTime: '',  // 退房日期初始化
      searchText: '', // 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,


      formData:{},      //表单信息
      addUser:true,   //是否为新增用户

      saveItem:false,     //保存操作框
      saveItemStatu:false,     //保存点击状态
      itemTitle:'新建学生',   //保存操作框title

      valueText: 0,
      customText: 0,

      saveItem1:false,     //保存操作框
      saveItemStatu1:false,     //保存点击状态
      itemTitle1:'评分',   //保存操作框title

      selectItemArr: [],    // 选中项目id
      tableCol: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '注册时间',
          key: 'createTimeStr'
        },
        {
          title: '姓名',
          key: 'name'
        },
        {
          title: '手机号',
          key: 'phone'
        },
        {
          title: '所在班级',
          key: 'course',
          render: (h, params) => {
            console.log("++++++"+JSON.stringify(params))
            var oName = params.row.course;
            return h('div', [
              h('span', {}, oName.className+"("+oName.cname+")")
            ])
          }
        },
        {
          width:100,
          title: '操作',
          key: 'examineStatus',
          render: (h, params) => {
              return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  vertical:true,
                  disabled:this.viewStudent
                  //disabled:this.mainTeacher !== null
                },
                on: {
                  click: () => {
                    let getData = JSON.parse(JSON.stringify(this.tableData[params.index]));
                    this.formData = getData;

                    this.itemTitle = '编辑学生信息';
                    
                    this.addUser = false;
                    this.saveItem = true;
                    if(this.courseList.length>=1){
                      return;
                    };

                     getAllCourse().then(res => {
                      if(res.data.success){
                        this.courseList = res.data.result.clasies; 
                       // this.classList = res.data.result.courses;
                       console.log(JSON.stringify(res)) ; 
                      }else if(res.data.errorMsg){
                        this.$Message.warning({
                          content:res.data.errorMsg
                        })
                      }
                    })
                    
                  }
                }
              }, '编辑'),

              h('Button', {
                props: {
                  type: 'success',
                  size: 'large',
                  vertical:true,
                  disabled:this.viewTeacher
                },
                on: {
                  click: () => {
                    let getData = JSON.parse(JSON.stringify(this.tableData[params.index]));
                    this.formData = getData;
                    this.editor.txt.html('');
                    this.itemTitle1 = '评分';
                    //this.addUser = false;
                    this.saveItem1 = true;
                  }
                }
              }, '评分')
            ])
           }
          //customStudent}
        }
      ],
      tableData: [],
      courseList: [],
      listStyle: {
          width: '150px',
          height: '200px'
      }
    }
  },
  methods: {
    async pageInit(){
      studentTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText).then(res => {
        if(res.data.success){
          this.total = res.data.result.data.totalSize;
          this.tableData = res.data.result.data.pageList;
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
    },
    setHtml (val) {
      this.editor.txt.html("")
    },
    changePage(page){
      this.currentPage = page;
      this.pageInit();
    },
    changeSize(size){
      this.pageSize = size;
      this.currentPage = 1;
      this.pageInit();
    },
    addItem(){
      this.formData = {};
      this.itemTitle = '添加学生';
      this.addUser = true;
      this.saveItem = true;
      if(this.courseList.length>=1){
        return;
      };
      getAllCourse().then(res => {
        if(res.data.success){
         this.courseList = res.data.result.clasies; 
         //this.classList = res.data.result.courses;
          console.log(JSON.stringify("+++"+ this.courseList))
        }else{
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
        })
     },
    /*closeUpload(){
      this.upLoadPic = false;
      this.defaultList=[];
      this.uploadList=[];
    },*/
    // 关闭保存项目模态框
    closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.saveItem1 = false;
    },
    saveItemOk(){
      var that = this;
      var formData = this.formData;
      //console.log(JSON.stringify(formData))
      if(!formData.name){
        this.$Message.warning({
          content:'请填写您的姓名！'
        });
        return;
      }else if (!/[\u4e00-\u9fa5_a-zA-Z]+$/.test(formData.name)){
        this.$Message.warning({
          content:'请填写正确的姓名'
        });
        return;
      };
      
      if(!formData.phone){
        this.$Message.warning({
          content:'请填写您的手机号'
        });
        return;
      }else if (!/^1(3|4|5|6|7|8)\d{9}$/.test(formData.phone)){
        this.$Message.warning({
          content:'请填写正确的手机号'
        });
        return;
      };

      if(this.addUser){
        if(!formData.password){
          this.$Message.warning({
            content:'请填写您的密码！'
          });
          return;
        }else if (!/^[\w_-]{5,11}$/.test(formData.password)){
          this.$Message.warning({
            content:'请填写5-11密码'
          });
          return;
        };
        if(!formData.confirmPwd){
          this.$Message.warning({
            content:'请确认您的密码！'
          });
          return;
        }else if (formData.confirmPwd !== formData.password){
          this.$Message.warning({
            content:'两次密码请保持一致'
          });
          return;
        };

        if(!formData.courseId){
          this.$Message.warning({
            content:'请选择班级'
          });
          return;
        };
        
        addStudent(this.formData).then(res => {
          if(res.data.result && res.data.result.error){
            this.$Message.warning({
              content:res.data.result.error
            })
            return;
          }else if(res.data.success){
            this.$Message.success({
              content:'保存用户成功'
            });
            that.saveItem = false;
            that.pageInit();
          }else if(res.data.errorMsg){
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
          that.saveItemStatu = false;
        })
      }else{
        this.saveItemStatu = true;
        updateStudent(this.formData).then(res => {
          // var that = this;
          that.saveItemStatu = false;
          if(res.data.success){
            this.$Message.success({
              content:'修改用户成功'
            });
            that.saveItem = false;
            that.pageInit();
          }else if(res.data.errorMsg){
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
        })
      }
    },

    saveItemOk1(){
      var that = this;
      var formData = this.formData;
      var customText = this.editor.txt.text()
      console.log("666666"+JSON.stringify(customText));
      if(!formData.customNum){
        this.$Message.warning({
          content:'请给学生打分！'
        });
        return;
      };
      if (customText.length > 30 ){
        this.$Message.warning({
          content:'输入的内容不能超过10字'
        });
        return;
      }else if (customText.length < 5) {
        this.$Message.warning({
          content:'输入的内容不能少于5个字'
        });
        return;
      };
        customStudent(this.formData,customText).then(res => {
          if(res.data.result && res.data.result.error){
            this.$Message.warning({
              content:res.data.result.error
            })
            return;
          }else if(res.data.success){
            this.$Message.success({
              content:'评分成功'
            });
            that.saveItem1 = false;
            that.pageInit();
          }else if(res.data.errorMsg){
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
          that.saveItemStatu1 = false;
        })
      },
    // 选中项
    selectOption (selection, row) {
      this.selectItemArr = []
      for (let item of selection) {
        this.selectItemArr.push(item.id)
      }
    },
    // 删除
    myDelete () {
      var selectItemArr = this.selectItemArr
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      commentDel('/student/delStudentById', selectItemArr).then(res => {
        console.log(JSON.stringify(res))
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'删除成功！'
          });
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }

        // this.tableData = res.data.result.data.pageList;
      })
    },
    // 入住日期
    myStartTime (newTime) {
      this.startTime = newTime
    },
    // 退房日期
    myEndTime (newTime) {
      this.endTime = newTime
    },
    // 搜索
    search () {
      this.currentPage = 1;
      this.pageInit();
    }
    
  },
  mounted () {
    // 初始化
    studentTableData(10, 1).then(res => {
       //console.log("----"+JSON.stringify(res));
      if(res.data.success){
        this.total = res.data.result.data.totalSize;
        this.tableData = res.data.result.data.pageList;
      }else if(res.data.errorMsg){
        this.$Message.warning({
          content:res.data.errorMsg
        })
      }
    })



    this.editor = new Editor(`#${this.editorId}`)
    this.editor.customConfig.onchange = (html) => {
      let text = this.editor.txt.text()
      if (this.cache) localStorage.editorCache = html
      this.$emit('input', this.valueType === 'html' ? html : text)
      this.$emit('on-change', html, text)
      this.$refs.editor.setHtml('');
    }
    this.editor.customConfig.menus = [          //菜单配置
        'head',
        //'list',  // 列表
        'justify',  // 对齐方式
        'bold',
        'fontSize',  // 字号
        'italic',
        'underline',
        //'image',  // 插入图片
        'foreColor',  // 文字颜色
        'undo',  // 撤销
        'redo',  // 重复
            ] 
    this.editor.customConfig.onchangeTimeout = this.changeInterval
    // create这个方法一定要在所有配置项之后调用
    this.editor.create()
    // 如果本地有存储加载本地存储内容
    let html = this.value || localStorage.editorCache
    if (html) this.editor.txt.html(html)

  },
  computed: {
    editorId () {
      return `editor${this._uid}`
    },
    access () {
      return this.$store.state.user.access
    },
    mainTeacher () {
      return this.$store.state.user.teacherId
    },
    //所有权限
    viewAccessAll () {
      return hasOneOf(['superAdmin', 'teacher','student'], this.access)
    },
    //部分权限
    viewAccessTeacher(){
      return hasOneOf(['teacher'], this.access)
    },

    viewTeacher () {
      return hasOneOf(['superAdmin','student'], this.access)
    },
  //部分权限
    superAdmin () {
      return hasOneOf(['superAdmin'], this.access)
    },
    //部分权限
    viewStudent () {
      return hasOneOf(['student','teacher'], this.access)
    }
  }
}
</script>
