/**
 * 表格重新封装
 * 目标： 原有表格所有功能 ，分页 ，行渲染，卡片视图，搜索 ，筛选，排序
 * */

function getNs(str, obj) {
  const ns = str.split('.');
  let o = obj;
  for (let i = 0, l = ns.length; i < l; i++) {
    const k = ns[i];
    if (k in o) o = o[k]
    else return undefined
  }
  return o
}

function setNs(str, obj, v) {
  const ns = str.split('.');
  let o = obj;
  for (let i = 0, l = ns.length; i < l; i++) {
    const k = ns[i];
    if (i === l - 1) return o[k] = v
    if (k in o) o = o[k]
    else o = {}
  }
}

function created() {
  this.resize = resizeH.bind(this);
  window.addEventListener('resize', this.resize)
  const self = this;
  this.getInstance(self);
  this.getEditedRows = function () {
    const r = [];
    self.setEdit('', '');
    self.editedCells.forEach(c => {
        const row = c[0]
        if (r.indexOf(row) === -1) {
          r.push(row)
        }
      }
    )
    return r;
  }

  function clearEdit() {
    const {editedCells, actEditCell} = self
    editedCells.length = 0;
    actEditCell.row = actEditCell.column = '';
  }

  this.loadData = function (items) {
    const {type, url, params, fail, done, handleParams, handle} = this.service;
    let {page, data, originData, filter} = self;
    //本地方案
    if (!url) {
      if (Array.isArray(items) && items.length) {
        data.length = originData.length = 0;
        data.push(...items)
      }
      if (page.show) {
        if (!originData.length) originData.push(...data);
        page.total = originData.length;
        self.data.length = 0;
        const {number, size} = page;
        const start = (number - 1) * size;
        const ds = originData.slice(start, start + size);
        self.data.push(...ds)
      }
      clearEdit()
      self.resize();
      // 远程方案
    } else {
      this.loading = true
      const dt = JSON.parse(JSON.stringify(handleParams(params, page)));
      const da = dt.data = dt.data || []
      const d = da[0] = da[0] || {}
      const w = d.where = d.where || {}
      w.and = w.and || [];
      w.and.push(...filter)
      console.log(dt)
      this.$axios[type](url, handle(dt)).then((resp) => {
        this.loading = false
        const data = done(resp)
        if (data) {
          page.total = resp.total || data && data.length || 0;
          if (Array.isArray(data)) {
            this.data.length = 0;
            this.data.push(...data)
          }
          clearEdit();
          self.$nextTick(self.resize)
        }
      }).catch((e) => {
        this.loading = false
        fail.call(self, e)
      })
    }
  }.bind(self)
}

function beforeDestroy() {
  window.removeEventListener('resize', this.resize)
}

function resizeH() {
  const {config = {}} = this
  const {table = {}} = config
  const {props: p = {}} = table
  const {height} = p
  const {table: {props}} = this;
  if (!/\d+/.test(height)) {
    const h = this.$el.parentNode.offsetHeight;
    if (h) props.height = h - (this.page.show ? 40 : 1)
  }
}


function mounted() {
  resizeH.call(this)
  if (this.service.autoLoad) setTimeout(this.loadData, 10)
}

const props = {
  config: {
    required: true,
    type: Object
  }
}

