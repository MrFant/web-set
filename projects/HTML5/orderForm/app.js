(function() {
  var  init = function() {
    var orderForm = document.forms.order,
        saveBtn = document.getElementById('saveOrder'),
        saveBtnClicked = false;

    var saveForm = function() {
        // 判断当前浏览器是否支持 'formAction' 属性
        // 如果不支持，就把form的action 属性设置为 save 按钮的url
      if(!('formAction' in document.createElement('input'))) {
        var formAction = saveBtn.getAttribute('formaction');
        orderForm.setAttribute('action',formAction);
      }
      saveBtnClicked = true;
    };

    saveBtn.addEventListener('click',saveForm, false);

    var qtyFields = orderForm.quantity, //3个number input标签
        totalFields = document.getElementsByClassName('item_total'),
        orderTotalField = document.getElementById('order_total');

    var formatMoney = function(value) {
      // \B 匹配不是开头或结尾的位置,g 是全局匹配的意思, \d 代表数字
      // ?!代表后面不是数字的位置
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    var calculateTotals = function() {
      var i = 0,
          ln = qtyFields.length,
          itemQty = 0,
          itemPrice = 0.00,
          itemTotal = 0.00,
          itemTotalMoney = '$0.00',
          orderTotal = 0.00,
          orderTotalMoney = '$0.00';

      for(;i<ln;i++) {
        if(!!qtyFields[i].valueAsNumber) {
          // 多余了吧
          itemQty =qtyFields[i].valueAsNumber || 0;
        } else {
          itemQty =parseFloat(qtyFields[i].value) || 0;
        }
        if(!!qtyFields[i].dataset) {
          itemPrice =parseFloat(qtyFields[i].dataset.price);
        } else {
          itemPrice =parseFloat(qtyFields[i].getAttribute('data-price'));
        }
        itemTotal =itemQty *itemPrice;
        // number.toFixed() return a string
        itemTotalMoney = '$'+formatMoney(itemTotal.toFixed(2));
        orderTotal +=itemTotal;
        orderTotalMoney = '$'+formatMoney(orderTotal.toFixed(2));

        if(!!totalFields[i].value) {
          // 检测浏览器是否支持output标签
          totalFields[i].value =itemTotalMoney;
          orderTotalField.value =orderTotalMoney;
        } else {
          totalFields[i].innerHTML =itemTotalMoney;
          orderTotalField.innerHTML =orderTotalMoney;
        }
      }
    };
    calculateTotals();

    // 当用户在数量框中输入小数时，取整化并提醒
    var integer=function () {
        for (let i=0;i<qtyFields.length;i++){
            if (qtyFields[i].valueAsNumber < Math.ceil(qtyFields[i].valueAsNumber)) {
                alert("quantity can only be Integer");
                qtyFields[i].valueAsNumber = Math.ceil(qtyFields[i].valueAsNumber);

            }
        }
        calculateTotals();
    };

    // 加事件监听函数
    var qtyListeners = function() {
      var i = 0,
          ln = qtyFields.length;
      for(;i<ln;i++) {
        qtyFields[i].addEventListener('input',calculateTotals, false);
        qtyFields[i].addEventListener('keyup',calculateTotals, false);
        // 当用户输入完，焦点消失时，取整化
        qtyFields[i].addEventListener('blur',integer,false);
      }
    };
    qtyListeners();

    var doCustomValidity = function(field, msg) {
      if('setCustomValidity' in field) {
        field.setCustomValidity(msg);
      } else {
        field.validationMessage = msg;
      }
    };

    var validateForm = function() {
      // 每次验证前先清空前面的错误信息
      doCustomValidity(orderForm.name, '');
      doCustomValidity(orderForm.password, '');
      doCustomValidity(orderForm.confirm_password, '');
      doCustomValidity(orderForm.card_name, '');



      if(orderForm.name.value.length < 4) {
        doCustomValidity(
          orderForm.name, 'Full Name must be at least 4 characters long'
        );
      }
      if(orderForm.password.value.length < 8) {
        doCustomValidity(
          orderForm.password,
          'Password must be at least 8 characters long'
        );
      }

      if(orderForm.password.value != orderForm.confirm_password.value) {
        doCustomValidity(
          orderForm.confirm_password,
          'Confirm Password must match Password'
        );
      }

      if(orderForm.card_name.value.length < 4) {
        doCustomValidity(
          orderForm.card_name,
          'Name on Card must be at least 4 characters long'
        );
      }

    };
    orderForm.addEventListener('input', validateForm, false);
    orderForm.addEventListener('keyup', validateForm, false);

    var styleInvalidForm = function() {
      orderForm.className = 'invalid';
    }
    // invalid事件：提交表单但验证失败时产生，将表单class设置为invalid
    // 这样做的目的是避免一开始就给：invalid伪类设置样式
    // 最后一个参数useCapture必须为true，才能捕获到form的invalid事件，否则
    // form内部的input等标签会先捕获invalid。
    orderForm.addEventListener('invalid', styleInvalidForm, true);

    // Modernizr.load({
    //   test: Modernizr.inputtypes.month,
    //   nope: 'monthpicker.js'
    // });

    var getFieldLabel = function(field) {
      // 有label标签时，两种方案
      if('labels' in field && field.labels.length > 0) {
        return field.labels[0].innerText;
      }
      if(field.parentNode && field.parentNode.tagName.toLowerCase()=== 'label')
      {
        return field.parentNode.innerText;
      }
      return '';
    }

    var submitForm = function(e) {
      /*
      这是一个回退方案，当在不支持html5自带验证机制浏览器下才能起作用，
      在支持h5的浏览器下，当有controlsElements错误时，会直接阻塞并提示，不会进入到submit阶段（抛出submit事件）
      所以这段代码也不会执行
       */
      if(!saveBtnClicked) {
        // validate form
        validateForm();
        var i = 0,
            // orderForm 的elements ，在HTMLFormControlsCollection中
            ln = orderForm.length,
            field,
            errors = [],
            errorFields = [],
            errorMsg = '';

        for(; i<ln; i++) {
          field = orderForm[i];
          // validationMessage是自定义的property，是setCustomValidity（）方法的回退方案
          // 当有element checkValidity失败时
          if((!!field.validationMessage && field.validationMessage.length > 0) || (!!field.checkValidity
                                                      && !field.checkValidity())
            ) {
            errors.push(
              getFieldLabel(field)+': '+field.validationMessage
            );
            errorFields.push(field);
          }
        }

        if(errors.length > 0) {
          // 当有错误的时候阻止提交
          e.preventDefault();
          errorMsg = errors.join('\n');
          alert('Please fix the following errors:\n'+errorMsg, 'Error');
          orderForm.className = 'invalid';
          errorFields[0].focus();
        }
      }
    };
    // 监听函数在h5自带验证之后
    orderForm.addEventListener('submit', submitForm, false);

    // var fallbackValidation = function() {
    //   var i = 0,
    //       ln = orderForm.length,
    //       field;
    //   for(;i<ln;i++) {
    //     field = orderForm[i];
    //     doCustomValidity(field, '');
    //     if(field.hasAttribute('pattern')) {
    //       var pattern = new  RegExp(field.getAttribute('pattern').toString());
    //       if(!pattern.test(field.value)) {
    //         var msg = 'Please match the requested format.';
    //         if(field.hasAttribute('title') &&  field.getAttribute('title').length > 0) {
    //           msg += ' '+field.getAttribute('title');
    //         }
    //         doCustomValidity(field, msg);
    //       }
    //     }
    //     if(field.hasAttribute('type') &&
    //        field.getAttribute('type').toLowerCase()=== 'email') {
    //       var pattern = new RegExp(/\S+@\S+\.\S+/);
    //       if(!pattern.test(field.value)) {
    //         doCustomValidity(field, 'Please enter an email address.');
    //       }
    //     }
    //     if(field.hasAttribute('required') && field.value.length < 1) {
    //       doCustomValidity(field, 'Please fill out this field.');
    //     }
    //   }
    // };


  };
  window.addEventListener('load',init, false);
}) ();
