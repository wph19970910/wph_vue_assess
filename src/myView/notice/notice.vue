<template>
  <div>
    <Card class="mb-10">
      <Row>
        <Col span="12">
          <h3>公告通知列表</h3>
        </Col>
        <Col span="12" class="text-right">
          <component2 v-if="superAdmin">
            <Button type="primary" @click='addItem'class="mr-10">新建</Button>
          </component2>
          <component2 v-if="viewTeacher,mainTeacher!==null" >
            <Button type="primary" @click='addItem1'class="mr-10">新建</Button>
          </component2>
          <component2 v-if="superAdmin">
            <Button type="error" @click="myDelete">删除</Button>
          </component2>
        </Col>
      </Row>
    </Card>
    <Card>
    <Row style="margin-bottom: 10px;">
      <span>日期范围：</span>
          <DatePicker style="width:160px" type="date" format="yyyy-MM-dd" :value='startTime' @on-change='myStartTime' placeholder="开始日期"></DatePicker>
          <span>~</span>
          <DatePicker style="width:160px;margin-right:20px;" type="date" format="yyyy-MM-dd" :value='endTime' @on-change='myEndTime' placeholder="结束日期"></DatePicker>
      <span>关键字：</span>
      <Input placeholder="请输入通知人查询" v-model.trim='searchText' style="width:200px;margin-right:20px;"></Input>
      <Button type="primary" @click='search'>搜索</Button>
    </Row>
        <Table size="large" @on-selection-change="selectOption" stripe ref="selection" :columns="tableCol" :data="tableData"></Table>
        <Page class='mt-10 text-right' :total="total" :current='currentPage' :page-size='pageSize' @on-change="changePage" @on-page-size-change="changeSize" show-sizer show-total />
    </Card>
      <Modal
      v-model="saveItem"
      :title="itemTitle"
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="120">
        <input type="hidden" name='id' v-model="formData.id">
        <FormItem label="通知/公告内容">
            <Input v-model="formData.notice" type="textarea" placeholder="请填写公告或通知内容" :maxlength="10"></Input>
        </FormItem>
        <FormItem label="是否在首页公告显示">
            <RadioGroup v-model="formData.state">
                <Radio :label="0" :key="0"><span>否</span></Radio>
                <Radio :label="1" :key="1"><span>是</span></Radio>
              </RadioGroup>
       </FormItem>
       <FormItem label="请选择通告类型">
            <RadioGroup v-model="formData.rose" type="button">
              <Radio :label="0" :key="0"><span>公告</span></Radio>
              <Radio :label="1" :key="1"><span>表扬</span></Radio>
              <Radio :label="2" :key="2"><span>批评</span></Radio>
            </RadioGroup>
       </FormItem>
       <FormItem label="是否选择通知人">
            <RadioGroup v-model="buttonState" type="button">
                <Radio :label="0" :key="0"><span>否</span></Radio>
                <Radio :label="1" :key="1"><span>是</span></Radio>
              </RadioGroup>
       </FormItem>
        <FormItem label="请选择被通知人" v-if="buttonState==1">
          <Transfer 
                :data="managerNames"
                :targetKeys="targetKeys"
                :list-style="listStyle"
                :render-format="render"
                :operations="['移除','添加']"
                filterable
                @on-change="handleChange"
                >
            </Transfer>
       </FormItem>
      </Form>
      <div slot="footer">
          <Button type="default"  @click="closeSaveItem">关闭</Button>
          <Button type="primary" :disabled='saveItemStatu'  @click="saveItemOk">确认</Button>
      </div>
    </Modal>
<!-- ----------------------------------------------------------------------------- -->
  <Modal
      v-model="saveItem1"
      :title="itemTitle"
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="120">
        <input type="hidden" name='id' v-model="formData.id">
        <FormItem label="通知/公告内容">
            <Input v-model="formData.notice" type="textarea" placeholder="请填写公告或通知内容" :maxlength="10"></Input>
        </FormItem>
        <FormItem label="请选择通告类型">
            <RadioGroup v-model="formData.rose" type="button">
              <Radio :label="0" :key="0"><span>公告</span></Radio>
              <Radio :label="1" :key="1"><span>表扬</span></Radio>
              <Radio :label="2" :key="2"><span>批评</span></Radio>
            </RadioGroup>
       </FormItem>
       <FormItem label="是否选择通知人">
            <RadioGroup v-model="buttonState" type="button">
                <Radio :label="0" :key="0"><span>否</span></Radio>
                <Radio :label="1" :key="1"><span>是</span></Radio>
              </RadioGroup>
       </FormItem>
        <FormItem label="请选择被通知人" v-if="buttonState==1">
          <Transfer 
                :data="managerNames"
                :targetKeys="targetKeys"
                :list-style="listStyle"
                :render-format="render"
                :operations="['移除','添加']"
                filterable
                @on-change="handleChange"
                >
            </Transfer>
       </FormItem>
       <FormItem label="申请在首页显示通告">
            <RadioGroup v-model="formData.state">
                <Radio :label="0" :key="0"><span>否</span></Radio>
                <Radio :label="2" :key="2"><span>是</span></Radio>
              </RadioGroup>
       </FormItem>
      </Form>
      <div slot="footer">
          <Button type="default"  @click="closeSaveItem">关闭</Button>
          <Button type="primary" :disabled='saveItemStatu'  @click="saveItemOk">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { hasOneOf,oneOf } from '@/libs/tools'