function data() {
  // 默认配置 参考
  const defaultConfig = {
    filter: [],
    originData: [],
    getInstance(s) {
    },
    info: false,
    wrap: false,
    loading: false,
    loadingText: '',
    border: false,
    table: {
      attrs: {},
      props: {
        border: true,
        height: 'auto',
        'max-height': ''
      },
      events: {
        'sort-change': function (v) {
          //todo : 远程排序
        }
      }
    },
    editWarning: true,
    // 编辑标记
    editedCells: [
      // [row,column,originalValue,newValue]
    ],
    // 激活的编辑项
    actEditCell: {row: '', column: '', value: ''},
    data: [],//行数据
    columns: [],//列
    service: { // 数据请求
      autoLoad: true,
      type: 'get', //类别
      url: '', // api接口 没有则认为是本地数据
      params: [],// 传参 array | function
      handleParams: function (data, page) {
        if (page && page.show) {
          data = Object.assign({}, data)
          data.page = {
            pageNumber: page.number,
            pageSize: page.size
          }
        }
        return {data: data && [data]}
      },
      handle(a) {
        return a
      },
      fail() {
      },//失败处理
      done(resp) {
        return resp.data
      }//成功处理
    },
    viewType: 'list', // 默认视图类型
    card: { // 卡片配置
      disable: false,
      title: '',
      icon: '',
      subTitle: '',
      iconColor: '#fff',
      content: '',
      footLabel: '',
      footRender: '',
      render(h, row) {
        const {title, icon, iconColor, subTitle, footLabel, footRender, content} = this.card;
        const t = h('div', {staticClass: 'title'}, [getNs(title, row)])
        const subT = h('div', {staticClass: 'subtitle'}, [getNs(subTitle, row)])
        let iconChild = [];
        if (/\//.test(icon)) {
          iconChild.push(h('img', {
            style: {
              height: '100%',
              width: 'auto'
            },
            domProps: {
              src: icon
            }
          }))
        } else iconChild.push(h('icon', {
          style: {
            color: iconColor
          },
          props: {
            name: icon
          }
        }))
        const ico = h('div', {
          staticClass: 'bg-icon',
        }, iconChild)
        const ct = h('div', {staticClass: 'content'}, [getNs(content, row)])
        const fl = h('div', {staticClass: 'foot-label'}, [getNs(footLabel, row)])
        const r = [];
        if ('function' === tp) {
          r.push(tp.call(this, h, row))
        } else {
          const tpl = this.$scopedSlots[footRender];
          if (tpl) r.push(tpl(row))
        }
        const fr = h('div', {staticClass: 'foot-btns'}, r)
        const tp = typeof footRender;
        const ft = [fl, fr];

        return h('div', {
          staticClass: 'x-table-card',
        }, [t, subT, ct, ico, h('div', {staticClass: 'foot'}, ft)])
      },
    },
    page: { //分页配置
      show: true,
      number: 1,
      size: 10,
      small: true,
      list: [10, 25, 50, 100, 200],
      total: 0,
      layout: 'total, sizes, prev, pager, next, jumper'
    }
  }
  const self = this;

  function cloneObj(o, n = {}) {
    Object.keys(o).forEach(c => {
      const x = o[c];
      const t = typeof x;
      if (Array.isArray(x) || t !== 'object') {
        if (c === 'sort-change') n[c] = x.bind(self)
        else n[c] = x
      }
      else n[c] = cloneObj(cloneObj(x), n[c])
    })
    return n;
  }

  return cloneObj(this.config, cloneObj(defaultConfig));
}

