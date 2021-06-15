// Variable declarations

let tableItems = document.getElementById('tableItems');
let menuItems = document.getElementById('menuItems');

let addTableBtn = document.getElementById('addTable');
let addMenuItemBtn = document.getElementById('addMenuItem');

let tableModal = document.getElementById('tableModal');
let tableIdGenerated = document.getElementById('tableIdGenerated');
let addTableModalBtn = document.getElementById('addTableModalBtn');

let menuItemModal = document.getElementById('menuItemModal');
let menuItemIdGenerated = document.getElementById('menuItemIdGenerated');
let menuItemModalForm = document.getElementById('menuItemModalForm');

let menuTableId = document.getElementById('menuTableId');
let menuCustomerName = document.getElementById('menuCustomerName');

let dragOrderItemModal = document.getElementById('dragOrderItemModal');

let dragOrderItemId = document.getElementById('dragOrderItemId');
let dragOrderItemName = document.getElementById('dragOrderItemName');

let menuItemDisplayList = document.getElementById('menuItemDisplayList');

let generateBillBtn = document.getElementById('generateBillBtn');
let addItemToCartBtn = document.getElementById('addItemToCartBtn');

let orderDetailsModal = document.getElementById('orderDetailsModal');

let grandTotalDisplay = document.getElementById('grandTotalDisplay');

let selectedItemDisplayList = document.getElementById('selectedItemDisplayList');

let tableItemsSearchBtn = document.getElementById('tableItemsSearchBtn');
let menuItemsSearchBtn = document.getElementById('menuItemsSearchBtn');

let generateBillModal = document.getElementById('generateBillModal');
generateBillDisplayList = document.getElementById('generateBillDisplayList');

let generateBillItemId = document.getElementById('generateBillItemId');
let generateBillItemName = document.getElementById('generateBillItemName');
let generateBillGrandTotal = document.getElementById('generateBillGrandTotal');

let alertForCustomerName = document.getElementById('alertForCustomerName');
let alertForMenuItemName = document.getElementById('alertForMenuItemName');
let alertForMenuItemPrice = document.getElementById('alertForMenuItemPrice');

const port = 8000;


// Functions

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj));
}
Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key));
}

function getRandomId() {
    return '_' + Math.random().toString(36).substr(2, 12);
};

