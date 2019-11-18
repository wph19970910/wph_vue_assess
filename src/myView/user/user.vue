<template>
  <div>
    <Card style="width:100%" class="mb-10">
      <Row>
        <Col span="12">
          <h3>用户管理</h3>
        </Col>
        <Col span="12" class="text-right">
          <Button type="info" class="mr-10" @click="addUser">添加</Button>
        </Col>
      </Row>
    </Card>
    <Card>
      <span>关键字：</span>
      <Input placeholder="请输入用户名" v-model="username" style="width:200px;margin-right:20px;"></Input>
      <Button type="primary" @click="queryInfo">搜索</Button>
      <Table border :columns="columns1" :data="data1" class="mt-10 mb-10" stripe :loading="loading">
        <template slot-scope="scope" slot="state">
          <i-switch
            v-model="scope.row.state === 1 ? true : false"
            @on-change="openClose($event,scope.row.id)"
          ></i-switch>
        </template>
        <template slot-scope="{ row }" slot="type">
          <strong>{{ row.type === 1 ? '老师' : '学生' }}</strong>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button type="primary" size="small" style="margin-right: 5px" @click="editUser(row.id)">编辑</Button>
          <!-- <Button type="error" size="small" @click="removeUser(row.id)">删除</Button> -->
        </template>
      </Table>
      <Page
        @on-change="changeCurrentPage"
        @on-page-size-change="changePageSize"
        :total="total"
        :current="currentPage"
        :page-size="pageSize"
        show-sizer
        show-total
        class="text-right"
        :page-size-opts="pageSizeOpts"
      />
    </Card>
    <!-- 编辑用户表单 -->
    <Modal style="width:50%;" :value="editModal" title="编辑用户" @on-ok="edit" @on-cancel="cancel">
      <Form :model="editUserInfo" :label-width="80">
        <FormItem label="用户名">
          <Input v-model="editUserInfo.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="索引">
          <Input v-model="editUserInfo.name" placeholder="请输入索引"></Input>
        </FormItem>
        <FormItem label="类型">
          <Input v-model="editUserInfo.type" placeholder="请输入类型:老师(1)学生(0)"></Input>
        </FormItem>
        <FormItem label="状态">
          <Input v-model="editUserInfo.state" placeholder="请输入状态:已删除(1)已启用(0)"></Input>
        </FormItem>
      </Form>
    </Modal>
    <!-- 添加用户表单 -->
    <Modal style="width:50%;" :value="addModal" title="编辑用户" @on-ok="add" @on-cancel="addCancel">
      <Form :model="addUserInfo" :label-width="80">
        <FormItem label="用户名">
          <Input v-model="addUserInfo.username" placeholder="请输入用户名"></Input>
        </FormItem>
        <FormItem label="索引">
          <Input v-model="addUserInfo.name" placeholder="请输入索引"></Input>
        </FormItem>
        <FormItem label="类型">
          <Input v-model="addUserInfo.type" placeholder="请输入类型:老师(1)学生(0)"></Input>
        </FormItem>
        <FormItem label="状态">
          <Input v-model="addUserInfo.state" placeholder="请输入状态:已删除(1)已启用(0)"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {
  getUser,
  updateUser,
  getUserById,
  deleteUser,
  addUser
} from "@/api/data";
export default {
  data() {
    return {
      loading: true,
      pageSizeOpts: [1, 5, 10, 20],
      columns1: [
        {
          title: "用户名",
          key: "username"
        },
        {
          title: "索引",
          key: "name"
        },
        {
          title: "类型",
          slot: "type"
        },
        {
          title: "状态",
          slot: "state"
        },
        {
          title: "操作",
          slot: "action",
          width: 150,
          align: "center"
        }
      ],
      data1: [],
      pageSize: 10,
      currentPage: 1,
      username: "",
      total: 0,
      // 编辑用户对话框
      editModal: false,
      // 编辑用户信息
      editUserInfo: {},
      // 模糊查询
      username: "",
      // 添加用户对话框
      addModal: false,
      // 添加用户信息
      addUserInfo: {}
    };
  },
  methods: {
    // 获取用户列表
    async userInit(pageSize, currentPage, username) {
      getUser(pageSize, currentPage, username).then(res => {
        this.data1 = res.data.result.data.pageList;
        this.total = res.data.result.data.totalSize;
        this.currentPage = res.data.result.data.currectPage;
        this.loading = false;
      });
    },
    // 分页页码值改变事件
    changeCurrentPage(newCurrentPage) {
      this.currentPage = newCurrentPage;
      this.userInit(this.pageSize, newCurrentPage, this.username);
    },
    // 每页展示数据条数改变事件
    changePageSize(newPageSize) {
      this.pageSize = newPageSize;
      this.currentPage = 1;
      this.userInit(newPageSize, this.currentPage, this.username);
    },
    // 编辑用户
    editUser(id) {
      this.editModal = true;
      getUserById(id).then(res => {
        this.editUserInfo = res.data.result.data;
      });
    },
    // 用户对话框点击确定
    edit() {
      updateUser(this.editUserInfo).then(res => {
        if (res.status !== 200) {
          this.$Message.error("修改失败");
        } else {
          getUser(this.pageSize, this.currentPage, this.username).then(res => {
            this.pageSize = res.data.result.data.pageSize;
            this.total = res.data.result.data.totalSize;            
            let temp = this.total % this.pageSize == 0 ?  this.currentPage -1 : this.currentPage;
            this.userInit(this.pageSize, temp, this.username);
          });
          this.$Message.success("修改成功");
        }
      });
      this.editModal = false;
    },
    // 用户对话框点击取消
    cancel() {
      this.editModal = false;
    },
    // 删除用户
    // removeUser(id) {
    //   console.log(id);
    //   deleteUser(id).then(res => {
    //     console.log(res);
    //     if (res.status !== 200) {
    //       this.$Message.error("删除失败");
    //     } else {
    //       this.$Message.success("删除成功");
    //       this.userInit(this.pageSize, this.currentPage);
    //     }
    //   });
    // },
    // 用户状态state
    openClose(e, id) {
      deleteUser(id, e).then(res => {
        if (res.status !== 200) {
          this.$Message.error("更新用户状态失败");
        } else {
          this.$Message.success("更新用户状态成功");
          this.userInit(this.pageSize, this.currentPage, this.username);
        }
      });
    },
    // 模糊查询
    queryInfo() {
      this.currentPage = 1;
      this.userInit(this.pageSize, this.currentPage, this.username);
    },
    // 添加用户对话框
    addUser() {
      this.addModal = true;
    },
    // 添加用户对话框确定
    add() {
      addUser(this.addUserInfo).then(res => {
        if (res.status !== 200) {
          this.$Message.error("添加失败");
        } else {
          this.$Message.success("添加成功");
          this.userInit(this.pageSize, this.currentPage, this.username);
        }
      });
      this.addModal = false;
      this.addUserInfo = {};
    },
    // 添加用户对话框取消
    addCancel() {
      this.addModal = false;
      this.addUserInfo = {};
    }
  },
  mounted() {
    this.userInit(this.pageSize, this.currentPage);
  }
};
</script>
<style scoped>
.wran {
  color: red;
}
.success {
  color: green;
}
</style>