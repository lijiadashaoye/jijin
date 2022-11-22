<template >
  <div v-if="isOk" class="tableWap">
    <h3 style="text-indent: 45%">持仓情况</h3>
    <table class="shouyi">
      <tr>
        <th>基金名称</th>
        <th>持仓数额</th>
        <th>盈亏数额</th>
        <th>收益率</th>
      </tr>
      <tr v-for="(t, i) of shouyiArr" :key="i">
        <td>
          <p @contextmenu.prevent="seeJiJin(t.code, $event)">
            {{ t.name }}（ {{ t.code }}）
            <span @click="seejijin(showJiJin)" v-if="showJiJin === t.code"
              :style="{ top: spanTop, right: spanLeft }">查看基金</span>
          </p>
        </td>
        <td>
          {{ t.chicang }}
        </td>
        <td>
          <span :class="{isGreen:!setColor(t.yingli),isRed:setColor(t.yingli)}">{{ t.yingli}}</span>
        </td>
        <td>
          <span :class="{isGreen:!setColor(t.yingli),isRed:setColor(t.yingli)}">{{ t.shouyilv }}</span>
        </td>
      </tr>
    </table>
    <h3 style="text-indent: 45%">重合的股票分析</h3>
    <table class="chonghe">
      <tr>
        <th>基金名称</th>
        <th>重合的股票</th>
        <th>不重合的股票</th>
      </tr>
      <tr v-for="(t, i) of chongheArr" :key="i">
        <td>
          <p @contextmenu.prevent="seeJiJin(t.one.code, $event)">
            {{ t.one.name }}
            <span @click="seejijin(showJiJin)" v-if="showJiJin === t.one.code"
              :style="{ top: spanTop, right: spanLeft }">查看基金</span>
          </p>
          <p @contextmenu.prevent="seeJiJin(t.two.code, $event)">
            {{ t.two.name }}
            <span @click="seejijin(showJiJin)" v-if="showJiJin === t.two.code"
              :style="{ top: spanTop, right: spanLeft }">查看基金</span>
          </p>
        </td>
        <td>
          <span>{{ t.chonghe.length }}</span>
          {{ t.chonghe.join("、 ") }}
        </td>
        <td>
          <p>{{ t.oneOther.join("、 ") }}</p>
          <p>{{ t.twoOther.join("、 ") }}</p>
        </td>
      </tr>
    </table>
    <h3 style="text-indent: 45%; margin-top: 30px">股票被持仓分析</h3>
    <table class="gupiao">
      <tr>
        <th>股票名称</th>
        <th>持有次数</th>
        <th>持有基金</th>
      </tr>
      <tr v-for="t of gupiaoEnd" :key="t.code">
        <td :style="{
          background: t.jijin.length > 4 ? 'pink' : '',
        }" @contextmenu.prevent="showRight(t.code, $event)">
          {{ t.name }}
          <span @click="seeGuPiao(showright)" v-if="showright === t.code"
            :style="{ top: spanTop, right: spanLeft }">查看股票</span>
        </td>
        <td>{{ t.jijin.length }}</td>
        <td>{{ t.jijin.join("、 ") }}</td>
      </tr>
    </table>
  </div>
</template>
<script setup>
import { inject, ref, onMounted, reactive } from "vue";

let isOk = ref(false),
  emit = defineEmits(["showTable", "progress"]),
  $axios = inject("$axios"),
  chongfu = ref([]),
  shaiguo = ref([]),
  chongheArr = ref([]),
  chongheLimit = 4, // 重合数量限定
  gupiaoEnd = ref([]),
  showright = ref(""),
  showJiJin = ref(""),
  spanTop = ref(0),
  spanLeft = ref(0),
  time = ref(''),
  shouyiArr = ref([]);