async function readFile() {

    const corHeaders = new Headers({ 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' });

    const requestForTables = async () => {
        const response = await fetch('http://localhost:' + port + '/tables');
        const data = await response.json();
        await localStorage.setObj('customer-table-list', data);
    }

    await requestForTables();

    const requestForMenuItems = async () => {
        const response = await fetch('http://localhost:' + port + '/menu',{
            headers : corHeaders
        });
        const data = await response.json();
        await localStorage.setObj('menu-item-list', data);
    }

    await requestForMenuItems();

}

menuItems.addEventListener('dragstart', (event) => {
    itemId = event.target.id.split('-')[1];
    event.dataTransfer.setData("dragOrderSelectedMenuItemId", itemId);
});

function getCardTemplateForMenu(itemList, i, itemListDiv) {

    let divElement = document.createElement('div');
    divElement.classList.add("col-3", "card", "mb-3");

    let imgElement = document.createElement('img');
    imgElement.src = itemList[i].url;
    imgElement.alt = "Sorry , Image can't be displayed"
    imgElement.draggable = true;
    imgElement.classList.add("img", "img-responsive", "card-img-top", "menu-card-img");
    imgElement.id = "menuImgElement" + "-" + itemList[i].id;

    let nameElement = document.createElement('h3');
    nameElement.textContent = itemList[i].name;
    nameElement.classList.add('card-title', 'text-center', 'menu-card-name');

    let innerDivElement = document.createElement('div');
    innerDivElement.classList.add("card-body");

    let priceElement = document.createElement('h5');
    priceElement.textContent = "Price : ";
    let rupeeIconElement = document.createElement('i');
    rupeeIconElement.classList.add("fa", "fa-inr");

    let priceSpanElement = document.createElement('span');
    priceSpanElement.textContent = itemList[i].price;
    priceSpanElement.classList.add("badge", "bg-primary", "price-span");

    // let orderItemElement = document.createElement('button');
    // orderItemElement.textContent = "Order Item";
    // orderItemElement.classList.add('btn','btn-primary','text-center','justify-content-center','order-item-btn');

    //appending divs

    priceElement.appendChild(rupeeIconElement);
    priceElement.appendChild(priceSpanElement);

    innerDivElement.appendChild(nameElement);
    innerDivElement.appendChild(priceElement);
    //innerDivElement.appendChild(orderItemElement);

    divElement.appendChild(imgElement);
    divElement.appendChild(innerDivElement);

    itemListDiv.appendChild(divElement);
}


function updateTable(id) {

    const currentUser = localStorage.getObj('currentUser')[0];

    let tablePriceSpan = document.getElementById("tablePriceSpan" + "-" + id);
    let tableTotalItems = document.getElementById("tableTotalItems" + "-" + id);

    tablePriceSpan.textContent = "Total Amount : ₹ " + currentUser.grandTotal;
    tableTotalItems.textContent = "Total Items : " + Object.keys(currentUser.menuItemsList).length;
}

tableItems.addEventListener('dragover', (event) => {
    event.preventDefault();
});

tableItems.addEventListener('drop', async (event) => {
    event.preventDefault();

    let dragOrderSelectedMenuItemId = event.dataTransfer.getData("dragOrderSelectedMenuItemId");

    const dragOrderItemModal = new bootstrap.Modal(document.getElementById('dragOrderItemModal'), {
        keyboard: false
    });

    const currTableId = event.target.id.split('-')[1];

    const getCurrentUserRequest = async () => {
        const response = await fetch('http://localhost:' + port + '/tables' + "?id=" + currTableId);
        const data = await response.json();
        await localStorage.setObj("currentUser", data);
    }

    await getCurrentUserRequest();

    const getSelectedMenuItemDetails = async () => {
        const response = await fetch('http://localhost:' + port + '/menu' + "?id=" + dragOrderSelectedMenuItemId);
        const data = await response.json();
        await localStorage.setObj("selectedDragMenuItem", data);
        buildDragMenuItemTemplate();
    }

    await getSelectedMenuItemDetails();

    dragOrderItemModal.show();

});

tableItems.addEventListener('click', async (event) => {

    let targetElement = event.target;

    let selector = 'open-order-template-btn';

    if (targetElement.classList.contains(selector)) {

        const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'), {
            keyboard: false
        });
    
        const currTableId = event.target.id.split('-')[1];
    
        const request = async () => {
            const response = await fetch('http://localhost:' + port + '/tables' + "?id=" + currTableId);
            const data = await response.json();
            await localStorage.setObj("currentUser", data);
            buildOrderDetailTemplate();
        }
    
        await request();
    
        await orderDetailsModal.show();    
        
    }

    event.stopPropagation();
    
});


function getCardTemplateForTable(itemList, i, itemListDiv) {

    let divElement = document.createElement('div');
    divElement.classList.add("col-12", "card", "mb-3");

    let nameElement = document.createElement('h3');
    nameElement.textContent = itemList[i].customerName;
    nameElement.classList.add('card-title', 'text-center', 'menu-card-name');
    nameElement.id = "nameElement" + "-" + itemList[i].id;

    let innerDivElement = document.createElement('div');
    innerDivElement.classList.add("card-body");
    innerDivElement.id = "tableDisplayDiv" + "-" + itemList[i].id;

    let idElement = document.createElement('h5');
    idElement.textContent = "Table Id - " + itemList[i].id;
    idElement.id = "idElement" + "-" + itemList[i].id;

    let priceElement = document.createElement('h5');
    priceElement.textContent = "Total Amount : ₹ " + itemList[i].grandTotal;
    priceElement.id = "tablePriceSpan" + "-" + itemList[i].id;

    let totalItemsElement = document.createElement('h5');
    totalItemsElement.textContent = "Total Items : " + Object.keys(itemList[i].menuItemsList).length;
    //totalItemsElement.classList.add('badge','bg-danger',"price-span");
    //totalItemsElement.style = 'font-size:1.25em';
    totalItemsElement.id = "tableTotalItems" + "-" + itemList[i].id;

    let customerMenuElement = document.createElement('button');
    customerMenuElement.textContent = "Order Details";
    customerMenuElement.classList.add('btn', 'btn-primary', 'text-center', 'order-item-btn','open-order-template-btn');
    customerMenuElement.id = "displayMenuBtn" + "-" + itemList[i].id;


    // let orderItemElement = document.createElement('button');
    // orderItemElement.textContent = "Order Item";
    // orderItemElement.classList.add('btn', 'btn-primary', 'text-center', 'order-item-btn');

    //appending divs

    innerDivElement.appendChild(nameElement);
    innerDivElement.appendChild(idElement);
    innerDivElement.appendChild(priceElement);
    innerDivElement.appendChild(totalItemsElement);
    innerDivElement.appendChild(customerMenuElement);
    //innerDivElement.appendChild(orderItemElement);

    divElement.appendChild(innerDivElement);

    itemListDiv.appendChild(divElement);

}


