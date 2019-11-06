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
    			<h3>成绩管理</h3>
    		</Col>
    		<Col span="12" class="text-right">
          <component2 v-if="Super">
            <Button type="primary" @click='addItem'class="mr-10">新建</Button>
          </component2>
				  <component2 v-if="viewAccess">
            <Button type="success" @click="myDelete">保存至成绩单</Button>
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
    <Modal
      v-model="saveItem"
      :title="itemTitle"
      @on-cancel='closeSaveItem'>
      <Form ref="formData" :model="formData" :label-width="100">
        <input type="hidden" name='id' v-model="formData.id">
        <FormItem >
          <span style="margin-left:-50px" v-if="mainTeacher==1">语文成绩：</span>
           <Input v-model="formData.chinese" v-if="mainTeacher==1" placeholder="请填写语文成绩" clearable style="width: 100px;margin-left:0px " />
          <span style="margin-left:50px" v-if="mainTeacher==2">数学成绩：</span>
            <Input v-model="formData.math"v-if="mainTeacher==2" placeholder="请填写数学成绩" clearable style="width: 100px" />
        </FormItem>
        <FormItem >
          <span style="margin-left:-50px" v-if="mainTeacher==3">英语成绩：</span>
           <Input v-model="formData.english" v-if="mainTeacher==3" placeholder="请填写英语成绩" clearable style="width: 100px;margin-left:0px " />
          <span style="margin-left:50px" v-if="mainTeacher==4">政治成绩：</span>
            <Input v-model="formData.political" v-if="mainTeacher==4" placeholder="请填政治成绩" clearable style="width: 100px" />
        </FormItem>
        <FormItem >
          <span style="margin-left:-50px" v-if="mainTeacher==5">历史成绩：</span>
           <Input v-model="formData.history" v-if="mainTeacher==5" placeholder="请填写历史成绩" clearable style="width: 100px;margin-left:0px " />
          <span style="margin-left:50px" v-if="mainTeacher==6">地理成绩：</span>
            <Input v-model="formData.geographic" v-if="mainTeacher==6" placeholder="请填写地理成绩" clearable style="width: 100px" />
        </FormItem>
        <FormItem v-if='addUser'>
       <span style="margin-left:-50px">请输入学生姓名：</span>
           <Row style="margin-left:50px;margin-top: -30px">
              <Col span="12" style="padding-right:20px ">
                  <Select
                      v-model="formData.studentId"
                      filterable
                      placeholder="请输入学生名字"
                      remote
                      :remote-method="remoteMethod1"
                      :loading="loading1">
                      <Option v-for="(students, index) in options1" :value="students.value" :key="index">{{students.label}}</Option>
                  </Select>
              </Col>
          </Row>
        </FormItem>
        <FormItem v-if='addUser'>
          <span style="margin-left:-50px">请输入考试时间：</span>
            <Row style="margin-left:50px;margin-top: -30px">
              <Col span="10" >
               <Select v-model="formData.examStatus" style="width:100px;margin-right:20px;">
                   <Option value="">请选择</Option>
                  <Option v-for="item in exam" :value="item.id" :key="item.id">{{ item.name }}</Option>
               </Select>
             </Col>
            <DatePicker style="width:120px" type="date" :value='strTime' format="yyyy-MM" @on-change='myStrTime' placeholder="结束日期"></DatePicker>
          </Row>
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
import { hasOneOf } from '@/libs/tools'
import { resultsTableData,selectExamTime, serchStudentByName, commentDels,addResult,updateResult} from '@/api/data'
export default {
  data () {
    return {
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
      loading1: false,
      options1:[],
      students:[],

      formData:{},      //表单信息
      addUser:true,   //是否为新增用户


      saveItem:false,     //保存操作框
      saveItemStatu:false,     //保存点击状态
      itemTitle:'新建教师',   //保存操作框title

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
        },
        {
          width:100,
          title: '操作',
          key: 'examineStatus',
          //checkAccess: ['superAdmin'],
          render: (h, params) => {
            console.log()
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'large',
                  disabled:this.viewAccessTeacher
                },
                on: {
                  click: () => {
                    let getData = JSON.parse(JSON.stringify(this.tableData[params.index]));
                    this.formData = getData;
                    this.saveItem = true;
                    this.addUser = false;
                    this.itemTitle = '编辑成绩';
                    
                  }
                }
              }, '编辑')
            ])
          },

        }
      ],
    }
  },
  methods: {
    //查询时间
    async pageInit(){
      selectExamTime(0).then(res => {
         console.log("----"+JSON.stringify(res));
        if(res.data.success){
            this.exam = res.data.result.exam;
          }else if(res.data.errorMsg){
            this.$Message.warning({
            content:res.data.errorMsg
          })
        }
      })
      resultsTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText,this.examTimes,this.examStatus,0).then(res => {
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
    addItem(){
      this.formData = {};
      this.itemTitle = '添加成绩';
      this.addUser = true;
      this.saveItem = true;
    },

    // 关闭保存项目模态框
    closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.targetKeys=[];
    },
    remoteMethod1 (query) {
      if (query !== '') {
          //alert(query);
          this.loading1 = true;
          //console.log("----"+JSON.stringify(query))
          serchStudentByName(query).then(res => {
             console.log("111"+JSON.stringify(res))
              this.students = res.data.result.students;
              this.loading1 = false;
              const list = this.students.map(item => {
                console.log("----"+JSON.stringify(item))
                  return {
                      value: item.id,
                      label: item.name
                  };
              });
              this.options1 = list.filter(item => item.label.toLowerCase().indexOf(query.toLowerCase()) > -1);
          }, 200);
      } else {
          this.options1 = [];
      }
    },

    saveItemOk(){
      var that = this;
      var formData = this.formData;
      //console.log(JSON.stringify(formData))
      if(!formData.chinese){
        this.$Message.warning({
          content:'请填写语文成绩！'
        });
        return;
      }else if (formData.chinese >150){
        this.$Message.warning({
          content:'语文最高分数是150'
        });
        return;
      }else if (formData.chinese <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };
      
      if(!formData.math){
        this.$Message.warning({
          content:'请填写数学成绩！'
        });
        return;
      }else if (formData.math >150){
        this.$Message.warning({
          content:'数学最高分数是150'
        });
        return;
      }else if (formData.math <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };

      if(!formData.english){
        this.$Message.warning({
          content:'请填写英语成绩！'
        });
        return;
      }else if (formData.english >150){
        this.$Message.warning({
          content:'英语最高分数是150'
        });
        return;
      }else if (formData.english <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };
      if(!formData.political){
        this.$Message.warning({
          content:'请填写政治成绩！'
        });
        return;
      }else if (formData.political >100){
        this.$Message.warning({
          content:'政治最高分数是100'
        });
        return;
      }else if (formData.political <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };
      if(!formData.history){
        this.$Message.warning({
          content:'请填写历史成绩！'
        });
        return;
      }else if (formData.history >100){
        this.$Message.warning({
          content:'历史最高分数是100'
        });
        return;
      }else if (formData.history <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };
      if(!formData.geographic){
        this.$Message.warning({
          content:'请填写地理成绩！'
        });
        return;
      }else if (formData.geographic >100){
        this.$Message.warning({
          content:'地理最高分数是100'
        });
        return;
      }else if (formData.geographic <0 ) {
        this.$Message.warning({
          content:'再蠢也不可能低于0分'
        });
        return
      };
      if(this.addUser){
        if(!formData.studentId){
          this.$Message.warning({
            content:'请填写学生名称！'
          });
          return;
        };
        if(!formData.examStatus){
          this.$Message.warning({
            content:'请填写考试时间！'
          });
          return;
        };
        if(!this.strTime){
          this.$Message.warning({
            content:'请填写具体考试时间！'
          });
          return;
        };
     // console.log("--65656555--"+JSON.stringify(this.formData));
        this.saveItemStatu = true;
        addResult(this.formData,this.strTime).then(res => {
          // var that = this;
          that.saveItemStatu = false;
          if(res.data.success){
            this.$Message.success({
              content:'保存成绩成功'
            });
            that.saveItem = false;
            that.pageInit();
          }else if(res.data.errorMsg){
            this.$Message.warning({
              content:res.data.errorMsg
            })
          }
        })
      }else{
        this.saveItemStatu = true;
         updateResult(this.formData).then(res => {
          // var that = this;
          that.saveItemStatu = false;
          if(res.data.success){
            this.$Message.success({
              content:'修改成绩成功'
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
      var states = 1;
      //alert(state);
      commentDels('/results/updateResultById', selectItemArr,states).then(res => {
        //console.log(JSON.stringify(res))
        if(res.data.success){
          this.selectItemArr=[];
          this.pageInit();
          this.$Message.success({
            content:'已将选中成绩存入档案中！'
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
    

  },


  //--------------------------------------------------
  mounted () {
    // 初始化
    //查询时间
    selectExamTime(0).then(res => {
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
    resultsTableData(10, 1,null,null,null,null,null,0).then(res => {
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
    mainTeacher () {
      return this.$store.state.user.subjectId
    },
    //部分权限
    viewAccess () {
      return hasOneOf(['superAdmin', 'teacher'], this.access)
    },
    //部分权限
    viewAccessTeacher () {
      return hasOneOf(['superAdmin','student'], this.access)
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
