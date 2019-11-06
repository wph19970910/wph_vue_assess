<template>
  <div>
    <Card class="mb-10">
      <Row>
        <Col span="12">
          <h3>公告通知申请处理</h3>
        </Col>
        <Col span="12" class="text-right">
          <component2 v-if="superAdmin">
            <Button type="primary" @click="Aggry" class="mr-10">同意</Button>
            <Button type="warning " @click="OnAggry" class="mr-10">不同意</Button>
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
   
<!-- ----------------------------------------------------------------------------- -->
  
  </div>
</template>
<script>
import { hasOneOf,oneOf } from '@/libs/tools'
import { NoticeTableData, commentDel,commentDels} from '@/api/data'
export default {
  data () {
    return {
      startTime: '', // 入住日期初始化
      endTime: '',  // 退房日期初始化
      searchText: '', // 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,

      selectItemArr: [],    // 选中项目id
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
      NoticeTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText,2).then(res => {
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
      })
    },

    Aggry () {
      var selectItemArr = this.selectItemArr
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      commentDels('/notice/arrNotice', selectItemArr,1).then(res => {
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'同意了！'
          });
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
    },

    OnAggry () {
      var selectItemArr = this.selectItemArr
      if(selectItemArr.length<1){
        this.$Message.warning({
          content:'请选择项目！'
        })
        return;
      }
      commentDels('/notice/arrNotice', selectItemArr,0).then(res => {
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'不同意！'
          });
        }else if(res.data.errorMsg){
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
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
    NoticeTableData(10, 1,null,null,null,2).then(res => {
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
    viewAccessTeacher () {
      return hasOneOf(['superAdmin','teacher'], this.access)
    },
  //部分权限
    viewTeacher () {
      return hasOneOf(['teacher'], this.access)
    },
    //部分权限
    viewStudent () {
      return hasOneOf(['student'], this.access)
    }
  }
}
</script>
