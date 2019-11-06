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
          <h3>班级管理</h3>
        </Col>
        <Col span="12" class="text-right">
          <component2 v-if="Super">
            <Button type="primary" @click='addItem'class="mr-10">新建</Button>
            <Button type="error" @click="myDelete">删除</Button>
          </component2>
        </Col>
      </Row>
    </Card>
    <Card>
    <Row style="margin-bottom: 10px;">
          <span>关键字：</span>
          <Input placeholder="请输入姓名" v-model.trim='searchText' style="width:200px;margin-right:20px;"></Input>
          <Button type="primary" @click='search'>搜索</Button>
    </Row>
        <Table size="large"  @on-selection-change="selectOption" stripe ref="selection" :columns="tableCol" :data="tableData">
        </Table>
        <Page class='mt-10 text-right' :total="total" :current='currentPage' :page-size='pageSize' @on-change="changePage" @on-page-size-change="changeSize" show-sizer show-total/>
    </Card>
    <Modal
      v-model="recordModal"
      title="任教老师详情"
      @on-cancel="closeRecordModal"
      width =60>
      <Table height="300" @on-selection-change="selectOption" stripe ref="selection" :columns="recordCol" :data="recordData"></Table>
      <Button type="primary" icon="ios-arrow-dropdown" ghost long @click="recordLoadMore">加载更多</Button>
      <div slot="footer">
          <Button type="default"  @click="closeRecordModal">关闭</Button>
      </div>
    </Modal>

    <Modal
      v-model="recordModal1"
      title="班内学生详情"
      @on-cancel="closeRecordModal"
      width =60>
      <Table height="300" @on-selection-change="selectOption" stripe ref="selection" :columns="recordCol1" :data="recordData1"></Table>
      <Button type="primary" icon="ios-arrow-dropdown" ghost long @click="recordLoadMore">加载更多</Button>
      <div slot="footer">
          <Button type="default"  @click="closeRecordModal">关闭</Button>
      </div>
    </Modal>


     <Modal
      v-model="saveItem"
      :title="itemTitle"
      width =800
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="100">
        <input type="hidden" name='id' v-model="formData.id">
        <component2 v-if="Super">
        <FormItem label="班级名称">
            <Input v-model="formData.className" placeholder="请填写班级名称" :maxlength="10" style="width: 280px"></Input>
        </FormItem>
        <FormItem label="班级称号">
            <Input v-model="formData.cname" placeholder="请填写班级别名" :maxlength="11" style="width: 280px"></Input>
        </FormItem>
      </component2>
        <FormItem label="班级口号" v-if="this.mainTeacher === formData.teacherId">
            <Input v-model="formData.remark" type="textarea" placeholder="请填写班级口号" :maxlength="10"></Input>
        </FormItem>
      <component2 v-if="viewAccessTeacher">
         <FormItem  v-if="this.mainTeacher !== formData.teacherId">
            <span  style="color: red;margin-left: 80px;font-size:20px">*你不是这个班级的班主任,不能修改*</span>
        </FormItem>
      </component2>
        <component2 v-if="Super">
          <FormItem label="指派任课老师" >
              <Transfer
                  :data="teachersList"
                  :targetKeys="targetKeys"
                  :list-style="listStyle"
                  :render-format="render"
                  :operations="['移除','添加']"
                  filterable
                  @on-change="handleChange"
                  >
              </Transfer>
          </FormItem>
        </component2>
      </Form>
      <div slot="footer">
          <Button type="default"  @click="closeSaveItem">关闭</Button>
          <Button type="primary" :disabled='saveItemStatu'  @click="saveItemOk">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { hasOneOf } from '@/libs/tools'