function buildDragMenuItemTemplate() {
    const currentUser = localStorage.getObj('currentUser');
    const selectedDragMenuItem = localStorage.getObj('selectedDragMenuItem');

    dragOrderItemId.textContent = "Table Id : " + currentUser[0].id;
    dragOrderItemId.classList.add('badge', 'bg-primary');
    dragOrderItemId.style = 'font-size:1.25em';

    dragOrderItemName.textContent = "Customer Name : " + currentUser[0].customerName;
    dragOrderItemName.classList.add('badge', 'bg-danger');
    dragOrderItemName.style = 'font-size:1.25em;';

    buildAddItemToCustomerOrderTemplate(currentUser, selectedDragMenuItem);

}

selectedItemDisplayList.addEventListener('change' , (event) => {

    let targetElement = event.target;

    let selector = 'menu-qty-item';

    if (targetElement.classList.contains(selector)) {

        const selectedDragMenuItem = localStorage.getObj('selectedDragMenuItem');
        const itemId = event.target.id.split('-')[1];

        let priceParagraphElement = document.getElementById('priceParagraphElementCustomerOrderTemplate' + '-' + itemId);
        let inputQtyElement = document.getElementById('inputQtyElementCustomerOrderTemplate' + '-' + itemId);

        priceParagraphElement.innerHTML = "Rs. " + (selectedDragMenuItem[0].price * inputQtyElement.value);
        
    }

    event.stopPropagation();

});

