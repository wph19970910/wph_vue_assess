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
    			<h3>教师管理</h3>
    		</Col>
    		<Col span="12" class="text-right">
          <component2 v-if="Super">
            <Button type="primary" @click='addItem'class="mr-10">新建</Button>
          </component2>
				  <component2 v-if="Super">
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
          <FormItem label="任教课程" >
             <Row>
                <Col span="12" style="padding-right:10px">
                    <Select v-model="formData.subjectId" filterable>
                        <Option v-for="item in cityList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </Col>
            </Row>
          </FormItem>
         <FormItem label="任教班级" >
             <Transfer
                :data="coursesList"
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
  </div>
</template>
<script>
import { hasOneOf } from '@/libs/tools'
import { teacherTableData,updateTeacher, commentDel,addTeacher,getAllClass} from '@/api/data'
export default {
  data () {
    return {
    	startTime: '', // 日期初始化
    	endTime: '', 	// 日期初始化
    	searchText: '',	// 搜索内容初始化
      pageSize:10,
      currentPage:1,
      total:1,


      formData:{},      //表单信息
      addUser:true,   //是否为新增用户

    	upLoadPic: false,		// 照片上传模态框
      picture:[],          //照片上传
      teacherId:0,        //照片上传参数

      saveItem:false,     //保存操作框
      saveItemStatu:false,     //保存点击状态
      itemTitle:'新建教师',   //保存操作框title

    	selectItemArr: [],		// 选中项目id
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
          title: '主教课程',
          key: 'classEnumString'
        },
        {
          title: '任教班级',
          key: 'courses',
          render: (h, params) => {
            //console.log("++++++"+JSON.stringify(params))
            var oName = params.row.courses;
            var sName = '';
            for (var i in oName) {
              sName += oName[i].className+'\n';
            }
            return h('div', [
              h('span', {}, sName)
            ])
          }
        },
        {
          width:100,
          title: '操作',
          key: 'examineStatus',
          checkAccess: ['superAdmin'],
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

                    this.itemTitle = '编辑教师信息';
                    if(this.formData.courses.length>0){
                      for(var j in this.formData.courses){
                        this.targetKeys.push(this.formData.courses[j].id);
                      }
                    }
                    
                    this.addUser = false;
                    this.saveItem = true;
                    if(this.cityList.length>=1){
                      return;
                    };

                     getAllClass().then(res => {
                      if(res.data.success){
                        this.cityList = res.data.result.clasies; 
                       // this.classList = res.data.result.courses;
                        // console.log(JSON.stringify(this.classList)) ;
                         var coursesArr = res.data.result.courses;
                         for(var i in coursesArr){
                            var objCourses = {};
                            objCourses.key = coursesArr[i].id;
                            objCourses.label = coursesArr[i].className;
                            this.coursesList.push(objCourses)
                         };   
                      }else if(res.data.errorMsg){
                        this.$Message.warning({
                          content:res.data.errorMsg
                        })
                      }
                    })
                    
                  }
                }
              }, '编辑')
            ])
          },

        }
      ],
      tableData: [],

      // 图片上传
      defaultList: [
          /*{
              'name': '98310050-e068-4417-973b-6e3160179084.jpg',
              'url': 'http://localhost:8081/picture/98310050-e068-4417-973b-6e3160179084.jpg'
          },
          {
              'name': 'bc7521e033abdd1e92222d733590f104',
              'url': 'https://o5wwk8baw.qnssl.com/bc7521e033abdd1e92222d733590f104/avatar'
          }*/
      ],
      imgName: '',
      picShow: false,
      uploadList: [],
      cityList: [],
      coursesList: [],
      targetKeys: [],
      listStyle: {
          width: '150px',
          height: '200px'
      }
    }
  },
  methods: {
    async pageInit(){
      teacherTableData(this.pageSize,this.currentPage,this.startTime,this.endTime,this.searchText).then(res => {
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
      this.itemTitle = '添加教师';
      this.addUser = true;
      this.saveItem = true;
      if(this.cityList.length>=1){
        return;
      };
      getAllClass().then(res => {
        if(res.data.success){
         this.cityList = res.data.result.clasies; 
         //this.classList = res.data.result.courses;
         // console.log(JSON.stringify("+++"+this.classList))
         var coursesArr = res.data.result.courses;
         for(var i in coursesArr){
          var objCourses = {};
          objCourses.key = coursesArr[i].id;
          objCourses.label = coursesArr[i].className;
          this.coursesList.push(objCourses)
         }
        }else {
          this.$Message.warning({
            content:res.data.errorMsg
          })
        }

      })
    },
   /* closeUpload(){
      alert(1);
      this.upLoadPic = false;
      this.defaultList=[];
      this.uploadList=[];
    },*/
    // 关闭保存项目模态框
    closeSaveItem(){
      this.formData = {};
      this.saveItem = false;
      this.targetKeys=[];
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

        if(!formData.subjectId){
          this.$Message.warning({
            content:'请选择任教课程'
          });
          return;
        };
        
        if(!this.targetKeys){
          this.$Message.warning({
            content:'请选择任教班级'
          });
          return;
        };
        addTeacher(this.formData,this.targetKeys).then(res => {
          
          // console.log(JSON.stringify(res))
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
        updateTeacher(this.formData,this.targetKeys).then(res => {
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
      commentDel('/teacher/delTeacherById', selectItemArr).then(res => {
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
    teacherTableData(10, 1).then(res => {
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
      return hasOneOf(['teacher','student'], this.access)
    },
    Super () {
      return hasOneOf(['superAdmin'], this.access)
    }
  }
}
</script>
