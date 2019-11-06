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
    <Card>
    <Row style="margin-bottom: 10px;">
          <span>关键字：</span>
          <Input placeholder="请输入姓名" v-model.trim='searchText' style="width:200px;margin-right:20px;"></Input>
          <Button type="primary" @click='search'>搜索</Button>
    </Row>
        <Table size="large"  stripe  :columns="tableCol" :data="tableData">
        </Table>
        <Page class='mt-10 text-right' :total="total" :current='currentPage' :page-size='pageSize' @on-change="changePage" @on-page-size-change="changeSize" show-sizer show-total/>
    </Card>
    <Modal
      v-model="recordModal"
      title="评分详情"
      @on-cancel="closeRecordModal"
      width =60>
      <Row style="background:#eee;padding:0px">
        <Col  class="text-right">
        <Card class="mb-1" :bordered="false" >
          <component2 v-if="viewAdmin">
            <Button type="error" @click="myDelete1">删除</Button>
          </component2>
          </Card>
        </Col>
      </Row>
      <Table height="300" @on-selection-change="selectOption" stripe ref="selection" :columns="recordCol" :data="recordData"></Table>
      <Button type="primary" icon="ios-arrow-dropdown" ghost long @click="recordLoadMore">加载更多</Button>
      <div slot="footer">
          <Button type="default"  @click="closeRecordModal">关闭</Button>
      </div>
    </Modal>

    <Modal
      v-model="textModal"
      title="删除原因"
      @on-cancel="closeTextModal"
      width =60>
      <Input v-model="customDelText" type="textarea" :rows="4" placeholder="请填写原因......" />
      <div slot="footer">
          <Button type="default"  @click="closeTextModal">关闭</Button>
           <Button type="primary" :disabled='delItemStatu'  @click="delItemOk">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { hasOneOf } from '@/libs/tools'
import { customTableData,recordTableData,commentDel1} from '@/api/data'
export default {
  data () {
    return {
      searchText: '', // 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,

      recordModal:false,     //评分记录模态框
      tableCurrentPage:1,    //评分记录当前页码
      tableTotalPage:1,     //评分记录总页码
      userId:'',      //评分记录用户id
      //customItemArr: [],//评分记录
      customId:'',//评分记录Id

      textModal:false,     //评分记录模态框
      //delItemStatu:false,
      customDelText:'',

      formData:{},      //表单信息

      selectItemArr: [],    // 选中项目id
      tableCol: [
        {
          title: '姓名',
          key: 'name'
        },
        {
          title: '综合评分',
          key: 'customNumPj',
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify(params))
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
          width:100,
          title: '详情',
          key: 'examineStatus',
          render: (h, params) => {
           // if(this.viewTeacher){
              return h('div', [
               h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  vertical:true
                  //disabled:this.viewStudent
                },
                on: {
                  click: () => {
                    //console.log("++++++"+JSON.stringify(params))
                    this.userId = params.row.id;
                    this.tableInit();
                    this.recordModal = true;
                  }
                }
              }, '详情')
            ])
           }
        }
      ],
      recordCol:[
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '评分人(老师)',
          key: 'teacherName'
        },
        {
          title: '评价内容',
          key: 'customText'
        },
        {
          title: '评分',
          key: 'customNum',
           render: (h, params) => {
            //console.log("++++++"+JSON.stringify(params))
            var oName = params.row.customNum+'分';
            return h('div', [
              h('Rate', {
                props: {
                  count: 5,
                  disabled:true,
                  allowHalf:true,
                  showText:true,
                  value:params.row.customNum
                }
              }, oName)
            ])
          }
        },
      ],
      tableData: [],
      recordData:[]
    }
  },
  methods: {
    async pageInit(){
      customTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText).then(res => {
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
      recordTableData(this.userId,this.tableCurrentPage).then(res => {
        //console.log("555555"+JSON.stringify(res));
        this.recordData=[];
        if(res.data.success){
          this.tableCurrentPage = res.data.result.data.currectPage;
          this.tableTotalPage = res.data.result.data.totalPage;
          var dataList = res.data.result.data.pageList;
          var recordO = {};
          for(let item of dataList) {
            recordO = {};
            recordO.id = item.id;
            recordO.customNum = item.customNum;
            recordO.customText = item.customText;
            recordO.teacherName = item.teacherName;
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
      this.tableCurrentPage = 1;
      this.recordData = [];
    },
    closeTextModal(){
      this.textModal = false;
      this.tableCurrentPage = 1;
      this.recordData = [];
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
      /*commentDel('/student/delStudentById', selectItemArr).then(res => {
        //console.log(JSON.stringify(res))
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
      })*/
    },
    // 删除
    myDelete1 () {
      var selectItemArr = this.selectItemArr
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      this.textModal=true;
    },
    delItemOk(){
       var selectItemArr = this.selectItemArr;
       var customDelText = this.customDelText;
       //this.delItemStatu = true;
       //console.log("++++++"+JSON.stringify(customDelText))
       if(customDelText.length<5){
        this.$Message.warning({
          content:'内容不能少于5个字！'
        })
        return;
      }else if (customDelText.length>50) {
        this.$Message.warning({
          content:'内容不能多于50个字！'
        })
      }
      commentDel1('/student/customDel', selectItemArr,customDelText).then(res => {
        //console.log(JSON.stringify(res))
        if(res.data.success){
          this.selectItemArr=[];
          //this.pageInit();
          this.recordData=[];
          this.tableInit();
          this.$Message.success({
            content:'删除成功！'
          });
          this.textModal= false;
          this.recordModal = false;
          this.pageInit();
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }

        // this.tableData = res.data.result.data.pageList;
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
    }
  },
  mounted () {
    // 初始化
    customTableData(10, 1).then(res => {
       console.log("----"+JSON.stringify(res));
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
  computed: {
    access () {
      return this.$store.state.user.access
    },
    //所有权限
    viewAccessAll () {
      return hasOneOf(['superAdmin', 'teacher','student'], this.access)
    },
    //部分权限
    viewAccessTeacher () {
      return hasOneOf(['superAdmin','teacher'], this.access)
    },
  //部分权限
    viewTeacher () {
      return hasOneOf(['superAdmin','student'], this.access)
    },
    //部分权限
    viewAdmin () {
      return hasOneOf(['superAdmin'], this.access)
    },
    //部分权限
    viewStudent () {
      return hasOneOf(['student'], this.access)
    }
  }
}
</script>