addItemToCartBtn.addEventListener('click' , async(event) => {
    const selectedDragMenuItem = localStorage.getObj('selectedDragMenuItem');
    const currentUser = localStorage.getObj('currentUser');

    let orderedItems = currentUser[0].menuItemsList;
    let inputQtyElement = document.getElementById('inputQtyElementCustomerOrderTemplate' + '-' + itemId);

    if (orderedItems[selectedDragMenuItem[0].id] === undefined) {
        orderedItems[selectedDragMenuItem[0].id] = parseInt(inputQtyElement.value,10);
    }
    else {
        orderedItems[selectedDragMenuItem[0].id] = parseInt(orderedItems[selectedDragMenuItem[0].id],10) + parseInt(inputQtyElement.value,10);
    }

    currentUser[0].totalItems = Object.keys(currentUser[0].menuItemsList).length;
    currentUser[0].grandTotal = parseFloat(currentUser[0].grandTotal) + (parseFloat(inputQtyElement.value) * parseFloat(selectedDragMenuItem[0].price));

    localStorage.setObj('currentUser', currentUser);

    const user = currentUser[0];

    updateTable(user.id);

    const request = async () => {
        const response = await fetch('http://localhost:' + port + '/tables/' + user.id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    }

    $("#dragOrderItemModal").modal("hide");

    await request();

});

function buildAddItemToCustomerOrderTemplate(currentUser, selectedDragMenuItem) {


    let orderedItems = currentUser[0].menuItemsList;

    selectedItemDisplayList.classList.add("mb-3");

    let rowDivElement = document.createElement('div');
    rowDivElement.classList.add('row', 'text-center');

    let sNoColumnElement = document.createElement('div');
    sNoColumnElement.classList.add('col-2');
    sNoColumnElement.textContent = 1;

    let itemColumnElement = document.createElement('div');
    itemColumnElement.classList.add('col-5');
    itemColumnElement.textContent = selectedDragMenuItem[0].name;
    itemColumnElement.style="overflow:hidden;";

    let priceColumnElement = document.createElement('div');
    priceColumnElement.classList.add('col-3');

    let priceParagraphElement = document.createElement('p');

    priceParagraphElement.innerHTML = "Rs. " + (selectedDragMenuItem[0].price);
    priceParagraphElement.classList.add('text-center', 'menu-input', 'menu-price-item');
    priceParagraphElement.id = 'priceParagraphElementCustomerOrderTemplate' + '-' + selectedDragMenuItem[0].id;


    let qtyColumnElement = document.createElement('div');
    qtyColumnElement.classList.add('col-2');

    let inputQtyElement = document.createElement('input');
    inputQtyElement.type = "number";
    inputQtyElement.min = 1;
    inputQtyElement.classList.add('text-center', 'menu-input', 'menu-qty-item');
    inputQtyElement.value = 1;
    inputQtyElement.id = 'inputQtyElementCustomerOrderTemplate' + '-' + selectedDragMenuItem[0].id;
    

    //Appending children 

    priceColumnElement.appendChild(priceParagraphElement);

    qtyColumnElement.appendChild(inputQtyElement);

    rowDivElement.appendChild(sNoColumnElement);
    rowDivElement.appendChild(itemColumnElement);
    rowDivElement.appendChild(priceColumnElement);
    rowDivElement.appendChild(qtyColumnElement);

    selectedItemDisplayList.appendChild(rowDivElement);
}

function buildOrderDetailTemplate() {
    const currentUser = localStorage.getObj('currentUser');

    menuTableId.textContent = "Table Id : " + currentUser[0].id;
    menuTableId.classList.add('badge', 'bg-primary');
    menuTableId.style = 'font-size:1.25em';

    menuCustomerName.textContent = "Customer Name : " + currentUser[0].customerName;
    menuCustomerName.classList.add('badge', 'bg-danger');
    menuCustomerName.style = 'font-size:1.25em';

    const orderedItems = currentUser[0].menuItemsList;
    let idx = 1;

    for (const item in orderedItems) {
        buildOrderItemTemplate(item, idx, orderedItems, currentUser);
        idx += 1;
    }

    calculateGrandTotal();     /** -------------------------------------------------------------------------- */
}

menuItemDisplayList.addEventListener('change', async (event) => {

    let targetElement = event.target;

    let selector = 'menu-qty-item';

    if (targetElement.classList.contains(selector)) {
        const item = event.target.id.split('-')[2];
        const currTableId = event.target.id.split('-')[1];

        var currItem = "";

        const request = async () => {
            const response = await fetch('http://localhost:' + port + '/menu' + "?id=" + item);
            const json = await response.json();
            currItem = json[0];
        }

        await request();

        const currentUser = localStorage.getObj('currentUser');
        let orderedItems = currentUser[0].menuItemsList;

        let priceParagraphElement = document.getElementById('priceParagraphElement' + "-" + currTableId + "-" + item);
        let inputQtyElement = document.getElementById('inputQtyElement' + "-" + currTableId + '-' + item);

        priceParagraphElement.innerHTML = "Rs. " + (currItem.price * inputQtyElement.value);
        orderedItems[item] = parseInt(inputQtyElement.value,10);
        localStorage.setObj('currentUser', currentUser);
        calculateGrandTotal();     /** -------------------------------------------------------------------------- */
    }

    event.stopPropagation();
});

menuItemDisplayList.addEventListener('click', (event) => {

    let targetElement = event.target;

    let selector = 'fa-trash';

    if (targetElement.classList.contains(selector)) {
        const item = event.target.id.split('-')[2];
        const currTableId = event.target.id.split('-')[1];

        const currentUser = localStorage.getObj('currentUser');
        let orderedItems = currentUser[0].menuItemsList;

        let deleteIconElement = document.getElementById('deleteIconElement-' + currTableId + '-' + item);

        delete orderedItems[item];
        localStorage.setObj('currentUser', currentUser);

        menuItemDisplayList.removeChild(deleteIconElement.parentNode.parentNode.parentNode);
        calculateGrandTotal();     /** -------------------------------------------------------------------------- */

    }

    event.stopPropagation();

});

async function buildOrderItemTemplate(item, idx, orderedItems, currentUser) {

    var currItem = "";

    const request = async () => {
        const response = await fetch('http://localhost:' + port + '/menu' + "?id=" + item);
        const json = await response.json();
        currItem = json[0];
    }

    await request();

    menuItemDisplayList.classList.add("mb-3");

    let rowDivElement = document.createElement('div');
    rowDivElement.classList.add('row', 'text-center');

    let sNoColumnElement = document.createElement('div');
    sNoColumnElement.classList.add('col-1');
    sNoColumnElement.textContent = idx;

    let itemColumnElement = document.createElement('div');
    itemColumnElement.classList.add('col-5');
    itemColumnElement.textContent = currItem.name;
    itemColumnElement.style="overflow:hidden;";

    let priceColumnElement = document.createElement('div');
    priceColumnElement.classList.add('col-2');

    let priceParagraphElement = document.createElement('p');
    priceParagraphElement.id = "priceParagraphElement" + "-" + currentUser[0].id + "-" + item;
    priceParagraphElement.innerHTML = "Rs. " + (currItem.price * orderedItems[item]);
    priceParagraphElement.classList.add('text-center', 'menu-input', 'menu-price-item');

    let qtyColumnElement = document.createElement('div');
    qtyColumnElement.classList.add('col-2');

    let inputQtyElement = document.createElement('input');
    inputQtyElement.type = "number";
    inputQtyElement.min = 0;
    inputQtyElement.classList.add('text-center', 'menu-input', 'menu-qty-item');
    inputQtyElement.value = orderedItems[item];
    inputQtyElement.id = "inputQtyElement" + "-" + currentUser[0].id + '-' + item;


    let deleteColumnElement = document.createElement('div');
    deleteColumnElement.classList.add('col-2');

    let deleteIconLinkElement = document.createElement('a');
    deleteIconLinkElement.href = '#';


    let deleteIconElement = document.createElement('i');
    deleteIconElement.classList.add('fa', 'fa-trash', 'menu-delete-item');
    deleteIconElement.style = "color:red";
    deleteIconElement.id = 'deleteIconElement' + '-' + currentUser[0].id + '-' + item;

    //Appending children 

    priceColumnElement.appendChild(priceParagraphElement);

    deleteIconLinkElement.appendChild(deleteIconElement);
    deleteColumnElement.appendChild(deleteIconLinkElement);

    qtyColumnElement.appendChild(inputQtyElement);

    rowDivElement.appendChild(sNoColumnElement);
    rowDivElement.appendChild(itemColumnElement);
    rowDivElement.appendChild(priceColumnElement);
    rowDivElement.appendChild(qtyColumnElement);
    rowDivElement.appendChild(deleteColumnElement);

    menuItemDisplayList.appendChild(rowDivElement);
}

async function calculateGrandTotal() {

    const currentUser = localStorage.getObj('currentUser')[0];

    const orderedItems = currentUser.menuItemsList;

    let grandTotal = 0;

    for (const item in orderedItems) {
        var currItem = "";

        const request = async () => {
            const response = await fetch('http://localhost:' + port + '/menu' + "?id=" + item);
            const json = await response.json();
            currItem = json[0];
        }

        await request();

        grandTotal += (currItem.price * orderedItems[item]);
    }

    grandTotalDisplay.value = "Rs. " + grandTotal;
    generateBillGrandTotal.value = "Rs. " + grandTotal;

    updateCustomerPriceAndTotalItems(grandTotal);

}

function updateCustomerPriceAndTotalItems(grandTotal) {
    let currentUser = localStorage.getObj('currentUser');
    currentUser[0].grandTotal = grandTotal;
    currentUser[0].totalItems = Object.keys(currentUser[0].menuItemsList).length;
    localStorage.setObj('currentUser', currentUser);
}

async function initialize() {

    await readFile();

    let menuItemList = localStorage.getObj('menu-item-list');

    for (i = 0; i < menuItemList.length; i++) {
        getCardTemplateForMenu(menuItemList, i, menuItems);
    }

    let customerTableList = localStorage.getObj('customer-table-list');

    for (i = 0; i < customerTableList.length; i++) {
        getCardTemplateForTable(customerTableList, i, tableItems);
    }

}

window.addEventListener('load', initialize);

addTableBtn.addEventListener('click', () => {
    let randomId = getRandomId();
    tableIdGenerated.placeholder = randomId;
});

addMenuItemBtn.addEventListener('click', () => {
    let randomId = getRandomId();
    menuItemIdGenerated.placeholder = randomId;
});

function validateName(name){
    if(name.length == 0){
        return false;
    }
    return true;
}

tableModalForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    let tempCustomerName = document.forms["tableModalForm"]["customerName"].value.trim();
    let currTableId = tableIdGenerated.placeholder;

    

    if(!validateName(tempCustomerName)){
        alertForCustomerName.style.display = '';
        return false;
    }

    let data = {
        customerName: tempCustomerName,
        id: currTableId,
        grandTotal: 0.00,
        menuItemsList: {},
        totalItems: 0
    }

    const request = async () => {
        const response = await fetch('http://localhost:' + port + '/tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const json = await response.json();
    }

    await request();

    let customerTableList = localStorage.getObj('customer-table-list');
    customerTableList.push(data);
    getCardTemplateForTable(customerTableList, customerTableList.length - 1, tableItems);

    $("#tableModal").modal('hide');

});