import { courseTableData,teacherArrTableData,studenrArrTableData,commentDel,appoinPeople,getAllTeacher,addCourse,updateCourse} from '@/api/data'
export default {
  data () {
    return {
      searchText: '', // 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,

      recordModal:false,     
      tableCurrentPage:1,    //评分记录当前页码
      tableTotalPage:1,     //评分记录总页码
      userId:'',      //评分记录用户id
      //customItemArr: [],//评分记录
      courseId:'',//评分记录Id

      textModal:false,     
      //delItemStatu:false,
      courseDelText:'',

      formData:{},      //表单信息
      //teachersModal:false,
      addUser:true, 

      teacherId:'',    
      studentId:'', 
      tea:0, 

      saveItem:false,
      saveItemStatu:false, 
      itemTitle:'班级编辑',

      teachersList: [],
      targetKeys: [],
      listStyle: {
          width: '280px',
          height: '400px'
      },

      selectItemArr: [],    // 选中项目id
      tableCol: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '班级名称',
          key: 'className',
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify(params))
            var oName = params.row.className+"("+params.row.cname+")";
            return h('div', [
              h('span', {}, oName)
            ])
          }
        },
        {
          title: '班主任',
          key: 'teacherName'
        },
        {
          title: '班长',
          key: 'studentName'
        },
        {
          title: '任教老师',
          key: 'teachers',
          render: (h, params) => {
               return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  vertical:true
                },
                on: {
                  click: () => {
                    //console.log("++2222222++++"+JSON.stringify( params.row.teacherId))
                    this.userId = params.row.id;
                    this.teacherId = params.row.teacherId;
                    this.tableInit();
                    this.recordModal = true;
                  }
                }
              }, '详情')
            ])
          }
        },

        {
          title: '班内学生',
          key: 'students',
          render: (h, params) => {
               return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  vertical:true
                },
                on: {
                  click: () => {
                    //console.log("++++++"+JSON.stringify(params))
                    this.userId = params.row.id;
                    this.studentId = params.row.studentId;
                    this.tableInit();
                    this.recordModal1 = true;
                  }
                }
              }, '详情')
            ])
          }
        },
        {
          title: '班级口号',
          key: 'remark',
          width: 300
        },
        {
          width:100,
          title: '操作',
          key: 'examineStatus',
          render: (h, params) => {
           // if(this.viewTeacher){
              return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  vertical:true,
                  disabled:this.viewStudent
                  //disabled:this.mainTeacher !== params.row.teacherId
                },
                on: {
                  click: () => {
                    
                    let getData = JSON.parse(JSON.stringify(this.tableData[params.index]));
                    this.formData = getData;
                    this.saveItem = true;
                    this.addUser = false;
                    this.itemTitle = '编辑班级';
                    if(this.formData.teachers.length>=1){
                      for(var j in this.formData.teachers){
                        this.targetKeys.push(this.formData.teachers[j].id);
                      }
                    }
                    
                    getAllTeacher().then(res => {
                        if(res.data.success){
                        //console.log("00000"+JSON.stringify(res))
                         var teachersArr = res.data.result.teachers;
                         for(var i in teachersArr){
                          var objCourses = {};
                          objCourses.key = teachersArr[i].id;
                          objCourses.label = teachersArr[i].name+'('+teachersArr[i].classEnumString+')';
                          this.teachersList.push(objCourses)
                         };
                         
                        }else {
                           this.$Message.warning({
                            content:res.data.errorMsg
                          })
                        }
                      })
                    
                  }
                }
              }, '编辑')
            ])
           }
        }
      ],
      recordCol:[
        {
          title: '老师名称',
          key: 'teacherName'
        },
        {
          title: '老师手机',
          key: 'teacherPhone'
        },
         {
          title: '老师任教课程',
          key: 'classEnumString'
        },
        {
          width:120,
          title: '操作',
          key: 'examine',
          render: (h, params) => {
            //console.log("+++55wwww5+++"+JSON.stringify(params))
           // if(this.viewTeacher){
              return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  vertical:true,
                  disabled:this.aaTeacher || this.recordData[params.index].id === this.teacherId 
                  //disabled:this.viewAccessTeacher
                },
                on: {
                  click: () => {
                    
                    let getData = JSON.parse(JSON.stringify(this.recordData[params.index]));
                    this.formData = getData;
                    appoinPeople(this.formData.id,this.userId,0).then(res => {
                        if(res.data.success){
                          this.$Message.success({
                            content:'任命班主任成功'
                          });
                           this.tableInit();
                           this.recordModal = false;
                           this.pageInit();
                           //this.recordData=[];
                        }else {
                           this.$Message.warning({
                            content:res.data.errorMsg
                          })
                        }
                      })
                    
                  }
                }
              }, '委任为班主任')
            ])
           }
        }
      ],
      recordCol1:[
        {
          title: '学生名称',
          key: 'studentName'
        },
        {
          title: '老师手机',
          key: 'studentPhone'
        },
        {
          title: '评分',
          key: 'customNumPj',
           render: (h, params) => {
            //console.log("+++111+++"+JSON.stringify(params))
            var oName = params.row.customNumPj+'分';
            return h('div', [
              h('Rate', {
                props: {
                  count: 5,
                  disabled:true,
                  allowHalf:true,
                  showText:true,
                  value:params.row.customNumPj
                }
              }, oName)
            ])
          }
        },
        {
          width:120,
          title: '操作',
          key: 'examine',
          render: (h, params) => {
            //console.log("+++55wwww5+++"+JSON.stringify(this.tableData))
            //console.log("+++66666+++"+JSON.stringify(this.mainTeacher))
           // if(this.viewTeacher){
              return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  vertical:true,
                  disabled:this.recordData1[params.index].id === this.studentId || this.viewTeacher ||this.mainTeacher !== this.tea
                },
                on: {
                  click: () => {
                    
                    let getData = JSON.parse(JSON.stringify(this.recordData1[params.index]));
                    this.formData = getData;
                    appoinPeople(this.formData.id,this.userId,1).then(res => {
                        if(res.data.success){
                          this.$Message.success({
                            content:'任命班长成功'
                          });
                           this.tableInit();
                           this.recordModal1 = false;
                           this.pageInit();
                           //this.recordData=[];
                        }else {
                           this.$Message.warning({
                            content:res.data.errorMsg
                          })
                        }
                      })
                    
                  }
                }
              }, '委任为班长')
            ])
           }
        }
      ],
      tableData: [],
      recordData:[],
      recordData1:[]
    }
  },
  methods: {
    async pageInit(){
      courseTableData(this.pageSize,this.currentPage,this.searchText).then(res => {
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
    async tableInit(){
      teacherArrTableData(this.userId,this.tableCurrentPage).then(res => {
        //console.log("++++++"+JSON.stringify(res))
        this.recordData=[];
        if(res.data.success){
          this.tableCurrentPage = res.data.result.data.currectPage;
          this.tableTotalPage = res.data.result.data.totalPage;
          var dataList = res.data.result.data.pageList;
          var recordO = {};
          for(let item of dataList) {
            recordO = {};
            recordO.id = item.id;
            recordO.teacherName = item.name;
            recordO.teacherPhone = item.phone;
            recordO.classEnumString = item.classEnumString;
            // recordO.positionAddr = item.lock.positionAddr;
            // recordO.name = item.lock.name;
            this.recordData.push(recordO);
          }
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })

      studenrArrTableData(this.userId,this.tableCurrentPage).then(res => {
        //console.log("++++++"+JSON.stringify(res))
        this.recordData1=[];
        if(res.data.success){
          this.tableCurrentPage = res.data.result.data.currectPage;
          this.tableTotalPage = res.data.result.data.totalPage;
          this.tea = res.data.result.courseById.teacherId;
          var dataList = res.data.result.data.pageList;
          var recordO = {};
          for(let item of dataList) {
            recordO = {};
            recordO.id = item.id;
            recordO.studentName = item.name;
            recordO.studentPhone = item.phone;
            recordO.customNumPj = item.customNumPj;
            // recordO.positionAddr = item.lock.positionAddr;
            // recordO.name = item.lock.name;
            this.recordData1.push(recordO);
          }
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
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
    closeRecordModal(){
      this.recordModal = false;
      this.recordModal1 = false;
      this.tableCurrentPage = 1;
      this.recordData = [];
      this.recordData1 = [];
    },
    closeTextModal(){
      this.textModal = false;
      this.tableCurrentPage = 1;
      this.recordData = [];
    },
     closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.targetKeys=[];
      this.teachersList=[];
    },
    addItem(){
      this.formData = {};
      this.itemTitle = '添加班级';
      this.addUser = true;
      this.saveItem = true;
      if(this.teachersList.length>=1){
        return;
      };
      getAllTeacher().then(res => {

        if(res.data.success){
        //console.log("00000"+JSON.stringify(res))
         var teachersArr = res.data.result.teachers;
         for(var i in teachersArr){
          var objCourses = {};
          objCourses.key = teachersArr[i].id;
          objCourses.label = teachersArr[i].name+'('+teachersArr[i].classEnumString+')';
          this.teachersList.push(objCourses)
         };
         
        }else {
           this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
     },
     saveItemOk(){
      var that = this;
      var formData = this.formData;
      //console.log("qqqqqqqqqqqq"+JSON.stringify(formData))
      if(!formData.className){
        this.$Message.warning({
          content:'请填写班级名称！'
        });
        return;
      };
      if(this.addUser){
        //alert(1)
          addCourse(this.formData,this.targetKeys).then(res => {
              // console.log(JSON.stringify(res))
              if(res.data.result && res.data.result.error){
                this.$Message.warning({
                  content:res.data.result.error
                })
                return;
              }else if(res.data.success){
                this.$Message.success({
                  content:'班级保存成功'
                });
                that.saveItem = false;
                //that.saveItem1 = false;
                that.pageInit();
              }else if(res.data.errorMsg){
                this.$Message.warning({
                  content:res.data.errorMsg
                })
              }
              that.saveItemStatu = false;
            })
        }else {
          updateCourse(this.formData,this.targetKeys).then(res => {
              // console.log(JSON.stringify(res))
              if(res.data.result && res.data.result.error){
                this.$Message.warning({
                  content:res.data.result.error
                })
                return;
              }else if(res.data.success){
                this.$Message.success({
                  content:'班级修改成功'
                });
                that.saveItem = false;
                //that.saveItem1 = false;
                this.teachersList=[];
                that.pageInit();
              }else if(res.data.errorMsg){
                this.$Message.warning({
                  content:res.data.errorMsg
                })
              }
              that.saveItemStatu = false;
            })
        }
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
      console.log("++++++"+JSON.stringify(selectItemArr))
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      commentDel('/course/delCourse', selectItemArr).then(res => {
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
      })
    },
    // 搜索
    search () {
      this.currentPage = 1;
      this.pageInit();
    },
    recordLoadMore(){
      if(this.tableCurrentPage === this.tableTotalPage){
        this.$Message.warning({
          content:'暂无更多数据'
        })
        return;
      }
      this.tableCurrentPage += 1;
      this.tableInit();
    },
    handleChange(newTargetKeys) {
        this.targetKeys = newTargetKeys;
    },
    render (item) {
        return item.label;
    },
    reloadMockData () {
        this.transfer = this.getMockData();
        this.targetKeys = this.getTargetKeys();
    }
  },
  mounted () {
    // 初始化
    courseTableData(10, 1).then(res => {
       //console.log("--11111--"+JSON.stringify(res));
      if(res.data.success){
        this.total = res.data.result.data.totalSize;
        this.tableData = res.data.result.data.pageList;
        this.tea=this.tableData.teacherId;
        console.log("----"+JSON.stringify(this.tableData));
      }else if(res.data.errorMsg){
        this.$Message.warning({
          content:res.data.errorMsg
        })
      }
    })
  },
  computed: {
    access () {
      console.log("++++++"+JSON.stringify(this.$store.state.user.access))
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
    viewAccessTeacher () {
      return hasOneOf(['teacher'], this.access)
    },
  //部分权限
    viewTeacher () {
      return hasOneOf(['superAdmin','student'], this.access)
    },
    aaTeacher () {
      return hasOneOf(['teacher','student'], this.access)
    },
    //部分权限
    Super () {
      return hasOneOf(['superAdmin'], this.access)
    },
    //部分权限
    viewStudent () {
      return hasOneOf(['student'], this.access)
    }
  }
}
</script>