(function autoRead() {
  $axios({
    method: "get",
    url: `wenjian`,
  }).then((res) => {
    let data = res.data.data
      .slice(1)
      .map((t) => ["" + t[0], t[1]])
      .filter((t) => t[0] !== "undefined"),
      zhengli = [];
    for (let i = data.length; i--;) {
      let t = data[i];
      if (!zhengli.includes(t[0])) {
        zhengli.push(t[0]);
        shaiguo.value.push(t);
      } else {
        chongfu.value.push(t);
      }
    }
    let month = new Date().getMonth() + 1;
    let arr = [1, 4, 7, 10]; // 如果在下一季度，就要清零
    if (arr.includes(month)) {
      $axios({
        method: "get",
        url: `reset`,
        headers: {
          "Content-Type": "tapplication/json;charset=utf-8",
        },
      }).then(() => {
        getData();
      });
    } else {
      getData();  // 使用本地存储的数据
    }
  });
})();
// 使用本地存储的数据
function getData() {
    $axios({
      method: "get",
      url: `getPageData`,
      headers: {
        "Content-Type": "tapplication/json;charset=utf-8",
      },
    })
    .then(async (res) => {
      let data = res.data;
      if (data.length) {
        let now = shaiguo.value.map((t) => t[0]);
        data.forEach((t) => {
          // 修改名字，与excel内一致了
          let tar = shaiguo.value.filter((j) => j[0] === t[0]);
          if (tar.length) {
            t[1] = tar[0][1];
          }
          if (!now.includes(t[0])) {
            data = data.filter((s) => s[0] !== t[0]);
          } else {
            shaiguo.value = shaiguo.value.filter((s) => s[0] !== t[0]);
          }
        });
      }
      second(data);
    });
}
async function second(data) {
  let postData = [];
  if (shaiguo.value.length) {
    postData.push(...shaiguo.value);
    for (let i = 0; i < shaiguo.value.length; i++) {
      emit("progress", Math.trunc(((i + 1) / shaiguo.value.length) * 100));
      await $axios({
        method: "get",
        url: `chicang/${shaiguo.value[i][0]}`,
        headers: {
          "Content-Type": "text/html;charset=utf-8",
        },
      }).then((res) => {
        let chicang = res.data.data.stock.map((t) => ({
          code: t.zcCode,
          name: t.zcName,
        }));
        shaiguo.value[i].push(chicang);
      });
    }
  }
  if (data.length) {
    postData.push(...data);
  }
  $axios({
    method: "post",
    url: `savePageData`,
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    data: postData,
  }).then((res) => {
    zhengliFn(res.data);
  });
}
function zhengliFn(data) {
  let jijinData = [];
  let gupiao = data.reduce((all, now) => {
    jijinData.push({
      code: now[0],
      name: now[1],
      gupiao: now[2].map((s) => s.name),
    });
    let tar = now[2];
    tar.forEach((t) => {
      if (!t.jijin) {
        t.jijin = [now[1]];
      }
      all.push(t);
    });
    return all;
  }, []),
    kong = [];
  gupiaoEnd.value = gupiao
    .reduce((all, now) => {
      if (!kong.includes(now.code)) {
        kong.push(now.code);
        all.push(now);
      } else {
        let tar = all.filter((s) => s.code === now.code);
        tar[0].jijin.push(now.jijin[0]);
      }
      return all;
    }, [])
    .sort((a, b) => b.jijin.length - a.jijin.length);
  for (let i = 0; i < jijinData.length; i++) {
    let num = 0,
      arr = jijinData.slice(i + 1);
    gupiao = jijinData[i].gupiao;
    for (let j = 0; j < arr.length; j++) {
      let gupiao2 = arr[j].gupiao;
      for (let k = gupiao2.length; k--;) {
        if (gupiao.includes(gupiao2[k])) {
          num++;
        }
      }
      if (num > chongheLimit) {
        chongheArr.value.push({
          one: { name: jijinData[i].name, code: jijinData[i].code },
          two: { name: arr[j].name, code: arr[j].code },
          chonghe: gupiao.filter((t) => gupiao2.includes(t)),
          oneOther: gupiao.filter((t) => !gupiao2.includes(t)),
          twoOther: gupiao2.filter((t) => !gupiao.includes(t)),
        });
      }
      num = 0;
    }
  }
  chongheArr.value = chongheArr.value.sort(
    (a, b) => b.chonghe.length - a.chonghe.length
  );
  // getShouYi()
  useHttps();
  setTimeout(() => {
    isOk.value = true;
    emit("showTable");
  }, 500);
}
function showRight(code, e) {
  clearTimeout(time);
  showright.value = code;
  time = setTimeout(() => {
    showright.value = "";
    spanTop.value = "";
    spanLeft.value = "";
  }, 3000);
  spanTop.value = "calc(50% - 12px)";
  spanLeft.value = 15 + "px";
}
function seeGuPiao(code) {
  window.open(`http://stockpage.10jqka.com.cn/${code}`);
}
function seeJiJin(code, e) {
  clearTimeout(time);
  showJiJin.value = code;
  time = setTimeout(() => {
    showJiJin.value = "";
    spanTop.value = "";
    spanLeft.value = "";
  }, 3000);
  spanTop.value = "calc(50% - 11px)";
  spanLeft.value = -3 + "px";
}
function seejijin(code) {
  window.open(`http://fund.10jqka.com.cn/${code}`);
}
function setColor(str) {
  let reg = /^-/;
  return !reg.test(str)
}
// 使用从天天基金网获取的收益数据
function useHttps() {
  import('../../myself.js').then(res=>{
  let reg = /<tr>.+?<\/tr>/ig,
    arr = JSON.parse(res.default).content.match(reg),
    reg1 = /(?<=html'>).+?(?:\（)\d{6}(?:\）)/ig, // 基金名字和代码
    reg2 = /(.+)(?:\（)(\d{6})(?:\）)/ig, // 基金代码
    reg3 = /(?<=desc'>).+?(?=(<\/td|<br\/))/ig,  // 持仓
    reg4 = /(?<=f16'>)-?(\d+?,?)+?(\.\d+)(?=<\/span)/ig,
    reg5 = /(?<=f12'>)-?\d+?(\.)?\d+?%/ig; // 收益率
  shouyiArr.value = arr.map(t => {
    let is1 = t.match(reg3),
      is2 = t.match(reg4),
      is3 = t.match(reg5),
      obj = {
        chicang: is1 ? is1[0] : '',
        yingli: is2 ? is2[0] : '',
        shouyilv: is3 ? is3[0] : '',
      },
      num = obj.shouyilv.replace('%', '');
    if (!isNaN(+num)) {
      obj.num = +num
    }
    t.match(reg1)[0].replace(reg2, ($0, $1, $2) => {
      obj.name = $1;
      obj.code = $2;
    })
    return obj
  })
    .sort((a, b) => a.num - b.num)
})
}
// 读取本地收益文件
function getShouYi() {
  $axios({
      method: "get",
      url: `shouyi`,
      headers: {
        "Content-Type": "tapplication/json;charset=utf-8",
      },
    }).then(res=>{
      shouyiArr.value = res.data.map(t => {
    let num = t.shouyilv.replace('%', '');
    if (!isNaN(+num)) {
      t.num = +num
    }
    return t
  }).sort((a, b) => a.num - b.num);
    })
}
</script>
<style scoped lang='scss'>
.tableWap {
  height: 100%;
  overflow-y: auto;
}

p {
  margin: 3px 0;
}

.gupiao {
  $col1: 110px;
  $col2: 64px;
  border: 1px solid;
  border-collapse: collapse;
  margin: 0 30px;
  width: calc(100% - 60px);

  th,
  td {
    border: 1px solid;
    padding: 3px 5px;
  }

  th:nth-of-type(1) {
    width: $col1;
  }

  th {
    font-size: 16px;
  }

  td {
    font-size: 14px;
  }

  tr td:nth-of-type(1) {
    width: $col1;
    font-size: 18px;
    text-align: center;
    position: relative;

    span {
      position: absolute;
      z-index: 3;
      display: inline-block;
      width: 70px;
      height: 24px;
      background: rgb(223, 240, 197);
      line-height: 24px;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
    }
  }

  th:nth-of-type(2) {
    width: $col2;
  }

  tr td:nth-of-type(2) {
    width: $col2;
    text-align: center;
  }

  tr td:nth-of-type(3) {
    line-height: 20px;
  }
}

.chonghe {
  width: calc(100% - 60px);
  border: 1px solid;
  border-collapse: collapse;
  margin: 30px;

  th,
  td {
    border: 1px solid;
    padding: 3px 5px;
  }

  th:nth-of-type(1) {
    width: 260px;
  }

  th:nth-of-type(2) {
    width: 40%;
  }

  th:nth-of-type(3) {
    width: calc(100% - 40% - 260px);
  }

  tr {
    td:nth-of-type(1) {
      font-size: 14px;
      text-align: right;
      padding-right: 10px;
      $spanBg: rgb(132, 241, 157);

      p:nth-of-type(1) {
        position: relative;
        color: rgb(141, 8, 106);

        span {
          position: absolute;
          z-index: 3;
          display: inline-block;
          width: 70px;
          height: 20px;
          background: $spanBg;
          line-height: 20px;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
          text-align: center;
        }
      }

      p:nth-of-type(2) {
        position: relative;
        color: rgb(2, 55, 55);

        span {
          text-align: center;
          position: absolute;
          z-index: 3;
          display: inline-block;
          width: 70px;
          height: 20px;
          background: $spanBg;
          line-height: 20px;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
        }
      }
    }

    td:nth-of-type(2) {
      font-size: 14px;

      span {
        color: red;
        font-size: 16px;
        display: inline-block;
        width: 18px;
        text-align: center;
      }
    }

    td:nth-of-type(3) {
      font-size: 14px;
    }
  }
}

.shouyi {
  width: calc(100% - 60px);
  border: 1px solid;
  border-collapse: collapse;
  margin: 30px;

  th,
  td {
    border: 1px solid;
    padding: 3px 5px;
  }

  th:nth-of-type(1) {
    width: 450px;
  }

  th:nth-of-type(2) {
    width: calc(100% - 40% - 450px);
  }

  th:nth-of-type(3) {
    width: 20%;
  }

  th:nth-of-type(4) {
    width: 20%;
  }

  tr {
    td {
      font-size: 14px;
      text-align: center
    }

    td:nth-of-type(1) {
      text-align: right;
      padding-right: 10px;
      $spanBg: rgb(132, 241, 157);

      p:nth-of-type(1) {
        position: relative;
        color: rgb(141, 8, 106);

        span {
          position: absolute;
          z-index: 3;
          display: inline-block;
          width: 70px;
          height: 20px;
          background: $spanBg;
          line-height: 20px;
          border-radius: 3px;
          font-size: 12px;
          cursor: pointer;
          text-align: center;
        }
      }
    }
  }
}

.isGreen {
  color: green
}

.isRed {
  color: rgb(242, 50, 50)
}
</style>