tableModal.addEventListener('hidden.bs.modal', (event) => {
    alertForCustomerName.style.display = 'none';
    document.forms["tableModalForm"]["customerName"].value = "";
});

menuItemModal.addEventListener('hidden.bs.modal', (event) => {
    alertForMenuItemName.style.display = 'none';
    alertForMenuItemPrice.style.display = 'none';
    document.forms["menuItemModalForm"]["menuItemName"].value = "";
    document.forms["menuItemModalForm"]["menuItemPrice"].value = "";
    document.forms["menuItemModalForm"]["menuItemURL"].value = "";
});

function isUriImage(uri) {

    uri = uri.split('?')[0];
    let parts = uri.split('.');
    let extension = parts[parts.length - 1];
    let imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];
    if (imageTypes.indexOf(extension) !== -1) {
      return true;
    }
    return false;
}

menuItemModalForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    let defaultImage = 'imgs/default.jpg';

    let tempMenuItemName = document.forms["menuItemModalForm"]["menuItemName"].value.trim();
    let tempMenuItemId = menuItemIdGenerated.placeholder;
    let tempMenuItemPrice = document.forms["menuItemModalForm"]["menuItemPrice"].value.trim();
    let tempMenuItemURL = document.forms["menuItemModalForm"]["menuItemURL"].value.trim();

    if(!validateName(tempMenuItemName)){
        alertForMenuItemName.style.display = '';
        return false;
    }
    alertForMenuItemName.style.display = 'none';

    if(parseFloat(tempMenuItemPrice).length === 0 || Number.isNaN(parseFloat(tempMenuItemPrice))){
        alertForMenuItemPrice.style.display = '';
        return false;
    }
    alertForMenuItemPrice.style.display = 'none';

    if (!isUriImage(tempMenuItemURL)) {
        tempMenuItemURL = defaultImage;
    }

    let data = {
        id: tempMenuItemId,
        url: tempMenuItemURL,
        name: tempMenuItemName,
        price: tempMenuItemPrice
    }

    const request = async () => {
        const response = await fetch('http://localhost:' + port + '/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const json = await response.json();
    }

    await request();

    let menuItemList = localStorage.getObj('menu-item-list');

    menuItemList.push(data);
    getCardTemplateForMenu(menuItemList, menuItemList.length - 1, menuItems);

    $("#menuItemModal").modal('hide');

});

