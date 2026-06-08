<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { $t } from '@vben/locales';
import { ref } from 'vue';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addDeptUsers, deleteDept, getDeptTree, removeDeptUser, updateDept } from '#/api/system/dept';

import { useColumns } from './data';
import Form from './modules/form.vue';
import AddUserModal from './modules/add-user-modal.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const addMemberModalRef = ref<InstanceType<typeof AddUserModal> | null>(null);
const currentDeptId = ref<string>('');

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDeptApi.SystemDept>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'addMembers': {
      onAddMembers(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'removeMember': {
      onRemoveMember(row);
      break;
    }
    case 'setLeader': {
      onSetLeader(row);
      break;
    }
    default: {
      break;
    }
  }
}

function transformDeptTree(data: SystemDeptApi.SystemDept[]): SystemDeptApi.SystemDept[] {
  const result: SystemDeptApi.SystemDept[] = [];
  for (const dept of data) {
    const users = dept.users || [];
    delete dept.users;
    
    let children: SystemDeptApi.SystemDept[] = [];
    if (dept.children && dept.children.length > 0) {
      children = transformDeptTree(dept.children);
    }
    
    if (users.length > 0) {
      const deptId = parseInt(dept.id);
      const memberNode: SystemDeptApi.SystemDept = {
        id: `members_${dept.id}`,
        name: `[ ${$t('system.dept.members')}列表 ]`,
        parent_id: deptId,
        status: dept.status,
        is_member_node: true,
        children: users.map(user => ({
          id: `user_${user.id}`,
          name: user.username,
          parent_id: parseInt(`members_${dept.id}`),
          status: user.status,
          is_member_node: true,
          remark: user.nickname,
          original_user_id: user.id,
          department_id: deptId,
        })),
      };
      children.push(memberNode);
    }
    
    result.push({
      ...dept,
      children: children.length > 0 ? children : undefined,
    });
  }
  return result;
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          const result = await getDeptTree();
          return transformDeptTree(result);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'parent_id',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions<SystemDeptApi.SystemDept>,
});

function onRefresh() {
  gridApi.query();
}

function onExpandAll() {
  gridApi.grid?.setAllTreeExpand(true);
}

function onCollapseAll() {
  gridApi.grid?.setAllTreeExpand(false);
}

function onEdit(row: SystemDeptApi.SystemDept) {
  formModalApi.setData(row).open();
}

function onCreate() {
  formModalApi.setData(null).open();
}

function onAppend(row: SystemDeptApi.SystemDept) {
  formModalApi.setData({ parent_id: parseInt(row.id) }).open();
}

function onAddMembers(row: SystemDeptApi.SystemDept) {
  currentDeptId.value = row.id;
  addMemberModalRef.value?.open();
}

function onDelete(row: SystemDeptApi.SystemDept) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDept(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRemoveMember(row: SystemDeptApi.SystemDept) {
  const hideLoading = message.loading({
    content: $t('system.dept.removingMember', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  if (row.original_user_id) {
    removeDeptUser(row.original_user_id)
      .then(() => {
        message.success({
          content: $t('system.dept.removeMemberSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      })
      .catch(() => {
        hideLoading();
      });
  }
}

function onSetLeader(row: SystemDeptApi.SystemDept) {
  const hideLoading = message.loading({
    content: $t('system.dept.settingLeader', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  if (row.department_id && row.original_user_id) {
    updateDept({
      id: row.department_id,
      leader_id: row.original_user_id,
    })
      .then(() => {
        message.success({
          content: $t('system.dept.setLeaderSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      })
      .catch(() => {
        hideLoading();
      });
  }
}

function onAddUsersSuccess(userIds: number[]) {
  if (userIds.length > 0 && currentDeptId.value) {
    const hideLoading = message.loading({
      content: $t('ui.actionMessage.processing'),
      duration: 0,
      key: 'action_process_msg',
    });
    addDeptUsers(currentDeptId.value, userIds)
      .then(() => {
        message.success({
          content: $t('system.dept.addUsersSuccess'),
          key: 'action_process_msg',
        });
        onRefresh();
      })
      .catch(() => {
        hideLoading();
      });
  }
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <AddUserModal
      ref="addMemberModalRef"
      @success="onAddUsersSuccess"
    />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
        </Button>
        <Button @click="onExpandAll" class="ml-2" >
          {{ $t('system.common.expandAll') }}
        </Button>
        <Button @click="onCollapseAll" class="ml-2">
          {{ $t('system.common.collapseAll') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
