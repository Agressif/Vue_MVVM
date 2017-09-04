function observe(obj, vm) {
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key]);
  })
}

function defineReactive(obj, key, value) {
  var dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      return value;
    },
    set(newVal) {
      if (newVal === value) {
        return;
      }
      value = newVal;
      dep.notify();
    }
  })
}

function nodeToFragment(node, vm) {
  var fragment = document.createDocumentFragment(),
    child;
  while (child = node.firstChild) {
    if (child.hasChildNodes()) {
      compile(child.firstChild, vm);
    } else {
      compile(child, vm);
    }
    // 将子节点劫持到文档片段中
    fragment.appendChild(child);
  }
  return fragment;
}

function compile(node, vm) {
  // 节点类型为元素 nodeType 为 1
  if (node.nodeType === 1) {
    var attr = node.attributes;
    // 解析属性
    for (var i = 0; i < attr.length; i++) {
      if (attr[i].nodeName == 'v-model') {
        // 获取v-model绑定的属性名
        var name = attr[i].nodeValue;
        node.addEventListener('input', (e) => {
          vm.data[name] = e.target.value;
        });
        // 将data的值赋给该node
        node.value = vm.data[name];
        node.removeAttribute('v-model');
      }
    };
    new Watcher(vm, node, name);
  }
  // 节点类型为text nodeType 为 3
  if (node.nodeType === 3) {
    new Watcher(vm, node, name, node.nodeValue);
  }
}

function Watcher(vm, node, name = '', input = '') {
  Dep.target = this;
  this.name = name;
  this.node = node;
  this.input = input;
  this.vm = vm;
  this.update();
  Dep.target = null;
}

Watcher.prototype = {
  update() {
    this.get();
    this.node.nodeValue = this.value;
  },
  get() {
    var reg = /\{\{(.*)\}\}/;
    if (reg.test(this.input)) {
      this.name = RegExp.$1.trim();
      this.value = this.input.replace(reg, this.vm.data[this.name]);
    }
  }
}

function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub);
  },
  notify() {
    this.subs.forEach(function(sub) {
      sub.update();
    });
  }
};

function Vue(options) {
  this.data = options.data;
  observe(this.data, this);
  var dom = nodeToFragment(document.getElementById(options.el), this);
  document.getElementById(options.el).appendChild(dom);
}

var vm = new Vue({
  el: 'app',
  data: {
    text: 'hello world'
  }
});