dragOrderItemModal.addEventListener('hidden.bs.modal', (event) => {
    selectedItemDisplayList.innerHTML = "";
});

orderDetailsModal.addEventListener('hidden.bs.modal', (event) => {
    menuItemDisplayList.innerHTML = "";

    let currentUser = localStorage.getObj('currentUser')[0];
    updateTable(currentUser.id);


    fetch('http://localhost:' + port + '/tables/' + currentUser.id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentUser),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success');
        })
        .catch((error) => {
            console.error('Error:', error);
        });

});

tableItemsSearchBtn.addEventListener('keyup', (event) => {
   
    let searchValue = event.target.value.toLowerCase();

    let customerNames = tableItems.querySelectorAll('.menu-card-name');

    let i = 0;
    let len = customerNames.length;
    for(i = 0;i < len;i++){
        const value = customerNames[i].textContent;
 
        if(value.toLowerCase().indexOf(searchValue) > -1){
            customerNames[i].parentNode.parentNode.style.display = "";
        }
        else{
            customerNames[i].parentNode.parentNode.style.display = "none";
        }
    }

});

menuItemsSearchBtn.addEventListener('keyup', (event) => {
   
    let searchValue = event.target.value.toLowerCase();

    let menuItemNames = menuItems.querySelectorAll('.menu-card-name');

    let i = 0;
    let len = menuItemNames.length
    for(i = 0;i < len;i++){
        const value = menuItemNames[i].textContent;
 
        if(value.toLowerCase().indexOf(searchValue) > -1){
            menuItemNames[i].parentNode.parentNode.style.display = "";
        }
        else{
            menuItemNames[i].parentNode.parentNode.style.display = "none";
        }
    }
    
});