import { NoticeTableData, commentDel,getManagerName,addNotice,getStudentName} from '@/api/data'
export default {
  data () {
    return {
      startTime: '', // 入住日期初始化
      endTime: '',  // 退房日期初始化
      searchText: '', // 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,

      loading1: false,
      options1:[],
      managerNames:[],
      targetKeys: [],
      listStyle: {
          width: '130px',
          height: '200px'
      },

      courseList: [],  
      buttonState:0,

      formData:{
        state:0
      },      //表单信息
      addUser:true,   //是否为新增

      selectItemArr: [],    // 选中项目id

      //mainTeacher:0,

      saveItem:false,     //保存操作框
      saveItemStatu:false,     //保存点击状态
      itemTitle:'创建通告/公告', 
      tableCol: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '内容',
          key: 'notice'
        },
        {
           title: '创建时间',
           key: 'createTimeStr'
        },
        {
           title: '通知人',
           key: 'name',
           render: (h, params) => {
           // console.log("++++++"+JSON.stringify(params.row.name))
            var oName = params.row.name;
            if (oName === null) {
               oName = "此通告没有通知人";
            }
            return h('div', [
              h('span', {}, oName)
            ])
          }
        },
        {
           title: '通知类型',
           key: 'roseStr'
        },
      ],
      tableData: []
    }
  },
  methods: {
    async pageInit(){
      NoticeTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText,null).then(res => {
        if(res.data.success){
          this.total = res.data.result.pageBounds.totalSize;
          this.tableData = res.data.result.pageBounds.pageList;
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
    addItem(){
      this.formData = {};
      this.formData.state=0;
      this.itemTitle = '添加通知/公告';
      //this.addUser = true;
      this.saveItem = true;
      if(this.managerNames.length>=1){
        return;
      };
      getManagerName(null).then(res => {
        if(res.data.success){
          //this.managerNames = res.data.result.managerNames;
          var managerNamesArr = res.data.result.managerNames;
          for(var i in managerNamesArr){
          var objCourses = {};
          objCourses.key = managerNamesArr[i].id;
          objCourses.label = managerNamesArr[i].name;
          this.managerNames.push(objCourses)
         };
        }
      })
    },

    addItem1(){
      this.formData = {};
      this.formData.state=0;
      this.itemTitle = '添加通知/公告';
      //this.addUser = true;
      this.saveItem1 = true;
      if(this.managerNames.length>=1){
        return;
      };

      getStudentName().then(res => {
        if(res.data.success){
          //this.managerNames = res.data.result.managerNames;
          var managerNamesArr = res.data.result.managerNames;
          for(var i in managerNamesArr){
          var objCourses = {};
          objCourses.key = managerNamesArr[i].id;
          objCourses.label = managerNamesArr[i].name;
          this.managerNames.push(objCourses)
         };
        }
      })
     },

    closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.saveItem1 = false;
      this.targetKeys=[];
    },

    saveItemOk(){
      var that = this;
      var formData = this.formData;
      console.log("qqqqqqqqqqqq"+JSON.stringify(formData))
      if(!formData.notice){
        this.$Message.warning({
          content:'请填写公告内容！'
        });
        return;
      }
     // return;
      addNotice(this.formData,this.targetKeys).then(res => {
          
          // console.log(JSON.stringify(res))
          if(res.data.result && res.data.result.error){
            this.$Message.warning({
              content:res.data.result.error
            })
            return;
          }else if(res.data.success){
            this.$Message.success({
              content:'公告保存成功'
            });
            that.saveItem = false;
            that.saveItem1 = false;
            that.pageInit();
          }else if(res.data.errorMsg){
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
          that.saveItemStatu = false;
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
      commentDel('/notice/delNotice', selectItemArr).then(res => {
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
    handleChange(newTargetKeys) {
        this.targetKeys = newTargetKeys;
    },
    render (item) {
        return item.label;
    },
     reloadMockData () {
        this.transfer = this.getMockData();
        this.targetKeys = this.getTargetKeys();
    },
    // 开始日期
    myStartTime (newTime) {
      this.startTime = newTime
    },
    // 结束日期
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
    NoticeTableData(10, 1,null,null,null,null).then(res => {
      if(res.data.success){
        console.log("+++++"+JSON.stringify(res))
        this.total = res.data.result.pageBounds.totalSize;
        this.tableData = res.data.result.pageBounds.pageList;
      }else if(res.data.errorMsg){
        this.$Message.warning({
          content:res.data.errorMsg
        })
      }
    })
  },

   computed: {
    access () {
      return this.$store.state.user.access
    },
    mainTeacher () {
      return this.$store.state.user.teacherId
    },
    //所有权限
    superAdmin () {
      return hasOneOf(['superAdmin'], this.access)
    },
  //部分权限
    viewTeacher () {
      return hasOneOf(['teacher'], this.access)
    }
  }
}
</script>
