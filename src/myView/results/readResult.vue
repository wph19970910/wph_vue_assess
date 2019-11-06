<style>
    @import "./common.less";
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
    .ivu-table .demo-table-info-cell-age {
        background-color: #ff6600;
        color: #fff;
    }
</style>
<template>
  <div>
  	<Card class="mb-10">
    	<Row>
    		<Col span="12">
    			<h3>成绩查询</h3>
    		</Col>
    		<Col span="12" class="text-right">
          <component2 v-if="viewAccessTeacher">
             <Button icon="md-download" :loading="exportLoading" @click="exportExcel" class="mr-10">导出文件
             </Button>
          </component2>
          <component2 v-if="Super">
            <Button type="error" @click='delItem'class="mr-10">删除</Button>
          </component2>
				  <component2 v-if="viewAccessTeacher">
            <Button type="primary" @click="myDelete" >移至成绩编辑</Button>
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
          <DatePicker style="width:120px" type="date" format="yyyy-MM-dd" :value='startTime' @on-change='myStartTime' placeholder="开始日期"></DatePicker>
          <span>~</span>
          <DatePicker style="width:120px;margin-right:20px;" type="date" format="yyyy-MM-dd" :value='endTime' @on-change='myEndTime' placeholder="结束日期"></DatePicker>
          <span>关键字：</span>
          <Input placeholder="请输入姓名" v-model.trim='searchText' style="width:100px;margin-right:20px;"></Input>
          <span>考试时间：</span>
           <Select v-model="examTimes" style="width:100px;margin-right:0px;">
             <Option value="">请选择</Option>
            <Option v-for="item in examTime" :value="item" :key="item" clearable=ture>{{ item}}</Option>
          </Select>
           <Select v-model="examStatus" style="width:100px;margin-right:20px;">
             <Option value="">请选择</Option>
            <Option v-for="item in exam" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
          <Button type="primary" @click='search'>搜索</Button>
		</Row>
        <Table size="large" @on-selection-change="selectOption" stripe ref="selection" :columns="tableCol" :data="tableData">
        </Table>
        <Page class='mt-10 text-right' :total="total" :current='currentPage' :page-size='pageSize' @on-change="changePage" @on-page-size-change="changeSize" show-sizer show-total/>
    </Card>
  </div>
</template>
<script>
import excel from '@/libs/excel'
import { hasOneOf } from '@/libs/tools'
import { resultsTableData,selectExamTime, commentDels,commentDel} from '@/api/data'
export default {
  data () {
    return {
      exportLoading: false,

    	startTime: '', // 日期初始化
    	endTime: '', 	// 日期初始化
      strTime:'',
    	searchText: '',	// 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,
      examTimes:'',
      examStatus:null,
     // states:0,
      //studentName:'',
     /* loading1: false,
      options1:[],
      students:[],*/

      formData:{},      //表单信息
      //addUser:true,   //是否为新增用户


      saveItem:false,     //保存操作框
      saveItemStatu:false,     //保存点击状态
      itemTitle:'成绩分析',   //保存操作框title

    	selectItemArr: [],		// 选中项目id

      exam:[],
      examTime:[],
      tableData: [],
      //myarry[{lable:'aa',value:'qq'},{lable:'bb',value:'cc'}],
      tableCol: [
        {
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          title: '姓名',
          width: 80,
          key: 'name'
        },
        {
          title: '考试时间',
          width: 180,
          key: 'classEnumString',
          sortable: true

         /*filters: [
           /*{
              lable:"aa",
              value:"qq"
           },
         ],  
         filterMultiple:false,
         filterMethod (value, row) {
            var arr = this.examTime;
             for(var i in arr){
                  var newObj = {};
                  newObj.lable = arr[i];
                  newObj.value = arr[i];
                  filters.push(newObj);
              }
            
          }*/
        },
        {
          title: '语文成绩',
          key: 'chinese',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.chinese;
            if (oName < 90) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
        {
          title: '数学成绩',
          key: 'math',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.math;
            if (oName < 90) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
         {
          title: '英语成绩',
          key: 'english',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.english;
            if (oName < 90) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
         {
          title: '政治成绩',
          key: 'political',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.political;
            if (oName < 60) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
         {
          title: '历史成绩',
          key: 'history',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.history;
            if (oName < 60) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
        {
          title: '地理成绩',
          key: 'geographic',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.geographic;
            if (oName < 60) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        },
        {
          title: '总成绩',
          key: 'sumResult',
          align: 'center',
          width: 120,
          sortable: true
        },
        {
          title: '平均成绩',
          key: 'pjResult',
          align: 'center',
          width: 120,
          sortable: true,
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify( params.row.chinese))
            var oName = params.row.pjResult;
            if (oName < 80) {
               return h('div', {
                style:{
                  border :'#ff6600',
                  background :'#ff6600'
                }
              },oName)
            }else {
              return h('div', [
                h('div', {}, oName)
              ])
            }
          }
        }
      ],
    }
  },
  methods: {
    //查询时间
    async pageInit(){

      selectExamTime(1).then(res => {
         console.log("----"+JSON.stringify(res));
        if(res.data.success){
            this.exam = res.data.result.exam;
          }else if(res.data.errorMsg){
            this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
      resultsTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText,this.examTimes,this.examStatus,1).then(res => {
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
    changePage(page){
      this.currentPage = page;
      this.pageInit();
    },
    changeSize(size){
      this.pageSize = size;
      this.currentPage = 1;
      this.pageInit();
    },
    delItem(){
      var selectItemArr = this.selectItemArr
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      console.log('0000000000000000000'+JSON.stringify(selectItemArr))
      //alert('确定移除吗？');
      commentDel('/results/delResultById', selectItemArr).then(res => {
        //console.log(JSON.stringify(res))
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'已将选中成绩移动至成绩编辑中！'
          });
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }

        // this.tableData = res.data.result.data.pageList;
      })
    },

    // 关闭保存项目模态框
    closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.targetKeys=[];
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
      //alert('确定移除吗？');
      commentDels('/results/updateResultById', selectItemArr,0).then(res => {
        //console.log(JSON.stringify(res))
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'已将选中成绩移动至成绩编辑中！'
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
    myStrTime (newTime) {
      this.strTime = newTime
    },
  	// 搜索
  	search () {
      this.currentPage = 1;
  		this.pageInit();
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
    //excel导出
    exportExcel () {
      if (this.tableData.length) {
        this.exportLoading = true
        const params = {
          title: ['姓名', '考试时间','语文', '数学','英语','政治','历史','地理','总分','平均分'],
          key: ['name', 'classEnumString', 'chinese','math','english','political','history','geographic','sumResult','pjResult'],
          data: this.tableData,
          autoWidth: true,
          filename: '成绩表'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },

  },


  //--------------------------------------------------
  mounted () {
    // 初始化
    //查询时间
    selectExamTime(1).then(res => {
      if(res.data.success){
          this.examTime = res.data.result.examTime;
          this.exam = res.data.result.exam;
         //console.log("----"+JSON.stringify(this.examTime));
        }else if(res.data.errorMsg){
          this.$Message.warning({
          content:res.data.errorMsg
        })
      }
    })
    //alert(1)
    resultsTableData(10, 1,null,null,null,null,null,1).then(res => {
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
    // 图片上传
    // this.uploadList = this.$refs.upload.fileList;
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
    Super () {
      return hasOneOf(['superAdmin'], this.access)
    },
    no () {
      return hasOneOf(['aaa'], this.access)
    }
  }
}
</script>