generateBillBtn.addEventListener('click', () => {
    $("#orderDetailsModal").modal('hide');
    $("#generateBillModal").modal('show');

    buildGenerateBillTemplate();
});

generateBillModal.addEventListener('hidden.bs.modal', (event) => {
    generateBillDisplayList.innerHTML = "";

    let currentUser = localStorage.getObj('currentUser')[0];
    let customerTableList = localStorage.getObj('customer-table-list');
    let innerDiv = tableItems.querySelector('#tableDisplayDiv-' + currentUser.id);
    
    //
    let idx = 0;
    let flag = false;
    let len = customerTableList.length
    for(idx = 0; idx < len;idx++){
        if(customerTableList[idx].id === currentUser.id){
            flag = true;
            break;
        }
    }
    if(flag){
        customerTableList.splice(idx,1);
    }
    
    tableItems.removeChild(innerDiv.parentNode);
    localStorage.setObj('currentUser','');
    localStorage.setObj('customer-table-list',customerTableList);

    fetch('http://localhost:' + port + '/pastOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentUser)
    });

    fetch('http://localhost:' + port + '/tables/' + currentUser.id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentUser)
    });
});



function buildGenerateBillTemplate() {
    const currentUser = localStorage.getObj('currentUser');

    generateBillItemId.textContent = "Table Id : " + currentUser[0].id;
    generateBillItemId.classList.add('badge', 'bg-primary');
    generateBillItemId.style = 'font-size:1.25em';

    generateBillItemName.textContent = "Customer Name : " + currentUser[0].customerName;
    generateBillItemName.classList.add('badge', 'bg-danger');
    generateBillItemName.style = 'font-size:1.25em';

    const orderedItems = currentUser[0].menuItemsList;
    let idx = 1;

    for (const item in orderedItems) {
        generateBillItemTemplate(item, idx, orderedItems, currentUser);
        idx += 1;
    }

    calculateGrandTotal();     /** -------------------------------------------------------------------------- */
}

async function generateBillItemTemplate(item, idx, orderedItems, currentUser) {

    var currItem = "";

    const request = async () => {
        const response = await fetch('http://localhost:' + port + '/menu' + "?id=" + item);
        const json = await response.json();
        currItem = json[0];
    }

    await request();

    generateBillDisplayList.classList.add("mb-3");

    let rowDivElement = document.createElement('div');
    rowDivElement.classList.add('row', 'text-center');

    let sNoColumnElement = document.createElement('div');
    sNoColumnElement.classList.add('col-2');
    sNoColumnElement.textContent = idx;

    let itemColumnElement = document.createElement('div');
    itemColumnElement.classList.add('col-5');
    itemColumnElement.textContent = currItem.name;
    itemColumnElement.style = "overflow:hidden;";

    let priceColumnElement = document.createElement('div');
    priceColumnElement.classList.add('col-3');

    let priceParagraphElement = document.createElement('p');
    priceParagraphElement.innerHTML = "Rs. " + (currItem.price * orderedItems[item]);
    priceParagraphElement.classList.add('text-center', 'menu-input', 'menu-price-item');

    let qtyColumnElement = document.createElement('div');
    qtyColumnElement.classList.add('col-2');

    let qtyParagraphElement = document.createElement('p');
    qtyParagraphElement.innerHTML = orderedItems[item];
    qtyParagraphElement.classList.add('text-center', 'menu-input', 'menu-qty-item');

    //Appending children 

    priceColumnElement.appendChild(priceParagraphElement);

    qtyColumnElement.appendChild(qtyParagraphElement);

    rowDivElement.appendChild(sNoColumnElement);
    rowDivElement.appendChild(itemColumnElement);
    rowDivElement.appendChild(priceColumnElement);
    rowDivElement.appendChild(qtyColumnElement);

    generateBillDisplayList.appendChild(rowDivElement);
}