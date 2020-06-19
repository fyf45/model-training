// 获取浏览器的高度
let windowHeight = $(window).height();
$('#wrap').css('height', windowHeight);
let objData = {
    dataList: [],
    dataModel: [],
    testList: [],
    sample_list: [],
    delSample_List: [],
    delModel_List: [],
    delTest_List: [],
    tableSample_name: '',
    tableResult_name: '',
    file_type: '',
    AlgorithmData: {},
    curr: 1,
    limit: 10,
    name:'',
    file: new FormData(),
    getList(arr, ele) {
        let str = '<option value="">请选择</option>';
        arr.map((val, i) => {
            str += `
          <option value="${val}">${val}</option>
            `
        })
        $(ele).html(str);
    },
    sendAjax(url, param, datatype) {
        return new Promise((resolve, reject) => {
            var loadIndex = '';
            $.ajax({
                type: "get",
                url: url,
                data: param,
                dataType: datatype,
                beforeSend: function () {
                    loadIndex = layer.load(0, {
                        shade: [0.1, '#ccc']
                    });
                },
                complete: function () {
                    layer.close(loadIndex);
                },
                success: res => {
                    resolve(res);
                },
                error: err => {
                    reject(err);
                }
            });
        })
    }
}

//样本选择
function _upload(e) {
    let file = e.target.files[0];
    if (file) {
        console.log(file);
        let filetype = file.name.replace(/.+\./, "");
        if (filetype == 'csv' || filetype == 'xlsx') {
            if (file.size < 100) {
                layer.msg("文件内容为空");
                $('input[name=csvfile]').val("")
                return false;
            } else {
                let fileName = file.name.replace(/(.*\/)*([^.]+).*/ig, "$2");
                $("#file_int").val(fileName);
                var formData = new FormData();
                formData.append('files', file);
                objData['file'] = formData;
            }
        } else {
            layer.msg("文件格式错误");
            $('input[name=csvfile]').val("")
            return false;
        }
    }
}
//注意：导航 依赖 element 模块，否则无法进行功能性操作
layui.use(['element', 'form', 'table', 'laypage', 'upload'], function () {
    var element = layui.element,
        form = layui.form,
        table = layui.table,
        laypage = layui.laypage,
        upload = layui.upload
    //数据管理
    function getManageList() {
        objData.sendAjax(API.getmanage, "json").then(res => {
            objData['sample_list'] = res.sampleList;
            objData['dataModel'] = res.modelList;
            objData['testList'] = res.testList;
            objData['dataList'] = res.sampleList.concat(res.testList);
            $('.allChecked').prop('checked', false)
            let str1 = str2 = str3 = '';
            if (res.sampleList.length > 0) {
                res.sampleList.map((item, index) => {
                    str1 += `
                            <input type="checkbox" name="sample_name" lay-filter="isChecked" lay-skin="primary"
                            title="${item}" class="int_check" value="${item}">
                            `
                })
            } else {
                str1 = "暂无数据"
            }
            if (res.modelList.length > 0) {
                res.modelList.map((item, index) => {
                    str2 += `
                            <input type="checkbox" name="model_name" lay-filter="isChecked" lay-skin="primary"
                                        title="${item}" class="int_check" value="${item}"></input>
                            `
                })
            } else {
                str2 = "暂无数据"
            }
            if (res.testList.length > 0) {
                res.testList.map((item, index) => {
                    str3 += `
                            <input type="checkbox" name="test_name" lay-filter="isChecked" lay-skin="primary"
                            title="${item}" class="int_check" value="${item}">
                            `
                })
            } else {
                str3 = "暂无数据"
            }
            $('#sample_item').html(str1);
            $('#model_item').html(str2);
            $('#test_item').html(str3);
            form.render();
        }).catch(err => {
            console.log(err)
        })
    }
    //模型详情
    function getModelDetail() {
        objData.sendAjax(API.getModelDetail, {},
            'json').then(res => {
                let len = Object.keys(res).length;
                if (len > 0) {
                    let tabStr = '';
                    for (let i in res) {
                        tabStr += `
                    <div class="tabstr-title">${i}算法</div>
                    <table class="layui-table tabStr">
                        <thead>
                            <tr>
                           `
                        for (let j = 0; j < res[i].colums.length; j++) {
                            tabStr += `
                        <th style="text-align: center;">${res[i].colums[j]}</th>
                    `
                        }
                        tabStr += `
                        </tr>
                    </thead>
                    <tbody>
                `
                        for (let k = 0; k < res[i].data.length; k++) {
                            tabStr += `
                    <tr> 
                    `
                            for (let x = 0; x < res[i].data[k].length; x++) {
                                tabStr += `
                        <td align="center">${res[i].data[k][x]}</td>
                    `
                            }
                            tabStr += `
                    </tr>`
                        }
                        tabStr += `
                            
                        </tbody>
                    </table>
                `
                    }
                    $('#dataDetail').html(tabStr);
                } else {
                    $('#dataDetail').html("<div class='no'>暂无数据模型</div>");
                }
            }).catch(err => {
                console.log(err)
            })
    }
    //问卷
    function getQuestList() {
        $.getJSON('../common/quest.json', function (res) {
            let str = '';
            for (let q = 0; q < res.dataList.length; q++) {
                str += `
                <div class="quest-form-item">
                    <div class="quest-a">${res.dataList[q].question}</div>
                    <div class="ans-form-list ans-form-check">
                `
                for (let i = 0; i < res.dataList[q].answer.length; i++) {
                    str += `
                    <input type="radio" name="${q+1}" lay-skin="primary" title="${res.dataList[q].answer[i]}" lay-verify="ans_checked"
                    value="${res.dataList[q].answer[i]}"> 
                    `
                }
                str += `
                    </div>
                </div>
                `
            }
            $('#quest-form-list').html(str);
            form.render();
        })
    }
    //监听Tab切换
    element.on('tab(docDemoTabBrief)', function (res) {
        if (res.index === 1) {
            objData.sendAjax(API.getDatalist, "json").then(res => {

                objData['dataList'] = res.dataList;
                objData.getList(objData['dataList'], '#dataList');
                form.render("select");
            }).catch(err => {
                console.log(err)
            })
        } else if (res.index === 2) {
            if ($('#train-algorithm')) {
                $('#train-algorithm').empty()
            }
            if ($('#model_name').find('.layui-input')) {
                $('#model_name').find('.layui-input').val("");
            }
            objData.sendAjax(API.getModellist, 'json').then(res => {
                objData['dataModel'] = res.modelList;
            }).catch(err => {
                console.log(err, '训练模型数据失败')
            });
            objData.sendAjax(API.getAlgorithm, 'json').then(res => {
                let algo = '<option value="">请选择</option>';
                objData.AlgorithmData = res;
                for (let k in res) {
                    algo += `
                      <option value="${k}">${k}</option>
                        `
                }
                $('#algorithm').html(algo);
                form.render("select");
            }).catch(err => {
                console.log(err, '训练模型数据失败')
            });
            if (objData['dataList'].length == 0) {
                objData.sendAjax(API.getDatalist, 'json').then(res => {
                    objData['dataList'] = res.dataList;
                    objData.getList(objData['dataList'], '#sampleList');
                    form.render("select");
                }).catch(err => {
                    console.log(err, '训练模型数据失败')
                });
            } else {
                objData.getList(objData['dataList'], '#sampleList');
                form.render("select");
            }
        } else if (res.index === 3) {
            if (objData['dataList'].length == 0 || objData['testList'].length == 0) {
                objData.sendAjax(API.getDatalist, 'json').then(res => {
                    objData['dataList'] = res.dataList;
                    objData['testList'] = res.testList;
                    objData.getList(objData['dataList'], '#sampleText');
                    objData.getList(objData['testList'], '#sampleResult');
                    form.render("select");
                }).catch(err => {
                    console.log(err, '训练模型数据失败')
                });
            } else {
                objData.getList(objData['dataList'], '#sampleText');
                objData.getList(objData['testList'], '#sampleResult');
                form.render("select");
            }
            if (objData['dataModel'].length == 0) {
                objData.sendAjax(API.getModellist, 'json').then(res => {
                    objData['dataModel'] = res.modelList;
                    objData.getList(objData['dataModel'], '#modelText');
                    form.render("select");
                }).catch(err => {
                    console.log(err, '训练模型数据失败')
                });
            } else {
                objData.getList(objData['dataModel'], '#modelText');
                form.render("select");
            }
        } else if (res.index === 4) {
            if (objData['dataModel'].length == 0) {
                objData.sendAjax(API.getModellist, 'json').then(res => {
                    objData['dataModel'] = res.modelList;
                    objData.getList(objData['dataModel'], '#applicTest');
                    form.render("select");
                }).catch(err => {
                    console.log(err, '训练模型数据失败')
                });
            } else {
                objData.getList(objData['dataModel'], '#applicTest');
                form.render("select");
            }

            getModelDetail()
            getQuestList();
        } else if (res.index === 5) {
            getManageList()
        }
    });
    form.verify({
        count: function (value, item) {
            if (!value) {
                return "请填写该字段"
            } else if (!/^[0-9]*$/.test(value)) {
                return "输入必须为数字!"
            }
        },
        sample_name: function (value, item) {
            if (!value) {
                return "请填写该字段"
            } else if ((objData['dataList'].includes(value))) {
                return "样本名称重复"
            }
        },
        model_name: function (value, item) {
            if (!value) {
                return "请填写该字段"
            } else if ((objData['dataModel'].includes(value))) {
                return "样本名称重复"
            }
        },
        numOrpoint: function (value, item) {
            if (!value) {
                return "请填写该字段"
            } else if (!/^\d+$|^\d+\.\d+$/g.test(value)) {
                return "输入必须为整数或小数"
            }
        }
    });
    //预处理数据生成
    form.on('submit(bindSub)', function (data) {
        $('#bindsub')[0].reset();
        form.render();
        objData.sendAjax(API.generate, {
            count: data.field.count,
            sample_name: data.field.sample_name
        }, 'text').then(res => {
            layer.msg(res);
            objData['dataList'].push(data.field.sample_name);
            let str = '<option value="">请选择</option>';
            objData['dataList'].map((val, i) => {
                str += `
          <option value="${val}" selected>${val}</option>
            `
            })
            $("#dataList").html(str);
            form.render("select");
        }).catch(err => {
            layer.msg("数据生成失败");
        })
        return false;
    });

    //获取每一行的数据
    let getRowData = function (event) {
        table.on(event, function (obj) {
            var data = obj.data;
            layer.alert(JSON.stringify(data), {
                title: '当前行数据：'
            });
            //标注选中样式
            obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
        });
    }
    //封装table函数
    function getTableData(options) {
        return table.render({
            elem: options.ele,
            data: options.data,
            toolbar: options.ele,
            cols: options.columns,
            limit: options.limit,
            page: false,
            done: function () {
                laypage.render({
                    elem: options.elePage,
                    count: options.count,
                    curr: options.curr,
                    limit: options.limit,
                    limits: [10, 20, 50, 100, 200, 500],
                    layout: ['prev', 'page', 'next', 'skip', 'count', 'limit'],
                    jump: function (obj, first) {
                        if (!first) {
                            //不是第一次进入
                            objData['curr'] = obj.curr;
                            objData['limit'] = obj.limit;
                            if (options.redditeTable) {
                                let params = {
                                    begin_idx: obj.curr,
                                    limit: obj.limit
                                };
                                options.redditeTable(options.url, Object.assign(params, options.name), options.name, options.ele, options.page, options.elePage, obj.limit, obj.curr)
                            }
                        }
                    }
                })
            }
        })
    }
    //表格渲染封装
    function redditeTable(url, params, name, ele, page, elePage, limit, curr) {
        objData.sendAjax(url, params, "json").then(function (res) {
            let columns = [{
                type: 'checkbox',
                fixed: 'left'
            }];
            if (res.data && res.data.length > 0) {
                for (let i = 0; i < res.label.length; i++) {
                    if (res.label[i] == "index") {
                        columns.push({
                            field: 'index',
                            align: 'center',
                            title: 'ID'
                        });
                    } else {
                        columns.push({
                            field: res.label[i],
                            align: 'center',
                            title: res.label[i],
                            edit: 'text'
                        })
                    }
                }
            }
            let options = {
                ele: ele,
                elePage: elePage,
                data: res.data,
                columns: [columns],
                count: res.count,
                limit: limit ? limit : 10,
                curr: curr ? curr : 1,
                redditeTable: redditeTable,
                url: url,
                page: page,
                name: name
            }
            getTableData(options);
            page.show();
        }).catch(function (err) {
            console.error(err);
        })
    }
    //预处理预览请求
    form.on('submit(bindGet)', function (data) {
        $('#bindget')[0].reset();
        form.render();
        objData['tableSample_name'] = data.field.sample_name;
        let name = {
            sample_name: objData['tableSample_name']
        }
        redditeTable(API.preview, {
            sample_name: objData['tableSample_name'],
            begin_idx: 1,
            limit: 10
        }, name, '#tableData', $("#tableDataPage"), "tableDataPage");
        return false;
    });
    getRowData('row(tableData)');
    //监听单元格编辑
    table.on('edit(tableData)', function (obj) {
        var value = obj.value, //得到修改后的值
            data = obj.data, //得到所在行所有键值
            field = obj.field, //得到字段
            index = obj.data.index;
        //得到字段
        objData.sendAjax(API.dataupdate, {
            sample_name: objData['tableSample_name'],
            field: field,
            index: index,
            value: value
        }, 'text').then(res => {
            let name = {
                sample_name: objData['tableSample_name']
            }
            let data = JSON.parse(res);
            if (data.code === 1) {
                layer.alert("更改成功", {
                    title: '结果显示'
                });
            } else {
                layer.alert("更改不符合要求！", {
                    title: '结果显示'
                });
                redditeTable(API.preview, {
                    sample_name: objData['tableSample_name'],
                    begin_idx: objData['curr'],
                    limit: objData['limit']
                }, name, '#tableData', $("#tableDataPage"), objData['curr'], objData['limit'])
            }
        }).catch(err => {
            layer.alert(err, {
                title: '结果显示'
            });
        })
    });
    //文件上传
    form.on('submit(uploadFile)', function (data) {
        if (objData['file'].has("files")) {
            let fileName = $("#file_int").val();
            if (objData['dataList'].includes(fileName)) {
                layer.msg("样本名称重复");
            } else {
                $.ajax({
                    url: API.dataupload + `?sample_name=${fileName}`,
                    method: 'POST',
                    data: objData['file'],
                    cache: false,
                    processData: false,
                    contentType: false,
                    success: function (res) {
                        if (res.code == 1) {
                            objData['dataList'].push(fileName)
                            layer.alert(res.data, {
                                title: '结果显示'
                            });
                        }
                    },
                    error: function (err) {
                        layer.msg(err);
                    }
                })
            }
        } else {
            layer.msg("确认是否选择文件")
        }
        return false;
    })

    //模型训练
    form.on('submit(train)', function (data) {
        objData.sendAjax(TRAINURI + '/', {
            params: JSON.stringify(data.field)
        }, 'json').then(res => {
            if (res.code == 1) {
                objData['dataModel'].push(data.field.model_name);
                let score_test = parseFloat(res.score_test).toFixed(3),
                    score_train = parseFloat(res.score_train).toFixed(3);
                layer.alert(`训练集得分：${score_test} </br> 测试集得分：${score_train}`, {
                    title: '训练结果'
                });
            } else if (res.code == 2) {
                var myChart = echarts.init(document.getElementById('train-echart'));
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: `${data.field.testParams ? '测试变量为：' + data.field.testParams : '图表'}`,
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['train', 'test']
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            dataView: {
                                readOnly: false
                            },
                            magicType: {
                                type: ['line', 'bar']
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: res.test_res.x
                    },
                    yAxis: {
                        type: 'value',
                        min: function (value) {
                            return (value.min - 0.1).toFixed(2)
                        },
                        max: function (value) {
                            return (value.max + 0.1).toFixed(2)
                        }
                    },
                    series: [{
                        name: 'train',
                        type: 'line',
                        data: res.test_res.train_score
                    }, {
                        name: 'test',
                        type: 'line',
                        data: res.test_res.test_score
                    }]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);
            }
        }).catch(err => {
            layer.msg("训练失败")
        })
        return false;
    });
    //训练监听算法数据遍历
    form.on('select(version)', function (data) {
        if (data.value == "常规训练") {
            $('#testAlgorithm').empty();
            $('#train-algorithm').empty();
            $('#algorithm').val("");
            let modelStr = `<label class="layui-form-label">模型名称</label>
                            <div class="layui-input-block">
                                <input type="text" name="model_name" required lay-verify="model_name"
                                    placeholder="请输入名称" autocomplete="off" class="layui-input">
                            </div>`
            $('#model_name').html(modelStr).show();
            form.render();
            form.on('select(algorithm)', function (data) {
                if (data.value) {
                    let str = '';
                    objData['AlgorithmData'][data.value].map(item => {
                        str += `
                    <div class="layui-form-item int-w">
                        <label class="layui-form-label">${item}</label>
                        <div class="layui-input-block">
                            <input type="text" name="${item}" required lay-verify="required"
                                placeholder="请输入参数" autocomplete="off" class="layui-input">
                        </div>
                    </div>
                `
                    })
                    $('#train-algorithm').html(str);
                    $('#train-algorithm').show();
                    form.render();
                }
            })
        } else {
            $('#testAlgorithm').empty().hide();
            $('#train-algorithm').empty().hide();
            $('#model_name').empty().hide();
            $('#algorithm').val("");
            form.render();
            form.on('select(algorithm)', function (data) {
                if (data.value) {
                    $('#train-algorithm').empty();
                    form.render();
                    let str = `<label class="layui-form-label">测试参数</label> <div class="layui-input-block">
                    <select name="testParams" lay-verify="required" id="testParams"
                        lay-filter="testParams"><option value="">请选择</option>`;
                    let arr = ['criterion'];
                    objData['AlgorithmData'][data.value].map(item => {
                        if (!arr.includes(item)) {
                            str += `
                            <option value="${item}">${item}</option>
                                `
                        }
                    })
                    str += ` </select></div>`
                    $('#testAlgorithm').html(str).show();
                    form.render();
                    //监听测试参数
                    form.on('select(testParams)', function (res) {
                        let testParamData = JSON.parse(JSON.stringify(objData['AlgorithmData'][data.value]));
                        testParamData.remove(res.value);
                        testParamData.unshift("start_val", "end_val", "interval")
                        let bits = '';
                        testParamData.map(ele => {
                            bits += `
                            <div class="layui-form-item int-w">
                                <label class="layui-form-label">${ele}</label>
                                <div class="layui-input-block">
                                    <input type="text" name="${ele}" required lay-verify="required"
                                        placeholder="请输入参数" autocomplete="off" class="layui-input">
                                </div>
                            </div>`
                        })
                        $('#train-algorithm').html(bits).show();
                        form.render();
                    })
                }
            })
        }
    })

    // 应用问卷展示
    form.on('submit(questStart)', function (data) {
        $('.question-form').hide("slow").show("normal");
        objData['quest_name'] = objData['dataModel'][data.field.quest_name];
        return false;
    });
    //应用问卷提交
    form.on('submit(quest_all)', function (data) {
        objData['name']=data.field.quest01_name;
        function getEle() {
            let flag;
            let arr = [];
            $('.quest-form-item').find('.ans-form-check').each((i, item) => {
                let ele = item.querySelectorAll('input');
                let flagCheck = function (ele) {
                    let checkType = false;
                    for (let i = 0; i < ele.length; i++) {
                        if (ele[i].checked) {
                            checkType = true;
                            break;
                        } else {
                            checkType = false;
                        }
                    }
                    return checkType;
                }
                if (!flagCheck(ele)) {
                    item.parentNode.children[0].style.color = "red";
                    flag = false;
                } else {
                    item.parentNode.children[0].style.color = "#3d3d3d";
                    flag = true;
                }
                arr.push(flag)
            });
            return arr;
        }
        let items = getEle().every(item => {
            return item == true;
        })
        if (items) {
            console.log(data.field)
            objData.sendAjax(APPLICATION + '/', {
                options: JSON.stringify(data.field),
                'name':objData['name']
            }, 'json').then(res => {
                layer.alert(`${res.recommend}`, {
                    title: `${res.syndrome}`
                });
            }).catch(err => {
                layer.msg(err)
            })
        } else {
            layer.msg("必选项不能为空")
        }
        return false;
    });
    //测试
    form.on('submit(test)', function (data) {
        $('#test')[0].reset();
        form.render();
        objData.sendAjax(TESTURL + '/', {
            sample_name: data.field.sample_name,
            model_name: data.field.model_name,
            test_name: data.field.result_name
        }, 'json').then(res => {
            let score_test = parseFloat(res.score).toFixed(3);
            layer.alert(`测试得分：${score_test}`, {
                title: '测试结果'
            });
            objData['dataList'].push(data.field.result_name);
            objData['testList'].push(data.field.result_name);
            objData.getList(objData['dataList'], '#sampleText');
            objData.getList(objData['testList'], '#sampleResult');
            form.render("select");
        }).catch(err => {
            layer.msg("测试失败")
        })
        return false;
    });
    //预览测试结果
    form.on('submit(testResult)', function (data) {
        $('#testresult')[0].reset();
        form.render();
        objData['tableResult_name'] = data.field.sample_name;
        let name = {
            test_name: objData['tableResult_name'],
        }
        redditeTable(API.viewdetail, {
            test_name: objData['tableResult_name'],
            begin_idx: 1,
            limit: 10
        }, name, '#tableResultData', $("#tableResultPage"), 'tableResultPage')
        return false;
    })
    getRowData('row(tableResultData)');
    //监听单元格编辑
    table.on('edit(tableResultData)', function (obj) {
        var value = obj.value, //得到修改后的值
            data = obj.data, //得到所在行所有键值
            field = obj.field, //得到字段
            index = obj.data.index;
        //得到字段
        objData.sendAjax(API.dataupdate, {
            sample_name: objData['tableResult_name'],
            field: field,
            index: index,
            value: value
        }, 'text').then(res => {
            let name = {
                test_name: objData['tableResult_name'],
            }
            let data = JSON.parse(res);
            if (data.code === 1) {
                layer.alert("更改成功", {
                    title: '结果显示'
                });
            } else {
                layer.alert("更改不符合要求！", {
                    title: '结果显示'
                });
                redditeTable(API.viewdetail, {
                    test_name: objData['tableResult_name'],
                    begin_idx: objData['curr'],
                    limit: objData['limit']
                }, name, '#tableResultData', $("#tableResultPage"), 'tableResultPage')
            }
        }).catch(err => {
            layer.alert(err, {
                title: '结果显示'
            });
        })
    });
    //全选封装
    function all_select(flag, ele, eleAll) {
        let _arr = [];
        if (flag) {
            if (ele.length > 0) {
                ele.prop("checked", true);
                ele.map((i, item) => {
                    if (!_arr.includes(item.value)) {
                        _arr.push(item.value);
                    }
                })
                form.render('checkbox');
            } else {
                layer.msg("暂无数据");
                eleAll.prop("checked", false);
                form.render('checkbox');
                _arr = [];
            }
        } else {
            ele.prop("checked", false);
            form.render('checkbox');
        }
        return _arr;
    }

    //单选封装
    function select_check(ele, eleAll, arr) {
        let len = ele.length;
        ele.map((i, item) => {
            if (item.checked) {
                if (!arr.includes(item.value)) {
                    arr.push(item.value);
                }
                len--;
                if (len == 0) {
                    eleAll.prop("checked", true);
                    form.render('checkbox');
                }
            } else {
                arr.remove(item.value);
                eleAll.prop("checked", false);
                form.render('checkbox');
            }
        })
    }
    //全选
    form.on('checkbox(all_check)', function (data) {
        let flag = $(this).is(':checked');
        let ele = $(this).parent().next().find('.int_check');
        let file_type = $(this).next().next().data("name");
        switch (file_type) {
            case "sample":
                objData['delSample_List'] = all_select(flag, ele, $(this))
                break;
            case "model":
                objData['delModel_List'] = all_select(flag, ele, $(this))
                break;
            case "test":
                objData['delTest_List'] = all_select(flag, ele, $(this))
                break;
        }
    });
    //单选
    form.on('checkbox(isChecked)', function (data) {
        let ele = $(this).parent().find('.int_check');
        let all_ele = $(this).parent().prev().find('.allChecked');
        let file_type = $(this).parent().prev().find('.layui-del').data("name");
        switch (file_type) {
            case "sample":
                select_check(ele, all_ele, objData['delSample_List'])
                break;
            case "model":
                select_check(ele, all_ele, objData['delModel_List'])
                break;
            case "test":
                select_check(ele, all_ele, objData['delTest_List'])
                break;
        }
    });
    //删除
    $('.manage-form-list').find('.layui-del').click(function () {
        let file_type = $(this).data('name');
        let len = file_type == 'sample' ? objData['delSample_List'].length : file_type == 'model' ? objData['delModel_List'].length : file_type == 'test' ? objData['delTest_List'].length : '';
        if (len > 0) {
            layer.alert("确认是否删除", {
                btn: ['确认', '取消'],
                title: "提示",
                yes: function (index, layero) {
                    objData.sendAjax(API.rm_file, {
                        file_type: file_type,
                        file_list: file_type == 'sample' ? JSON.stringify(objData['delSample_List']) : file_type == 'model' ? JSON.stringify(objData['delModel_List']) : file_type == 'test' ? JSON.stringify(objData['delTest_List']) : ''
                    }, 'text').then(res => {
                        layer.msg(res);
                        switch (file_type) {
                            case "sample":
                                objData['delSample_List'].map(item => {
                                    objData['delSample_List'].remove(item)
                                });
                                break;
                            case "model":
                                objData['delModel_List'].map(item => {
                                    objData['delModel_List'].remove(item)
                                });
                                break;
                            case "test":
                                objData['delTest_List'].map(item => {
                                    objData['delTest_List'].remove(item)
                                });
                                break;
                        }
                        getManageList();
                    }).catch(err => {
                        layer.msg(err)
                        console.log(err)
                    })
                    layer.close(index);
                }
            })
        } else {
            layer.msg("请确认是否选中")
        }
        return false
    })
});