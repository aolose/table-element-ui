# table-element-ui
element ui 的 table 封装

## API
#### config
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |
| getInstance | 获取表格实例 | Function(实例) | - | - |
| loading | 显示加载 | Boolean | - | false | 是 |
| editWarning | 表格数据有编辑过翻页否提示 | Boolean | - | true |
| info | 是否显示列说明 | Boolean | - | true |
| wrap | 是否换行显示 | Boolean | - | false |
| table | 表格配置 | Object | - | 详见table |
| editedCells | 编辑过的单元格 | Array | - | [] | 是 |
| actEditCell | 激活编辑的单元格 | Object | - | {row:'',cell:''} | 是 |
| data | 表格数据 | Array | - | [] |
| columns | 列配置 | Array | - | 详见columns |
| service | 表格数据服务 | Object | - | 详见service |
| viewType | 视图类型 | String | list/card | list |
| card | 卡片控制 | Object | - | 详见card |
| page | 分页控制 | Object | - | 详见page |


#### table 
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |  |
| attrs | 表格Dom属性 | Object | - | 同Element UI |
| props | 表格组件属性 | Object | - | 同Element UI |
| events | 表格事件 | Object | - | 同Element UI |


#### columns 
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |
| prop | 对应数据字段名称 | String | - | - |
| info | 字段说明 | String | - | - |
| label | 列名称 | String | - | - |
| formatter | 格式转换 | Function(行,列,单元格值) 返回：显示值 | - | - |
| render | 自定义单元格 | String 模板slot名称 / Function(渲染方法,数据) 返回VNode | - | - |
| children | 子列 多级表头 | Array | - | - |
| editable | 可编辑标记 | Boolean/Function(行) 返回Boolean | true 可编辑 / false | false |
| edit | 编辑渲染 | String 模板slot名称 / Function(渲染方法,数据) 返回VNode /{set(row,v),get(row),render} | - | - |


#### service 
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |
| autoLoad | 自动加载 | Boolean | - | true |
| type | 获取方式 | String | get/post | get |
| url | 数据源 | String | - | - |
| params | 参数 | Array | - | [] |
| handleParams | 参数处理 | Function(入参，分页数据) 返回：新参数 | - | - | 是 |
| handle | 发送请求前的参数处理 | Function(参数) 返回：新参数 | - | - | 是 |
| fail | 请求失败事件 | Function（错误） | - | - |
| done | 请求成功 | Function（响应）返回：表格数据 | - | - | 是 |


#### card 
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |
| disable | 是禁用卡片视图 | Boolean | - | false |
| title | 标题 | String | - | - | icon | 背景图标 | String | - | - |
| subTitle | 副标题 | String | - | - |
| iconColor | 图标颜色 | String | - | #fff |
| content | 内容 | String | - | - |
| footLabel | 底部标题 | String | - | - |
| footRender | 底部渲染 | String 模板slot名称 / Function(渲染方法,行数据) 返回VNode | - | - |
| render | 卡片渲染 | String 模板slot名称 / Function(渲染方法,行数据) 返回VNode | - | - |


#### page 
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 内部属性 |
| --- | --- | --- | --- | --- | --- |
| show | 是否显示 | Boolean | - | true |
| number | 页码 | Number | - | 1 |
| size | 页面行数 | Number | - | 10 |
| small | 是否小页码 | Boolean | - | true |
| list | 页码列表 | Array | - | [10,25,50,100,200] |
| total | 总数 | Number | - | 0 |
| layout | 外观 | String | - | total, sizes, prev, pager, next, jumper