function render(h) {
  const root = this;
  const {page, card, editedCells, actEditCell, wrap, info} = this;
  const children = [];

  function setEdit(row, col) {
    // 上次单元格检查
    const {row: r, column: c, value: v} = actEditCell
    if (r) {
      const existIndex = editedCells.findIndex(o => o[0] === r && o[1] === c)
      // 值没有变化则移除操作
      if (r[c.prop] === v) {
        if (existIndex > -1) editedCells.splice(existIndex, 1)
      } else {
        // 有变化没有记录则添加
        if (existIndex === -1) {
          editedCells.push([r, c, v])
        }
      }
    }
    // 设置本次激活单元格
    actEditCell.row = row
    actEditCell.column = col
    if (row) {
      const existCell = editedCells.find(c => c[0] === row && c[1] === col)
      if (existCell) actEditCell.value = existCell[2]
      else actEditCell.value = row[col.prop]
    } else actEditCell.value = ''
    // 表格渲染
    root.data.push()
  }

  root.setEdit = setEdit
  if (this.config.viewType === 'card' && !card.disable) {
    const cards = this.data.map(row => {
      const {render} = card;
      const tp = typeof render;
      if ('function' === tp) {
        return render.call(root, h, row)
      } else {
        const tpl = root.$scopedSlots[render];
        if (tpl) return tpl(row)
      }
    })
    children.push(h('div', {
      style: {
        height: this.maxHeight + 'px'
      },
      staticClass: 'x-card-list',
    }, cards))
  } else {
    function isEdit(row, col) {
      return actEditCell.row === row && actEditCell.column === col
    }

    function createCol(c) {
      const cfg = {};
      const {render, children, editable, edit, formatter, prop} = c;
      let subCols = [];

      function deepCopy(a) {
        const d = {};
        for (let i in a) {
          if (a.hasOwnProperty(i)) {
            const type = Object.prototype.toString.call(a[i]).replace(/\[object (\w+)]/g, '$1');
            if (type !== 'Object') d[i] = a[i]
            else d[i] = deepCopy(a[i])
          }
        }
        return d
      }

      function renderCell(data) {
        let _data = data;
        if (typeof formatter === 'function') {
          _data = {...data}
          _data.row = deepCopy(_data.row)
          setNs(prop, _data.row, formatter(_data.row, _data.column, getNs(prop, _data.row)))
        }
        const tp = typeof render;
        if ('function' === tp) {
          return render.call(root, h, _data)
        } else if ('string' === tp) {
          const c = root.$scopedSlots[render];
          return c(_data)
        }
        return (getNs(prop || '', _data.row) || '').toString()
      }

      // 渲染编辑内容
      function renderEditCell(data) {
        if (edit) {
          const t = typeof edit;
          if ('function' === t) {
            return edit.call(root, h, data, c)
          } else if ('object' === t) {
            const {get, set, render} = edit;
            const _data = {...data}
            const _row = _data.row = {...data.row}
            const opt = {
              set(v) {
                data.row[prop] = v
              },
              get() {
                return data.row[prop]
              }
            }
            if ('function' === typeof set) {
              opt.set = function (v) {
                set.call(root, data.row, v)
              }
            }
            if ('function' === typeof get) {
              opt.get = function () {
                return get.call(root, data.row)
              }
            }
            Object.defineProperty(_row, prop, opt)
            if (render) {
              if ('function' === typeof 'render') {
                return render.call(root, h, _data, c)
              } else {
                const tpl = root.$scopedSlots[render];
                if (tpl) {
                  return tpl(_data)
                }
              }
            }
          } else {
            const tpl = root.$scopedSlots[edit];
            if (tpl) {
              return tpl(data)
            }
          }
        }
        const l = c.prop, {row} = data
        return h('el-input', {
          props: {
            value: getNs(l, row)
          },
          on: {
            change(v) {
              setNs(l, row, v)
            }
          }
        })
      }

      if (children) {
        subCols = children.map(createCol)
      } else if (render || editable || edit) {
        cfg.scopedSlots = {
          default(data) {
            const {row} = data;
            let _editable = false;
            if ('function' === typeof editable) _editable = editable(row)
            else _editable = editable || !!edit
            if (_editable) {
              const child = [];
              if (isEdit(row, c)) {
                child.push(renderEditCell(data))
              } else {
                child.push(renderCell(data))
              }
              const content = child[0]
              const tooltip = data.column.showOverflowTooltip&&typeof content==='string'&&content.length;
              const props = {
                disabled: !tooltip,
              };
               if (tooltip) props.content = content
              return h('el-tooltip',
                {
                  props,
                  on: {
                    mouseenter(e) {
                      console.log('e',1,e)
                      debugger
                      if (tooltip) {
                      }
                    },
                  }
                }, [
                  h('div', {
                    staticClass: 'editable',
                    on: {
                      click(e) {
                        e.stopPropagation()
                        setEdit(row, c)
                      }
                    }
                  }, child)])
            } else {
              return renderCell(data)
            }
          }
        }
      }
      const _c = cfg.props = {
        ...c, 'render-header': function (h) {
          const child = [];
          if (info && c.info !== false || c.info) {
            child.push(h('el-tooltip',
              {
                props: {
                  content: c.info || c.label,
                  placement: 'bottom'
                }
              }, [
                h('i', {staticClass: 'material-icons x-info'}, ['info_outline'])
              ]
            ))
          }
          return h('div', {
            staticClass: 'x-col'
          }, [c.label, h('div', {staticClass: 'x-options'}, child)])
        }
      }
      if (!wrap) {
        _c['label-class-name'] = 'nowrap ' + (_c['label-class-name'] || '')
        _c['class-name'] = 'nowrap ' + (_c['class-name'] || '')
      }
      return h('el-table-column', cfg, subCols);
    }

    const columns = [];
    this.columns.forEach(c=>{
      if(c.show&&!c.show())return;
      columns.push(createCol(c))
    })
    const {props, events, attrs} = this.table;
    const table = root.body = h('el-table', {
      props: {...props, data: this.data},
      attrs,
      on: events
    }, [columns])
    children.push(table)
  }
  if (page.show) {
    const {number, size, list, total, layout, small} = page

    function checkChange(next, fail) {
      function once() {
        root.editWarning = false
        root._once = true
        setTimeout(function () {
          root.editWarning = true
          delete root._once
        }, 300)
      }

      setTimeout(() => {
        if (root.editWarning && root.editedCells.length) {
          return root.$confirm('该操作会导致页面未保存数据，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(function () {
            once();
            next();
          }).catch(function () {
            once();
            fail();
          });
        } else {
          if (!root._once) next()
        }
      }, 0)
    }

    const paging = h('el-pagination', {
      props: {
        'current-page': number,
        'page-size': size,
        'page-sizes': list,
        total, small,
        layout
      },
      on: {
        'size-change': function (n) {
          checkChange(() => {
            root.page.size = n;
            root.loadData();
          }, () => {
            const n = root.page.size
            root.page.size = 0
            root.$nextTick(() => {
              root.page.size = n
            })
          })
        },
        'current-change': function (n) {
          checkChange(function () {
            root.page.number = n;
            root.loadData();
          }, () => {
            const n = root.page.number
            root.page.number = 0
            root.$nextTick(() => {
              root.page.number = n
            })
          })
        }
      }
    })
    children.push(paging)
  }
  return h('div', {
    staticClass: 'x-table',
    class: {
      'no-border': !root.border
    },
    style: {
      height: '100%'
    },
    attrs: {
      'element-loading-text': this.loadingText || this.$t(22)
    },
    on: {
      click() {
        setEdit('', '')
      }
    },
    directives: [
      {
        name: 'loading',
        value: this.loading,
      }
    ],
  }, children);
}

export default {
  created, mounted, beforeDestroy, props, data, render
}
