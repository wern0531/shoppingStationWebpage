let orderData = [];
const orderList = document.querySelector(".js-orderList");
function init() {
    getOrderList();
}
init();
function renderC3() {
    // 物件資料蒐集
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.category] == undefined) {
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    let newData = [];
    categoryAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors: {
                "Louvre 雙人床架": "#DACBFF",
                "Antony 雙人床架": "#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            orderData = response.data.orders;
            let str = '';
            orderData.forEach(function (item) {
                //組時間字串
                const timeStamp = new Date(item.createdAt * 1000);
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
                //組產品字串
                let productStr = "";
                item.products.forEach(function (productItem) {
                    productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
                })
                //判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) {
                    orderStatus = "已處理"
                } else {
                    orderStatus = "未處理"
                }
                //組訂單字串
                str += ` <tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>${productStr}</td>
                <td>${orderTime}</td>
                <td class="orderStatus">
                    <a href="#" data-status="${item.paid}" class="js-orderStatus" data-id="${item.id}">${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                </td>
            </tr>`
            })
            orderList.innerHTML = str;
            renderC3();
        })
}

orderList.addEventListener('click', function (e) {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrederItem(id);
        return
    }
    if (targetClass == "js-orderStatus") {
        let status = e.target.getAttribute("data-status");
        console.log(typeof (status), status);
        changeOrderStatus(status, id);
        return
    }
})

function changeOrderStatus(status, id) {
    console.log(status);
    let newStatus;
    console.log(newStatus);
    if (status == "true") {
        newStatus = false;
    } else {
        newStatus = true;
    }
    console.log(newStatus);
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token,
        }
    }).then(function (response) {
        alert("修改訂單成功");
        getOrderList();
    })
}

function deleteOrederItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token,
        }
    }).then(function (response) {
        alert("刪除該筆訂單成功");
        getOrderList();
    })

}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    }).then(function (response) {
        alert("刪除全部訂單成功");
        getOrderList();
    })
})