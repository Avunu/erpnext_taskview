frappe.dom.set_style("/* sfc-style:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/components/Task.vue?type=style&index=0 */\n.task[data-v-75df30b2] {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  width: 100%;\n}\n.task-subject-container[data-v-75df30b2] {\n  flex-grow: 1;\n  margin-right: 10px;\n  border-bottom: 1px dashed darkgrey;\n}\n.task-subject[data-v-75df30b2] {\n  padding: 0;\n  margin: 0;\n  cursor: text;\n  width: 100%;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.task-subject-edit[data-v-75df30b2] {\n  padding: 5px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 14px;\n  width: 100%;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.task-controls[data-v-75df30b2] {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n}\n.task-control[data-v-75df30b2] {\n  margin-right: 10px;\n  display: flex;\n  align-items: center;\n}\n.custom-checkbox[data-v-75df30b2] {\n  display: flex;\n  align-items: center;\n  position: relative;\n}\n.custom-checkbox label[data-v-75df30b2] {\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  margin: 0;\n}\n.custom-checkbox input[data-v-75df30b2] {\n  position: absolute;\n  opacity: 0;\n  cursor: pointer;\n}\n.custom-checkbox .checkmark[data-v-75df30b2] {\n  height: 20px;\n  width: 20px;\n  background-color: #d8dfed;\n  border-radius: 4px;\n  margin-right: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.custom-checkbox input:checked ~ .checkmark[data-v-75df30b2] {\n  background-color: #2196F3;\n}\n.custom-checkbox .checkmark[data-v-75df30b2]:after {\n  content: \"\";\n  position: absolute;\n  display: none;\n}\n.custom-checkbox input:checked ~ .checkmark[data-v-75df30b2]:after {\n  display: block;\n  width: 5px;\n  height: 10px;\n  border: solid white;\n  border-width: 0 3px 3px 0;\n  transform: rotate(45deg);\n}\n\n/* ../erpnext_taskview/node_modules/@he-tree/vue/style/default.css */\n.tree-node--with-tree-line {\n  position: relative;\n}\n.tree-line {\n  position: absolute;\n  background-color: #bbb;\n}\n.tree-vline {\n  width: 1px;\n  top: 0;\n  bottom: 0;\n}\n.tree-hline {\n  height: 1px;\n  top: 50%;\n  width: 10px;\n}\n.he-tree--rtl {\n  direction: rtl;\n}\n.he-tree-drag-placeholder {\n  background: #ddf2f9;\n  border: 1px dashed #00d9ff;\n  height: 22px;\n  width: 100%;\n}\n.he-tree__open-icon {\n  cursor: pointer;\n  user-select: none;\n  display: inline-block;\n}\n.he-tree__open-icon.open {\n  transform: rotate(90deg);\n}\n.he-tree__open-icon svg {\n  width: 1em;\n}\n\n/* ../erpnext_taskview/node_modules/@he-tree/vue/style/material-design.css */\n.mtl-tree .tree-node-inner {\n  display: flex;\n  align-items: center;\n  font-size: 14px;\n}\n.mtl-tree .tree-node {\n  padding: 1px 0;\n}\n.mtl-tree .tree-node:hover {\n  background-color: #ededed;\n}\n.mtl-checkbox {\n  width: 14px;\n  height: 14px;\n}\n.mtl-ml {\n  margin-left: 4px;\n}\n.mtl-mr {\n  margin-right: 4px;\n}\n.mtl-tree table {\n  width: 100%;\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n.mtl-tree td,\n.mtl-tree th {\n  border-bottom: 1px solid rgba(224, 224, 224, 1);\n  line-height: 1.5;\n}\n.mtl-tree tr:last-child td,\n.mtl-tree tr:last-child tr {\n  border-bottom: 0px;\n}\n.mtl-text-left {\n  text-align: left;\n}\n.mtl-text-center {\n  text-align: center;\n}\n.mtl-text-right {\n  text-align: right;\n}\n\n/* sfc-style:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/TaskView.vue?type=style&index=0 */\n.highlighted-project {\n  font-weight: bold;\n}\n.tree-container {\n  font-size: 14px;\n}\n.small-icon {\n  font-size: 1.5em;\n}\n.outer-task {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  width: 100%;\n}\n.mtl-tree .tree-node:hover {\n  background-color: var(--task-hover-bg-color);\n}\n.he-tree__open-icon svg path {\n  fill: var(--icon-color);\n}\n/*# sourceMappingURL=app.bundle.6P3ZPUUG.css.map */\n");
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // ../erpnext_taskview/node_modules/@vue/shared/dist/shared.esm-bundler.js
  function makeMap(str, expectsLowerCase) {
    const set2 = new Set(str.split(","));
    return expectsLowerCase ? (val) => set2.has(val.toLowerCase()) : (val) => set2.has(val);
  }
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var NOOP = () => {
  };
  var NO = () => false;
  var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
  var isModelListener = (key) => key.startsWith("onUpdate:");
  var extend = Object.assign;
  var remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
      arr.splice(i, 1);
    }
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === "[object Map]";
  var isSet = (val) => toTypeString(val) === "[object Set]";
  var isDate = (val) => toTypeString(val) === "[object Date]";
  var isFunction = (val) => typeof val === "function";
  var isString = (val) => typeof val === "string";
  var isSymbol = (val) => typeof val === "symbol";
  var isObject = (val) => val !== null && typeof val === "object";
  var isPromise = (val) => {
    return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
  };
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isPlainObject = (val) => toTypeString(val) === "[object Object]";
  var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  var isReservedProp = /* @__PURE__ */ makeMap(
    ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
  );
  var isBuiltInDirective = /* @__PURE__ */ makeMap(
    "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
  );
  var cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction(
    (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
  );
  var capitalize = cacheStringFunction((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  var toHandlerKey = cacheStringFunction((str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  });
  var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
  var invokeArrayFns = (fns, ...arg) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i](...arg);
    }
  };
  var def = (obj, key, value, writable = false) => {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: false,
      writable,
      value
    });
  };
  var looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
  };
  var toNumber = (val) => {
    const n = isString(val) ? Number(val) : NaN;
    return isNaN(n) ? val : n;
  };
  var _globalThis;
  var getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  };
  function normalizeStyle(value) {
    if (isArray(value)) {
      const res = {};
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
        if (normalized) {
          for (const key in normalized) {
            res[key] = normalized[key];
          }
        }
      }
      return res;
    } else if (isString(value) || isObject(value)) {
      return value;
    }
  }
  var listDelimiterRE = /;(?![^(]*\))/g;
  var propertyDelimiterRE = /:([^]+)/;
  var styleCommentRE = /\/\*[^]*?\*\//g;
  function parseStringStyle(cssText) {
    const ret = {};
    cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
      if (item) {
        const tmp = item.split(propertyDelimiterRE);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }
  function normalizeClass(value) {
    let res = "";
    if (isString(value)) {
      res = value;
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const normalized = normalizeClass(value[i]);
        if (normalized) {
          res += normalized + " ";
        }
      }
    } else if (isObject(value)) {
      for (const name in value) {
        if (value[name]) {
          res += name + " ";
        }
      }
    }
    return res.trim();
  }
  var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
  var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
  var MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
  var isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
  var isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
  var isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
  var isBooleanAttr = /* @__PURE__ */ makeMap(
    specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
  );
  function includeBooleanAttr(value) {
    return !!value || value === "";
  }
  function looseCompareArrays(a, b) {
    if (a.length !== b.length)
      return false;
    let equal = true;
    for (let i = 0; equal && i < a.length; i++) {
      equal = looseEqual(a[i], b[i]);
    }
    return equal;
  }
  function looseEqual(a, b) {
    if (a === b)
      return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }
    aValidType = isSymbol(a);
    bValidType = isSymbol(b);
    if (aValidType || bValidType) {
      return a === b;
    }
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    }
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
      if (!aValidType || !bValidType) {
        return false;
      }
      const aKeysCount = Object.keys(a).length;
      const bKeysCount = Object.keys(b).length;
      if (aKeysCount !== bKeysCount) {
        return false;
      }
      for (const key in a) {
        const aHasKey = a.hasOwnProperty(key);
        const bHasKey = b.hasOwnProperty(key);
        if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
          return false;
        }
      }
    }
    return String(a) === String(b);
  }
  function looseIndexOf(arr, val) {
    return arr.findIndex((item) => looseEqual(item, val));
  }
  var isRef = (val) => {
    return !!(val && val.__v_isRef === true);
  };
  var toDisplayString = (val) => {
    return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
  };
  var replacer = (_key, val) => {
    if (isRef(val)) {
      return replacer(_key, val.value);
    } else if (isMap(val)) {
      return {
        [`Map(${val.size})`]: [...val.entries()].reduce(
          (entries, [key, val2], i) => {
            entries[stringifySymbol(key, i) + " =>"] = val2;
            return entries;
          },
          {}
        )
      };
    } else if (isSet(val)) {
      return {
        [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
      };
    } else if (isSymbol(val)) {
      return stringifySymbol(val);
    } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
      return String(val);
    }
    return val;
  };
  var stringifySymbol = (v, i = "") => {
    var _a;
    return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
  };

  // ../erpnext_taskview/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
  function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
  }
  var activeEffectScope;
  var EffectScope = class {
    constructor(detached = false) {
      this.detached = detached;
      this._active = true;
      this.effects = [];
      this.cleanups = [];
      this.parent = activeEffectScope;
      if (!detached && activeEffectScope) {
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      }
    }
    get active() {
      return this._active;
    }
    run(fn) {
      if (this._active) {
        const currentEffectScope = activeEffectScope;
        try {
          activeEffectScope = this;
          return fn();
        } finally {
          activeEffectScope = currentEffectScope;
        }
      } else if (true) {
        warn(`cannot run an inactive effect scope.`);
      }
    }
    on() {
      activeEffectScope = this;
    }
    off() {
      activeEffectScope = this.parent;
    }
    stop(fromParent) {
      if (this._active) {
        let i, l;
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].stop();
        }
        for (i = 0, l = this.cleanups.length; i < l; i++) {
          this.cleanups[i]();
        }
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].stop(true);
          }
        }
        if (!this.detached && this.parent && !fromParent) {
          const last = this.parent.scopes.pop();
          if (last && last !== this) {
            this.parent.scopes[this.index] = last;
            last.index = this.index;
          }
        }
        this.parent = void 0;
        this._active = false;
      }
    }
  };
  function recordEffectScope(effect2, scope = activeEffectScope) {
    if (scope && scope.active) {
      scope.effects.push(effect2);
    }
  }
  function getCurrentScope() {
    return activeEffectScope;
  }
  var activeEffect;
  var ReactiveEffect = class {
    constructor(fn, trigger2, scheduler, scope) {
      this.fn = fn;
      this.trigger = trigger2;
      this.scheduler = scheduler;
      this.active = true;
      this.deps = [];
      this._dirtyLevel = 4;
      this._trackId = 0;
      this._runnings = 0;
      this._shouldSchedule = false;
      this._depsLength = 0;
      recordEffectScope(this, scope);
    }
    get dirty() {
      if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
        this._dirtyLevel = 1;
        pauseTracking();
        for (let i = 0; i < this._depsLength; i++) {
          const dep = this.deps[i];
          if (dep.computed) {
            triggerComputed(dep.computed);
            if (this._dirtyLevel >= 4) {
              break;
            }
          }
        }
        if (this._dirtyLevel === 1) {
          this._dirtyLevel = 0;
        }
        resetTracking();
      }
      return this._dirtyLevel >= 4;
    }
    set dirty(v) {
      this._dirtyLevel = v ? 4 : 0;
    }
    run() {
      this._dirtyLevel = 0;
      if (!this.active) {
        return this.fn();
      }
      let lastShouldTrack = shouldTrack;
      let lastEffect = activeEffect;
      try {
        shouldTrack = true;
        activeEffect = this;
        this._runnings++;
        preCleanupEffect(this);
        return this.fn();
      } finally {
        postCleanupEffect(this);
        this._runnings--;
        activeEffect = lastEffect;
        shouldTrack = lastShouldTrack;
      }
    }
    stop() {
      if (this.active) {
        preCleanupEffect(this);
        postCleanupEffect(this);
        this.onStop && this.onStop();
        this.active = false;
      }
    }
  };
  function triggerComputed(computed3) {
    return computed3.value;
  }
  function preCleanupEffect(effect2) {
    effect2._trackId++;
    effect2._depsLength = 0;
  }
  function postCleanupEffect(effect2) {
    if (effect2.deps.length > effect2._depsLength) {
      for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
        cleanupDepEffect(effect2.deps[i], effect2);
      }
      effect2.deps.length = effect2._depsLength;
    }
  }
  function cleanupDepEffect(dep, effect2) {
    const trackId = dep.get(effect2);
    if (trackId !== void 0 && effect2._trackId !== trackId) {
      dep.delete(effect2);
      if (dep.size === 0) {
        dep.cleanup();
      }
    }
  }
  var shouldTrack = true;
  var pauseScheduleStack = 0;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function pauseScheduling() {
    pauseScheduleStack++;
  }
  function resetScheduling() {
    pauseScheduleStack--;
    while (!pauseScheduleStack && queueEffectSchedulers.length) {
      queueEffectSchedulers.shift()();
    }
  }
  function trackEffect(effect2, dep, debuggerEventExtraInfo) {
    var _a;
    if (dep.get(effect2) !== effect2._trackId) {
      dep.set(effect2, effect2._trackId);
      const oldDep = effect2.deps[effect2._depsLength];
      if (oldDep !== dep) {
        if (oldDep) {
          cleanupDepEffect(oldDep, effect2);
        }
        effect2.deps[effect2._depsLength++] = dep;
      } else {
        effect2._depsLength++;
      }
      if (true) {
        (_a = effect2.onTrack) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
      }
    }
  }
  var queueEffectSchedulers = [];
  function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
    var _a;
    pauseScheduling();
    for (const effect2 of dep.keys()) {
      let tracking;
      if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
        effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
        effect2._dirtyLevel = dirtyLevel;
      }
      if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
        if (true) {
          (_a = effect2.onTrigger) == null ? void 0 : _a.call(effect2, extend({ effect: effect2 }, debuggerEventExtraInfo));
        }
        effect2.trigger();
        if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
          effect2._shouldSchedule = false;
          if (effect2.scheduler) {
            queueEffectSchedulers.push(effect2.scheduler);
          }
        }
      }
    }
    resetScheduling();
  }
  var createDep = (cleanup, computed3) => {
    const dep = /* @__PURE__ */ new Map();
    dep.cleanup = cleanup;
    dep.computed = computed3;
    return dep;
  };
  var targetMap = /* @__PURE__ */ new WeakMap();
  var ITERATE_KEY = Symbol(true ? "iterate" : "");
  var MAP_KEY_ITERATE_KEY = Symbol(true ? "Map key iterate" : "");
  function track(target, type, key) {
    if (shouldTrack && activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let dep = depsMap.get(key);
      if (!dep) {
        depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
      }
      trackEffect(
        activeEffect,
        dep,
        true ? {
          target,
          type,
          key
        } : void 0
      );
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    let deps = [];
    if (type === "clear") {
      deps = [...depsMap.values()];
    } else if (key === "length" && isArray(target)) {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
          deps.push(dep);
        }
      });
    } else {
      if (key !== void 0) {
        deps.push(depsMap.get(key));
      }
      switch (type) {
        case "add":
          if (!isArray(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            deps.push(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!isArray(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    pauseScheduling();
    for (const dep of deps) {
      if (dep) {
        triggerEffects(
          dep,
          4,
          true ? {
            target,
            type,
            key,
            newValue,
            oldValue,
            oldTarget
          } : void 0
        );
      }
    }
    resetScheduling();
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
  );
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
      instrumentations[key] = function(...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, "get", i + "");
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
      instrumentations[key] = function(...args) {
        pauseTracking();
        pauseScheduling();
        const res = toRaw(this)[key].apply(this, args);
        resetScheduling();
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function hasOwnProperty2(key) {
    if (!isSymbol(key))
      key = String(key);
    const obj = toRaw(this);
    track(obj, "has", key);
    return obj.hasOwnProperty(key);
  }
  var BaseReactiveHandler = class {
    constructor(_isReadonly = false, _isShallow = false) {
      this._isReadonly = _isReadonly;
      this._isShallow = _isShallow;
    }
    get(target, key, receiver) {
      const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_isShallow") {
        return isShallow2;
      } else if (key === "__v_raw") {
        if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
          return target;
        }
        return;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly2) {
        if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
          return Reflect.get(arrayInstrumentations, key, receiver);
        }
        if (key === "hasOwnProperty") {
          return hasOwnProperty2;
        }
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly2) {
        track(target, "get", key);
      }
      if (isShallow2) {
        return res;
      }
      if (isRef2(res)) {
        return targetIsArray && isIntegerKey(key) ? res : res.value;
      }
      if (isObject(res)) {
        return isReadonly2 ? readonly(res) : reactive(res);
      }
      return res;
    }
  };
  var MutableReactiveHandler = class extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(false, isShallow2);
    }
    set(target, key, value, receiver) {
      let oldValue = target[key];
      if (!this._isShallow) {
        const isOldValueReadonly = isReadonly(oldValue);
        if (!isShallow(value) && !isReadonly(value)) {
          oldValue = toRaw(oldValue);
          value = toRaw(value);
        }
        if (!isArray(target) && isRef2(oldValue) && !isRef2(value)) {
          if (isOldValueReadonly) {
            return false;
          } else {
            oldValue.value = value;
            return true;
          }
        }
      }
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
      }
      return result;
    }
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const oldValue = target[key];
      const result = Reflect.deleteProperty(target, key);
      if (result && hadKey) {
        trigger(target, "delete", key, void 0, oldValue);
      }
      return result;
    }
    has(target, key) {
      const result = Reflect.has(target, key);
      if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has", key);
      }
      return result;
    }
    ownKeys(target) {
      track(
        target,
        "iterate",
        isArray(target) ? "length" : ITERATE_KEY
      );
      return Reflect.ownKeys(target);
    }
  };
  var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
    constructor(isShallow2 = false) {
      super(true, isShallow2);
    }
    set(target, key) {
      if (true) {
        warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
      }
      return true;
    }
    deleteProperty(target, key) {
      if (true) {
        warn(
          `Delete operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
      }
      return true;
    }
  };
  var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
  var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
  var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
    true
  );
  var shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get(target, key, isReadonly2 = false, isShallow2 = false) {
    target = target["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly2) {
      if (hasChanged(key, rawKey)) {
        track(rawTarget, "get", key);
      }
      track(rawTarget, "get", rawKey);
    }
    const { has: has2 } = getProto(rawTarget);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has(key, isReadonly2 = false) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly2) {
      if (hasChanged(key, rawKey)) {
        track(rawTarget, "has", key);
      }
      track(rawTarget, "has", rawKey);
    }
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly2 = false) {
    target = target["__v_raw"];
    !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
    return Reflect.get(target, "size", target);
  }
  function add(value, _isShallow = false) {
    if (!_isShallow && !isShallow(value) && !isReadonly(value)) {
      value = toRaw(value);
    }
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, "add", value, value);
    }
    return this;
  }
  function set(key, value, _isShallow = false) {
    if (!_isShallow && !isShallow(value) && !isReadonly(value)) {
      value = toRaw(value);
    }
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get2.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get2 ? get2.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true ? isMap(target) ? new Map(target) : new Set(target) : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, "clear", void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly2, isShallow2) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly2, isShallow2) {
    return function(...args) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(
        rawTarget,
        "iterate",
        isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
      );
      return {
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        warn(
          `${capitalize(type)} operation ${key}failed: target is readonly.`,
          toRaw(this)
        );
      }
      return type === "delete" ? false : type === "clear" ? void 0 : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get(this, key);
      },
      get size() {
        return size(this);
      },
      has,
      add,
      set,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false)
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has,
      add(value) {
        return add.call(this, value, true);
      },
      set(key, value) {
        return set.call(this, key, value, true);
      },
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true)
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has.call(this, key, true);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has.call(this, key, true);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(true, true)
    };
    const iteratorMethods = [
      "keys",
      "values",
      "entries",
      Symbol.iterator
    ];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
      shallowInstrumentations2[method] = createIterableMethod(method, false, true);
      shallowReadonlyInstrumentations2[method] = createIterableMethod(
        method,
        true,
        true
      );
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2
    ];
  }
  var [
    mutableInstrumentations,
    readonlyInstrumentations,
    shallowInstrumentations,
    shallowReadonlyInstrumentations
  ] = /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly2, shallow) {
    const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(
        hasOwn(instrumentations, key) && key in target ? instrumentations : target,
        key,
        receiver
      );
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
  };
  var shallowCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, true)
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
  };
  var shallowReadonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, true)
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      warn(
        `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
      );
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  function reactive(target) {
    if (isReadonly(target)) {
      return target;
    }
    return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }
  function shallowReactive(target) {
    return createReactiveObject(
      target,
      false,
      shallowReactiveHandlers,
      shallowCollectionHandlers,
      shallowReactiveMap
    );
  }
  function readonly(target) {
    return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap
    );
  }
  function shallowReadonly(target) {
    return createReactiveObject(
      target,
      true,
      shallowReadonlyHandlers,
      shallowReadonlyCollectionHandlers,
      shallowReadonlyMap
    );
  }
  function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (true) {
        warn(
          `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
            target
          )}`
        );
      }
      return target;
    }
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(
      target,
      targetType === 2 ? collectionHandlers : baseHandlers
    );
    proxyMap.set(target, proxy);
    return proxy;
  }
  function isReactive(value) {
    if (isReadonly(value)) {
      return isReactive(value["__v_raw"]);
    }
    return !!(value && value["__v_isReactive"]);
  }
  function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
  }
  function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
  }
  function isProxy(value) {
    return value ? !!value["__v_raw"] : false;
  }
  function toRaw(observed) {
    const raw = observed && observed["__v_raw"];
    return raw ? toRaw(raw) : observed;
  }
  function markRaw(value) {
    if (Object.isExtensible(value)) {
      def(value, "__v_skip", true);
    }
    return value;
  }
  var toReactive = (value) => isObject(value) ? reactive(value) : value;
  var toReadonly = (value) => isObject(value) ? readonly(value) : value;
  var COMPUTED_SIDE_EFFECT_WARN = `Computed is still dirty after getter evaluation, likely because a computed is mutating its own dependency in its getter. State mutations in computed getters should be avoided.  Check the docs for more details: https://vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free`;
  var ComputedRefImpl = class {
    constructor(getter, _setter, isReadonly2, isSSR) {
      this.getter = getter;
      this._setter = _setter;
      this.dep = void 0;
      this.__v_isRef = true;
      this["__v_isReadonly"] = false;
      this.effect = new ReactiveEffect(
        () => getter(this._value),
        () => triggerRefValue(
          this,
          this.effect._dirtyLevel === 2 ? 2 : 3
        )
      );
      this.effect.computed = this;
      this.effect.active = this._cacheable = !isSSR;
      this["__v_isReadonly"] = isReadonly2;
    }
    get value() {
      const self2 = toRaw(this);
      if ((!self2._cacheable || self2.effect.dirty) && hasChanged(self2._value, self2._value = self2.effect.run())) {
        triggerRefValue(self2, 4);
      }
      trackRefValue(self2);
      if (self2.effect._dirtyLevel >= 2) {
        if (this._warnRecursive) {
          warn(COMPUTED_SIDE_EFFECT_WARN, `

getter: `, this.getter);
        }
        triggerRefValue(self2, 2);
      }
      return self2._value;
    }
    set value(newValue) {
      this._setter(newValue);
    }
    get _dirty() {
      return this.effect.dirty;
    }
    set _dirty(v) {
      this.effect.dirty = v;
    }
  };
  function computed(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    const onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = true ? () => {
        warn("Write operation failed: computed value is readonly");
      } : NOOP;
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
    if (debugOptions && !isSSR) {
      cRef.effect.onTrack = debugOptions.onTrack;
      cRef.effect.onTrigger = debugOptions.onTrigger;
    }
    return cRef;
  }
  function trackRefValue(ref2) {
    var _a;
    if (shouldTrack && activeEffect) {
      ref2 = toRaw(ref2);
      trackEffect(
        activeEffect,
        (_a = ref2.dep) != null ? _a : ref2.dep = createDep(
          () => ref2.dep = void 0,
          ref2 instanceof ComputedRefImpl ? ref2 : void 0
        ),
        true ? {
          target: ref2,
          type: "get",
          key: "value"
        } : void 0
      );
    }
  }
  function triggerRefValue(ref2, dirtyLevel = 4, newVal, oldVal) {
    ref2 = toRaw(ref2);
    const dep = ref2.dep;
    if (dep) {
      triggerEffects(
        dep,
        dirtyLevel,
        true ? {
          target: ref2,
          type: "set",
          key: "value",
          newValue: newVal,
          oldValue: oldVal
        } : void 0
      );
    }
  }
  function isRef2(r) {
    return !!(r && r.__v_isRef === true);
  }
  function ref(value) {
    return createRef(value, false);
  }
  function createRef(rawValue, shallow) {
    if (isRef2(rawValue)) {
      return rawValue;
    }
    return new RefImpl(rawValue, shallow);
  }
  var RefImpl = class {
    constructor(value, __v_isShallow) {
      this.__v_isShallow = __v_isShallow;
      this.dep = void 0;
      this.__v_isRef = true;
      this._rawValue = __v_isShallow ? value : toRaw(value);
      this._value = __v_isShallow ? value : toReactive(value);
    }
    get value() {
      trackRefValue(this);
      return this._value;
    }
    set value(newVal) {
      const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
      newVal = useDirectValue ? newVal : toRaw(newVal);
      if (hasChanged(newVal, this._rawValue)) {
        const oldVal = this._rawValue;
        this._rawValue = newVal;
        this._value = useDirectValue ? newVal : toReactive(newVal);
        triggerRefValue(this, 4, newVal, oldVal);
      }
    }
  };
  function unref(ref2) {
    return isRef2(ref2) ? ref2.value : ref2;
  }
  var shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
      const oldValue = target[key];
      if (isRef2(oldValue) && !isRef2(value)) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  };
  function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
  }

  // ../erpnext_taskview/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
  var stack = [];
  function pushWarningContext(vnode) {
    stack.push(vnode);
  }
  function popWarningContext() {
    stack.pop();
  }
  var isWarning = false;
  function warn$1(msg, ...args) {
    if (isWarning)
      return;
    isWarning = true;
    pauseTracking();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
      callWithErrorHandling(
        appWarnHandler,
        instance,
        11,
        [
          msg + args.map((a) => {
            var _a, _b;
            return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
          }).join(""),
          instance && instance.proxy,
          trace.map(
            ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
          ).join("\n"),
          trace
        ]
      );
    } else {
      const warnArgs = [`[Vue warn]: ${msg}`, ...args];
      if (trace.length && true) {
        warnArgs.push(`
`, ...formatTrace(trace));
      }
      console.warn(...warnArgs);
    }
    resetTracking();
    isWarning = false;
  }
  function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
      return [];
    }
    const normalizedStack = [];
    while (currentVNode) {
      const last = normalizedStack[0];
      if (last && last.vnode === currentVNode) {
        last.recurseCount++;
      } else {
        normalizedStack.push({
          vnode: currentVNode,
          recurseCount: 0
        });
      }
      const parentInstance = currentVNode.component && currentVNode.component.parent;
      currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
  }
  function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
      logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
    });
    return logs;
  }
  function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(
      vnode.component,
      vnode.type,
      isRoot
    )}`;
    const close = `>` + postfix;
    return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
  }
  function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach((key) => {
      res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
      res.push(` ...`);
    }
    return res;
  }
  function formatProp(key, value, raw) {
    if (isString(value)) {
      value = JSON.stringify(value);
      return raw ? value : [`${key}=${value}`];
    } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
      return raw ? value : [`${key}=${value}`];
    } else if (isRef2(value)) {
      value = formatProp(key, toRaw(value.value), true);
      return raw ? value : [`${key}=Ref<`, value, `>`];
    } else if (isFunction(value)) {
      return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    } else {
      value = toRaw(value);
      return raw ? value : [`${key}=`, value];
    }
  }
  function assertNumber(val, type) {
    if (false)
      return;
    if (val === void 0) {
      return;
    } else if (typeof val !== "number") {
      warn$1(`${type} is not a valid number - got ${JSON.stringify(val)}.`);
    } else if (isNaN(val)) {
      warn$1(`${type} is NaN - the duration expression might be incorrect.`);
    }
  }
  var ErrorTypeStrings$1 = {
    ["sp"]: "serverPrefetch hook",
    ["bc"]: "beforeCreate hook",
    ["c"]: "created hook",
    ["bm"]: "beforeMount hook",
    ["m"]: "mounted hook",
    ["bu"]: "beforeUpdate hook",
    ["u"]: "updated",
    ["bum"]: "beforeUnmount hook",
    ["um"]: "unmounted hook",
    ["a"]: "activated hook",
    ["da"]: "deactivated hook",
    ["ec"]: "errorCaptured hook",
    ["rtc"]: "renderTracked hook",
    ["rtg"]: "renderTriggered hook",
    [0]: "setup function",
    [1]: "render function",
    [2]: "watcher getter",
    [3]: "watcher callback",
    [4]: "watcher cleanup function",
    [5]: "native event handler",
    [6]: "component event handler",
    [7]: "vnode hook",
    [8]: "directive hook",
    [9]: "transition hook",
    [10]: "app errorHandler",
    [11]: "app warnHandler",
    [12]: "ref function",
    [13]: "async component loader",
    [14]: "scheduler flush",
    [15]: "component update"
  };
  function callWithErrorHandling(fn, instance, type, args) {
    try {
      return args ? fn(...args) : fn();
    } catch (err) {
      handleError(err, instance, type);
    }
  }
  function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
      const res = callWithErrorHandling(fn, instance, type, args);
      if (res && isPromise(res)) {
        res.catch((err) => {
          handleError(err, instance, type);
        });
      }
      return res;
    }
    if (isArray(fn)) {
      const values = [];
      for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
      }
      return values;
    } else if (true) {
      warn$1(
        `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`
      );
    }
  }
  function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    if (instance) {
      let cur = instance.parent;
      const exposedInstance = instance.proxy;
      const errorInfo = true ? ErrorTypeStrings$1[type] : `https://vuejs.org/error-reference/#runtime-${type}`;
      while (cur) {
        const errorCapturedHooks = cur.ec;
        if (errorCapturedHooks) {
          for (let i = 0; i < errorCapturedHooks.length; i++) {
            if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
              return;
            }
          }
        }
        cur = cur.parent;
      }
      const appErrorHandler = instance.appContext.config.errorHandler;
      if (appErrorHandler) {
        pauseTracking();
        callWithErrorHandling(
          appErrorHandler,
          null,
          10,
          [err, exposedInstance, errorInfo]
        );
        resetTracking();
        return;
      }
    }
    logError(err, type, contextVNode, throwInDev);
  }
  function logError(err, type, contextVNode, throwInDev = true) {
    if (true) {
      const info = ErrorTypeStrings$1[type];
      if (contextVNode) {
        pushWarningContext(contextVNode);
      }
      warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
      if (contextVNode) {
        popWarningContext();
      }
      if (throwInDev) {
        throw err;
      } else {
        console.error(err);
      }
    } else {
      console.error(err);
    }
  }
  var isFlushing = false;
  var isFlushPending = false;
  var queue = [];
  var flushIndex = 0;
  var pendingPostFlushCbs = [];
  var activePostFlushCbs = null;
  var postFlushIndex = 0;
  var resolvedPromise = /* @__PURE__ */ Promise.resolve();
  var currentFlushPromise = null;
  var RECURSION_LIMIT = 100;
  function nextTick(fn) {
    const p2 = currentFlushPromise || resolvedPromise;
    return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
  }
  function findInsertionIndex(id) {
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
      const middle = start + end >>> 1;
      const middleJob = queue[middle];
      const middleJobId = getId(middleJob);
      if (middleJobId < id || middleJobId === id && middleJob.pre) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }
    return start;
  }
  function queueJob(job) {
    if (!queue.length || !queue.includes(
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
    )) {
      if (job.id == null) {
        queue.push(job);
      } else {
        queue.splice(findInsertionIndex(job.id), 0, job);
      }
      queueFlush();
    }
  }
  function queueFlush() {
    if (!isFlushing && !isFlushPending) {
      isFlushPending = true;
      currentFlushPromise = resolvedPromise.then(flushJobs);
    }
  }
  function invalidateJob(job) {
    const i = queue.indexOf(job);
    if (i > flushIndex) {
      queue.splice(i, 1);
    }
  }
  function queuePostFlushCb(cb) {
    if (!isArray(cb)) {
      if (!activePostFlushCbs || !activePostFlushCbs.includes(
        cb,
        cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
      )) {
        pendingPostFlushCbs.push(cb);
      }
    } else {
      pendingPostFlushCbs.push(...cb);
    }
    queueFlush();
  }
  function flushPreFlushCbs(instance, seen, i = isFlushing ? flushIndex + 1 : 0) {
    if (true) {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (; i < queue.length; i++) {
      const cb = queue[i];
      if (cb && cb.pre) {
        if (instance && cb.id !== instance.uid) {
          continue;
        }
        if (checkRecursiveUpdates(seen, cb)) {
          continue;
        }
        queue.splice(i, 1);
        i--;
        cb();
      }
    }
  }
  function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
      const deduped = [...new Set(pendingPostFlushCbs)].sort(
        (a, b) => getId(a) - getId(b)
      );
      pendingPostFlushCbs.length = 0;
      if (activePostFlushCbs) {
        activePostFlushCbs.push(...deduped);
        return;
      }
      activePostFlushCbs = deduped;
      if (true) {
        seen = seen || /* @__PURE__ */ new Map();
      }
      for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
        const cb = activePostFlushCbs[postFlushIndex];
        if (checkRecursiveUpdates(seen, cb)) {
          continue;
        }
        if (cb.active !== false)
          cb();
      }
      activePostFlushCbs = null;
      postFlushIndex = 0;
    }
  }
  var getId = (job) => job.id == null ? Infinity : job.id;
  var comparator = (a, b) => {
    const diff = getId(a) - getId(b);
    if (diff === 0) {
      if (a.pre && !b.pre)
        return -1;
      if (b.pre && !a.pre)
        return 1;
    }
    return diff;
  };
  function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    if (true) {
      seen = seen || /* @__PURE__ */ new Map();
    }
    queue.sort(comparator);
    const check = true ? (job) => checkRecursiveUpdates(seen, job) : NOOP;
    try {
      for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
        const job = queue[flushIndex];
        if (job && job.active !== false) {
          if (check(job)) {
            continue;
          }
          callWithErrorHandling(
            job,
            job.i,
            job.i ? 15 : 14
          );
        }
      }
    } finally {
      flushIndex = 0;
      queue.length = 0;
      flushPostFlushCbs(seen);
      isFlushing = false;
      currentFlushPromise = null;
      if (queue.length || pendingPostFlushCbs.length) {
        flushJobs(seen);
      }
    }
  }
  function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
      seen.set(fn, 1);
    } else {
      const count = seen.get(fn);
      if (count > RECURSION_LIMIT) {
        const instance = fn.i;
        const componentName = instance && getComponentName(instance.type);
        handleError(
          `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
          null,
          10
        );
        return true;
      } else {
        seen.set(fn, count + 1);
      }
    }
  }
  var isHmrUpdating = false;
  var hmrDirtyComponents = /* @__PURE__ */ new Map();
  if (true) {
    getGlobalThis().__VUE_HMR_RUNTIME__ = {
      createRecord: tryWrap(createRecord),
      rerender: tryWrap(rerender),
      reload: tryWrap(reload)
    };
  }
  var map = /* @__PURE__ */ new Map();
  function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
      createRecord(id, instance.type);
      record = map.get(id);
    }
    record.instances.add(instance);
  }
  function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
  }
  function createRecord(id, initialDef) {
    if (map.has(id)) {
      return false;
    }
    map.set(id, {
      initialDef: normalizeClassComponent(initialDef),
      instances: /* @__PURE__ */ new Set()
    });
    return true;
  }
  function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
  }
  function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) {
      return;
    }
    record.initialDef.render = newRender;
    [...record.instances].forEach((instance) => {
      if (newRender) {
        instance.render = newRender;
        normalizeClassComponent(instance.type).render = newRender;
      }
      instance.renderCache = [];
      isHmrUpdating = true;
      instance.effect.dirty = true;
      instance.update();
      isHmrUpdating = false;
    });
  }
  function reload(id, newComp) {
    const record = map.get(id);
    if (!record)
      return;
    newComp = normalizeClassComponent(newComp);
    updateComponentDef(record.initialDef, newComp);
    const instances2 = [...record.instances];
    for (let i = 0; i < instances2.length; i++) {
      const instance = instances2[i];
      const oldComp = normalizeClassComponent(instance.type);
      let dirtyInstances = hmrDirtyComponents.get(oldComp);
      if (!dirtyInstances) {
        if (oldComp !== record.initialDef) {
          updateComponentDef(oldComp, newComp);
        }
        hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
      }
      dirtyInstances.add(instance);
      instance.appContext.propsCache.delete(instance.type);
      instance.appContext.emitsCache.delete(instance.type);
      instance.appContext.optionsCache.delete(instance.type);
      if (instance.ceReload) {
        dirtyInstances.add(instance);
        instance.ceReload(newComp.styles);
        dirtyInstances.delete(instance);
      } else if (instance.parent) {
        instance.parent.effect.dirty = true;
        queueJob(() => {
          instance.parent.update();
          dirtyInstances.delete(instance);
        });
      } else if (instance.appContext.reload) {
        instance.appContext.reload();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      } else {
        console.warn(
          "[HMR] Root or manually mounted instance modified. Full reload required."
        );
      }
    }
    queuePostFlushCb(() => {
      hmrDirtyComponents.clear();
    });
  }
  function updateComponentDef(oldComp, newComp) {
    extend(oldComp, newComp);
    for (const key in oldComp) {
      if (key !== "__file" && !(key in newComp)) {
        delete oldComp[key];
      }
    }
  }
  function tryWrap(fn) {
    return (id, arg) => {
      try {
        return fn(id, arg);
      } catch (e) {
        console.error(e);
        console.warn(
          `[HMR] Something went wrong during Vue component hot-reload. Full reload required.`
        );
      }
    };
  }
  var devtools$1;
  var buffer = [];
  var devtoolsNotInstalled = false;
  function emit$1(event, ...args) {
    if (devtools$1) {
      devtools$1.emit(event, ...args);
    } else if (!devtoolsNotInstalled) {
      buffer.push({ event, args });
    }
  }
  function setDevtoolsHook$1(hook, target) {
    var _a, _b;
    devtools$1 = hook;
    if (devtools$1) {
      devtools$1.enabled = true;
      buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
      buffer = [];
    } else if (typeof window !== "undefined" && window.HTMLElement && !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))) {
      const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
      replay.push((newHook) => {
        setDevtoolsHook$1(newHook, target);
      });
      setTimeout(() => {
        if (!devtools$1) {
          target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
          devtoolsNotInstalled = true;
          buffer = [];
        }
      }, 3e3);
    } else {
      devtoolsNotInstalled = true;
      buffer = [];
    }
  }
  function devtoolsInitApp(app, version2) {
    emit$1("app:init", app, version2, {
      Fragment,
      Text,
      Comment,
      Static
    });
  }
  function devtoolsUnmountApp(app) {
    emit$1("app:unmount", app);
  }
  var devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook(
    "component:added"
  );
  var devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated");
  var _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
    "component:removed"
  );
  var devtoolsComponentRemoved = (component) => {
    if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && !devtools$1.cleanupBuffer(component)) {
      _devtoolsComponentRemoved(component);
    }
  };
  function createDevtoolsComponentHook(hook) {
    return (component) => {
      emit$1(
        hook,
        component.appContext.app,
        component.uid,
        component.parent ? component.parent.uid : void 0,
        component
      );
    };
  }
  var devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook(
    "perf:start"
  );
  var devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook(
    "perf:end"
  );
  function createDevtoolsPerformanceHook(hook) {
    return (component, type, time) => {
      emit$1(hook, component.appContext.app, component.uid, component, type, time);
    };
  }
  function devtoolsComponentEmit(component, event, params) {
    emit$1(
      "component:emit",
      component.appContext.app,
      component,
      event,
      params
    );
  }
  var currentRenderingInstance = null;
  var currentScopeId = null;
  function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = instance && instance.type.__scopeId || null;
    return prev;
  }
  function pushScopeId(id) {
    currentScopeId = id;
  }
  function popScopeId() {
    currentScopeId = null;
  }
  function withCtx(fn, ctx2 = currentRenderingInstance, isNonScopedSlot) {
    if (!ctx2)
      return fn;
    if (fn._n) {
      return fn;
    }
    const renderFnWithContext = (...args) => {
      if (renderFnWithContext._d) {
        setBlockTracking(-1);
      }
      const prevInstance = setCurrentRenderingInstance(ctx2);
      let res;
      try {
        res = fn(...args);
      } finally {
        setCurrentRenderingInstance(prevInstance);
        if (renderFnWithContext._d) {
          setBlockTracking(1);
        }
      }
      if (true) {
        devtoolsComponentUpdated(ctx2);
      }
      return res;
    };
    renderFnWithContext._n = true;
    renderFnWithContext._c = true;
    renderFnWithContext._d = true;
    return renderFnWithContext;
  }
  function validateDirectiveName(name) {
    if (isBuiltInDirective(name)) {
      warn$1("Do not use built-in directive ids as custom directive id: " + name);
    }
  }
  function withDirectives(vnode, directives) {
    if (currentRenderingInstance === null) {
      warn$1(`withDirectives can only be used inside render functions.`);
      return vnode;
    }
    const instance = getComponentPublicInstance(currentRenderingInstance);
    const bindings = vnode.dirs || (vnode.dirs = []);
    for (let i = 0; i < directives.length; i++) {
      let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
      if (dir) {
        if (isFunction(dir)) {
          dir = {
            mounted: dir,
            updated: dir
          };
        }
        if (dir.deep) {
          traverse(value);
        }
        bindings.push({
          dir,
          instance,
          value,
          oldValue: void 0,
          arg,
          modifiers
        });
      }
    }
    return vnode;
  }
  function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      if (oldBindings) {
        binding.oldValue = oldBindings[i].value;
      }
      let hook = binding.dir[name];
      if (hook) {
        pauseTracking();
        callWithAsyncErrorHandling(hook, instance, 8, [
          vnode.el,
          binding,
          vnode,
          prevVNode
        ]);
        resetTracking();
      }
    }
  }
  var leaveCbKey = Symbol("_leaveCb");
  var enterCbKey = Symbol("_enterCb");
  function useTransitionState() {
    const state = {
      isMounted: false,
      isLeaving: false,
      isUnmounting: false,
      leavingVNodes: /* @__PURE__ */ new Map()
    };
    onMounted(() => {
      state.isMounted = true;
    });
    onBeforeUnmount(() => {
      state.isUnmounting = true;
    });
    return state;
  }
  var TransitionHookValidator = [Function, Array];
  var BaseTransitionPropsValidators = {
    mode: String,
    appear: Boolean,
    persisted: Boolean,
    onBeforeEnter: TransitionHookValidator,
    onEnter: TransitionHookValidator,
    onAfterEnter: TransitionHookValidator,
    onEnterCancelled: TransitionHookValidator,
    onBeforeLeave: TransitionHookValidator,
    onLeave: TransitionHookValidator,
    onAfterLeave: TransitionHookValidator,
    onLeaveCancelled: TransitionHookValidator,
    onBeforeAppear: TransitionHookValidator,
    onAppear: TransitionHookValidator,
    onAfterAppear: TransitionHookValidator,
    onAppearCancelled: TransitionHookValidator
  };
  var recursiveGetSubtree = (instance) => {
    const subTree = instance.subTree;
    return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
  };
  var BaseTransitionImpl = {
    name: `BaseTransition`,
    props: BaseTransitionPropsValidators,
    setup(props, { slots }) {
      const instance = getCurrentInstance();
      const state = useTransitionState();
      return () => {
        const children = slots.default && getTransitionRawChildren(slots.default(), true);
        if (!children || !children.length) {
          return;
        }
        let child = children[0];
        if (children.length > 1) {
          let hasFound = false;
          for (const c of children) {
            if (c.type !== Comment) {
              if (hasFound) {
                warn$1(
                  "<transition> can only be used on a single element or component. Use <transition-group> for lists."
                );
                break;
              }
              child = c;
              hasFound = true;
              if (false)
                break;
            }
          }
        }
        const rawProps = toRaw(props);
        const { mode } = rawProps;
        if (mode && mode !== "in-out" && mode !== "out-in" && mode !== "default") {
          warn$1(`invalid <transition> mode: ${mode}`);
        }
        if (state.isLeaving) {
          return emptyPlaceholder(child);
        }
        const innerChild = getKeepAliveChild(child);
        if (!innerChild) {
          return emptyPlaceholder(child);
        }
        let enterHooks = resolveTransitionHooks(
          innerChild,
          rawProps,
          state,
          instance,
          (hooks) => enterHooks = hooks
        );
        setTransitionHooks(innerChild, enterHooks);
        const oldChild = instance.subTree;
        const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
        if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(innerChild, oldInnerChild) && recursiveGetSubtree(instance).type !== Comment) {
          const leavingHooks = resolveTransitionHooks(
            oldInnerChild,
            rawProps,
            state,
            instance
          );
          setTransitionHooks(oldInnerChild, leavingHooks);
          if (mode === "out-in" && innerChild.type !== Comment) {
            state.isLeaving = true;
            leavingHooks.afterLeave = () => {
              state.isLeaving = false;
              if (instance.update.active !== false) {
                instance.effect.dirty = true;
                instance.update();
              }
            };
            return emptyPlaceholder(child);
          } else if (mode === "in-out" && innerChild.type !== Comment) {
            leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
              const leavingVNodesCache = getLeavingNodesForType(
                state,
                oldInnerChild
              );
              leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
              el[leaveCbKey] = () => {
                earlyRemove();
                el[leaveCbKey] = void 0;
                delete enterHooks.delayedLeave;
              };
              enterHooks.delayedLeave = delayedLeave;
            };
          }
        }
        return child;
      };
    }
  };
  var BaseTransition = BaseTransitionImpl;
  function getLeavingNodesForType(state, vnode) {
    const { leavingVNodes } = state;
    let leavingVNodesCache = leavingVNodes.get(vnode.type);
    if (!leavingVNodesCache) {
      leavingVNodesCache = /* @__PURE__ */ Object.create(null);
      leavingVNodes.set(vnode.type, leavingVNodesCache);
    }
    return leavingVNodesCache;
  }
  function resolveTransitionHooks(vnode, props, state, instance, postClone) {
    const {
      appear,
      mode,
      persisted = false,
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onEnterCancelled,
      onBeforeLeave,
      onLeave,
      onAfterLeave,
      onLeaveCancelled,
      onBeforeAppear,
      onAppear,
      onAfterAppear,
      onAppearCancelled
    } = props;
    const key = String(vnode.key);
    const leavingVNodesCache = getLeavingNodesForType(state, vnode);
    const callHook3 = (hook, args) => {
      hook && callWithAsyncErrorHandling(
        hook,
        instance,
        9,
        args
      );
    };
    const callAsyncHook = (hook, args) => {
      const done = args[1];
      callHook3(hook, args);
      if (isArray(hook)) {
        if (hook.every((hook2) => hook2.length <= 1))
          done();
      } else if (hook.length <= 1) {
        done();
      }
    };
    const hooks = {
      mode,
      persisted,
      beforeEnter(el) {
        let hook = onBeforeEnter;
        if (!state.isMounted) {
          if (appear) {
            hook = onBeforeAppear || onBeforeEnter;
          } else {
            return;
          }
        }
        if (el[leaveCbKey]) {
          el[leaveCbKey](
            true
          );
        }
        const leavingVNode = leavingVNodesCache[key];
        if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
          leavingVNode.el[leaveCbKey]();
        }
        callHook3(hook, [el]);
      },
      enter(el) {
        let hook = onEnter;
        let afterHook = onAfterEnter;
        let cancelHook = onEnterCancelled;
        if (!state.isMounted) {
          if (appear) {
            hook = onAppear || onEnter;
            afterHook = onAfterAppear || onAfterEnter;
            cancelHook = onAppearCancelled || onEnterCancelled;
          } else {
            return;
          }
        }
        let called = false;
        const done = el[enterCbKey] = (cancelled) => {
          if (called)
            return;
          called = true;
          if (cancelled) {
            callHook3(cancelHook, [el]);
          } else {
            callHook3(afterHook, [el]);
          }
          if (hooks.delayedLeave) {
            hooks.delayedLeave();
          }
          el[enterCbKey] = void 0;
        };
        if (hook) {
          callAsyncHook(hook, [el, done]);
        } else {
          done();
        }
      },
      leave(el, remove2) {
        const key2 = String(vnode.key);
        if (el[enterCbKey]) {
          el[enterCbKey](
            true
          );
        }
        if (state.isUnmounting) {
          return remove2();
        }
        callHook3(onBeforeLeave, [el]);
        let called = false;
        const done = el[leaveCbKey] = (cancelled) => {
          if (called)
            return;
          called = true;
          remove2();
          if (cancelled) {
            callHook3(onLeaveCancelled, [el]);
          } else {
            callHook3(onAfterLeave, [el]);
          }
          el[leaveCbKey] = void 0;
          if (leavingVNodesCache[key2] === vnode) {
            delete leavingVNodesCache[key2];
          }
        };
        leavingVNodesCache[key2] = vnode;
        if (onLeave) {
          callAsyncHook(onLeave, [el, done]);
        } else {
          done();
        }
      },
      clone(vnode2) {
        const hooks2 = resolveTransitionHooks(
          vnode2,
          props,
          state,
          instance,
          postClone
        );
        if (postClone)
          postClone(hooks2);
        return hooks2;
      }
    };
    return hooks;
  }
  function emptyPlaceholder(vnode) {
    if (isKeepAlive(vnode)) {
      vnode = cloneVNode(vnode);
      vnode.children = null;
      return vnode;
    }
  }
  function getKeepAliveChild(vnode) {
    if (!isKeepAlive(vnode)) {
      return vnode;
    }
    if (vnode.component) {
      return vnode.component.subTree;
    }
    const { shapeFlag, children } = vnode;
    if (children) {
      if (shapeFlag & 16) {
        return children[0];
      }
      if (shapeFlag & 32 && isFunction(children.default)) {
        return children.default();
      }
    }
  }
  function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 && vnode.component) {
      setTransitionHooks(vnode.component.subTree, hooks);
    } else if (vnode.shapeFlag & 128) {
      vnode.ssContent.transition = hooks.clone(vnode.ssContent);
      vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    } else {
      vnode.transition = hooks;
    }
  }
  function getTransitionRawChildren(children, keepComment = false, parentKey) {
    let ret = [];
    let keyedFragmentCount = 0;
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
      if (child.type === Fragment) {
        if (child.patchFlag & 128)
          keyedFragmentCount++;
        ret = ret.concat(
          getTransitionRawChildren(child.children, keepComment, key)
        );
      } else if (keepComment || child.type !== Comment) {
        ret.push(key != null ? cloneVNode(child, { key }) : child);
      }
    }
    if (keyedFragmentCount > 1) {
      for (let i = 0; i < ret.length; i++) {
        ret[i].patchFlag = -2;
      }
    }
    return ret;
  }
  function defineComponent(options, extraOptions) {
    return isFunction(options) ? /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
  }
  var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
  var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
  function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a", target);
  }
  function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da", target);
  }
  function registerKeepAliveHook(hook, type, target = currentInstance) {
    const wrappedHook = hook.__wdc || (hook.__wdc = () => {
      let current = target;
      while (current) {
        if (current.isDeactivated) {
          return;
        }
        current = current.parent;
      }
      return hook();
    });
    injectHook(type, wrappedHook, target);
    if (target) {
      let current = target.parent;
      while (current && current.parent) {
        if (isKeepAlive(current.parent.vnode)) {
          injectToKeepAliveRoot(wrappedHook, type, target, current);
        }
        current = current.parent;
      }
    }
  }
  function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    const injected = injectHook(
      type,
      hook,
      keepAliveRoot,
      true
    );
    onUnmounted(() => {
      remove(keepAliveRoot[type], injected);
    }, target);
  }
  function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
      const hooks = target[type] || (target[type] = []);
      const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
        pauseTracking();
        const reset = setCurrentInstance(target);
        const res = callWithAsyncErrorHandling(hook, target, type, args);
        reset();
        resetTracking();
        return res;
      });
      if (prepend) {
        hooks.unshift(wrappedHook);
      } else {
        hooks.push(wrappedHook);
      }
      return wrappedHook;
    } else if (true) {
      const apiName = toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""));
      warn$1(
        `${apiName} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
      );
    }
  }
  var createHook = (lifecycle) => (hook, target = currentInstance) => {
    if (!isInSSRComponentSetup || lifecycle === "sp") {
      injectHook(lifecycle, (...args) => hook(...args), target);
    }
  };
  var onBeforeMount = createHook("bm");
  var onMounted = createHook("m");
  var onBeforeUpdate = createHook("bu");
  var onUpdated = createHook("u");
  var onBeforeUnmount = createHook("bum");
  var onUnmounted = createHook("um");
  var onServerPrefetch = createHook("sp");
  var onRenderTriggered = createHook(
    "rtg"
  );
  var onRenderTracked = createHook(
    "rtc"
  );
  function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec", hook, target);
  }
  var COMPONENTS = "components";
  function resolveComponent(name, maybeSelfReference) {
    return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
  }
  var NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
  function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
    const instance = currentRenderingInstance || currentInstance;
    if (instance) {
      const Component = instance.type;
      if (type === COMPONENTS) {
        const selfName = getComponentName(
          Component,
          false
        );
        if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
          return Component;
        }
      }
      const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
      if (!res && maybeSelfReference) {
        return Component;
      }
      if (warnMissing && !res) {
        const extra = type === COMPONENTS ? `
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.` : ``;
        warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
      }
      return res;
    } else if (true) {
      warn$1(
        `resolve${capitalize(type.slice(0, -1))} can only be used in render() or setup().`
      );
    }
  }
  function resolve(registry, name) {
    return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
  }
  function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = cache && cache[index];
    if (isArray(source) || isString(source)) {
      ret = new Array(source.length);
      for (let i = 0, l = source.length; i < l; i++) {
        ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
      }
    } else if (typeof source === "number") {
      if (!Number.isInteger(source)) {
        warn$1(`The v-for range expect an integer value but got ${source}.`);
      }
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
      }
    } else if (isObject(source)) {
      if (source[Symbol.iterator]) {
        ret = Array.from(
          source,
          (item, i) => renderItem(item, i, void 0, cached && cached[i])
        );
      } else {
        const keys = Object.keys(source);
        ret = new Array(keys.length);
        for (let i = 0, l = keys.length; i < l; i++) {
          const key = keys[i];
          ret[i] = renderItem(source[key], key, i, cached && cached[i]);
        }
      }
    } else {
      ret = [];
    }
    if (cache) {
      cache[index] = ret;
    }
    return ret;
  }
  function renderSlot(slots, name, props = {}, fallback, noSlotted) {
    if (currentRenderingInstance.isCE || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.isCE) {
      if (name !== "default")
        props.name = name;
      return createVNode("slot", props, fallback && fallback());
    }
    let slot = slots[name];
    if (slot && slot.length > 1) {
      warn$1(
        `SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template.`
      );
      slot = () => [];
    }
    if (slot && slot._c) {
      slot._d = false;
    }
    openBlock();
    const validSlotContent = slot && ensureValidVNode(slot(props));
    const rendered = createBlock(
      Fragment,
      {
        key: (props.key || validSlotContent && validSlotContent.key || `_${name}`) + (!validSlotContent && fallback ? "_fb" : "")
      },
      validSlotContent || (fallback ? fallback() : []),
      validSlotContent && slots._ === 1 ? 64 : -2
    );
    if (!noSlotted && rendered.scopeId) {
      rendered.slotScopeIds = [rendered.scopeId + "-s"];
    }
    if (slot && slot._c) {
      slot._d = true;
    }
    return rendered;
  }
  function ensureValidVNode(vnodes) {
    return vnodes.some((child) => {
      if (!isVNode(child))
        return true;
      if (child.type === Comment)
        return false;
      if (child.type === Fragment && !ensureValidVNode(child.children))
        return false;
      return true;
    }) ? vnodes : null;
  }
  var getPublicInstance = (i) => {
    if (!i)
      return null;
    if (isStatefulComponent(i))
      return getComponentPublicInstance(i);
    return getPublicInstance(i.parent);
  };
  var publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => true ? shallowReadonly(i.props) : i.props,
    $attrs: (i) => true ? shallowReadonly(i.attrs) : i.attrs,
    $slots: (i) => true ? shallowReadonly(i.slots) : i.slots,
    $refs: (i) => true ? shallowReadonly(i.refs) : i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $emit: (i) => i.emit,
    $options: (i) => true ? resolveMergedOptions(i) : i.type,
    $forceUpdate: (i) => i.f || (i.f = () => {
      i.effect.dirty = true;
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => true ? instanceWatch.bind(i) : NOOP
  });
  var isReservedPrefix = (key) => key === "_" || key === "$";
  var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
  var PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
      if (key === "__v_skip") {
        return true;
      }
      const { ctx: ctx2, setupState, data, props, accessCache, type, appContext } = instance;
      if (key === "__isVue") {
        return true;
      }
      let normalizedProps;
      if (key[0] !== "$") {
        const n = accessCache[key];
        if (n !== void 0) {
          switch (n) {
            case 1:
              return setupState[key];
            case 2:
              return data[key];
            case 4:
              return ctx2[key];
            case 3:
              return props[key];
          }
        } else if (hasSetupBinding(setupState, key)) {
          accessCache[key] = 1;
          return setupState[key];
        } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
          accessCache[key] = 2;
          return data[key];
        } else if ((normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)) {
          accessCache[key] = 3;
          return props[key];
        } else if (ctx2 !== EMPTY_OBJ && hasOwn(ctx2, key)) {
          accessCache[key] = 4;
          return ctx2[key];
        } else if (shouldCacheAccess) {
          accessCache[key] = 0;
        }
      }
      const publicGetter = publicPropertiesMap[key];
      let cssModule, globalProperties;
      if (publicGetter) {
        if (key === "$attrs") {
          track(instance.attrs, "get", "");
          markAttrsAccessed();
        } else if (key === "$slots") {
          track(instance, "get", key);
        }
        return publicGetter(instance);
      } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
        return cssModule;
      } else if (ctx2 !== EMPTY_OBJ && hasOwn(ctx2, key)) {
        accessCache[key] = 4;
        return ctx2[key];
      } else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) {
        {
          return globalProperties[key];
        }
      } else if (currentRenderingInstance && (!isString(key) || key.indexOf("__v") !== 0)) {
        if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
          warn$1(
            `Property ${JSON.stringify(
              key
            )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
          );
        } else if (instance === currentRenderingInstance) {
          warn$1(
            `Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`
          );
        }
      }
    },
    set({ _: instance }, key, value) {
      const { data, setupState, ctx: ctx2 } = instance;
      if (hasSetupBinding(setupState, key)) {
        setupState[key] = value;
        return true;
      } else if (setupState.__isScriptSetup && hasOwn(setupState, key)) {
        warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
        return false;
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (hasOwn(instance.props, key)) {
        warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
        return false;
      }
      if (key[0] === "$" && key.slice(1) in instance) {
        warn$1(
          `Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`
        );
        return false;
      } else {
        if (key in instance.appContext.config.globalProperties) {
          Object.defineProperty(ctx2, key, {
            enumerable: true,
            configurable: true,
            value
          });
        } else {
          ctx2[key] = value;
        }
      }
      return true;
    },
    has({
      _: { data, setupState, accessCache, ctx: ctx2, appContext, propsOptions }
    }, key) {
      let normalizedProps;
      return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx2, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
    },
    defineProperty(target, key, descriptor) {
      if (descriptor.get != null) {
        target._.accessCache[key] = 0;
      } else if (hasOwn(descriptor, "value")) {
        this.set(target, key, descriptor.value, null);
      }
      return Reflect.defineProperty(target, key, descriptor);
    }
  };
  if (true) {
    PublicInstanceProxyHandlers.ownKeys = (target) => {
      warn$1(
        `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
      );
      return Reflect.ownKeys(target);
    };
  }
  function createDevRenderContext(instance) {
    const target = {};
    Object.defineProperty(target, `_`, {
      configurable: true,
      enumerable: false,
      get: () => instance
    });
    Object.keys(publicPropertiesMap).forEach((key) => {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: false,
        get: () => publicPropertiesMap[key](instance),
        set: NOOP
      });
    });
    return target;
  }
  function exposePropsOnRenderContext(instance) {
    const {
      ctx: ctx2,
      propsOptions: [propsOptions]
    } = instance;
    if (propsOptions) {
      Object.keys(propsOptions).forEach((key) => {
        Object.defineProperty(ctx2, key, {
          enumerable: true,
          configurable: true,
          get: () => instance.props[key],
          set: NOOP
        });
      });
    }
  }
  function exposeSetupStateOnRenderContext(instance) {
    const { ctx: ctx2, setupState } = instance;
    Object.keys(toRaw(setupState)).forEach((key) => {
      if (!setupState.__isScriptSetup) {
        if (isReservedPrefix(key[0])) {
          warn$1(
            `setup() return property ${JSON.stringify(
              key
            )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
          );
          return;
        }
        Object.defineProperty(ctx2, key, {
          enumerable: true,
          configurable: true,
          get: () => setupState[key],
          set: NOOP
        });
      }
    });
  }
  function normalizePropsOrEmits(props) {
    return isArray(props) ? props.reduce(
      (normalized, p2) => (normalized[p2] = null, normalized),
      {}
    ) : props;
  }
  function createDuplicateChecker() {
    const cache = /* @__PURE__ */ Object.create(null);
    return (type, key) => {
      if (cache[key]) {
        warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
      } else {
        cache[key] = type;
      }
    };
  }
  var shouldCacheAccess = true;
  function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx2 = instance.ctx;
    shouldCacheAccess = false;
    if (options.beforeCreate) {
      callHook(options.beforeCreate, instance, "bc");
    }
    const {
      data: dataOptions,
      computed: computedOptions,
      methods,
      watch: watchOptions,
      provide: provideOptions,
      inject: injectOptions,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      activated,
      deactivated,
      beforeDestroy,
      beforeUnmount,
      destroyed,
      unmounted,
      render: render3,
      renderTracked,
      renderTriggered,
      errorCaptured,
      serverPrefetch,
      expose,
      inheritAttrs,
      components,
      directives,
      filters
    } = options;
    const checkDuplicateProperties = true ? createDuplicateChecker() : null;
    if (true) {
      const [propsOptions] = instance.propsOptions;
      if (propsOptions) {
        for (const key in propsOptions) {
          checkDuplicateProperties("Props", key);
        }
      }
    }
    if (injectOptions) {
      resolveInjections(injectOptions, ctx2, checkDuplicateProperties);
    }
    if (methods) {
      for (const key in methods) {
        const methodHandler = methods[key];
        if (isFunction(methodHandler)) {
          if (true) {
            Object.defineProperty(ctx2, key, {
              value: methodHandler.bind(publicThis),
              configurable: true,
              enumerable: true,
              writable: true
            });
          } else {
            ctx2[key] = methodHandler.bind(publicThis);
          }
          if (true) {
            checkDuplicateProperties("Methods", key);
          }
        } else if (true) {
          warn$1(
            `Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`
          );
        }
      }
    }
    if (dataOptions) {
      if (!isFunction(dataOptions)) {
        warn$1(
          `The data option must be a function. Plain object usage is no longer supported.`
        );
      }
      const data = dataOptions.call(publicThis, publicThis);
      if (isPromise(data)) {
        warn$1(
          `data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`
        );
      }
      if (!isObject(data)) {
        warn$1(`data() should return an object.`);
      } else {
        instance.data = reactive(data);
        if (true) {
          for (const key in data) {
            checkDuplicateProperties("Data", key);
            if (!isReservedPrefix(key[0])) {
              Object.defineProperty(ctx2, key, {
                configurable: true,
                enumerable: true,
                get: () => data[key],
                set: NOOP
              });
            }
          }
        }
      }
    }
    shouldCacheAccess = true;
    if (computedOptions) {
      for (const key in computedOptions) {
        const opt = computedOptions[key];
        const get2 = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
        if (get2 === NOOP) {
          warn$1(`Computed property "${key}" has no getter.`);
        }
        const set2 = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : true ? () => {
          warn$1(
            `Write operation failed: computed property "${key}" is readonly.`
          );
        } : NOOP;
        const c = computed2({
          get: get2,
          set: set2
        });
        Object.defineProperty(ctx2, key, {
          enumerable: true,
          configurable: true,
          get: () => c.value,
          set: (v) => c.value = v
        });
        if (true) {
          checkDuplicateProperties("Computed", key);
        }
      }
    }
    if (watchOptions) {
      for (const key in watchOptions) {
        createWatcher(watchOptions[key], ctx2, publicThis, key);
      }
    }
    if (provideOptions) {
      const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key]);
      });
    }
    if (created) {
      callHook(created, instance, "c");
    }
    function registerLifecycleHook(register, hook) {
      if (isArray(hook)) {
        hook.forEach((_hook) => register(_hook.bind(publicThis)));
      } else if (hook) {
        register(hook.bind(publicThis));
      }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if (isArray(expose)) {
      if (expose.length) {
        const exposed = instance.exposed || (instance.exposed = {});
        expose.forEach((key) => {
          Object.defineProperty(exposed, key, {
            get: () => publicThis[key],
            set: (val) => publicThis[key] = val
          });
        });
      } else if (!instance.exposed) {
        instance.exposed = {};
      }
    }
    if (render3 && instance.render === NOOP) {
      instance.render = render3;
    }
    if (inheritAttrs != null) {
      instance.inheritAttrs = inheritAttrs;
    }
    if (components)
      instance.components = components;
    if (directives)
      instance.directives = directives;
  }
  function resolveInjections(injectOptions, ctx2, checkDuplicateProperties = NOOP) {
    if (isArray(injectOptions)) {
      injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
      const opt = injectOptions[key];
      let injected;
      if (isObject(opt)) {
        if ("default" in opt) {
          injected = inject(
            opt.from || key,
            opt.default,
            true
          );
        } else {
          injected = inject(opt.from || key);
        }
      } else {
        injected = inject(opt);
      }
      if (isRef2(injected)) {
        Object.defineProperty(ctx2, key, {
          enumerable: true,
          configurable: true,
          get: () => injected.value,
          set: (v) => injected.value = v
        });
      } else {
        ctx2[key] = injected;
      }
      if (true) {
        checkDuplicateProperties("Inject", key);
      }
    }
  }
  function callHook(hook, instance, type) {
    callWithAsyncErrorHandling(
      isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
      instance,
      type
    );
  }
  function createWatcher(raw, ctx2, publicThis, key) {
    const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
    if (isString(raw)) {
      const handler = ctx2[raw];
      if (isFunction(handler)) {
        watch(getter, handler);
      } else if (true) {
        warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
      }
    } else if (isFunction(raw)) {
      watch(getter, raw.bind(publicThis));
    } else if (isObject(raw)) {
      if (isArray(raw)) {
        raw.forEach((r) => createWatcher(r, ctx2, publicThis, key));
      } else {
        const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx2[raw.handler];
        if (isFunction(handler)) {
          watch(getter, handler, raw);
        } else if (true) {
          warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
        }
      }
    } else if (true) {
      warn$1(`Invalid watch option: "${key}"`, raw);
    }
  }
  function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const {
      mixins: globalMixins,
      optionsCache: cache,
      config: { optionMergeStrategies }
    } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
      resolved = cached;
    } else if (!globalMixins.length && !mixins && !extendsOptions) {
      {
        resolved = base;
      }
    } else {
      resolved = {};
      if (globalMixins.length) {
        globalMixins.forEach(
          (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
        );
      }
      mergeOptions(resolved, base, optionMergeStrategies);
    }
    if (isObject(base)) {
      cache.set(base, resolved);
    }
    return resolved;
  }
  function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
      mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
      mixins.forEach(
        (m) => mergeOptions(to, m, strats, true)
      );
    }
    for (const key in from) {
      if (asMixin && key === "expose") {
        warn$1(
          `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
        );
      } else {
        const strat = internalOptionMergeStrats[key] || strats && strats[key];
        to[key] = strat ? strat(to[key], from[key]) : from[key];
      }
    }
    return to;
  }
  var internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeEmitsOrPropsOptions,
    emits: mergeEmitsOrPropsOptions,
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    watch: mergeWatchOptions,
    provide: mergeDataFn,
    inject: mergeInject
  };
  function mergeDataFn(to, from) {
    if (!from) {
      return to;
    }
    if (!to) {
      return from;
    }
    return function mergedDataFn() {
      return extend(
        isFunction(to) ? to.call(this, this) : to,
        isFunction(from) ? from.call(this, this) : from
      );
    };
  }
  function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
  }
  function normalizeInject(raw) {
    if (isArray(raw)) {
      const res = {};
      for (let i = 0; i < raw.length; i++) {
        res[raw[i]] = raw[i];
      }
      return res;
    }
    return raw;
  }
  function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
  }
  function mergeObjectOptions(to, from) {
    return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
  }
  function mergeEmitsOrPropsOptions(to, from) {
    if (to) {
      if (isArray(to) && isArray(from)) {
        return [.../* @__PURE__ */ new Set([...to, ...from])];
      }
      return extend(
        /* @__PURE__ */ Object.create(null),
        normalizePropsOrEmits(to),
        normalizePropsOrEmits(from != null ? from : {})
      );
    } else {
      return from;
    }
  }
  function mergeWatchOptions(to, from) {
    if (!to)
      return from;
    if (!from)
      return to;
    const merged = extend(/* @__PURE__ */ Object.create(null), to);
    for (const key in from) {
      merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
  }
  function createAppContext() {
    return {
      app: null,
      config: {
        isNativeTag: NO,
        performance: false,
        globalProperties: {},
        optionMergeStrategies: {},
        errorHandler: void 0,
        warnHandler: void 0,
        compilerOptions: {}
      },
      mixins: [],
      components: {},
      directives: {},
      provides: /* @__PURE__ */ Object.create(null),
      optionsCache: /* @__PURE__ */ new WeakMap(),
      propsCache: /* @__PURE__ */ new WeakMap(),
      emitsCache: /* @__PURE__ */ new WeakMap()
    };
  }
  var uid$1 = 0;
  function createAppAPI(render3, hydrate) {
    return function createApp2(rootComponent, rootProps = null) {
      if (!isFunction(rootComponent)) {
        rootComponent = extend({}, rootComponent);
      }
      if (rootProps != null && !isObject(rootProps)) {
        warn$1(`root props passed to app.mount() must be an object.`);
        rootProps = null;
      }
      const context2 = createAppContext();
      const installedPlugins = /* @__PURE__ */ new WeakSet();
      let isMounted = false;
      const app = context2.app = {
        _uid: uid$1++,
        _component: rootComponent,
        _props: rootProps,
        _container: null,
        _context: context2,
        _instance: null,
        version,
        get config() {
          return context2.config;
        },
        set config(v) {
          if (true) {
            warn$1(
              `app.config cannot be replaced. Modify individual options instead.`
            );
          }
        },
        use(plugin, ...options) {
          if (installedPlugins.has(plugin)) {
            warn$1(`Plugin has already been applied to target app.`);
          } else if (plugin && isFunction(plugin.install)) {
            installedPlugins.add(plugin);
            plugin.install(app, ...options);
          } else if (isFunction(plugin)) {
            installedPlugins.add(plugin);
            plugin(app, ...options);
          } else if (true) {
            warn$1(
              `A plugin must either be a function or an object with an "install" function.`
            );
          }
          return app;
        },
        mixin(mixin) {
          if (true) {
            if (!context2.mixins.includes(mixin)) {
              context2.mixins.push(mixin);
            } else if (true) {
              warn$1(
                "Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : "")
              );
            }
          } else if (true) {
            warn$1("Mixins are only available in builds supporting Options API");
          }
          return app;
        },
        component(name, component) {
          if (true) {
            validateComponentName(name, context2.config);
          }
          if (!component) {
            return context2.components[name];
          }
          if (context2.components[name]) {
            warn$1(`Component "${name}" has already been registered in target app.`);
          }
          context2.components[name] = component;
          return app;
        },
        directive(name, directive) {
          if (true) {
            validateDirectiveName(name);
          }
          if (!directive) {
            return context2.directives[name];
          }
          if (context2.directives[name]) {
            warn$1(`Directive "${name}" has already been registered in target app.`);
          }
          context2.directives[name] = directive;
          return app;
        },
        mount(rootContainer, isHydrate, namespace) {
          if (!isMounted) {
            if (rootContainer.__vue_app__) {
              warn$1(
                `There is already an app instance mounted on the host container.
 If you want to mount another app on the same host container, you need to unmount the previous app by calling \`app.unmount()\` first.`
              );
            }
            const vnode = createVNode(rootComponent, rootProps);
            vnode.appContext = context2;
            if (namespace === true) {
              namespace = "svg";
            } else if (namespace === false) {
              namespace = void 0;
            }
            if (true) {
              context2.reload = () => {
                render3(
                  cloneVNode(vnode),
                  rootContainer,
                  namespace
                );
              };
            }
            if (isHydrate && hydrate) {
              hydrate(vnode, rootContainer);
            } else {
              render3(vnode, rootContainer, namespace);
            }
            isMounted = true;
            app._container = rootContainer;
            rootContainer.__vue_app__ = app;
            if (true) {
              app._instance = vnode.component;
              devtoolsInitApp(app, version);
            }
            return getComponentPublicInstance(vnode.component);
          } else if (true) {
            warn$1(
              `App has already been mounted.
If you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \`const createMyApp = () => createApp(App)\``
            );
          }
        },
        unmount() {
          if (isMounted) {
            render3(null, app._container);
            if (true) {
              app._instance = null;
              devtoolsUnmountApp(app);
            }
            delete app._container.__vue_app__;
          } else if (true) {
            warn$1(`Cannot unmount an app that is not mounted.`);
          }
        },
        provide(key, value) {
          if (key in context2.provides) {
            warn$1(
              `App already provides property with key "${String(key)}". It will be overwritten with the new value.`
            );
          }
          context2.provides[key] = value;
          return app;
        },
        runWithContext(fn) {
          const lastApp = currentApp;
          currentApp = app;
          try {
            return fn();
          } finally {
            currentApp = lastApp;
          }
        }
      };
      return app;
    };
  }
  var currentApp = null;
  function provide(key, value) {
    if (!currentInstance) {
      if (true) {
        warn$1(`provide() can only be used inside setup().`);
      }
    } else {
      let provides = currentInstance.provides;
      const parentProvides = currentInstance.parent && currentInstance.parent.provides;
      if (parentProvides === provides) {
        provides = currentInstance.provides = Object.create(parentProvides);
      }
      provides[key] = value;
    }
  }
  function inject(key, defaultValue, treatDefaultAsFactory = false) {
    const instance = currentInstance || currentRenderingInstance;
    if (instance || currentApp) {
      const provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
      if (provides && key in provides) {
        return provides[key];
      } else if (arguments.length > 1) {
        return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
      } else if (true) {
        warn$1(`injection "${String(key)}" not found.`);
      }
    } else if (true) {
      warn$1(`inject() can only be used inside setup() or functional components.`);
    }
  }
  var internalObjectProto = {};
  var createInternalObject = () => Object.create(internalObjectProto);
  var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
  function initProps(instance, rawProps, isStateful, isSSR = false) {
    const props = {};
    const attrs = createInternalObject();
    instance.propsDefaults = /* @__PURE__ */ Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    for (const key in instance.propsOptions[0]) {
      if (!(key in props)) {
        props[key] = void 0;
      }
    }
    if (true) {
      validateProps(rawProps || {}, props, instance);
    }
    if (isStateful) {
      instance.props = isSSR ? props : shallowReactive(props);
    } else {
      if (!instance.type.props) {
        instance.props = attrs;
      } else {
        instance.props = props;
      }
    }
    instance.attrs = attrs;
  }
  function isInHmrContext(instance) {
    while (instance) {
      if (instance.type.__hmrId)
        return true;
      instance = instance.parent;
    }
  }
  function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const {
      props,
      attrs,
      vnode: { patchFlag }
    } = instance;
    const rawCurrentProps = toRaw(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (!isInHmrContext(instance) && (optimized || patchFlag > 0) && !(patchFlag & 16)) {
      if (patchFlag & 8) {
        const propsToUpdate = instance.vnode.dynamicProps;
        for (let i = 0; i < propsToUpdate.length; i++) {
          let key = propsToUpdate[i];
          if (isEmitListener(instance.emitsOptions, key)) {
            continue;
          }
          const value = rawProps[key];
          if (options) {
            if (hasOwn(attrs, key)) {
              if (value !== attrs[key]) {
                attrs[key] = value;
                hasAttrsChanged = true;
              }
            } else {
              const camelizedKey = camelize(key);
              props[camelizedKey] = resolvePropValue(
                options,
                rawCurrentProps,
                camelizedKey,
                value,
                instance,
                false
              );
            }
          } else {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          }
        }
      }
    } else {
      if (setFullProps(instance, rawProps, props, attrs)) {
        hasAttrsChanged = true;
      }
      let kebabKey;
      for (const key in rawCurrentProps) {
        if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
          if (options) {
            if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) {
              props[key] = resolvePropValue(
                options,
                rawCurrentProps,
                key,
                void 0,
                instance,
                true
              );
            }
          } else {
            delete props[key];
          }
        }
      }
      if (attrs !== rawCurrentProps) {
        for (const key in attrs) {
          if (!rawProps || !hasOwn(rawProps, key) && true) {
            delete attrs[key];
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (hasAttrsChanged) {
      trigger(instance.attrs, "set", "");
    }
    if (true) {
      validateProps(rawProps || {}, props, instance);
    }
  }
  function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
      for (let key in rawProps) {
        if (isReservedProp(key)) {
          continue;
        }
        const value = rawProps[key];
        let camelKey;
        if (options && hasOwn(options, camelKey = camelize(key))) {
          if (!needCastKeys || !needCastKeys.includes(camelKey)) {
            props[camelKey] = value;
          } else {
            (rawCastValues || (rawCastValues = {}))[camelKey] = value;
          }
        } else if (!isEmitListener(instance.emitsOptions, key)) {
          if (!(key in attrs) || value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
    if (needCastKeys) {
      const rawCurrentProps = toRaw(props);
      const castValues = rawCastValues || EMPTY_OBJ;
      for (let i = 0; i < needCastKeys.length; i++) {
        const key = needCastKeys[i];
        props[key] = resolvePropValue(
          options,
          rawCurrentProps,
          key,
          castValues[key],
          instance,
          !hasOwn(castValues, key)
        );
      }
    }
    return hasAttrsChanged;
  }
  function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
      const hasDefault = hasOwn(opt, "default");
      if (hasDefault && value === void 0) {
        const defaultValue = opt.default;
        if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
          const { propsDefaults } = instance;
          if (key in propsDefaults) {
            value = propsDefaults[key];
          } else {
            const reset = setCurrentInstance(instance);
            value = propsDefaults[key] = defaultValue.call(
              null,
              props
            );
            reset();
          }
        } else {
          value = defaultValue;
        }
      }
      if (opt[0]) {
        if (isAbsent && !hasDefault) {
          value = false;
        } else if (opt[1] && (value === "" || value === hyphenate(key))) {
          value = true;
        }
      }
    }
    return value;
  }
  var mixinPropsCache = /* @__PURE__ */ new WeakMap();
  function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = asMixin ? mixinPropsCache : appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
      return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendProps = (raw2) => {
        hasExtends = true;
        const [props, keys] = normalizePropsOptions(raw2, appContext, true);
        extend(normalized, props);
        if (keys)
          needCastKeys.push(...keys);
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendProps);
      }
      if (comp.extends) {
        extendProps(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendProps);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, EMPTY_ARR);
      }
      return EMPTY_ARR;
    }
    if (isArray(raw)) {
      for (let i = 0; i < raw.length; i++) {
        if (!isString(raw[i])) {
          warn$1(`props must be strings when using array syntax.`, raw[i]);
        }
        const normalizedKey = camelize(raw[i]);
        if (validatePropName(normalizedKey)) {
          normalized[normalizedKey] = EMPTY_OBJ;
        }
      }
    } else if (raw) {
      if (!isObject(raw)) {
        warn$1(`invalid props options`, raw);
      }
      for (const key in raw) {
        const normalizedKey = camelize(key);
        if (validatePropName(normalizedKey)) {
          const opt = raw[key];
          const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
          const propType = prop.type;
          let shouldCast = false;
          let shouldCastTrue = true;
          if (isArray(propType)) {
            for (let index = 0; index < propType.length; ++index) {
              const type = propType[index];
              const typeName = isFunction(type) && type.name;
              if (typeName === "Boolean") {
                shouldCast = true;
                break;
              } else if (typeName === "String") {
                shouldCastTrue = false;
              }
            }
          } else {
            shouldCast = isFunction(propType) && propType.name === "Boolean";
          }
          prop[0] = shouldCast;
          prop[1] = shouldCastTrue;
          if (shouldCast || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
    const res = [normalized, needCastKeys];
    if (isObject(comp)) {
      cache.set(comp, res);
    }
    return res;
  }
  function validatePropName(key) {
    if (key[0] !== "$" && !isReservedProp(key)) {
      return true;
    } else if (true) {
      warn$1(`Invalid prop name: "${key}" is a reserved property.`);
    }
    return false;
  }
  function getType(ctor) {
    if (ctor === null) {
      return "null";
    }
    if (typeof ctor === "function") {
      return ctor.name || "";
    } else if (typeof ctor === "object") {
      const name = ctor.constructor && ctor.constructor.name;
      return name || "";
    }
    return "";
  }
  function validateProps(rawProps, props, instance) {
    const resolvedValues = toRaw(props);
    const options = instance.propsOptions[0];
    for (const key in options) {
      let opt = options[key];
      if (opt == null)
        continue;
      validateProp(
        key,
        resolvedValues[key],
        opt,
        true ? shallowReadonly(resolvedValues) : resolvedValues,
        !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key))
      );
    }
  }
  function validateProp(name, value, prop, props, isAbsent) {
    const { type, required, validator, skipCheck } = prop;
    if (required && isAbsent) {
      warn$1('Missing required prop: "' + name + '"');
      return;
    }
    if (value == null && !required) {
      return;
    }
    if (type != null && type !== true && !skipCheck) {
      let isValid = false;
      const types = isArray(type) ? type : [type];
      const expectedTypes = [];
      for (let i = 0; i < types.length && !isValid; i++) {
        const { valid, expectedType } = assertType(value, types[i]);
        expectedTypes.push(expectedType || "");
        isValid = valid;
      }
      if (!isValid) {
        warn$1(getInvalidTypeMessage(name, value, expectedTypes));
        return;
      }
    }
    if (validator && !validator(value, props)) {
      warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
    }
  }
  var isSimpleType = /* @__PURE__ */ makeMap(
    "String,Number,Boolean,Function,Symbol,BigInt"
  );
  function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (isSimpleType(expectedType)) {
      const t = typeof value;
      valid = t === expectedType.toLowerCase();
      if (!valid && t === "object") {
        valid = value instanceof type;
      }
    } else if (expectedType === "Object") {
      valid = isObject(value);
    } else if (expectedType === "Array") {
      valid = isArray(value);
    } else if (expectedType === "null") {
      valid = value === null;
    } else {
      valid = value instanceof type;
    }
    return {
      valid,
      expectedType
    };
  }
  function getInvalidTypeMessage(name, value, expectedTypes) {
    if (expectedTypes.length === 0) {
      return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
    }
    let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
      message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    if (isExplicable(receivedType)) {
      message += `with value ${receivedValue}.`;
    }
    return message;
  }
  function styleValue(value, type) {
    if (type === "String") {
      return `"${value}"`;
    } else if (type === "Number") {
      return `${Number(value)}`;
    } else {
      return `${value}`;
    }
  }
  function isExplicable(type) {
    const explicitTypes = ["string", "number", "boolean"];
    return explicitTypes.some((elem) => type.toLowerCase() === elem);
  }
  function isBoolean(...args) {
    return args.some((elem) => elem.toLowerCase() === "boolean");
  }
  var isInternalKey = (key) => key[0] === "_" || key === "$stable";
  var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
  var normalizeSlot = (key, rawSlot, ctx2) => {
    if (rawSlot._n) {
      return rawSlot;
    }
    const normalized = withCtx((...args) => {
      if (currentInstance && (!ctx2 || ctx2.root === currentInstance.root)) {
        warn$1(
          `Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
        );
      }
      return normalizeSlotValue(rawSlot(...args));
    }, ctx2);
    normalized._c = false;
    return normalized;
  };
  var normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx2 = rawSlots._ctx;
    for (const key in rawSlots) {
      if (isInternalKey(key))
        continue;
      const value = rawSlots[key];
      if (isFunction(value)) {
        slots[key] = normalizeSlot(key, value, ctx2);
      } else if (value != null) {
        if (true) {
          warn$1(
            `Non-function value encountered for slot "${key}". Prefer function slots for better performance.`
          );
        }
        const normalized = normalizeSlotValue(value);
        slots[key] = () => normalized;
      }
    }
  };
  var normalizeVNodeSlots = (instance, children) => {
    if (!isKeepAlive(instance.vnode) && true) {
      warn$1(
        `Non-function value encountered for default slot. Prefer function slots for better performance.`
      );
    }
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
  };
  var assignSlots = (slots, children, optimized) => {
    for (const key in children) {
      if (optimized || key !== "_") {
        slots[key] = children[key];
      }
    }
  };
  var initSlots = (instance, children, optimized) => {
    const slots = instance.slots = createInternalObject();
    if (instance.vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        assignSlots(slots, children, optimized);
        if (optimized) {
          def(slots, "_", type, true);
        }
      } else {
        normalizeObjectSlots(children, slots);
      }
    } else if (children) {
      normalizeVNodeSlots(instance, children);
    }
  };
  var updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = EMPTY_OBJ;
    if (vnode.shapeFlag & 32) {
      const type = children._;
      if (type) {
        if (isHmrUpdating) {
          assignSlots(slots, children, optimized);
          trigger(instance, "set", "$slots");
        } else if (optimized && type === 1) {
          needDeletionCheck = false;
        } else {
          assignSlots(slots, children, optimized);
        }
      } else {
        needDeletionCheck = !children.$stable;
        normalizeObjectSlots(children, slots);
      }
      deletionComparisonTarget = children;
    } else if (children) {
      normalizeVNodeSlots(instance, children);
      deletionComparisonTarget = { default: 1 };
    }
    if (needDeletionCheck) {
      for (const key in slots) {
        if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
          delete slots[key];
        }
      }
    }
  };
  function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if (isArray(rawRef)) {
      rawRef.forEach(
        (r, i) => setRef(
          r,
          oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
          parentSuspense,
          vnode,
          isUnmount
        )
      );
      return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
      return;
    }
    const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref2 } = rawRef;
    if (!owner) {
      warn$1(
        `Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`
      );
      return;
    }
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
    const setupState = owner.setupState;
    if (oldRef != null && oldRef !== ref2) {
      if (isString(oldRef)) {
        refs[oldRef] = null;
        if (hasOwn(setupState, oldRef)) {
          setupState[oldRef] = null;
        }
      } else if (isRef2(oldRef)) {
        oldRef.value = null;
      }
    }
    if (isFunction(ref2)) {
      callWithErrorHandling(ref2, owner, 12, [value, refs]);
    } else {
      const _isString = isString(ref2);
      const _isRef = isRef2(ref2);
      if (_isString || _isRef) {
        const doSet = () => {
          if (rawRef.f) {
            const existing = _isString ? hasOwn(setupState, ref2) ? setupState[ref2] : refs[ref2] : ref2.value;
            if (isUnmount) {
              isArray(existing) && remove(existing, refValue);
            } else {
              if (!isArray(existing)) {
                if (_isString) {
                  refs[ref2] = [refValue];
                  if (hasOwn(setupState, ref2)) {
                    setupState[ref2] = refs[ref2];
                  }
                } else {
                  ref2.value = [refValue];
                  if (rawRef.k)
                    refs[rawRef.k] = ref2.value;
                }
              } else if (!existing.includes(refValue)) {
                existing.push(refValue);
              }
            }
          } else if (_isString) {
            refs[ref2] = value;
            if (hasOwn(setupState, ref2)) {
              setupState[ref2] = value;
            }
          } else if (_isRef) {
            ref2.value = value;
            if (rawRef.k)
              refs[rawRef.k] = value;
          } else if (true) {
            warn$1("Invalid template ref type:", ref2, `(${typeof ref2})`);
          }
        };
        if (value) {
          doSet.id = -1;
          queuePostRenderEffect(doSet, parentSuspense);
        } else {
          doSet();
        }
      } else if (true) {
        warn$1("Invalid template ref type:", ref2, `(${typeof ref2})`);
      }
    }
  }
  var TeleportEndKey = Symbol("_vte");
  var isTeleport = (type) => type.__isTeleport;
  var supported;
  var perf;
  function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
      perf.mark(`vue-${type}-${instance.uid}`);
    }
    if (true) {
      devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
    }
  }
  function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
      const startTag = `vue-${type}-${instance.uid}`;
      const endTag = startTag + `:end`;
      perf.mark(endTag);
      perf.measure(
        `<${formatComponentName(instance, instance.type)}> ${type}`,
        startTag,
        endTag
      );
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
    }
    if (true) {
      devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
    }
  }
  function isSupported() {
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function initFeatureFlags() {
    const needWarn = [];
    if (false) {
      needWarn.push(`__VUE_OPTIONS_API__`);
      getGlobalThis().__VUE_OPTIONS_API__ = true;
    }
    if (false) {
      needWarn.push(`__VUE_PROD_DEVTOOLS__`);
      getGlobalThis().__VUE_PROD_DEVTOOLS__ = false;
    }
    if (typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ !== "boolean") {
      needWarn.push(`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`);
      getGlobalThis().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
    }
    if (needWarn.length) {
      const multi = needWarn.length > 1;
      console.warn(
        `Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
      );
    }
  }
  var queuePostRenderEffect = queueEffectWithSuspense;
  function createRenderer(options) {
    return baseCreateRenderer(options);
  }
  function baseCreateRenderer(options, createHydrationFns) {
    {
      initFeatureFlags();
    }
    const target = getGlobalThis();
    target.__VUE__ = true;
    if (true) {
      setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    }
    const {
      insert: hostInsert,
      remove: hostRemove,
      patchProp: hostPatchProp,
      createElement: hostCreateElement,
      createText: hostCreateText,
      createComment: hostCreateComment,
      setText: hostSetText,
      setElementText: hostSetElementText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      setScopeId: hostSetScopeId = NOOP,
      insertStaticContent: hostInsertStaticContent
    } = options;
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = isHmrUpdating ? false : !!n2.dynamicChildren) => {
      if (n1 === n2) {
        return;
      }
      if (n1 && !isSameVNodeType(n1, n2)) {
        anchor = getNextHostNode(n1);
        unmount(n1, parentComponent, parentSuspense, true);
        n1 = null;
      }
      if (n2.patchFlag === -2) {
        optimized = false;
        n2.dynamicChildren = null;
      }
      const { type, ref: ref2, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container, anchor);
          break;
        case Comment:
          processCommentNode(n1, n2, container, anchor);
          break;
        case Static:
          if (n1 == null) {
            mountStaticNode(n2, container, anchor, namespace);
          } else if (true) {
            patchStaticNode(n1, n2, container, namespace);
          }
          break;
        case Fragment:
          processFragment(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          break;
        default:
          if (shapeFlag & 1) {
            processElement(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 6) {
            processComponent(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (shapeFlag & 64) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else if (shapeFlag & 128) {
            type.process(
              n1,
              n2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized,
              internals
            );
          } else if (true) {
            warn$1("Invalid VNode type:", type, `(${typeof type})`);
          }
      }
      if (ref2 != null && parentComponent) {
        setRef(ref2, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
      }
    };
    const processText = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateText(n2.children),
          container,
          anchor
        );
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          hostSetText(el, n2.children);
        }
      }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
      if (n1 == null) {
        hostInsert(
          n2.el = hostCreateComment(n2.children || ""),
          container,
          anchor
        );
      } else {
        n2.el = n1.el;
      }
    };
    const mountStaticNode = (n2, container, anchor, namespace) => {
      [n2.el, n2.anchor] = hostInsertStaticContent(
        n2.children,
        container,
        anchor,
        namespace,
        n2.el,
        n2.anchor
      );
    };
    const patchStaticNode = (n1, n2, container, namespace) => {
      if (n2.children !== n1.children) {
        const anchor = hostNextSibling(n1.anchor);
        removeStaticNode(n1);
        [n2.el, n2.anchor] = hostInsertStaticContent(
          n2.children,
          container,
          anchor,
          namespace
        );
      } else {
        n2.el = n1.el;
        n2.anchor = n1.anchor;
      }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostInsert(el, container, nextSibling);
        el = next;
      }
      hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
      let next;
      while (el && el !== anchor) {
        next = hostNextSibling(el);
        hostRemove(el);
        el = next;
      }
      hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      if (n2.type === "svg") {
        namespace = "svg";
      } else if (n2.type === "math") {
        namespace = "mathml";
      }
      if (n1 == null) {
        mountElement(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let el;
      let vnodeHook;
      const { props, shapeFlag, transition, dirs } = vnode;
      el = vnode.el = hostCreateElement(
        vnode.type,
        namespace,
        props && props.is,
        props
      );
      if (shapeFlag & 8) {
        hostSetElementText(el, vnode.children);
      } else if (shapeFlag & 16) {
        mountChildren(
          vnode.children,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(vnode, namespace),
          slotScopeIds,
          optimized
        );
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
      if (props) {
        for (const key in props) {
          if (key !== "value" && !isReservedProp(key)) {
            hostPatchProp(el, key, null, props[key], namespace, parentComponent);
          }
        }
        if ("value" in props) {
          hostPatchProp(el, "value", null, props.value, namespace);
        }
        if (vnodeHook = props.onVnodeBeforeMount) {
          invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
      }
      if (true) {
        def(el, "__vnode", vnode, true);
        def(el, "__vueParentComponent", parentComponent, true);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      const needCallTransitionHooks = needTransition(parentSuspense, transition);
      if (needCallTransitionHooks) {
        transition.beforeEnter(el);
      }
      hostInsert(el, container, anchor);
      if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
      if (scopeId) {
        hostSetScopeId(el, scopeId);
      }
      if (slotScopeIds) {
        for (let i = 0; i < slotScopeIds.length; i++) {
          hostSetScopeId(el, slotScopeIds[i]);
        }
      }
      if (parentComponent) {
        let subTree = parentComponent.subTree;
        if (subTree.patchFlag > 0 && subTree.patchFlag & 2048) {
          subTree = filterSingleRoot(subTree.children) || subTree;
        }
        if (vnode === subTree) {
          const parentVNode = parentComponent.vnode;
          setScopeId(
            el,
            parentVNode,
            parentVNode.scopeId,
            parentVNode.slotScopeIds,
            parentComponent.parent
          );
        }
      }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
      for (let i = start; i < children.length; i++) {
        const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
        patch(
          null,
          child,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const el = n2.el = n1.el;
      if (true) {
        el.__vnode = n2;
      }
      let { patchFlag, dynamicChildren, dirs } = n2;
      patchFlag |= n1.patchFlag & 16;
      const oldProps = n1.props || EMPTY_OBJ;
      const newProps = n2.props || EMPTY_OBJ;
      let vnodeHook;
      parentComponent && toggleRecurse(parentComponent, false);
      if (vnodeHook = newProps.onVnodeBeforeUpdate) {
        invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
      }
      if (dirs) {
        invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
      }
      parentComponent && toggleRecurse(parentComponent, true);
      if (isHmrUpdating) {
        patchFlag = 0;
        optimized = false;
        dynamicChildren = null;
      }
      if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
        hostSetElementText(el, "");
      }
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          el,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds
        );
        if (true) {
          traverseStaticChildren(n1, n2);
        }
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          el,
          null,
          parentComponent,
          parentSuspense,
          resolveChildrenNamespace(n2, namespace),
          slotScopeIds,
          false
        );
      }
      if (patchFlag > 0) {
        if (patchFlag & 16) {
          patchProps(el, oldProps, newProps, parentComponent, namespace);
        } else {
          if (patchFlag & 2) {
            if (oldProps.class !== newProps.class) {
              hostPatchProp(el, "class", null, newProps.class, namespace);
            }
          }
          if (patchFlag & 4) {
            hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
          }
          if (patchFlag & 8) {
            const propsToUpdate = n2.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
              const key = propsToUpdate[i];
              const prev = oldProps[key];
              const next = newProps[key];
              if (next !== prev || key === "value") {
                hostPatchProp(el, key, prev, next, namespace, parentComponent);
              }
            }
          }
        }
        if (patchFlag & 1) {
          if (n1.children !== n2.children) {
            hostSetElementText(el, n2.children);
          }
        }
      } else if (!optimized && dynamicChildren == null) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      }
      if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
          dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
        }, parentSuspense);
      }
    };
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
      for (let i = 0; i < newChildren.length; i++) {
        const oldVNode = oldChildren[i];
        const newVNode = newChildren[i];
        const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : fallbackContainer;
        patch(
          oldVNode,
          newVNode,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          true
        );
      }
    };
    const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
      if (oldProps !== newProps) {
        if (oldProps !== EMPTY_OBJ) {
          for (const key in oldProps) {
            if (!isReservedProp(key) && !(key in newProps)) {
              hostPatchProp(
                el,
                key,
                oldProps[key],
                null,
                namespace,
                parentComponent
              );
            }
          }
        }
        for (const key in newProps) {
          if (isReservedProp(key))
            continue;
          const next = newProps[key];
          const prev = oldProps[key];
          if (next !== prev && key !== "value") {
            hostPatchProp(el, key, prev, next, namespace, parentComponent);
          }
        }
        if ("value" in newProps) {
          hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
        }
      }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
      const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
      let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
      if (isHmrUpdating || patchFlag & 2048) {
        patchFlag = 0;
        optimized = false;
        dynamicChildren = null;
      }
      if (fragmentSlotScopeIds) {
        slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
      }
      if (n1 == null) {
        hostInsert(fragmentStartAnchor, container, anchor);
        hostInsert(fragmentEndAnchor, container, anchor);
        mountChildren(
          n2.children || [],
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren) {
          patchBlockChildren(
            n1.dynamicChildren,
            dynamicChildren,
            container,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds
          );
          if (true) {
            traverseStaticChildren(n1, n2);
          } else if (n2.key != null || parentComponent && n2 === parentComponent.subTree) {
            traverseStaticChildren(
              n1,
              n2,
              true
            );
          }
        } else {
          patchChildren(
            n1,
            n2,
            container,
            fragmentEndAnchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      n2.slotScopeIds = slotScopeIds;
      if (n1 == null) {
        if (n2.shapeFlag & 512) {
          parentComponent.ctx.activate(
            n2,
            container,
            anchor,
            namespace,
            optimized
          );
        } else {
          mountComponent(
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            optimized
          );
        }
      } else {
        updateComponent(n1, n2, optimized);
      }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
      const instance = initialVNode.component = createComponentInstance(
        initialVNode,
        parentComponent,
        parentSuspense
      );
      if (instance.type.__hmrId) {
        registerHMR(instance);
      }
      if (true) {
        pushWarningContext(initialVNode);
        startMeasure(instance, `mount`);
      }
      if (isKeepAlive(initialVNode)) {
        instance.ctx.renderer = internals;
      }
      {
        if (true) {
          startMeasure(instance, `init`);
        }
        setupComponent(instance, false, optimized);
        if (true) {
          endMeasure(instance, `init`);
        }
      }
      if (instance.asyncDep) {
        parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
        if (!initialVNode.el) {
          const placeholder = instance.subTree = createVNode(Comment);
          processCommentNode(null, placeholder, container, anchor);
        }
      } else {
        setupRenderEffect(
          instance,
          initialVNode,
          container,
          anchor,
          parentSuspense,
          namespace,
          optimized
        );
      }
      if (true) {
        popWarningContext();
        endMeasure(instance, `mount`);
      }
    };
    const updateComponent = (n1, n2, optimized) => {
      const instance = n2.component = n1.component;
      if (shouldUpdateComponent(n1, n2, optimized)) {
        if (instance.asyncDep && !instance.asyncResolved) {
          if (true) {
            pushWarningContext(n2);
          }
          updateComponentPreRender(instance, n2, optimized);
          if (true) {
            popWarningContext();
          }
          return;
        } else {
          instance.next = n2;
          invalidateJob(instance.update);
          instance.effect.dirty = true;
          instance.update();
        }
      } else {
        n2.el = n1.el;
        instance.vnode = n2;
      }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          let vnodeHook;
          const { el, props } = initialVNode;
          const { bm, m, parent } = instance;
          const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
          toggleRecurse(instance, false);
          if (bm) {
            invokeArrayFns(bm);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
            invokeVNodeHook(vnodeHook, parent, initialVNode);
          }
          toggleRecurse(instance, true);
          if (el && hydrateNode) {
            const hydrateSubTree = () => {
              if (true) {
                startMeasure(instance, `render`);
              }
              instance.subTree = renderComponentRoot(instance);
              if (true) {
                endMeasure(instance, `render`);
              }
              if (true) {
                startMeasure(instance, `hydrate`);
              }
              hydrateNode(
                el,
                instance.subTree,
                instance,
                parentSuspense,
                null
              );
              if (true) {
                endMeasure(instance, `hydrate`);
              }
            };
            if (isAsyncWrapperVNode) {
              initialVNode.type.__asyncLoader().then(
                () => !instance.isUnmounted && hydrateSubTree()
              );
            } else {
              hydrateSubTree();
            }
          } else {
            if (true) {
              startMeasure(instance, `render`);
            }
            const subTree = instance.subTree = renderComponentRoot(instance);
            if (true) {
              endMeasure(instance, `render`);
            }
            if (true) {
              startMeasure(instance, `patch`);
            }
            patch(
              null,
              subTree,
              container,
              anchor,
              instance,
              parentSuspense,
              namespace
            );
            if (true) {
              endMeasure(instance, `patch`);
            }
            initialVNode.el = subTree.el;
          }
          if (m) {
            queuePostRenderEffect(m, parentSuspense);
          }
          if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
            const scopedInitialVNode = initialVNode;
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
              parentSuspense
            );
          }
          if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
            instance.a && queuePostRenderEffect(instance.a, parentSuspense);
          }
          instance.isMounted = true;
          if (true) {
            devtoolsComponentAdded(instance);
          }
          initialVNode = container = anchor = null;
        } else {
          let { next, bu, u, parent, vnode } = instance;
          {
            const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
            if (nonHydratedAsyncRoot) {
              if (next) {
                next.el = vnode.el;
                updateComponentPreRender(instance, next, optimized);
              }
              nonHydratedAsyncRoot.asyncDep.then(() => {
                if (!instance.isUnmounted) {
                  componentUpdateFn();
                }
              });
              return;
            }
          }
          let originNext = next;
          let vnodeHook;
          if (true) {
            pushWarningContext(next || instance.vnode);
          }
          toggleRecurse(instance, false);
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next, optimized);
          } else {
            next = vnode;
          }
          if (bu) {
            invokeArrayFns(bu);
          }
          if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
            invokeVNodeHook(vnodeHook, parent, next, vnode);
          }
          toggleRecurse(instance, true);
          if (true) {
            startMeasure(instance, `render`);
          }
          const nextTree = renderComponentRoot(instance);
          if (true) {
            endMeasure(instance, `render`);
          }
          const prevTree = instance.subTree;
          instance.subTree = nextTree;
          if (true) {
            startMeasure(instance, `patch`);
          }
          patch(
            prevTree,
            nextTree,
            hostParentNode(prevTree.el),
            getNextHostNode(prevTree),
            instance,
            parentSuspense,
            namespace
          );
          if (true) {
            endMeasure(instance, `patch`);
          }
          next.el = nextTree.el;
          if (originNext === null) {
            updateHOCHostEl(instance, nextTree.el);
          }
          if (u) {
            queuePostRenderEffect(u, parentSuspense);
          }
          if (vnodeHook = next.props && next.props.onVnodeUpdated) {
            queuePostRenderEffect(
              () => invokeVNodeHook(vnodeHook, parent, next, vnode),
              parentSuspense
            );
          }
          if (true) {
            devtoolsComponentUpdated(instance);
          }
          if (true) {
            popWarningContext();
          }
        }
      };
      const effect2 = instance.effect = new ReactiveEffect(
        componentUpdateFn,
        NOOP,
        () => queueJob(update),
        instance.scope
      );
      const update = instance.update = () => {
        if (effect2.dirty) {
          effect2.run();
        }
      };
      update.i = instance;
      update.id = instance.uid;
      toggleRecurse(instance, true);
      if (true) {
        effect2.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
        effect2.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
      }
      update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
      nextVNode.component = instance;
      const prevProps = instance.vnode.props;
      instance.vnode = nextVNode;
      instance.next = null;
      updateProps(instance, nextVNode.props, prevProps, optimized);
      updateSlots(instance, nextVNode.children, optimized);
      pauseTracking();
      flushPreFlushCbs(instance);
      resetTracking();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
      const c1 = n1 && n1.children;
      const prevShapeFlag = n1 ? n1.shapeFlag : 0;
      const c2 = n2.children;
      const { patchFlag, shapeFlag } = n2;
      if (patchFlag > 0) {
        if (patchFlag & 128) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        } else if (patchFlag & 256) {
          patchUnkeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          return;
        }
      }
      if (shapeFlag & 8) {
        if (prevShapeFlag & 16) {
          unmountChildren(c1, parentComponent, parentSuspense);
        }
        if (c2 !== c1) {
          hostSetElementText(container, c2);
        }
      } else {
        if (prevShapeFlag & 16) {
          if (shapeFlag & 16) {
            patchKeyedChildren(
              c1,
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else {
            unmountChildren(c1, parentComponent, parentSuspense, true);
          }
        } else {
          if (prevShapeFlag & 8) {
            hostSetElementText(container, "");
          }
          if (shapeFlag & 16) {
            mountChildren(
              c2,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          }
        }
      }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      c1 = c1 || EMPTY_ARR;
      c2 = c2 || EMPTY_ARR;
      const oldLength = c1.length;
      const newLength = c2.length;
      const commonLength = Math.min(oldLength, newLength);
      let i;
      for (i = 0; i < commonLength; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        patch(
          c1[i],
          nextChild,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
      if (oldLength > newLength) {
        unmountChildren(
          c1,
          parentComponent,
          parentSuspense,
          true,
          false,
          commonLength
        );
      } else {
        mountChildren(
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized,
          commonLength
        );
      }
    };
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
      let i = 0;
      const l2 = c2.length;
      let e1 = c1.length - 1;
      let e2 = l2 - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
        if (isSameVNodeType(n1, n2)) {
          patch(
            n1,
            n2,
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
          while (i <= e2) {
            patch(
              null,
              c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            i++;
          }
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i], parentComponent, parentSuspense, true);
          i++;
        }
      } else {
        const s1 = i;
        const s2 = i;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        for (i = s2; i <= e2; i++) {
          const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
          if (nextChild.key != null) {
            if (keyToNewIndexMap.has(nextChild.key)) {
              warn$1(
                `Duplicate keys found during update:`,
                JSON.stringify(nextChild.key),
                `Make sure keys are unique.`
              );
            }
            keyToNewIndexMap.set(nextChild.key, i);
          }
        }
        let j;
        let patched = 0;
        const toBePatched = e2 - s2 + 1;
        let moved = false;
        let maxNewIndexSoFar = 0;
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (i = 0; i < toBePatched; i++)
          newIndexToOldIndexMap[i] = 0;
        for (i = s1; i <= e1; i++) {
          const prevChild = c1[i];
          if (patched >= toBePatched) {
            unmount(prevChild, parentComponent, parentSuspense, true);
            continue;
          }
          let newIndex;
          if (prevChild.key != null) {
            newIndex = keyToNewIndexMap.get(prevChild.key);
          } else {
            for (j = s2; j <= e2; j++) {
              if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
                newIndex = j;
                break;
              }
            }
          }
          if (newIndex === void 0) {
            unmount(prevChild, parentComponent, parentSuspense, true);
          } else {
            newIndexToOldIndexMap[newIndex - s2] = i + 1;
            if (newIndex >= maxNewIndexSoFar) {
              maxNewIndexSoFar = newIndex;
            } else {
              moved = true;
            }
            patch(
              prevChild,
              c2[newIndex],
              container,
              null,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
            patched++;
          }
        }
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
        j = increasingNewIndexSequence.length - 1;
        for (i = toBePatched - 1; i >= 0; i--) {
          const nextIndex = s2 + i;
          const nextChild = c2[nextIndex];
          const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
          if (newIndexToOldIndexMap[i] === 0) {
            patch(
              null,
              nextChild,
              container,
              anchor,
              parentComponent,
              parentSuspense,
              namespace,
              slotScopeIds,
              optimized
            );
          } else if (moved) {
            if (j < 0 || i !== increasingNewIndexSequence[j]) {
              move(nextChild, container, anchor, 2);
            } else {
              j--;
            }
          }
        }
      }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
      const { el, type, transition, children, shapeFlag } = vnode;
      if (shapeFlag & 6) {
        move(vnode.component.subTree, container, anchor, moveType);
        return;
      }
      if (shapeFlag & 128) {
        vnode.suspense.move(container, anchor, moveType);
        return;
      }
      if (shapeFlag & 64) {
        type.move(vnode, container, anchor, internals);
        return;
      }
      if (type === Fragment) {
        hostInsert(el, container, anchor);
        for (let i = 0; i < children.length; i++) {
          move(children[i], container, anchor, moveType);
        }
        hostInsert(vnode.anchor, container, anchor);
        return;
      }
      if (type === Static) {
        moveStaticNode(vnode, container, anchor);
        return;
      }
      const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
      if (needTransition2) {
        if (moveType === 0) {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        } else {
          const { leave, delayLeave, afterLeave } = transition;
          const remove22 = () => hostInsert(el, container, anchor);
          const performLeave = () => {
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          };
          if (delayLeave) {
            delayLeave(el, remove22, performLeave);
          } else {
            performLeave();
          }
        }
      } else {
        hostInsert(el, container, anchor);
      }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
      const {
        type,
        props,
        ref: ref2,
        children,
        dynamicChildren,
        shapeFlag,
        patchFlag,
        dirs,
        cacheIndex
      } = vnode;
      if (patchFlag === -2) {
        optimized = false;
      }
      if (ref2 != null) {
        setRef(ref2, null, parentSuspense, vnode, true);
      }
      if (cacheIndex != null) {
        parentComponent.renderCache[cacheIndex] = void 0;
      }
      if (shapeFlag & 256) {
        parentComponent.ctx.deactivate(vnode);
        return;
      }
      const shouldInvokeDirs = shapeFlag & 1 && dirs;
      const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
      let vnodeHook;
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
      if (shapeFlag & 6) {
        unmountComponent(vnode.component, parentSuspense, doRemove);
      } else {
        if (shapeFlag & 128) {
          vnode.suspense.unmount(parentSuspense, doRemove);
          return;
        }
        if (shouldInvokeDirs) {
          invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
        }
        if (shapeFlag & 64) {
          vnode.type.remove(
            vnode,
            parentComponent,
            parentSuspense,
            internals,
            doRemove
          );
        } else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
          unmountChildren(
            dynamicChildren,
            parentComponent,
            parentSuspense,
            false,
            true
          );
        } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
          unmountChildren(children, parentComponent, parentSuspense);
        }
        if (doRemove) {
          remove2(vnode);
        }
      }
      if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
        queuePostRenderEffect(() => {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        }, parentSuspense);
      }
    };
    const remove2 = (vnode) => {
      const { type, el, anchor, transition } = vnode;
      if (type === Fragment) {
        if (vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) {
          vnode.children.forEach((child) => {
            if (child.type === Comment) {
              hostRemove(child.el);
            } else {
              remove2(child);
            }
          });
        } else {
          removeFragment(el, anchor);
        }
        return;
      }
      if (type === Static) {
        removeStaticNode(vnode);
        return;
      }
      const performRemove = () => {
        hostRemove(el);
        if (transition && !transition.persisted && transition.afterLeave) {
          transition.afterLeave();
        }
      };
      if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
        const { leave, delayLeave } = transition;
        const performLeave = () => leave(el, performRemove);
        if (delayLeave) {
          delayLeave(vnode.el, performRemove, performLeave);
        } else {
          performLeave();
        }
      } else {
        performRemove();
      }
    };
    const removeFragment = (cur, end) => {
      let next;
      while (cur !== end) {
        next = hostNextSibling(cur);
        hostRemove(cur);
        cur = next;
      }
      hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
      if (instance.type.__hmrId) {
        unregisterHMR(instance);
      }
      const { bum, scope, update, subTree, um, m, a } = instance;
      invalidateMount(m);
      invalidateMount(a);
      if (bum) {
        invokeArrayFns(bum);
      }
      scope.stop();
      if (update) {
        update.active = false;
        unmount(subTree, instance, parentSuspense, doRemove);
      }
      if (um) {
        queuePostRenderEffect(um, parentSuspense);
      }
      queuePostRenderEffect(() => {
        instance.isUnmounted = true;
      }, parentSuspense);
      if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
        parentSuspense.deps--;
        if (parentSuspense.deps === 0) {
          parentSuspense.resolve();
        }
      }
      if (true) {
        devtoolsComponentRemoved(instance);
      }
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
      for (let i = start; i < children.length; i++) {
        unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
      }
    };
    const getNextHostNode = (vnode) => {
      if (vnode.shapeFlag & 6) {
        return getNextHostNode(vnode.component.subTree);
      }
      if (vnode.shapeFlag & 128) {
        return vnode.suspense.next();
      }
      const el = hostNextSibling(vnode.anchor || vnode.el);
      const teleportEnd = el && el[TeleportEndKey];
      return teleportEnd ? hostNextSibling(teleportEnd) : el;
    };
    let isFlushing2 = false;
    const render3 = (vnode, container, namespace) => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
        }
      } else {
        patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
        );
      }
      container._vnode = vnode;
      if (!isFlushing2) {
        isFlushing2 = true;
        flushPreFlushCbs();
        flushPostFlushCbs();
        isFlushing2 = false;
      }
    };
    const internals = {
      p: patch,
      um: unmount,
      m: move,
      r: remove2,
      mt: mountComponent,
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      n: getNextHostNode,
      o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
      [hydrate, hydrateNode] = createHydrationFns(
        internals
      );
    }
    return {
      render: render3,
      hydrate,
      createApp: createAppAPI(render3, hydrate)
    };
  }
  function resolveChildrenNamespace({ type, props }, currentNamespace) {
    return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
  }
  function toggleRecurse({ effect: effect2, update }, allowed) {
    effect2.allowRecurse = update.allowRecurse = allowed;
  }
  function needTransition(parentSuspense, transition) {
    return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
  }
  function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if (isArray(ch1) && isArray(ch2)) {
      for (let i = 0; i < ch1.length; i++) {
        const c1 = ch1[i];
        let c2 = ch2[i];
        if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
          if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
            c2 = ch2[i] = cloneIfMounted(ch2[i]);
            c2.el = c1.el;
          }
          if (!shallow && c2.patchFlag !== -2)
            traverseStaticChildren(c1, c2);
        }
        if (c2.type === Text) {
          c2.el = c1.el;
        }
        if (c2.type === Comment && !c2.el) {
          c2.el = c1.el;
        }
      }
    }
  }
  function getSequence(arr) {
    const p2 = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p2[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = u + v >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p2[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p2[v];
    }
    return result;
  }
  function locateNonHydratedAsyncRoot(instance) {
    const subComponent = instance.subTree.component;
    if (subComponent) {
      if (subComponent.asyncDep && !subComponent.asyncResolved) {
        return subComponent;
      } else {
        return locateNonHydratedAsyncRoot(subComponent);
      }
    }
  }
  function invalidateMount(hooks) {
    if (hooks) {
      for (let i = 0; i < hooks.length; i++)
        hooks[i].active = false;
    }
  }
  var ssrContextKey = Symbol.for("v-scx");
  var useSSRContext = () => {
    {
      const ctx2 = inject(ssrContextKey);
      if (!ctx2) {
        warn$1(
          `Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`
        );
      }
      return ctx2;
    }
  };
  var INITIAL_WATCHER_VALUE = {};
  function watch(source, cb, options) {
    if (!isFunction(cb)) {
      warn$1(
        `\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`
      );
    }
    return doWatch(source, cb, options);
  }
  function doWatch(source, cb, {
    immediate,
    deep,
    flush,
    once,
    onTrack,
    onTrigger
  } = EMPTY_OBJ) {
    if (cb && once) {
      const _cb = cb;
      cb = (...args) => {
        _cb(...args);
        unwatch();
      };
    }
    if (deep !== void 0 && typeof deep === "number") {
      warn$1(
        `watch() "deep" option with number value will be used as watch depth in future versions. Please use a boolean instead to avoid potential breakage.`
      );
    }
    if (!cb) {
      if (immediate !== void 0) {
        warn$1(
          `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
      if (deep !== void 0) {
        warn$1(
          `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
      if (once !== void 0) {
        warn$1(
          `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
        );
      }
    }
    const warnInvalidSource = (s) => {
      warn$1(
        `Invalid watch source: `,
        s,
        `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
      );
    };
    const instance = currentInstance;
    const reactiveGetter = (source2) => deep === true ? source2 : traverse(source2, deep === false ? 1 : void 0);
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef2(source)) {
      getter = () => source.value;
      forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
      getter = () => reactiveGetter(source);
      forceTrigger = true;
    } else if (isArray(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
      getter = () => source.map((s) => {
        if (isRef2(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return reactiveGetter(s);
        } else if (isFunction(s)) {
          return callWithErrorHandling(s, instance, 2);
        } else {
          warnInvalidSource(s);
        }
      });
    } else if (isFunction(source)) {
      if (cb) {
        getter = () => callWithErrorHandling(source, instance, 2);
      } else {
        getter = () => {
          if (cleanup) {
            cleanup();
          }
          return callWithAsyncErrorHandling(
            source,
            instance,
            3,
            [onCleanup]
          );
        };
      }
    } else {
      getter = NOOP;
      warnInvalidSource(source);
    }
    if (cb && deep) {
      const baseGetter = getter;
      getter = () => traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn) => {
      cleanup = effect2.onStop = () => {
        callWithErrorHandling(fn, instance, 4);
        cleanup = effect2.onStop = void 0;
      };
    };
    let ssrCleanup;
    if (isInSSRComponentSetup) {
      onCleanup = NOOP;
      if (!cb) {
        getter();
      } else if (immediate) {
        callWithAsyncErrorHandling(cb, instance, 3, [
          getter(),
          isMultiSource ? [] : void 0,
          onCleanup
        ]);
      }
      if (flush === "sync") {
        const ctx2 = useSSRContext();
        ssrCleanup = ctx2.__watcherHandles || (ctx2.__watcherHandles = []);
      } else {
        return NOOP;
      }
    }
    let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    const job = () => {
      if (!effect2.active || !effect2.dirty) {
        return;
      }
      if (cb) {
        const newValue = effect2.run();
        if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
          if (cleanup) {
            cleanup();
          }
          callWithAsyncErrorHandling(cb, instance, 3, [
            newValue,
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            onCleanup
          ]);
          oldValue = newValue;
        }
      } else {
        effect2.run();
      }
    };
    job.allowRecurse = !!cb;
    let scheduler;
    if (flush === "sync") {
      scheduler = job;
    } else if (flush === "post") {
      scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
    } else {
      job.pre = true;
      if (instance)
        job.id = instance.uid;
      scheduler = () => queueJob(job);
    }
    const effect2 = new ReactiveEffect(getter, NOOP, scheduler);
    const scope = getCurrentScope();
    const unwatch = () => {
      effect2.stop();
      if (scope) {
        remove(scope.effects, effect2);
      }
    };
    if (true) {
      effect2.onTrack = onTrack;
      effect2.onTrigger = onTrigger;
    }
    if (cb) {
      if (immediate) {
        job();
      } else {
        oldValue = effect2.run();
      }
    } else if (flush === "post") {
      queuePostRenderEffect(
        effect2.run.bind(effect2),
        instance && instance.suspense
      );
    } else {
      effect2.run();
    }
    if (ssrCleanup)
      ssrCleanup.push(unwatch);
    return unwatch;
  }
  function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
    let cb;
    if (isFunction(value)) {
      cb = value;
    } else {
      cb = value.handler;
      options = value;
    }
    const reset = setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    reset();
    return res;
  }
  function createPathGetter(ctx2, path) {
    const segments = path.split(".");
    return () => {
      let cur = ctx2;
      for (let i = 0; i < segments.length && cur; i++) {
        cur = cur[segments[i]];
      }
      return cur;
    };
  }
  function traverse(value, depth = Infinity, seen) {
    if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
      return value;
    }
    seen = seen || /* @__PURE__ */ new Set();
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
    depth--;
    if (isRef2(value)) {
      traverse(value.value, depth, seen);
    } else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], depth, seen);
      }
    } else if (isSet(value) || isMap(value)) {
      value.forEach((v) => {
        traverse(v, depth, seen);
      });
    } else if (isPlainObject(value)) {
      for (const key in value) {
        traverse(value[key], depth, seen);
      }
      for (const key of Object.getOwnPropertySymbols(value)) {
        if (Object.prototype.propertyIsEnumerable.call(value, key)) {
          traverse(value[key], depth, seen);
        }
      }
    }
    return value;
  }
  var getModelModifiers = (props, modelName) => {
    return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
  };
  function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted)
      return;
    const props = instance.vnode.props || EMPTY_OBJ;
    if (true) {
      const {
        emitsOptions,
        propsOptions: [propsOptions]
      } = instance;
      if (emitsOptions) {
        if (!(event in emitsOptions) && true) {
          if (!propsOptions || !(toHandlerKey(camelize(event)) in propsOptions)) {
            warn$1(
              `Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`
            );
          }
        } else {
          const validator = emitsOptions[event];
          if (isFunction(validator)) {
            const isValid = validator(...rawArgs);
            if (!isValid) {
              warn$1(
                `Invalid event arguments: event validation failed for event "${event}".`
              );
            }
          }
        }
      }
    }
    let args = rawArgs;
    const isModelListener2 = event.startsWith("update:");
    const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
    if (modifiers) {
      if (modifiers.trim) {
        args = rawArgs.map((a) => isString(a) ? a.trim() : a);
      }
      if (modifiers.number) {
        args = rawArgs.map(looseToNumber);
      }
    }
    if (true) {
      devtoolsComponentEmit(instance, event, args);
    }
    if (true) {
      const lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
        warn$1(
          `Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(
            instance,
            instance.type
          )} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(
            event
          )}" instead of "${event}".`
        );
      }
    }
    let handlerName;
    let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
    if (!handler && isModelListener2) {
      handler = props[handlerName = toHandlerKey(hyphenate(event))];
    }
    if (handler) {
      callWithAsyncErrorHandling(
        handler,
        instance,
        6,
        args
      );
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
      if (!instance.emitted) {
        instance.emitted = {};
      } else if (instance.emitted[handlerName]) {
        return;
      }
      instance.emitted[handlerName] = true;
      callWithAsyncErrorHandling(
        onceHandler,
        instance,
        6,
        args
      );
    }
  }
  function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== void 0) {
      return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    let hasExtends = false;
    if (!isFunction(comp)) {
      const extendEmits = (raw2) => {
        const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
        if (normalizedFromExtend) {
          hasExtends = true;
          extend(normalized, normalizedFromExtend);
        }
      };
      if (!asMixin && appContext.mixins.length) {
        appContext.mixins.forEach(extendEmits);
      }
      if (comp.extends) {
        extendEmits(comp.extends);
      }
      if (comp.mixins) {
        comp.mixins.forEach(extendEmits);
      }
    }
    if (!raw && !hasExtends) {
      if (isObject(comp)) {
        cache.set(comp, null);
      }
      return null;
    }
    if (isArray(raw)) {
      raw.forEach((key) => normalized[key] = null);
    } else {
      extend(normalized, raw);
    }
    if (isObject(comp)) {
      cache.set(comp, normalized);
    }
    return normalized;
  }
  function isEmitListener(options, key) {
    if (!options || !isOn(key)) {
      return false;
    }
    key = key.slice(2).replace(/Once$/, "");
    return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
  }
  var accessedAttrs = false;
  function markAttrsAccessed() {
    accessedAttrs = true;
  }
  function renderComponentRoot(instance) {
    const {
      type: Component,
      vnode,
      proxy,
      withProxy,
      propsOptions: [propsOptions],
      slots,
      attrs,
      emit: emit2,
      render: render3,
      renderCache,
      props,
      data,
      setupState,
      ctx: ctx2,
      inheritAttrs
    } = instance;
    const prev = setCurrentRenderingInstance(instance);
    let result;
    let fallthroughAttrs;
    if (true) {
      accessedAttrs = false;
    }
    try {
      if (vnode.shapeFlag & 4) {
        const proxyToUse = withProxy || proxy;
        const thisProxy = setupState.__isScriptSetup ? new Proxy(proxyToUse, {
          get(target, key, receiver) {
            warn$1(
              `Property '${String(
                key
              )}' was accessed via 'this'. Avoid using 'this' in templates.`
            );
            return Reflect.get(target, key, receiver);
          }
        }) : proxyToUse;
        result = normalizeVNode(
          render3.call(
            thisProxy,
            proxyToUse,
            renderCache,
            true ? shallowReadonly(props) : props,
            setupState,
            data,
            ctx2
          )
        );
        fallthroughAttrs = attrs;
      } else {
        const render22 = Component;
        if (attrs === props) {
          markAttrsAccessed();
        }
        result = normalizeVNode(
          render22.length > 1 ? render22(
            true ? shallowReadonly(props) : props,
            true ? {
              get attrs() {
                markAttrsAccessed();
                return shallowReadonly(attrs);
              },
              slots,
              emit: emit2
            } : { attrs, slots, emit: emit2 }
          ) : render22(
            true ? shallowReadonly(props) : props,
            null
          )
        );
        fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
      }
    } catch (err) {
      blockStack.length = 0;
      handleError(err, instance, 1);
      result = createVNode(Comment);
    }
    let root = result;
    let setRoot = void 0;
    if (result.patchFlag > 0 && result.patchFlag & 2048) {
      [root, setRoot] = getChildRoot(result);
    }
    if (fallthroughAttrs && inheritAttrs !== false) {
      const keys = Object.keys(fallthroughAttrs);
      const { shapeFlag } = root;
      if (keys.length) {
        if (shapeFlag & (1 | 6)) {
          if (propsOptions && keys.some(isModelListener)) {
            fallthroughAttrs = filterModelListeners(
              fallthroughAttrs,
              propsOptions
            );
          }
          root = cloneVNode(root, fallthroughAttrs, false, true);
        } else if (!accessedAttrs && root.type !== Comment) {
          const allAttrs = Object.keys(attrs);
          const eventAttrs = [];
          const extraAttrs = [];
          for (let i = 0, l = allAttrs.length; i < l; i++) {
            const key = allAttrs[i];
            if (isOn(key)) {
              if (!isModelListener(key)) {
                eventAttrs.push(key[2].toLowerCase() + key.slice(3));
              }
            } else {
              extraAttrs.push(key);
            }
          }
          if (extraAttrs.length) {
            warn$1(
              `Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes.`
            );
          }
          if (eventAttrs.length) {
            warn$1(
              `Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
            );
          }
        }
      }
    }
    if (vnode.dirs) {
      if (!isElementRoot(root)) {
        warn$1(
          `Runtime directive used on component with non-element root node. The directives will not function as intended.`
        );
      }
      root = cloneVNode(root, null, false, true);
      root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    if (vnode.transition) {
      if (!isElementRoot(root)) {
        warn$1(
          `Component inside <Transition> renders non-element root node that cannot be animated.`
        );
      }
      root.transition = vnode.transition;
    }
    if (setRoot) {
      setRoot(root);
    } else {
      result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
  }
  var getChildRoot = (vnode) => {
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren, false);
    if (!childRoot) {
      return [vnode, void 0];
    } else if (childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) {
      return getChildRoot(childRoot);
    }
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot) => {
      rawChildren[index] = updatedRoot;
      if (dynamicChildren) {
        if (dynamicIndex > -1) {
          dynamicChildren[dynamicIndex] = updatedRoot;
        } else if (updatedRoot.patchFlag > 0) {
          vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
        }
      }
    };
    return [normalizeVNode(childRoot), setRoot];
  };
  function filterSingleRoot(children, recurse = true) {
    let singleRoot;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isVNode(child)) {
        if (child.type !== Comment || child.children === "v-if") {
          if (singleRoot) {
            return;
          } else {
            singleRoot = child;
            if (recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) {
              return filterSingleRoot(singleRoot.children);
            }
          }
        }
      } else {
        return;
      }
    }
    return singleRoot;
  }
  var getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
      if (key === "class" || key === "style" || isOn(key)) {
        (res || (res = {}))[key] = attrs[key];
      }
    }
    return res;
  };
  var filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
      if (!isModelListener(key) || !(key.slice(9) in props)) {
        res[key] = attrs[key];
      }
    }
    return res;
  };
  var isElementRoot = (vnode) => {
    return vnode.shapeFlag & (6 | 1) || vnode.type === Comment;
  };
  function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    if ((prevChildren || nextChildren) && isHmrUpdating) {
      return true;
    }
    if (nextVNode.dirs || nextVNode.transition) {
      return true;
    }
    if (optimized && patchFlag >= 0) {
      if (patchFlag & 1024) {
        return true;
      }
      if (patchFlag & 16) {
        if (!prevProps) {
          return !!nextProps;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
      } else if (patchFlag & 8) {
        const dynamicProps = nextVNode.dynamicProps;
        for (let i = 0; i < dynamicProps.length; i++) {
          const key = dynamicProps[i];
          if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
            return true;
          }
        }
      }
    } else {
      if (prevChildren || nextChildren) {
        if (!nextChildren || !nextChildren.$stable) {
          return true;
        }
      }
      if (prevProps === nextProps) {
        return false;
      }
      if (!prevProps) {
        return !!nextProps;
      }
      if (!nextProps) {
        return true;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
  }
  function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
        return true;
      }
    }
    return false;
  }
  function updateHOCHostEl({ vnode, parent }, el) {
    while (parent) {
      const root = parent.subTree;
      if (root.suspense && root.suspense.activeBranch === vnode) {
        root.el = vnode.el;
      }
      if (root === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
      } else {
        break;
      }
    }
  }
  var isSuspense = (type) => type.__isSuspense;
  function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
      if (isArray(fn)) {
        suspense.effects.push(...fn);
      } else {
        suspense.effects.push(fn);
      }
    } else {
      queuePostFlushCb(fn);
    }
  }
  var Fragment = Symbol.for("v-fgt");
  var Text = Symbol.for("v-txt");
  var Comment = Symbol.for("v-cmt");
  var Static = Symbol.for("v-stc");
  var blockStack = [];
  var currentBlock = null;
  function openBlock(disableTracking = false) {
    blockStack.push(currentBlock = disableTracking ? null : []);
  }
  function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
  }
  var isBlockTreeEnabled = 1;
  function setBlockTracking(value) {
    isBlockTreeEnabled += value;
    if (value < 0 && currentBlock) {
      currentBlock.hasOnce = true;
    }
  }
  function setupBlock(vnode) {
    vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
    closeBlock();
    if (isBlockTreeEnabled > 0 && currentBlock) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(
      createBaseVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        shapeFlag,
        true
      )
    );
  }
  function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(
      createVNode(
        type,
        props,
        children,
        patchFlag,
        dynamicProps,
        true
      )
    );
  }
  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }
  function isSameVNodeType(n1, n2) {
    if (n2.shapeFlag & 6 && n1.component) {
      const dirtyInstances = hmrDirtyComponents.get(n2.type);
      if (dirtyInstances && dirtyInstances.has(n1.component)) {
        n1.shapeFlag &= ~256;
        n2.shapeFlag &= ~512;
        return false;
      }
    }
    return n1.type === n2.type && n1.key === n2.key;
  }
  var vnodeArgsTransformer;
  var createVNodeWithArgsTransform = (...args) => {
    return _createVNode(
      ...vnodeArgsTransformer ? vnodeArgsTransformer(args, currentRenderingInstance) : args
    );
  };
  var normalizeKey = ({ key }) => key != null ? key : null;
  var normalizeRef = ({
    ref: ref2,
    ref_key,
    ref_for
  }) => {
    if (typeof ref2 === "number") {
      ref2 = "" + ref2;
    }
    return ref2 != null ? isString(ref2) || isRef2(ref2) || isFunction(ref2) ? { i: currentRenderingInstance, r: ref2, k: ref_key, f: !!ref_for } : ref2 : null;
  };
  function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
      __v_isVNode: true,
      __v_skip: true,
      type,
      props,
      key: props && normalizeKey(props),
      ref: props && normalizeRef(props),
      scopeId: currentScopeId,
      slotScopeIds: null,
      children,
      component: null,
      suspense: null,
      ssContent: null,
      ssFallback: null,
      dirs: null,
      transition: null,
      el: null,
      anchor: null,
      target: null,
      targetStart: null,
      targetAnchor: null,
      staticCount: 0,
      shapeFlag,
      patchFlag,
      dynamicProps,
      dynamicChildren: null,
      appContext: null,
      ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
      normalizeChildren(vnode, children);
      if (shapeFlag & 128) {
        type.normalize(vnode);
      }
    } else if (children) {
      vnode.shapeFlag |= isString(children) ? 8 : 16;
    }
    if (vnode.key !== vnode.key) {
      warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  var createVNode = true ? createVNodeWithArgsTransform : _createVNode;
  function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
      if (!type) {
        warn$1(`Invalid vnode type when creating vnode: ${type}.`);
      }
      type = Comment;
    }
    if (isVNode(type)) {
      const cloned = cloneVNode(
        type,
        props,
        true
      );
      if (children) {
        normalizeChildren(cloned, children);
      }
      if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
        if (cloned.shapeFlag & 6) {
          currentBlock[currentBlock.indexOf(type)] = cloned;
        } else {
          currentBlock.push(cloned);
        }
      }
      cloned.patchFlag = -2;
      return cloned;
    }
    if (isClassComponent(type)) {
      type = type.__vccOpts;
    }
    if (props) {
      props = guardReactiveProps(props);
      let { class: klass, style } = props;
      if (klass && !isString(klass)) {
        props.class = normalizeClass(klass);
      }
      if (isObject(style)) {
        if (isProxy(style) && !isArray(style)) {
          style = extend({}, style);
        }
        props.style = normalizeStyle(style);
      }
    }
    const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
    if (shapeFlag & 4 && isProxy(type)) {
      type = toRaw(type);
      warn$1(
        `Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with \`markRaw\` or using \`shallowRef\` instead of \`ref\`.`,
        `
Component that was made reactive: `,
        type
      );
    }
    return createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      isBlockNode,
      true
    );
  }
  function guardReactiveProps(props) {
    if (!props)
      return null;
    return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
  }
  function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
    const { props, ref: ref2, patchFlag, children, transition } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
      __v_isVNode: true,
      __v_skip: true,
      type: vnode.type,
      props: mergedProps,
      key: mergedProps && normalizeKey(mergedProps),
      ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
      scopeId: vnode.scopeId,
      slotScopeIds: vnode.slotScopeIds,
      children: patchFlag === -1 && isArray(children) ? children.map(deepCloneVNode) : children,
      target: vnode.target,
      targetStart: vnode.targetStart,
      targetAnchor: vnode.targetAnchor,
      staticCount: vnode.staticCount,
      shapeFlag: vnode.shapeFlag,
      patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
      dynamicProps: vnode.dynamicProps,
      dynamicChildren: vnode.dynamicChildren,
      appContext: vnode.appContext,
      dirs: vnode.dirs,
      transition,
      component: vnode.component,
      suspense: vnode.suspense,
      ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
      ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
      el: vnode.el,
      anchor: vnode.anchor,
      ctx: vnode.ctx,
      ce: vnode.ce
    };
    if (transition && cloneTransition) {
      setTransitionHooks(
        cloned,
        transition.clone(cloned)
      );
    }
    return cloned;
  }
  function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if (isArray(vnode.children)) {
      cloned.children = vnode.children.map(deepCloneVNode);
    }
    return cloned;
  }
  function createTextVNode(text = " ", flag = 0) {
    return createVNode(Text, null, text, flag);
  }
  function createCommentVNode(text = "", asBlock = false) {
    return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
  }
  function normalizeVNode(child) {
    if (child == null || typeof child === "boolean") {
      return createVNode(Comment);
    } else if (isArray(child)) {
      return createVNode(
        Fragment,
        null,
        child.slice()
      );
    } else if (typeof child === "object") {
      return cloneIfMounted(child);
    } else {
      return createVNode(Text, null, String(child));
    }
  }
  function cloneIfMounted(child) {
    return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
  }
  function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
      children = null;
    } else if (isArray(children)) {
      type = 16;
    } else if (typeof children === "object") {
      if (shapeFlag & (1 | 64)) {
        const slot = children.default;
        if (slot) {
          slot._c && (slot._d = false);
          normalizeChildren(vnode, slot());
          slot._c && (slot._d = true);
        }
        return;
      } else {
        type = 32;
        const slotFlag = children._;
        if (!slotFlag && !isInternalObject(children)) {
          children._ctx = currentRenderingInstance;
        } else if (slotFlag === 3 && currentRenderingInstance) {
          if (currentRenderingInstance.slots._ === 1) {
            children._ = 1;
          } else {
            children._ = 2;
            vnode.patchFlag |= 1024;
          }
        }
      }
    } else if (isFunction(children)) {
      children = { default: children, _ctx: currentRenderingInstance };
      type = 32;
    } else {
      children = String(children);
      if (shapeFlag & 64) {
        type = 16;
        children = [createTextVNode(children)];
      } else {
        type = 8;
      }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
  }
  function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
      const toMerge = args[i];
      for (const key in toMerge) {
        if (key === "class") {
          if (ret.class !== toMerge.class) {
            ret.class = normalizeClass([ret.class, toMerge.class]);
          }
        } else if (key === "style") {
          ret.style = normalizeStyle([ret.style, toMerge.style]);
        } else if (isOn(key)) {
          const existing = ret[key];
          const incoming = toMerge[key];
          if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
            ret[key] = existing ? [].concat(existing, incoming) : incoming;
          }
        } else if (key !== "") {
          ret[key] = toMerge[key];
        }
      }
    }
    return ret;
  }
  function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7, [
      vnode,
      prevVNode
    ]);
  }
  var emptyAppContext = createAppContext();
  var uid = 0;
  function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
      uid: uid++,
      vnode,
      type,
      parent,
      appContext,
      root: null,
      next: null,
      subTree: null,
      effect: null,
      update: null,
      scope: new EffectScope(
        true
      ),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: parent ? parent.provides : Object.create(appContext.provides),
      accessCache: null,
      renderCache: [],
      components: null,
      directives: null,
      propsOptions: normalizePropsOptions(type, appContext),
      emitsOptions: normalizeEmitsOptions(type, appContext),
      emit: null,
      emitted: null,
      propsDefaults: EMPTY_OBJ,
      inheritAttrs: type.inheritAttrs,
      ctx: EMPTY_OBJ,
      data: EMPTY_OBJ,
      props: EMPTY_OBJ,
      attrs: EMPTY_OBJ,
      slots: EMPTY_OBJ,
      refs: EMPTY_OBJ,
      setupState: EMPTY_OBJ,
      setupContext: null,
      suspense,
      suspenseId: suspense ? suspense.pendingId : 0,
      asyncDep: null,
      asyncResolved: false,
      isMounted: false,
      isUnmounted: false,
      isDeactivated: false,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null
    };
    if (true) {
      instance.ctx = createDevRenderContext(instance);
    } else {
      instance.ctx = { _: instance };
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    if (vnode.ce) {
      vnode.ce(instance);
    }
    return instance;
  }
  var currentInstance = null;
  var getCurrentInstance = () => currentInstance || currentRenderingInstance;
  var internalSetCurrentInstance;
  var setInSSRSetupState;
  {
    const g = getGlobalThis();
    const registerGlobalSetter = (key, setter) => {
      let setters;
      if (!(setters = g[key]))
        setters = g[key] = [];
      setters.push(setter);
      return (v) => {
        if (setters.length > 1)
          setters.forEach((set2) => set2(v));
        else
          setters[0](v);
      };
    };
    internalSetCurrentInstance = registerGlobalSetter(
      `__VUE_INSTANCE_SETTERS__`,
      (v) => currentInstance = v
    );
    setInSSRSetupState = registerGlobalSetter(
      `__VUE_SSR_SETTERS__`,
      (v) => isInSSRComponentSetup = v
    );
  }
  var setCurrentInstance = (instance) => {
    const prev = currentInstance;
    internalSetCurrentInstance(instance);
    instance.scope.on();
    return () => {
      instance.scope.off();
      internalSetCurrentInstance(prev);
    };
  };
  var unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    internalSetCurrentInstance(null);
  };
  var isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
  function validateComponentName(name, { isNativeTag }) {
    if (isBuiltInTag(name) || isNativeTag(name)) {
      warn$1(
        "Do not use built-in or reserved HTML elements as component id: " + name
      );
    }
  }
  function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4;
  }
  var isInSSRComponentSetup = false;
  function setupComponent(instance, isSSR = false, optimized = false) {
    isSSR && setInSSRSetupState(isSSR);
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children, optimized);
    const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
    isSSR && setInSSRSetupState(false);
    return setupResult;
  }
  function setupStatefulComponent(instance, isSSR) {
    var _a;
    const Component = instance.type;
    if (true) {
      if (Component.name) {
        validateComponentName(Component.name, instance.appContext.config);
      }
      if (Component.components) {
        const names = Object.keys(Component.components);
        for (let i = 0; i < names.length; i++) {
          validateComponentName(names[i], instance.appContext.config);
        }
      }
      if (Component.directives) {
        const names = Object.keys(Component.directives);
        for (let i = 0; i < names.length; i++) {
          validateDirectiveName(names[i]);
        }
      }
      if (Component.compilerOptions && isRuntimeOnly()) {
        warn$1(
          `"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`
        );
      }
    }
    instance.accessCache = /* @__PURE__ */ Object.create(null);
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    if (true) {
      exposePropsOnRenderContext(instance);
    }
    const { setup } = Component;
    if (setup) {
      const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
      const reset = setCurrentInstance(instance);
      pauseTracking();
      const setupResult = callWithErrorHandling(
        setup,
        instance,
        0,
        [
          true ? shallowReadonly(instance.props) : instance.props,
          setupContext
        ]
      );
      resetTracking();
      reset();
      if (isPromise(setupResult)) {
        setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
        if (isSSR) {
          return setupResult.then((resolvedResult) => {
            handleSetupResult(instance, resolvedResult, isSSR);
          }).catch((e) => {
            handleError(e, instance, 0);
          });
        } else {
          instance.asyncDep = setupResult;
          if (!instance.suspense) {
            const name = (_a = Component.name) != null ? _a : "Anonymous";
            warn$1(
              `Component <${name}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
            );
          }
        }
      } else {
        handleSetupResult(instance, setupResult, isSSR);
      }
    } else {
      finishComponentSetup(instance, isSSR);
    }
  }
  function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
      if (instance.type.__ssrInlineRender) {
        instance.ssrRender = setupResult;
      } else {
        instance.render = setupResult;
      }
    } else if (isObject(setupResult)) {
      if (isVNode(setupResult)) {
        warn$1(
          `setup() should not return VNodes directly - return a render function instead.`
        );
      }
      if (true) {
        instance.devtoolsRawSetupState = setupResult;
      }
      instance.setupState = proxyRefs(setupResult);
      if (true) {
        exposeSetupStateOnRenderContext(instance);
      }
    } else if (setupResult !== void 0) {
      warn$1(
        `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
      );
    }
    finishComponentSetup(instance, isSSR);
  }
  var compile;
  var installWithProxy;
  var isRuntimeOnly = () => !compile;
  function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    if (!instance.render) {
      if (!isSSR && compile && !Component.render) {
        const template = Component.template || resolveMergedOptions(instance).template;
        if (template) {
          if (true) {
            startMeasure(instance, `compile`);
          }
          const { isCustomElement, compilerOptions } = instance.appContext.config;
          const { delimiters, compilerOptions: componentCompilerOptions } = Component;
          const finalCompilerOptions = extend(
            extend(
              {
                isCustomElement,
                delimiters
              },
              compilerOptions
            ),
            componentCompilerOptions
          );
          Component.render = compile(template, finalCompilerOptions);
          if (true) {
            endMeasure(instance, `compile`);
          }
        }
      }
      instance.render = Component.render || NOOP;
      if (installWithProxy) {
        installWithProxy(instance);
      }
    }
    if (true) {
      const reset = setCurrentInstance(instance);
      pauseTracking();
      try {
        applyOptions(instance);
      } finally {
        resetTracking();
        reset();
      }
    }
    if (!Component.render && instance.render === NOOP && !isSSR) {
      if (!compile && Component.template) {
        warn$1(
          `Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
        );
      } else {
        warn$1(`Component is missing template or render function: `, Component);
      }
    }
  }
  var attrsProxyHandlers = true ? {
    get(target, key) {
      markAttrsAccessed();
      track(target, "get", "");
      return target[key];
    },
    set() {
      warn$1(`setupContext.attrs is readonly.`);
      return false;
    },
    deleteProperty() {
      warn$1(`setupContext.attrs is readonly.`);
      return false;
    }
  } : {
    get(target, key) {
      track(target, "get", "");
      return target[key];
    }
  };
  function getSlotsProxy(instance) {
    return new Proxy(instance.slots, {
      get(target, key) {
        track(instance, "get", "$slots");
        return target[key];
      }
    });
  }
  function createSetupContext(instance) {
    const expose = (exposed) => {
      if (true) {
        if (instance.exposed) {
          warn$1(`expose() should be called only once per setup().`);
        }
        if (exposed != null) {
          let exposedType = typeof exposed;
          if (exposedType === "object") {
            if (isArray(exposed)) {
              exposedType = "array";
            } else if (isRef2(exposed)) {
              exposedType = "ref";
            }
          }
          if (exposedType !== "object") {
            warn$1(
              `expose() should be passed a plain object, received ${exposedType}.`
            );
          }
        }
      }
      instance.exposed = exposed || {};
    };
    if (true) {
      let attrsProxy;
      let slotsProxy;
      return Object.freeze({
        get attrs() {
          return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
        },
        get slots() {
          return slotsProxy || (slotsProxy = getSlotsProxy(instance));
        },
        get emit() {
          return (event, ...args) => instance.emit(event, ...args);
        },
        expose
      });
    } else {
      return {
        attrs: new Proxy(instance.attrs, attrsProxyHandlers),
        slots: instance.slots,
        emit: instance.emit,
        expose
      };
    }
  }
  function getComponentPublicInstance(instance) {
    if (instance.exposed) {
      return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
        get(target, key) {
          if (key in target) {
            return target[key];
          } else if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](instance);
          }
        },
        has(target, key) {
          return key in target || key in publicPropertiesMap;
        }
      }));
    } else {
      return instance.proxy;
    }
  }
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
  function getComponentName(Component, includeInferred = true) {
    return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
  }
  function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
      const match = Component.__file.match(/([^/\\]+)\.\w+$/);
      if (match) {
        name = match[1];
      }
    }
    if (!name && instance && instance.parent) {
      const inferFromRegistry = (registry) => {
        for (const key in registry) {
          if (registry[key] === Component) {
            return key;
          }
        }
      };
      name = inferFromRegistry(
        instance.components || instance.parent.type.components
      ) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
  }
  function isClassComponent(value) {
    return isFunction(value) && "__vccOpts" in value;
  }
  var computed2 = (getterOrOptions, debugOptions) => {
    const c = computed(getterOrOptions, debugOptions, isInSSRComponentSetup);
    if (true) {
      const i = getCurrentInstance();
      if (i && i.appContext.config.warnRecursiveComputed) {
        c._warnRecursive = true;
      }
    }
    return c;
  };
  function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  }
  function initCustomFormatter() {
    if (typeof window === "undefined") {
      return;
    }
    const vueStyle = { style: "color:#3ba776" };
    const numberStyle = { style: "color:#1677ff" };
    const stringStyle = { style: "color:#f5222d" };
    const keywordStyle = { style: "color:#eb2f96" };
    const formatter = {
      __vue_custom_formatter: true,
      header(obj) {
        if (!isObject(obj)) {
          return null;
        }
        if (obj.__isVue) {
          return ["div", vueStyle, `VueInstance`];
        } else if (isRef2(obj)) {
          return [
            "div",
            {},
            ["span", vueStyle, genRefFlag(obj)],
            "<",
            formatValue(obj.value),
            `>`
          ];
        } else if (isReactive(obj)) {
          return [
            "div",
            {},
            ["span", vueStyle, isShallow(obj) ? "ShallowReactive" : "Reactive"],
            "<",
            formatValue(obj),
            `>${isReadonly(obj) ? ` (readonly)` : ``}`
          ];
        } else if (isReadonly(obj)) {
          return [
            "div",
            {},
            ["span", vueStyle, isShallow(obj) ? "ShallowReadonly" : "Readonly"],
            "<",
            formatValue(obj),
            ">"
          ];
        }
        return null;
      },
      hasBody(obj) {
        return obj && obj.__isVue;
      },
      body(obj) {
        if (obj && obj.__isVue) {
          return [
            "div",
            {},
            ...formatInstance(obj.$)
          ];
        }
      }
    };
    function formatInstance(instance) {
      const blocks = [];
      if (instance.type.props && instance.props) {
        blocks.push(createInstanceBlock("props", toRaw(instance.props)));
      }
      if (instance.setupState !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock("setup", instance.setupState));
      }
      if (instance.data !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock("data", toRaw(instance.data)));
      }
      const computed3 = extractKeys(instance, "computed");
      if (computed3) {
        blocks.push(createInstanceBlock("computed", computed3));
      }
      const injected = extractKeys(instance, "inject");
      if (injected) {
        blocks.push(createInstanceBlock("injected", injected));
      }
      blocks.push([
        "div",
        {},
        [
          "span",
          {
            style: keywordStyle.style + ";opacity:0.66"
          },
          "$ (internal): "
        ],
        ["object", { object: instance }]
      ]);
      return blocks;
    }
    function createInstanceBlock(type, target) {
      target = extend({}, target);
      if (!Object.keys(target).length) {
        return ["span", {}];
      }
      return [
        "div",
        { style: "line-height:1.25em;margin-bottom:0.6em" },
        [
          "div",
          {
            style: "color:#476582"
          },
          type
        ],
        [
          "div",
          {
            style: "padding-left:1.25em"
          },
          ...Object.keys(target).map((key) => {
            return [
              "div",
              {},
              ["span", keywordStyle, key + ": "],
              formatValue(target[key], false)
            ];
          })
        ]
      ];
    }
    function formatValue(v, asRaw = true) {
      if (typeof v === "number") {
        return ["span", numberStyle, v];
      } else if (typeof v === "string") {
        return ["span", stringStyle, JSON.stringify(v)];
      } else if (typeof v === "boolean") {
        return ["span", keywordStyle, v];
      } else if (isObject(v)) {
        return ["object", { object: asRaw ? toRaw(v) : v }];
      } else {
        return ["span", stringStyle, String(v)];
      }
    }
    function extractKeys(instance, type) {
      const Comp = instance.type;
      if (isFunction(Comp)) {
        return;
      }
      const extracted = {};
      for (const key in instance.ctx) {
        if (isKeyOfType(Comp, key, type)) {
          extracted[key] = instance.ctx[key];
        }
      }
      return extracted;
    }
    function isKeyOfType(Comp, key, type) {
      const opts = Comp[type];
      if (isArray(opts) && opts.includes(key) || isObject(opts) && key in opts) {
        return true;
      }
      if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
        return true;
      }
      if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) {
        return true;
      }
    }
    function genRefFlag(v) {
      if (isShallow(v)) {
        return `ShallowRef`;
      }
      if (v.effect) {
        return `ComputedRef`;
      }
      return `Ref`;
    }
    if (window.devtoolsFormatters) {
      window.devtoolsFormatters.push(formatter);
    } else {
      window.devtoolsFormatters = [formatter];
    }
  }
  var version = "3.4.38";
  var warn2 = true ? warn$1 : NOOP;

  // ../erpnext_taskview/node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
  var svgNS = "http://www.w3.org/2000/svg";
  var mathmlNS = "http://www.w3.org/1998/Math/MathML";
  var doc = typeof document !== "undefined" ? document : null;
  var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
  var nodeOps = {
    insert: (child, parent, anchor) => {
      parent.insertBefore(child, anchor || null);
    },
    remove: (child) => {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    createElement: (tag, namespace, is, props) => {
      const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
      if (tag === "select" && props && props.multiple != null) {
        el.setAttribute("multiple", props.multiple);
      }
      return el;
    },
    createText: (text) => doc.createTextNode(text),
    createComment: (text) => doc.createComment(text),
    setText: (node, text) => {
      node.nodeValue = text;
    },
    setElementText: (el, text) => {
      el.textContent = text;
    },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => doc.querySelector(selector),
    setScopeId(el, id) {
      el.setAttribute(id, "");
    },
    insertStaticContent(content, parent, anchor, namespace, start, end) {
      const before = anchor ? anchor.previousSibling : parent.lastChild;
      if (start && (start === end || start.nextSibling)) {
        while (true) {
          parent.insertBefore(start.cloneNode(true), anchor);
          if (start === end || !(start = start.nextSibling))
            break;
        }
      } else {
        templateContainer.innerHTML = namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content;
        const template = templateContainer.content;
        if (namespace === "svg" || namespace === "mathml") {
          const wrapper = template.firstChild;
          while (wrapper.firstChild) {
            template.appendChild(wrapper.firstChild);
          }
          template.removeChild(wrapper);
        }
        parent.insertBefore(template, anchor);
      }
      return [
        before ? before.nextSibling : parent.firstChild,
        anchor ? anchor.previousSibling : parent.lastChild
      ];
    }
  };
  var TRANSITION = "transition";
  var ANIMATION = "animation";
  var vtcKey = Symbol("_vtc");
  var Transition = (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots);
  Transition.displayName = "Transition";
  var DOMTransitionPropsValidators = {
    name: String,
    type: String,
    css: {
      type: Boolean,
      default: true
    },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String
  };
  var TransitionPropsValidators = Transition.props = /* @__PURE__ */ extend(
    {},
    BaseTransitionPropsValidators,
    DOMTransitionPropsValidators
  );
  var callHook2 = (hook, args = []) => {
    if (isArray(hook)) {
      hook.forEach((h2) => h2(...args));
    } else if (hook) {
      hook(...args);
    }
  };
  var hasExplicitCallback = (hook) => {
    return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
  };
  function resolveTransitionProps(rawProps) {
    const baseProps = {};
    for (const key in rawProps) {
      if (!(key in DOMTransitionPropsValidators)) {
        baseProps[key] = rawProps[key];
      }
    }
    if (rawProps.css === false) {
      return baseProps;
    }
    const {
      name = "v",
      type,
      duration,
      enterFromClass = `${name}-enter-from`,
      enterActiveClass = `${name}-enter-active`,
      enterToClass = `${name}-enter-to`,
      appearFromClass = enterFromClass,
      appearActiveClass = enterActiveClass,
      appearToClass = enterToClass,
      leaveFromClass = `${name}-leave-from`,
      leaveActiveClass = `${name}-leave-active`,
      leaveToClass = `${name}-leave-to`
    } = rawProps;
    const durations = normalizeDuration(duration);
    const enterDuration = durations && durations[0];
    const leaveDuration = durations && durations[1];
    const {
      onBeforeEnter,
      onEnter,
      onEnterCancelled,
      onLeave,
      onLeaveCancelled,
      onBeforeAppear = onBeforeEnter,
      onAppear = onEnter,
      onAppearCancelled = onEnterCancelled
    } = baseProps;
    const finishEnter = (el, isAppear, done) => {
      removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
      removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
      done && done();
    };
    const finishLeave = (el, done) => {
      el._isLeaving = false;
      removeTransitionClass(el, leaveFromClass);
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
      done && done();
    };
    const makeEnterHook = (isAppear) => {
      return (el, done) => {
        const hook = isAppear ? onAppear : onEnter;
        const resolve2 = () => finishEnter(el, isAppear, done);
        callHook2(hook, [el, resolve2]);
        nextFrame(() => {
          removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
          addTransitionClass(el, isAppear ? appearToClass : enterToClass);
          if (!hasExplicitCallback(hook)) {
            whenTransitionEnds(el, type, enterDuration, resolve2);
          }
        });
      };
    };
    return extend(baseProps, {
      onBeforeEnter(el) {
        callHook2(onBeforeEnter, [el]);
        addTransitionClass(el, enterFromClass);
        addTransitionClass(el, enterActiveClass);
      },
      onBeforeAppear(el) {
        callHook2(onBeforeAppear, [el]);
        addTransitionClass(el, appearFromClass);
        addTransitionClass(el, appearActiveClass);
      },
      onEnter: makeEnterHook(false),
      onAppear: makeEnterHook(true),
      onLeave(el, done) {
        el._isLeaving = true;
        const resolve2 = () => finishLeave(el, done);
        addTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveActiveClass);
        forceReflow();
        nextFrame(() => {
          if (!el._isLeaving) {
            return;
          }
          removeTransitionClass(el, leaveFromClass);
          addTransitionClass(el, leaveToClass);
          if (!hasExplicitCallback(onLeave)) {
            whenTransitionEnds(el, type, leaveDuration, resolve2);
          }
        });
        callHook2(onLeave, [el, resolve2]);
      },
      onEnterCancelled(el) {
        finishEnter(el, false);
        callHook2(onEnterCancelled, [el]);
      },
      onAppearCancelled(el) {
        finishEnter(el, true);
        callHook2(onAppearCancelled, [el]);
      },
      onLeaveCancelled(el) {
        finishLeave(el);
        callHook2(onLeaveCancelled, [el]);
      }
    });
  }
  function normalizeDuration(duration) {
    if (duration == null) {
      return null;
    } else if (isObject(duration)) {
      return [NumberOf(duration.enter), NumberOf(duration.leave)];
    } else {
      const n = NumberOf(duration);
      return [n, n];
    }
  }
  function NumberOf(val) {
    const res = toNumber(val);
    if (true) {
      assertNumber(res, "<transition> explicit duration");
    }
    return res;
  }
  function addTransitionClass(el, cls) {
    cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
    (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
  }
  function removeTransitionClass(el, cls) {
    cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
    const _vtc = el[vtcKey];
    if (_vtc) {
      _vtc.delete(cls);
      if (!_vtc.size) {
        el[vtcKey] = void 0;
      }
    }
  }
  function nextFrame(cb) {
    requestAnimationFrame(() => {
      requestAnimationFrame(cb);
    });
  }
  var endId = 0;
  function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
    const id = el._endId = ++endId;
    const resolveIfNotStale = () => {
      if (id === el._endId) {
        resolve2();
      }
    };
    if (explicitTimeout) {
      return setTimeout(resolveIfNotStale, explicitTimeout);
    }
    const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
    if (!type) {
      return resolve2();
    }
    const endEvent = type + "end";
    let ended = 0;
    const end = () => {
      el.removeEventListener(endEvent, onEnd);
      resolveIfNotStale();
    };
    const onEnd = (e) => {
      if (e.target === el && ++ended >= propCount) {
        end();
      }
    };
    setTimeout(() => {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(endEvent, onEnd);
  }
  function getTransitionInfo(el, expectedType) {
    const styles = window.getComputedStyle(el);
    const getStyleProperties = (key) => (styles[key] || "").split(", ");
    const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
    const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
    const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
    const animationTimeout = getTimeout(animationDelays, animationDurations);
    let type = null;
    let timeout = 0;
    let propCount = 0;
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
      propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
    }
    const hasTransform = type === TRANSITION && /\b(transform|all)(,|$)/.test(
      getStyleProperties(`${TRANSITION}Property`).toString()
    );
    return {
      type,
      timeout,
      propCount,
      hasTransform
    };
  }
  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }
    return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
  }
  function toMs(s) {
    if (s === "auto")
      return 0;
    return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
  }
  function forceReflow() {
    return document.body.offsetHeight;
  }
  function patchClass(el, value, isSVG) {
    const transitionClasses = el[vtcKey];
    if (transitionClasses) {
      value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
    }
    if (value == null) {
      el.removeAttribute("class");
    } else if (isSVG) {
      el.setAttribute("class", value);
    } else {
      el.className = value;
    }
  }
  var vShowOriginalDisplay = Symbol("_vod");
  var vShowHidden = Symbol("_vsh");
  var vShow = {
    beforeMount(el, { value }, { transition }) {
      el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
      if (transition && value) {
        transition.beforeEnter(el);
      } else {
        setDisplay(el, value);
      }
    },
    mounted(el, { value }, { transition }) {
      if (transition && value) {
        transition.enter(el);
      }
    },
    updated(el, { value, oldValue }, { transition }) {
      if (!value === !oldValue)
        return;
      if (transition) {
        if (value) {
          transition.beforeEnter(el);
          setDisplay(el, true);
          transition.enter(el);
        } else {
          transition.leave(el, () => {
            setDisplay(el, false);
          });
        }
      } else {
        setDisplay(el, value);
      }
    },
    beforeUnmount(el, { value }) {
      setDisplay(el, value);
    }
  };
  if (true) {
    vShow.name = "show";
  }
  function setDisplay(el, value) {
    el.style.display = value ? el[vShowOriginalDisplay] : "none";
    el[vShowHidden] = !value;
  }
  var CSS_VAR_TEXT = Symbol(true ? "CSS_VAR_TEXT" : "");
  var displayRE = /(^|;)\s*display\s*:/;
  function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString(next);
    let hasControlledDisplay = false;
    if (next && !isCssString) {
      if (prev) {
        if (!isString(prev)) {
          for (const key in prev) {
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        } else {
          for (const prevStyle of prev.split(";")) {
            const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
            if (next[key] == null) {
              setStyle(style, key, "");
            }
          }
        }
      }
      for (const key in next) {
        if (key === "display") {
          hasControlledDisplay = true;
        }
        setStyle(style, key, next[key]);
      }
    } else {
      if (isCssString) {
        if (prev !== next) {
          const cssVarText = style[CSS_VAR_TEXT];
          if (cssVarText) {
            next += ";" + cssVarText;
          }
          style.cssText = next;
          hasControlledDisplay = displayRE.test(next);
        }
      } else if (prev) {
        el.removeAttribute("style");
      }
    }
    if (vShowOriginalDisplay in el) {
      el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
      if (el[vShowHidden]) {
        style.display = "none";
      }
    }
  }
  var semicolonRE = /[^\\];\s*$/;
  var importantRE = /\s*!important$/;
  function setStyle(style, name, val) {
    if (isArray(val)) {
      val.forEach((v) => setStyle(style, name, v));
    } else {
      if (val == null)
        val = "";
      if (true) {
        if (semicolonRE.test(val)) {
          warn2(
            `Unexpected semicolon at the end of '${name}' style value: '${val}'`
          );
        }
      }
      if (name.startsWith("--")) {
        style.setProperty(name, val);
      } else {
        const prefixed = autoPrefix(style, name);
        if (importantRE.test(val)) {
          style.setProperty(
            hyphenate(prefixed),
            val.replace(importantRE, ""),
            "important"
          );
        } else {
          style[prefixed] = val;
        }
      }
    }
  }
  var prefixes = ["Webkit", "Moz", "ms"];
  var prefixCache = {};
  function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
      return cached;
    }
    let name = camelize(rawName);
    if (name !== "filter" && name in style) {
      return prefixCache[rawName] = name;
    }
    name = capitalize(name);
    for (let i = 0; i < prefixes.length; i++) {
      const prefixed = prefixes[i] + name;
      if (prefixed in style) {
        return prefixCache[rawName] = prefixed;
      }
    }
    return rawName;
  }
  var xlinkNS = "http://www.w3.org/1999/xlink";
  function patchAttr(el, key, value, isSVG, instance, isBoolean2 = isSpecialBooleanAttr(key)) {
    if (isSVG && key.startsWith("xlink:")) {
      if (value == null) {
        el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(
          key,
          isBoolean2 ? "" : isSymbol(value) ? String(value) : value
        );
      }
    }
  }
  function patchDOMProp(el, key, value, parentComponent) {
    if (key === "innerHTML" || key === "textContent") {
      if (value == null)
        return;
      el[key] = value;
      return;
    }
    const tag = el.tagName;
    if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
      const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
      const newValue = value == null ? "" : String(value);
      if (oldValue !== newValue || !("_value" in el)) {
        el.value = newValue;
      }
      if (value == null) {
        el.removeAttribute(key);
      }
      el._value = value;
      return;
    }
    let needRemove = false;
    if (value === "" || value == null) {
      const type = typeof el[key];
      if (type === "boolean") {
        value = includeBooleanAttr(value);
      } else if (value == null && type === "string") {
        value = "";
        needRemove = true;
      } else if (type === "number") {
        value = 0;
        needRemove = true;
      }
    }
    try {
      el[key] = value;
    } catch (e) {
      if (!needRemove) {
        warn2(
          `Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`,
          e
        );
      }
    }
    needRemove && el.removeAttribute(key);
  }
  function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
  }
  function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
  }
  var veiKey = Symbol("_vei");
  function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    const invokers = el[veiKey] || (el[veiKey] = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
      existingInvoker.value = true ? sanitizeEventValue(nextValue, rawName) : nextValue;
    } else {
      const [name, options] = parseName(rawName);
      if (nextValue) {
        const invoker = invokers[rawName] = createInvoker(
          true ? sanitizeEventValue(nextValue, rawName) : nextValue,
          instance
        );
        addEventListener(el, name, invoker, options);
      } else if (existingInvoker) {
        removeEventListener(el, name, existingInvoker, options);
        invokers[rawName] = void 0;
      }
    }
  }
  var optionsModifierRE = /(?:Once|Passive|Capture)$/;
  function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
      options = {};
      let m;
      while (m = name.match(optionsModifierRE)) {
        name = name.slice(0, name.length - m[0].length);
        options[m[0].toLowerCase()] = true;
      }
    }
    const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
    return [event, options];
  }
  var cachedNow = 0;
  var p = /* @__PURE__ */ Promise.resolve();
  var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
  function createInvoker(initialValue, instance) {
    const invoker = (e) => {
      if (!e._vts) {
        e._vts = Date.now();
      } else if (e._vts <= invoker.attached) {
        return;
      }
      callWithAsyncErrorHandling(
        patchStopImmediatePropagation(e, invoker.value),
        instance,
        5,
        [e]
      );
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
  }
  function sanitizeEventValue(value, propName) {
    if (isFunction(value) || isArray(value)) {
      return value;
    }
    warn2(
      `Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`
    );
    return NOOP;
  }
  function patchStopImmediatePropagation(e, value) {
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      return value.map(
        (fn) => (e2) => !e2._stopped && fn && fn(e2)
      );
    } else {
      return value;
    }
  }
  var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
  var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
    const isSVG = namespace === "svg";
    if (key === "class") {
      patchClass(el, nextValue, isSVG);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (isOn(key)) {
      if (!isModelListener(key)) {
        patchEvent(el, key, prevValue, nextValue, parentComponent);
      }
    } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
      patchDOMProp(el, key, nextValue);
      if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
        patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
      }
    } else {
      if (key === "true-value") {
        el._trueValue = nextValue;
      } else if (key === "false-value") {
        el._falseValue = nextValue;
      }
      patchAttr(el, key, nextValue, isSVG);
    }
  };
  function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
      if (key === "innerHTML" || key === "textContent") {
        return true;
      }
      if (key in el && isNativeOn(key) && isFunction(value)) {
        return true;
      }
      return false;
    }
    if (key === "spellcheck" || key === "draggable" || key === "translate") {
      return false;
    }
    if (key === "form") {
      return false;
    }
    if (key === "list" && el.tagName === "INPUT") {
      return false;
    }
    if (key === "type" && el.tagName === "TEXTAREA") {
      return false;
    }
    if (key === "width" || key === "height") {
      const tag = el.tagName;
      if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
        return false;
      }
    }
    if (isNativeOn(key) && isString(value)) {
      return false;
    }
    return key in el;
  }
  var positionMap = /* @__PURE__ */ new WeakMap();
  var newPositionMap = /* @__PURE__ */ new WeakMap();
  var moveCbKey = Symbol("_moveCb");
  var enterCbKey2 = Symbol("_enterCb");
  var TransitionGroupImpl = {
    name: "TransitionGroup",
    props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
      tag: String,
      moveClass: String
    }),
    setup(props, { slots }) {
      const instance = getCurrentInstance();
      const state = useTransitionState();
      let prevChildren;
      let children;
      onUpdated(() => {
        if (!prevChildren.length) {
          return;
        }
        const moveClass = props.moveClass || `${props.name || "v"}-move`;
        if (!hasCSSTransform(
          prevChildren[0].el,
          instance.vnode.el,
          moveClass
        )) {
          return;
        }
        prevChildren.forEach(callPendingCbs);
        prevChildren.forEach(recordPosition);
        const movedChildren = prevChildren.filter(applyTranslation);
        forceReflow();
        movedChildren.forEach((c) => {
          const el = c.el;
          const style = el.style;
          addTransitionClass(el, moveClass);
          style.transform = style.webkitTransform = style.transitionDuration = "";
          const cb = el[moveCbKey] = (e) => {
            if (e && e.target !== el) {
              return;
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener("transitionend", cb);
              el[moveCbKey] = null;
              removeTransitionClass(el, moveClass);
            }
          };
          el.addEventListener("transitionend", cb);
        });
      });
      return () => {
        const rawProps = toRaw(props);
        const cssTransitionProps = resolveTransitionProps(rawProps);
        let tag = rawProps.tag || Fragment;
        prevChildren = [];
        if (children) {
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.el && child.el instanceof Element) {
              prevChildren.push(child);
              setTransitionHooks(
                child,
                resolveTransitionHooks(
                  child,
                  cssTransitionProps,
                  state,
                  instance
                )
              );
              positionMap.set(
                child,
                child.el.getBoundingClientRect()
              );
            }
          }
        }
        children = slots.default ? getTransitionRawChildren(slots.default()) : [];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.key != null) {
            setTransitionHooks(
              child,
              resolveTransitionHooks(child, cssTransitionProps, state, instance)
            );
          } else if (true) {
            warn2(`<TransitionGroup> children must be keyed.`);
          }
        }
        return createVNode(tag, null, children);
      };
    }
  };
  var removeMode = (props) => delete props.mode;
  /* @__PURE__ */ removeMode(TransitionGroupImpl.props);
  function callPendingCbs(c) {
    const el = c.el;
    if (el[moveCbKey]) {
      el[moveCbKey]();
    }
    if (el[enterCbKey2]) {
      el[enterCbKey2]();
    }
  }
  function recordPosition(c) {
    newPositionMap.set(c, c.el.getBoundingClientRect());
  }
  function applyTranslation(c) {
    const oldPos = positionMap.get(c);
    const newPos = newPositionMap.get(c);
    const dx = oldPos.left - newPos.left;
    const dy = oldPos.top - newPos.top;
    if (dx || dy) {
      const s = c.el.style;
      s.transform = s.webkitTransform = `translate(${dx}px,${dy}px)`;
      s.transitionDuration = "0s";
      return c;
    }
  }
  function hasCSSTransform(el, root, moveClass) {
    const clone = el.cloneNode();
    const _vtc = el[vtcKey];
    if (_vtc) {
      _vtc.forEach((cls) => {
        cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
      });
    }
    moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
    clone.style.display = "none";
    const container = root.nodeType === 1 ? root : root.parentNode;
    container.appendChild(clone);
    const { hasTransform } = getTransitionInfo(clone);
    container.removeChild(clone);
    return hasTransform;
  }
  var getModelAssigner = (vnode) => {
    const fn = vnode.props["onUpdate:modelValue"] || false;
    return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
  };
  function onCompositionStart(e) {
    e.target.composing = true;
  }
  function onCompositionEnd(e) {
    const target = e.target;
    if (target.composing) {
      target.composing = false;
      target.dispatchEvent(new Event("input"));
    }
  }
  var assignKey = Symbol("_assign");
  var vModelText = {
    created(el, { modifiers: { lazy, trim, number } }, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      const castToNumber = number || vnode.props && vnode.props.type === "number";
      addEventListener(el, lazy ? "change" : "input", (e) => {
        if (e.target.composing)
          return;
        let domValue = el.value;
        if (trim) {
          domValue = domValue.trim();
        }
        if (castToNumber) {
          domValue = looseToNumber(domValue);
        }
        el[assignKey](domValue);
      });
      if (trim) {
        addEventListener(el, "change", () => {
          el.value = el.value.trim();
        });
      }
      if (!lazy) {
        addEventListener(el, "compositionstart", onCompositionStart);
        addEventListener(el, "compositionend", onCompositionEnd);
        addEventListener(el, "change", onCompositionEnd);
      }
    },
    mounted(el, { value }) {
      el.value = value == null ? "" : value;
    },
    beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      if (el.composing)
        return;
      const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
      const newValue = value == null ? "" : value;
      if (elValue === newValue) {
        return;
      }
      if (document.activeElement === el && el.type !== "range") {
        if (lazy && value === oldValue) {
          return;
        }
        if (trim && el.value.trim() === newValue) {
          return;
        }
      }
      el.value = newValue;
    }
  };
  var vModelCheckbox = {
    deep: true,
    created(el, _, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      addEventListener(el, "change", () => {
        const modelValue = el._modelValue;
        const elementValue = getValue(el);
        const checked = el.checked;
        const assign = el[assignKey];
        if (isArray(modelValue)) {
          const index = looseIndexOf(modelValue, elementValue);
          const found = index !== -1;
          if (checked && !found) {
            assign(modelValue.concat(elementValue));
          } else if (!checked && found) {
            const filtered = [...modelValue];
            filtered.splice(index, 1);
            assign(filtered);
          }
        } else if (isSet(modelValue)) {
          const cloned = new Set(modelValue);
          if (checked) {
            cloned.add(elementValue);
          } else {
            cloned.delete(elementValue);
          }
          assign(cloned);
        } else {
          assign(getCheckboxValue(el, checked));
        }
      });
    },
    mounted: setChecked,
    beforeUpdate(el, binding, vnode) {
      el[assignKey] = getModelAssigner(vnode);
      setChecked(el, binding, vnode);
    }
  };
  function setChecked(el, { value, oldValue }, vnode) {
    el._modelValue = value;
    if (isArray(value)) {
      el.checked = looseIndexOf(value, vnode.props.value) > -1;
    } else if (isSet(value)) {
      el.checked = value.has(vnode.props.value);
    } else if (value !== oldValue) {
      el.checked = looseEqual(value, getCheckboxValue(el, true));
    }
  }
  function getValue(el) {
    return "_value" in el ? el._value : el.value;
  }
  function getCheckboxValue(el, checked) {
    const key = checked ? "_trueValue" : "_falseValue";
    return key in el ? el[key] : checked;
  }
  var keyNames = {
    esc: "escape",
    space: " ",
    up: "arrow-up",
    left: "arrow-left",
    right: "arrow-right",
    down: "arrow-down",
    delete: "backspace"
  };
  var withKeys = (fn, modifiers) => {
    const cache = fn._withKeys || (fn._withKeys = {});
    const cacheKey = modifiers.join(".");
    return cache[cacheKey] || (cache[cacheKey] = (event) => {
      if (!("key" in event)) {
        return;
      }
      const eventKey = hyphenate(event.key);
      if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) {
        return fn(event);
      }
    });
  };
  var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
  var renderer;
  function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions));
  }
  var createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    if (true) {
      injectNativeTagCheck(app);
      injectCompilerOptionsCheck(app);
    }
    const { mount } = app;
    app.mount = (containerOrSelector) => {
      const container = normalizeContainer(containerOrSelector);
      if (!container)
        return;
      const component = app._component;
      if (!isFunction(component) && !component.render && !component.template) {
        component.template = container.innerHTML;
      }
      container.innerHTML = "";
      const proxy = mount(container, false, resolveRootNamespace(container));
      if (container instanceof Element) {
        container.removeAttribute("v-cloak");
        container.setAttribute("data-v-app", "");
      }
      return proxy;
    };
    return app;
  };
  function resolveRootNamespace(container) {
    if (container instanceof SVGElement) {
      return "svg";
    }
    if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
      return "mathml";
    }
  }
  function injectNativeTagCheck(app) {
    Object.defineProperty(app.config, "isNativeTag", {
      value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
      writable: false
    });
  }
  function injectCompilerOptionsCheck(app) {
    if (isRuntimeOnly()) {
      const isCustomElement = app.config.isCustomElement;
      Object.defineProperty(app.config, "isCustomElement", {
        get() {
          return isCustomElement;
        },
        set() {
          warn2(
            `The \`isCustomElement\` config option is deprecated. Use \`compilerOptions.isCustomElement\` instead.`
          );
        }
      });
      const compilerOptions = app.config.compilerOptions;
      const msg = `The \`compilerOptions\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, \`compilerOptions\` must be passed to \`@vue/compiler-dom\` in the build setup instead.
- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.
- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;
      Object.defineProperty(app.config, "compilerOptions", {
        get() {
          warn2(msg);
          return compilerOptions;
        },
        set() {
          warn2(msg);
        }
      });
    }
  }
  function normalizeContainer(container) {
    if (isString(container)) {
      const res = document.querySelector(container);
      if (!res) {
        warn2(
          `Failed to mount app: mount target selector "${container}" returned null.`
        );
      }
      return res;
    }
    if (window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") {
      warn2(
        `mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`
      );
    }
    return container;
  }

  // ../erpnext_taskview/node_modules/vue/dist/vue.runtime.esm-bundler.js
  function initDev() {
    {
      initCustomFormatter();
    }
  }
  if (true) {
    initDev();
  }

  // ../erpnext_taskview/node_modules/vue-demi/lib/index.mjs
  var isVue2 = false;
  var isVue3 = true;

  // ../erpnext_taskview/node_modules/@babel/runtime/helpers/esm/typeof.js
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }

  // ../erpnext_taskview/node_modules/@babel/runtime/helpers/esm/toPrimitive.js
  function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t)
      return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i))
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }

  // ../erpnext_taskview/node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }

  // ../erpnext_taskview/node_modules/@babel/runtime/helpers/esm/defineProperty.js
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }

  // ../erpnext_taskview/node_modules/helper-js/dist/index.esm.js
  function isArray2(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
  }
  function isObject2(v) {
    return Object.prototype.toString.call(v) === "[object Object]";
  }
  function isFunction2(v) {
    return typeof v === "function";
  }
  function notGreaterThan(n, max) {
    return n < max ? n : max;
  }
  function arrayRemove(arr, v) {
    let index;
    let count = 0;
    while ((index = arr.indexOf(v)) > -1) {
      arr.splice(index, 1);
      count++;
    }
    return count;
  }
  function arrayLast(arr) {
    return arr[arr.length - 1];
  }
  function toArrayIfNot(arrOrNot) {
    return isArray2(arrOrNot) ? arrOrNot : [arrOrNot];
  }
  function objectOnly(obj, keys) {
    let keysSet = new Set(keys);
    const r = {};
    keysSet.forEach((key) => {
      r[key] = obj[key];
    });
    return r;
  }
  function* iterateAll(val) {
    let opt = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!opt.reverse) {
      if (val.length != null) {
        for (let i = 0; i < val.length; i++) {
          const info = {
            value: val[i],
            index: i
          };
          if (!opt.exclude || !opt.exclude(info)) {
            yield info;
          }
        }
      } else if (isObject2(val)) {
        for (const key of Object.keys(val)) {
          const info = {
            value: val[key],
            key
          };
          if (!opt.exclude || !opt.exclude(info)) {
            yield info;
          }
        }
      } else {
        throw "Unsupported type";
      }
    } else {
      if (val.length != null) {
        for (let i = val.length - 1; i >= 0; i--) {
          const info = {
            value: val[i],
            index: i
          };
          if (!opt.exclude || !opt.exclude(info)) {
            yield info;
          }
        }
      } else if (isObject2(val)) {
        const keys = Object.keys(val);
        keys.reverse();
        for (const key of keys) {
          const info = {
            value: val[key],
            key
          };
          if (!opt.exclude || !opt.exclude(info)) {
            yield info;
          }
        }
      } else {
        throw "Unsupported type";
      }
    }
  }
  function assignIfNoKey(obj, key, val) {
    if (!obj.hasOwnProperty(key)) {
      obj[key] = val;
    }
  }
  function objectAssignIfNoKey(obj1, obj2) {
    Object.keys(obj2).forEach((key) => {
      assignIfNoKey(obj1, key, obj2[key]);
    });
    return obj1;
  }
  function withoutUndefined(obj) {
    const r = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== void 0) {
        r[key] = obj[key];
      }
    });
    return r;
  }
  function walkTreeData(obj, handler) {
    let opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    opt = objectAssignIfNoKey(__spreadValues({}, opt), {
      childrenKey: "children"
    });
    const {
      childrenKey
    } = opt;
    const rootChildren = isArray2(obj) ? obj : [obj];
    class StopException {
    }
    const func = (children, parent, parentPath) => {
      if (opt.reverse) {
        children = children.slice();
        children.reverse();
      }
      const len = children.length;
      for (let i = 0; i < len; i++) {
        const item = children[i];
        const index = opt.reverse ? len - i - 1 : i;
        const path = parentPath ? [...parentPath, index] : [];
        if (opt.childFirst) {
          if (item[childrenKey] != null) {
            func(item[childrenKey], item, path);
          }
        }
        const r = handler(item, index, parent, path);
        if (r === false) {
          throw new StopException();
        } else if (r === "skip children") {
          continue;
        } else if (r === "skip siblings") {
          break;
        }
        if (!opt.childFirst) {
          if (item[childrenKey] != null) {
            func(item[childrenKey], item, path);
          }
        }
      }
    };
    try {
      func(rootChildren, null, isArray2(obj) ? [] : null);
    } catch (e) {
      if (e instanceof StopException)
        ;
      else {
        throw e;
      }
    }
  }
  function findInfoInTreeData(obj, handler) {
    let opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    let r;
    walkTreeData(obj, function() {
      if (handler(...arguments)) {
        r = {
          node: arguments.length <= 0 ? void 0 : arguments[0],
          index: arguments.length <= 1 ? void 0 : arguments[1],
          parent: arguments.length <= 2 ? void 0 : arguments[2],
          path: arguments.length <= 3 ? void 0 : arguments[3]
        };
        return false;
      }
    }, opt);
    return r;
  }
  function findTreeData(obj, handler) {
    let opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const r = findInfoInTreeData(obj, handler, opt);
    return r === null || r === void 0 ? void 0 : r.node;
  }
  function cloneTreeData(root, options) {
    const opt = {
      childrenKey: "children"
    };
    if (options) {
      Object.assign(opt, options);
    }
    const {
      childrenKey,
      nodeHandler
    } = opt;
    const td = new TreeData();
    td.childrenKey = childrenKey;
    walkTreeData(root, (node, index, parent, path) => {
      let newNode = Object.assign({}, node);
      if (newNode[childrenKey]) {
        newNode[childrenKey] = [];
      }
      if (nodeHandler) {
        newNode = nodeHandler(newNode, {
          oldNode: node,
          index,
          parent,
          path
        });
      }
      td.set(path, newNode);
    }, {
      childrenKey
    });
    return td.data;
  }
  var TreeData = class {
    constructor() {
      let data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      _defineProperty(this, "data", void 0);
      _defineProperty(this, "childrenKey", "children");
      this.data = data;
    }
    get rootChildren() {
      const {
        childrenKey
      } = this;
      const {
        data
      } = this;
      return isArray2(data) ? data : data[childrenKey];
    }
    *iteratePath(path) {
      let opt = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      const {
        childrenKey,
        rootChildren
      } = this;
      if (!opt.reverse) {
        let prevPath = [];
        let prevChildren = rootChildren;
        for (const index of path) {
          const currentPath = [...prevPath, index];
          const currentNode = prevChildren[index];
          yield {
            path: currentPath,
            node: currentNode
          };
          prevPath = currentPath;
          prevChildren = currentNode[childrenKey];
        }
      } else {
        const list = [...this.iteratePath(path, __spreadProps(__spreadValues({}, opt), {
          reverse: false
        }))];
        list.reverse();
        for (const {
          path: path0,
          node
        } of list) {
          const path2 = path0;
          yield {
            path: path2,
            node
          };
        }
      }
    }
    getFamily(path) {
      const all = [];
      for (const {
        node
      } of this.iteratePath(path)) {
        all.push(node);
      }
      return all;
    }
    get(path) {
      return arrayLast(this.getFamily(path));
    }
    getParentAndIndex(path) {
      const parentPath = path.slice();
      const index = parentPath.pop();
      return {
        parent: this.get(parentPath),
        index,
        parentPath
      };
    }
    getParent(path) {
      return this.getParentAndIndex(path).parent;
    }
    set(path, node) {
      if (path == null || path.length === 0) {
        this.data = node;
      } else {
        const {
          childrenKey
        } = this;
        let {
          rootChildren
        } = this;
        const {
          parent,
          index
        } = this.getParentAndIndex(path);
        let parentChildren;
        if (path.length === 1) {
          if (!rootChildren) {
            if (this.data) {
              this.data[childrenKey] = [];
            } else {
              this.data = [];
            }
          }
          parentChildren = rootChildren;
        } else {
          if (!parent[childrenKey]) {
            parent[childrenKey] = [];
          }
          parentChildren = parent[childrenKey];
        }
        parentChildren[index] = node;
      }
    }
    delete(path) {
      const {
        childrenKey,
        rootChildren
      } = this;
      const {
        parent,
        index
      } = this.getParentAndIndex(path);
      const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
      const node = parentChildren[index];
      parentChildren.splice(index, 1);
      return node;
    }
    walk(handler, opt) {
      const {
        childrenKey,
        data
      } = this;
      return walkTreeData(data, handler, childrenKey, opt);
    }
    clone() {
      let opt = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      return cloneTreeData(this.data), withoutUndefined({
        childrenKey: this.childrenKey,
        nodeHandler: opt.nodeHandler || void 0
      });
    }
  };
  function resolveValueOrGettter(valueOrGetter) {
    let args = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    if (isFunction2(valueOrGetter)) {
      return valueOrGetter(...args);
    } else {
      return valueOrGetter;
    }
  }
  function applyFinally(func, finallyFunc) {
    const wrapped = function() {
      let r, e;
      try {
        r = func(...arguments);
      } catch (error) {
        e = error;
      } finally {
        finallyFunc();
      }
      if (!e) {
        return r;
      } else {
        throw e;
      }
    };
    return wrapped;
  }
  function cacheFunction(func) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const cachedArgsArr = [];
    let map2;
    const defaultValue = {};
    let noArgsCache = defaultValue;
    const wrapped = function() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      if (args.length === 0) {
        if (noArgsCache === defaultValue) {
          noArgsCache = func();
        }
        return noArgsCache;
      }
      if (!map2) {
        map2 = new ArrayKeyMap();
      }
      if (!map2.has(args)) {
        map2.set(args, func(...args));
        if (options.capacity != null) {
          cachedArgsArr.push(args);
          const removed = cachedArgsArr.splice(0, cachedArgsArr.length - options.capacity);
          for (const args2 of removed) {
            map2.delete(args2);
          }
        }
      }
      return map2.get(args);
    };
    const clearCache = () => {
      map2 = null;
      cachedArgsArr.splice(0, cachedArgsArr.length);
    };
    return {
      action: wrapped,
      clearCache
    };
  }
  function promisePin() {
    let resolve2, reject;
    const promise = new Promise((resolve22, reject2) => {
      resolve2 = resolve22;
      reject = reject2;
    });
    return {
      promise,
      resolve: resolve2,
      reject
    };
  }
  function isDescendantOf(el, parent) {
    while (true) {
      if (el.parentNode == null) {
        return false;
      } else if (el.parentNode === parent) {
        return true;
      } else {
        el = el.parentNode;
      }
    }
  }
  function getBoundingClientRect(el) {
    let xy = el.getBoundingClientRect();
    if (document.documentElement.clientTop > 0) {
      const top = xy.top - document.documentElement.clientTop, bottom = xy.bottom, left = xy.left - document.documentElement.clientLeft, right = xy.right, width = xy.width || right - left, height = xy.height || bottom - top;
      const x = left;
      const y = top;
      const json = {
        top,
        right,
        bottom,
        left,
        width,
        height,
        x,
        y
      };
      xy = __spreadProps(__spreadValues({}, json), {
        toJSON: () => json
      });
    }
    return xy;
  }
  function findParent(el, callback) {
    let opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    let cur = opt && opt.withSelf ? el : el.parentElement;
    while (cur) {
      const shouldBreak = opt.until && cur === opt.until;
      if (shouldBreak && !opt.withUntil) {
        return;
      }
      const r = callback(cur);
      if (r === "break") {
        return;
      } else if (r) {
        return cur;
      } else if (shouldBreak) {
        return;
      } else {
        cur = cur.parentElement;
      }
    }
  }
  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return new RegExp("(^| )" + className + "( |$)", "gi").test(el.className);
    }
  }
  function hasClassIn(el, classNames) {
    for (const className of classNames) {
      if (hasClass(el, className)) {
        return true;
      }
    }
    return false;
  }
  function on(el, name, handler, options) {
    if (el.addEventListener) {
      el.addEventListener(name, handler, options);
    } else if (el.attachEvent) {
      el.attachEvent("on".concat(name), handler, options);
    }
  }
  function off(el, name, handler, options) {
    if (el.removeEventListener) {
      el.removeEventListener(name, handler, options);
    } else if (el.detachEvent) {
      el.detachEvent("on".concat(name), handler, options);
    }
  }
  function extendedListen(info) {
    let destroyFuncs = [];
    const listenAll = () => {
      if (r.listening) {
        return;
      }
      for (const item of info) {
        on.apply(this, item);
        const destroy = () => off.apply(this, item);
        destroyFuncs.push(destroy);
      }
      r.listening = true;
    };
    const destroyAll = () => {
      if (!r.listening) {
        return;
      }
      for (const destroy of destroyFuncs) {
        destroy();
      }
      destroyFuncs = [];
      r.listening = false;
    };
    const r = {
      listening: false,
      stop: destroyAll,
      resume: listenAll,
      start: listenAll
    };
    r.start();
    return r;
  }
  function css(el, name) {
    const stl = getComputedStyle(el);
    return stl[name];
  }
  function binarySearch(arr, callback) {
    let opt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    opt = __spreadValues({
      start: 0,
      end: arr.length - 1,
      maxTimes: 1e3
    }, opt);
    let {
      start,
      end
    } = opt;
    const {
      returnNearestIfNoHit,
      maxTimes
    } = opt;
    let midNum;
    let mid;
    if (start == null) {
      start = 0;
      end = arr.length - 1;
    }
    let i = 0;
    let r;
    while (start >= 0 && start <= end) {
      if (i >= maxTimes) {
        throw Error("binarySearch: loop times is over ".concat(maxTimes, ", you can increase the limit."));
      }
      midNum = Math.floor((end - start) / 2 + start);
      mid = arr[midNum];
      const count = i + 1;
      r = callback(mid, midNum, count);
      if (r > 0) {
        end = midNum - 1;
      } else if (r < 0) {
        start = midNum + 1;
      } else {
        return {
          index: midNum,
          value: mid,
          count,
          hit: true
        };
      }
      i++;
    }
    return returnNearestIfNoHit ? {
      index: midNum,
      value: mid,
      count: i + 1,
      hit: false,
      greater: r > 0
    } : null;
  }
  function makeStorageHelper(storage) {
    return {
      storage,
      set(name, value, minutes) {
        if (value == null) {
          this.storage.removeItem(name);
        } else {
          this.storage.setItem(name, JSON.stringify({
            value,
            expired_at: minutes ? new Date().getTime() + minutes * 60 * 1e3 : null
          }));
        }
      },
      get(name) {
        let t = this.storage.getItem(name);
        if (t) {
          t = JSON.parse(t);
          if (!t.expired_at || t.expired_at > new Date().getTime()) {
            return t.value;
          } else {
            this.storage.removeItem(name);
          }
        }
        return null;
      },
      clear() {
        this.storage.clear();
      }
    };
  }
  var extendedLocalStorage = cacheFunction(function() {
    return makeStorageHelper(localStorage);
  });
  var extendedSessionStorage = cacheFunction(function() {
    return makeStorageHelper(sessionStorage);
  });
  var ArrayKeyMap = class {
    constructor() {
      _defineProperty(this, "_map", /* @__PURE__ */ new Map());
      _defineProperty(this, "_values", {});
      _defineProperty(this, "_objCount", 0);
    }
    _keysToString(keys) {
      const {
        _map
      } = this;
      let t = [];
      for (const key of keys) {
        if (!_map.has(key)) {
          return null;
        }
        t.push(_map.get(key)[0]);
      }
      return t.toString();
    }
    has(keys) {
      if (this._keysToString(keys) == null) {
        return false;
      }
      return true;
    }
    get(keys) {
      const {
        _values
      } = this;
      const key2 = this._keysToString(keys);
      if (key2 == null) {
        throw "Value not found by specified keys";
      }
      return _values[key2][1];
    }
    set(keys, value) {
      const {
        _map,
        _values
      } = this;
      let t = [];
      for (const key of keys) {
        let str;
        let count = 1;
        if (_map.has(key)) {
          [str, count] = _map.get(key);
          count++;
        } else {
          this._objCount++;
          str = this._objCount.toString();
        }
        _map.set(key, [str, count]);
        t.push(str);
      }
      _values[t.toString()] = [keys.slice(), value];
    }
    delete(keys) {
      const {
        _values,
        _map
      } = this;
      const key2 = this._keysToString(keys);
      if (key2 == null) {
        throw "Value not found by specified keys";
      }
      delete _values[key2];
      for (const key of keys) {
        let [str, count] = _map.get(key);
        count--;
        if (count === 0) {
          _map.delete(key);
        } else {
          _map.set(key, [str, count]);
        }
      }
    }
    clear() {
      this._map.clear();
      this._values = {};
    }
    *entries() {
      const {
        _values
      } = this;
      for (const key in _values) {
        const [keys, value] = _values[key];
        yield [keys, value];
      }
    }
    count() {
      return [...this.entries()].length;
    }
  };

  // ../erpnext_taskview/node_modules/@virtual-list/vue/dist/v3/index.es.js
  var _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  var _sfc_main$1 = defineComponent({
    props: {
      table: Boolean
    }
  });
  var _hoisted_1 = { key: 0 };
  var _hoisted_2 = { key: 1 };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return _ctx.table ? (openBlock(), createElementBlock("table", _hoisted_1, [
      renderSlot(_ctx.$slots, "prepend"),
      createBaseVNode("tbody", null, [
        renderSlot(_ctx.$slots, "default")
      ]),
      renderSlot(_ctx.$slots, "append")
    ])) : (openBlock(), createElementBlock("div", _hoisted_2, [
      renderSlot(_ctx.$slots, "prepend"),
      renderSlot(_ctx.$slots, "default"),
      renderSlot(_ctx.$slots, "append")
    ]));
  }
  var VirtualListTable = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1]]);
  var cpt = defineComponent({
    components: { VirtualListTable },
    props: {
      items: Array,
      disabled: Boolean,
      horizontal: Boolean,
      firstRender: { type: Number, default: 10 },
      buffer: { type: Number, default: 100 },
      itemKey: {
        type: [String, Function]
      },
      itemSize: {
        type: Function
      },
      table: Boolean
    },
    setup(props) {
      const start = ref(0);
      const end = ref(props.firstRender - 1);
      const end2 = computed2(() => {
        var _a;
        return notGreaterThan(end.value, (((_a = props.items) == null ? void 0 : _a.length) || 1) - 1);
      });
      const avgSize = ref(0);
      const startSize = computed2(() => positions.value[start.value] ? getPosition(start.value) : 0);
      const totalSize = computed2(() => positions.value.length > 0 ? getPosition(positions.value.length - 1) + arrayLast(sizes.value) : 0);
      const endSize = computed2(() => positions.value[end2.value] ? totalSize.value - getPosition(end2.value) - sizes.value[end2.value] : 0);
      const listStyle = computed2(() => !props.disabled ? { overflow: "auto" } : {});
      const listInnerStyle = computed2(() => {
        const r = {
          display: "flex"
        };
        if (!props.disabled) {
          if (!props.horizontal) {
            Object.assign(r, {
              "margin-top": startSize.value + "px",
              "margin-bottom": endSize.value + "px"
            });
          } else {
            Object.assign(r, {
              "margin-left": startSize.value + "px",
              "margin-right": endSize.value + "px",
              width: totalSize.value - endSize.value - startSize.value + "px"
            });
          }
        }
        r["flex-direction"] = !props.horizontal ? "column" : "row";
        if (props.table) {
          delete r.display;
          delete r["flex-direction"];
        }
        return r;
      });
      const runtimeSizes = computed2(() => reactive((props.items || []).map(() => null)));
      const sizes = computed2(() => (props.items || []).map((item, index) => {
        var _a;
        if (runtimeSizes[index] != null) {
          return runtimeSizes[index];
        }
        let r = (_a = props.itemSize) == null ? void 0 : _a.call(props, item, index);
        if (r == null) {
          r = avgSize.value;
        }
        return r;
      }));
      const positions = computed2(() => {
        const p2 = [];
        sizes.value.reduce((a, b) => {
          p2.push(a);
          return a + b;
        }, 0);
        return p2;
      });
      watch(() => props.items, update);
      const visibleItemsInfo = computed2(() => {
        if (!props.items || props.disabled) {
          return;
        }
        const r = [];
        for (let index = start.value; index <= end2.value; index++) {
          const item = props.items[index];
          if (!item) {
            break;
          }
          r.push({ item, index });
        }
        return r;
      });
      const listElRef = ref();
      const listInnerRef = ref();
      onMounted(async () => {
        update();
        try {
          createResizeObserver();
        } catch (error) {
          await nextTick();
          update();
        }
      });
      let prevScroll;
      function onscroll() {
        const listEl = listElRef.value;
        if (!listEl) {
          return;
        }
        const currentScroll = getScroll(listEl);
        if (prevScroll != null && props.buffer - Math.abs(currentScroll - prevScroll) >= 10) {
          return;
        }
        prevScroll = currentScroll;
        update();
      }
      let executing = false;
      let waiting = false;
      async function update() {
        var _a;
        if (executing) {
          waiting = true;
          return;
        }
        if (!props.items || props.disabled) {
          return;
        }
        executing = true;
        const listEl = listElRef.value;
        const listInner = (_a = listInnerRef.value) == null ? void 0 : _a.$el;
        if (!listEl || !listInner) {
          return;
        }
        if (!avgSize.value) {
          avgSize.value = getAvgSize();
        }
        start.value = getStart();
        end.value = getEnd();
        await nextTick();
        let updated;
        let vi0 = 0;
        const runtimeSizesTemp = {};
        const children = !props.table ? listInner.children : listInner.querySelector("tbody").children;
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          const cssPosition = css(el, "position");
          if (cssPosition && ["absolute", "fixed"].includes(cssPosition)) {
            continue;
          }
          const size2 = css(el, "display") !== "none" ? getOuterSize(el) : 0;
          const vi = el.getAttribute("vt-index");
          const index = vi ? parseInt(vi) : start.value + vi0;
          runtimeSizesTemp[index] = (runtimeSizesTemp[index] || 0) + size2;
          vi0++;
        }
        for (const indexS of Object.keys(runtimeSizesTemp)) {
          const index = parseInt(indexS);
          if (runtimeSizes.value[index] !== runtimeSizesTemp[index]) {
            runtimeSizes.value[index] = runtimeSizesTemp[index];
            updated = true;
          }
        }
        if (updated) {
          await nextTick();
        }
        executing = false;
        if (waiting) {
          waiting = false;
          update();
        }
        function getStart() {
          const startPosition = getScroll(listEl) - getPaddingStart(listEl) - props.buffer;
          const r = binarySearch(positions.value, (mid) => mid - startPosition, { returnNearestIfNoHit: true });
          return r.index;
        }
        function getEnd() {
          const endPosition = getScroll(listEl) - getPaddingStart(listEl) + getClientSize(listEl) + props.buffer;
          const r = binarySearch(positions.value, (mid) => mid - endPosition, { returnNearestIfNoHit: true });
          return r.index;
        }
        function getAvgSize() {
          const maxSampleCount = 10;
          const sizeArr = [];
          const children2 = !props.table ? listInner.children : listInner.querySelector("tbody").children;
          for (let index = 0; index < children2.length; index++) {
            const el = children2[index];
            const style = getComputedStyle(el);
            if (["absolute", "fixed"].includes(style.position)) {
              continue;
            }
            const outerSize = getOuterSize(el);
            sizeArr.push(outerSize);
            if (sizeArr.length >= maxSampleCount) {
              break;
            }
          }
          if (sizeArr.length === 0) {
            return 0;
          }
          return sizeArr.reduce((a, b) => a + b, 0) / sizeArr.length;
        }
      }
      function getClientSize(el) {
        const style = getComputedStyle(el);
        let r = parseFloat(!props.horizontal ? style.height : style.width);
        if (style.boxSizing === "border-box") {
          if (!props.horizontal) {
            r = r - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
          } else {
            r = r - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
          }
        }
        return r;
      }
      function getOuterSize(el) {
        let r = getClientSize(el);
        const style = getComputedStyle(el);
        if (!props.horizontal) {
          r += parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        } else {
          r += parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth) + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        }
        r = Number.isNaN(r) ? 0 : r;
        return r;
      }
      function getScroll(el) {
        return !props.horizontal ? el.scrollTop : el.scrollLeft;
      }
      function getPaddingStart(el) {
        const style = getComputedStyle(el);
        return !props.horizontal ? parseFloat(style.paddingTop) : parseFloat(style.paddingLeft);
      }
      function getPosition(index) {
        return positions.value[index];
      }
      function createResizeObserver() {
        const listEl = listElRef.value;
        const resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (hasClass(entry.target, "vtlist")) {
              update();
              break;
            }
          }
        });
        resizeObserver.observe(listEl);
      }
      function getItemKey(item, index) {
        if (props.itemKey) {
          if (typeof props.itemKey === "string" && props.itemKey === "index") {
            return index;
          } else if (typeof props.itemKey === "function") {
            return props.itemKey(item, index);
          }
        }
      }
      return {
        listElRef,
        listInnerRef,
        onscroll,
        listStyle,
        listInnerStyle,
        visibleItemsInfo,
        getItemKey,
        update,
        sizes,
        positions,
        runtimeSizes
      };
    }
  });
  var _sfc_main = cpt;
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_VirtualListTable = resolveComponent("VirtualListTable");
    return openBlock(), createElementBlock("div", {
      class: "vtlist",
      ref: "listElRef",
      style: normalizeStyle(_ctx.listStyle),
      onScrollPassive: _cache[0] || (_cache[0] = (...args) => _ctx.onscroll && _ctx.onscroll(...args))
    }, [
      createVNode(_component_VirtualListTable, {
        class: "vtlist-inner",
        ref: "listInnerRef",
        style: normalizeStyle(_ctx.listInnerStyle),
        table: _ctx.table
      }, {
        prepend: withCtx(() => [
          renderSlot(_ctx.$slots, "prepend")
        ]),
        append: withCtx(() => [
          renderSlot(_ctx.$slots, "append")
        ]),
        default: withCtx(() => [
          _ctx.disabled ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(_ctx.items, (item, index) => {
            return renderSlot(_ctx.$slots, "default", {
              key: _ctx.getItemKey(item, index),
              item,
              index
            });
          }), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(_ctx.visibleItemsInfo, ({ item, index }) => {
            return renderSlot(_ctx.$slots, "default", {
              key: _ctx.getItemKey(item, index),
              item,
              index
            });
          }), 128))
        ]),
        _: 3
      }, 8, ["style", "table"])
    ], 36);
  }
  var VirtualList = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);

  // ../erpnext_taskview/node_modules/@he-tree/tree-utils/dist/index.esm.js
  var CHILDREN = "children";
  function makeTreeProcessor(data) {
    let opt = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const opt2 = opt;
    const utilsBase = __spreadProps(__spreadValues(__spreadValues({}, defaultOptions), opt2), {
      data,
      stats: null,
      statsFlat: null,
      _statsMap: null,
      initialized: false,
      init() {
        const {
          data: data2,
          childrenKey
        } = this;
        const td = new TreeData([]);
        this._statsMap = /* @__PURE__ */ new Map();
        walkTreeData(data2, (nodeData, index, parent, path) => {
          const stat = this.statHandler(__spreadProps(__spreadValues({}, statDefault()), {
            data: nodeData,
            open: Boolean(this.defaultOpen),
            parent: td.getParent(path),
            children: [],
            level: path.length
          }));
          this._statsMap.set(nodeData, stat);
          td.set(path, stat);
        }, {
          childrenKey
        });
        const statsFlat = [];
        td.walk((stat) => {
          statsFlat.push(stat);
        });
        this.stats = this.statsHandler(td.rootChildren);
        this.statsFlat = this.statsFlatHandler(statsFlat);
        this.initialized = true;
      },
      getStat(nodeData) {
        let r = this._statsMap.get(nodeData);
        if (!r) {
          throw new StatNotFoundError("Stat not found");
        }
        return r;
      },
      has(nodeData) {
        if (nodeData["isStat"]) {
          return this.statsFlat.indexOf(nodeData) > -1;
        } else {
          try {
            let r = this.getStat(nodeData);
            return Boolean(r);
          } catch (error) {
            if (error instanceof StatNotFoundError) {
              return false;
            }
            throw error;
          }
        }
      },
      _getPathByStat(stat) {
        if (stat == null) {
          return [];
        }
        const siblings = this.getSiblings(stat);
        const index = siblings.indexOf(stat);
        return [...stat.parent ? this._getPathByStat(stat.parent) : [], index];
      },
      afterOneCheckChanged(stat) {
        const {
          checked
        } = stat;
        if (stat._ignoreCheckedOnce) {
          delete stat._ignoreCheckedOnce;
          return false;
        }
        const checkParent = (stat2) => {
          const {
            parent
          } = stat2;
          if (parent) {
            let hasChecked;
            let hasUnchecked;
            for (const child of parent.children) {
              if (child.checked || child.checked === 0) {
                hasChecked = true;
              } else {
                hasUnchecked = true;
                if (hasChecked && hasUnchecked) {
                  break;
                }
              }
            }
            const parentChecked = !hasUnchecked ? true : hasChecked ? 0 : false;
            if (parent.checked !== parentChecked) {
              this._ignoreCheckedOnce(parent);
              parent.checked = parentChecked;
            }
            checkParent(parent);
          }
        };
        checkParent(stat);
        walkTreeData(stat.children, (child) => {
          if (child.checked !== checked) {
            this._ignoreCheckedOnce(child);
            child.checked = checked;
          }
        }, {
          childrenKey: CHILDREN
        });
        return true;
      },
      _ignoreCheckedOnce(stat) {
        stat._ignoreCheckedOnce = true;
        setTimeout(() => {
          if (stat._ignoreCheckedOnce) {
            stat._ignoreCheckedOnce = false;
          }
        }, 100);
      },
      isVisible(statOrNodeData) {
        const stat = statOrNodeData["isStat"] ? statOrNodeData : this.getStat(statOrNodeData);
        const walk = (stat2) => {
          return !stat2 || !stat2.hidden && stat2.open && walk(stat2.parent);
        };
        return Boolean(!stat.hidden && walk(stat.parent));
      },
      updateCheck() {
        walkTreeData(this.stats, (stat) => {
          if (stat.children && stat.children.length > 0) {
            const checked = stat.children.every((v) => v.checked);
            if (stat.checked !== checked) {
              this._ignoreCheckedOnce(stat);
              stat.checked = checked;
            }
          }
        }, {
          childFirst: true,
          childrenKey: CHILDREN
        });
      },
      getChecked() {
        let withDemi = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
        return this.statsFlat.filter((v) => {
          return v.checked || withDemi && v.checked === 0;
        });
      },
      getUnchecked() {
        let withDemi = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
        return this.statsFlat.filter((v) => {
          return withDemi ? !v.checked : v.checked === false;
        });
      },
      openAll() {
        for (const stat of this.statsFlat) {
          stat.open = true;
        }
      },
      closeAll() {
        for (const stat of this.statsFlat) {
          stat.open = false;
        }
      },
      openNodeAndParents(nodeOrStat) {
        const stat = nodeOrStat["isStat"] ? nodeOrStat : this.getStat(nodeOrStat);
        for (const parentStat of this.iterateParent(stat, {
          withSelf: true
        })) {
          parentStat.open = true;
        }
      },
      _calcFlatIndex(parent, index) {
        let flatIndex = parent ? this.statsFlat.indexOf(parent) + 1 : 0;
        const siblings = parent ? parent.children : this.stats;
        for (let i = 0; i < index; i++) {
          flatIndex += this._count(siblings[i]);
        }
        return flatIndex;
      },
      add(nodeData, parent, index) {
        if (this.has(nodeData)) {
          throw "Can't add because data exists in tree";
        }
        const siblings = parent ? parent.children : this.stats;
        if (index == null) {
          index = siblings.length;
        }
        const stat = this.statHandler(__spreadProps(__spreadValues({}, statDefault()), {
          open: Boolean(this.defaultOpen),
          data: nodeData,
          parent: parent || null,
          children: [],
          level: parent ? parent.level + 1 : 1
        }));
        this._setPosition(stat, parent || null, index);
        const children = nodeData[this.childrenKey];
        if (children) {
          const childrenSnap = children.slice();
          for (const child of childrenSnap) {
            this.add(child, stat);
          }
        }
      },
      remove(stat) {
        const siblings = this.getSiblings(stat);
        if (siblings.includes(stat)) {
          arrayRemove(siblings, stat);
          const stats = this._flat(stat);
          this.statsFlat.splice(this.statsFlat.indexOf(stat), stats.length);
          for (const stat2 of stats) {
            this._statsMap.delete(stat2.data);
          }
          this.afterRemoveStat(stat);
          return true;
        }
        return false;
      },
      getSiblings(stat) {
        const {
          parent
        } = stat;
        return parent ? parent.children : this.stats;
      },
      _setPosition(stat, parent, index) {
        const siblings = parent ? parent.children : this.stats;
        siblings.splice(index, 0, stat);
        stat.parent = parent;
        stat.level = parent ? parent.level + 1 : 1;
        const flatIndex = this._calcFlatIndex(parent, index);
        const stats = this._flat(stat);
        this.statsFlat.splice(flatIndex, 0, ...stats);
        for (const stat2 of stats) {
          if (!this._statsMap.has(stat2.data)) {
            this._statsMap.set(stat2.data, stat2);
          }
        }
        walkTreeData(stat, (node, index2, parent2) => {
          if (parent2) {
            node.level = parent2.level + 1;
          }
        }, {
          childrenKey: CHILDREN
        });
        this.afterSetStat(stat, parent, index);
      },
      *iterateParent(stat, opt3) {
        let t = opt3 !== null && opt3 !== void 0 && opt3.withSelf ? stat : stat.parent;
        while (t) {
          yield t;
          t = t.parent;
        }
      },
      move(stat, parent, index) {
        if (this.has(stat)) {
          if (stat.parent === parent && this.getSiblings(stat).indexOf(stat) === index) {
            return false;
          }
          if (stat === parent) {
            throw new Error("Can't move node to it self");
          }
          if (parent && stat.level < parent.level) {
            let t;
            for (const item of this.iterateParent(parent)) {
              if (item.level === stat.level) {
                t = item;
                break;
              }
            }
            if (stat === t) {
              throw new Error("Can't move node to its descendant");
            }
          }
          this.remove(stat);
        }
        this._setPosition(stat, parent, index);
        return true;
      },
      _flat(stat) {
        const r = [];
        walkTreeData(stat, (child) => {
          r.push(child);
        }, {
          childrenKey: CHILDREN
        });
        return r;
      },
      _count(stat) {
        return this._flat(stat).length;
      },
      getData(filter2, root) {
        const {
          childrenKey
        } = this;
        const td = new TreeData([]);
        td.childrenKey = childrenKey;
        walkTreeData(root || this.stats, (stat, index, parent, path) => {
          let newData = __spreadProps(__spreadValues({}, stat.data), {
            [childrenKey]: []
          });
          if (filter2) {
            newData = filter2(newData);
          }
          td.set(path, newData);
        }, {
          childrenKey: CHILDREN
        });
        return td.data;
      }
    });
    const utils = utilsBase;
    if (!utilsBase.noInitialization) {
      utils.init();
    }
    return utils;
  }
  var defaultOptions = {
    childrenKey: "children",
    defaultOpen: false,
    statsHandler(stats) {
      return stats;
    },
    statsFlatHandler(statsFlat) {
      return statsFlat;
    },
    afterSetStat(stat, parent, index) {
    },
    afterRemoveStat(stat) {
    },
    statHandler(stat) {
      return stat;
    }
  };
  function statDefault() {
    return {
      isStat: true,
      hidden: false,
      checked: false,
      style: null,
      class: null,
      draggable: null,
      droppable: null
    };
  }
  var StatNotFoundError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "StatNotFoundError";
    }
  };

  // ../erpnext_taskview/node_modules/drag-event-service/dist/index.esm.js
  var events = {
    start: ["mousedown", "touchstart"],
    move: ["mousemove", "touchmove"],
    end: ["mouseup", "touchend"]
  };
  var DragEventService = {
    isTouch(e) {
      return e.type && e.type.startsWith("touch");
    },
    _getStore(el) {
      if (!el._wrapperStore) {
        el._wrapperStore = [];
      }
      return el._wrapperStore;
    },
    on(el, name, handler, options) {
      const {
        args,
        mouseArgs,
        touchArgs
      } = resolveOptions(options);
      const store = this._getStore(el);
      const ts = this;
      const wrapper = function(e) {
        let mouse;
        const isTouch = ts.isTouch(e);
        if (isTouch) {
          mouse = {
            x: e.changedTouches[0].pageX,
            y: e.changedTouches[0].pageY,
            pageX: e.changedTouches[0].pageX,
            pageY: e.changedTouches[0].pageY,
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY,
            screenX: e.changedTouches[0].screenX,
            screenY: e.changedTouches[0].screenY
          };
        } else {
          mouse = {
            x: e.pageX,
            y: e.pageY,
            pageX: e.pageX,
            pageY: e.pageY,
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: e.screenY
          };
          if (name === "start" && e.which !== 1) {
            return;
          }
        }
        return handler.call(this, e, mouse);
      };
      store.push({
        handler,
        wrapper
      });
      on.call(null, el, events[name][0], wrapper, ...[...args, ...mouseArgs]);
      on.call(null, el, events[name][1], wrapper, ...[...args, ...touchArgs]);
    },
    off(el, name, handler, options) {
      const {
        args,
        mouseArgs,
        touchArgs
      } = resolveOptions(options);
      const store = this._getStore(el);
      for (let i = store.length - 1; i >= 0; i--) {
        const {
          handler: handler2,
          wrapper
        } = store[i];
        if (handler === handler2) {
          off.call(null, el, events[name][0], wrapper, ...[...args, ...mouseArgs]);
          off.call(null, el, events[name][1], wrapper, ...[...args, ...mouseArgs]);
          store.splice(i, 1);
        }
      }
    }
  };
  function resolveOptions(options) {
    if (!options) {
      options = {};
    }
    const args = options.args || [];
    const mouseArgs = options.mouseArgs || [];
    const touchArgs = options.touchArgs || [];
    return {
      args,
      mouseArgs,
      touchArgs
    };
  }

  // ../erpnext_taskview/node_modules/@he-tree/dnd-utils/dist/index.esm.js
  var instances = /* @__PURE__ */ new Map();
  var context = {
    triggerElement: null,
    dragElement: null,
    internal: false,
    dropEffect: "none",
    preventDefault: false
  };
  var ctx = context;
  function syncDropEffect(e) {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = ctx.dropEffect;
    }
  }
  function extendedDND(root) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (instances.has(root)) {
      throw "Already registered on specified element";
    }
    const opt = __spreadValues({}, options);
    const ins = opt;
    objectAssignIfNoKey(opt, defaultOptions2);
    DragEventService.on(root, "start", beforeDragStart, {
      touchArgs: [{
        passive: true
      }]
    });
    DragEventService.on(root, "end", onClickEnd);
    function beforeDragStart(e) {
      var _opt$beforeDragStart;
      const node = e.target;
      if (node.nodeType === Node.ELEMENT_NODE) {
        ctx.triggerElement = node;
      }
      const el = node;
      if (opt.ingoreHTMLTags && el.tagName) {
        if (opt.ingoreHTMLTags.find((tag) => tag.toUpperCase() === el.tagName)) {
          return;
        }
      }
      const dragElement = (_opt$beforeDragStart = opt.beforeDragStart) === null || _opt$beforeDragStart === void 0 ? void 0 : _opt$beforeDragStart.call(opt, e);
      if (dragElement) {
        dragElement.setAttribute("draggable", "true");
        ctx.dragElement = dragElement;
      }
    }
    function onClickEnd(e) {
      if (ctx.dragElement) {
        ctx.dragElement.removeAttribute("draggable");
      }
    }
    function onDragStart(e) {
      var _opt$onDragStart;
      ctx.internal = true;
      (_opt$onDragStart = opt.onDragStart) === null || _opt$onDragStart === void 0 ? void 0 : _opt$onDragStart.call(opt, e);
      syncDropEffect(e);
    }
    function onDrag(e) {
      var _opt$onDrag;
      (_opt$onDrag = opt.onDrag) === null || _opt$onDrag === void 0 ? void 0 : _opt$onDrag.call(opt, e);
      syncDropEffect(e);
    }
    function onDragEnd(e) {
      var _opt$onDragEnd;
      (_opt$onDragEnd = opt.onDragEnd) === null || _opt$onDragEnd === void 0 ? void 0 : _opt$onDragEnd.call(opt, e);
      ctx.internal = false;
      if (ctx.dragElement) {
        ctx.dragElement.removeAttribute("draggable");
      }
      ctx.triggerElement = null;
      ctx.dragElement = null;
      ctx.dropEffect = "none";
    }
    const destroyDropZoneListeners = extendedDropZone(root, {
      onDragLeave(e) {
        var _opt$onDragLeave;
        (_opt$onDragLeave = opt.onDragLeave) === null || _opt$onDragLeave === void 0 ? void 0 : _opt$onDragLeave.call(opt, e);
        syncDropEffect(e);
      },
      onDragEnter(e) {
        var _opt$onDragEnter;
        ins.ifPreventDefault(e) && e.preventDefault();
        (_opt$onDragEnter = opt.onDragEnter) === null || _opt$onDragEnter === void 0 ? void 0 : _opt$onDragEnter.call(opt, e);
        syncDropEffect(e);
      },
      onDragOver(e) {
        var _opt$onDragOver;
        ins.ifPreventDefault(e) && e.preventDefault();
        (_opt$onDragOver = opt.onDragOver) === null || _opt$onDragOver === void 0 ? void 0 : _opt$onDragOver.call(opt, e);
        syncDropEffect(e);
      },
      onDrop(e) {
        var _opt$onDrop;
        ins.ifPreventDefault(e) && e.preventDefault();
        (_opt$onDrop = opt.onDrop) === null || _opt$onDrop === void 0 ? void 0 : _opt$onDrop.call(opt, e);
      },
      onEnter(e) {
        var _opt$onEnter;
        (_opt$onEnter = opt.onEnter) === null || _opt$onEnter === void 0 ? void 0 : _opt$onEnter.call(opt, e);
      },
      onLeave(e) {
        var _opt$onLeave;
        (_opt$onLeave = opt.onLeave) === null || _opt$onLeave === void 0 ? void 0 : _opt$onLeave.call(opt, e);
      }
    });
    on(root, "dragstart", onDragStart);
    on(root, "drag", onDrag);
    on(root, "dragend", onDragEnd);
    const destroy = () => {
      DragEventService.off(root, "start", beforeDragStart, {
        touchArgs: [{
          passive: true
        }]
      });
      off(root, "dragstart", onDragStart);
      off(root, "drag", onDrag);
      off(root, "dragend", onDragEnd);
      destroyDropZoneListeners();
      instances.delete(root);
    };
    Object.assign(opt, {
      root,
      destroy
    });
    instances.set(root, ins);
    return ins;
  }
  var defaultOptions2 = {
    ingoreHTMLTags: ["INPUT", "TEXTAREA", "SELECT", "OPTGROUP", "OPTION"],
    ifPreventDefault(event) {
      if (context.dragElement) {
        return true;
      }
      return ctx.preventDefault;
    },
    beforeDragStart(event) {
    },
    onDragStart(event) {
    },
    onDrag(event) {
    },
    onDragEnter(event) {
    },
    onDragLeave(event) {
    },
    onDragOver(event) {
    },
    onDragEnd(event) {
    },
    onDrop(event) {
    }
  };
  var justEnteredTarget = null;
  var setJustEnteredTarget = (el) => {
    justEnteredTarget = el;
    setTimeout(() => {
      justEnteredTarget = null;
    }, 20);
  };
  function extendedDropZone(el) {
    let opt = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const dropZone = el;
    let entered = false;
    const onEnter = (e) => {
      var _opt$onEnter2;
      entered = true;
      (_opt$onEnter2 = opt.onEnter) === null || _opt$onEnter2 === void 0 ? void 0 : _opt$onEnter2.call(opt, e);
      endListeners.resume();
    };
    const onDragEnter = (e) => {
      var _opt$onDragEnter2;
      setJustEnteredTarget(e.target);
      (_opt$onDragEnter2 = opt.onDragEnter) === null || _opt$onDragEnter2 === void 0 ? void 0 : _opt$onDragEnter2.call(opt, e);
      if (!entered) {
        onEnter(e);
      }
    };
    const onDragOver = (e) => {
      var _opt$onDragOver2;
      if (!entered) {
        onEnter(e);
      }
      (_opt$onDragOver2 = opt.onDragOver) === null || _opt$onDragOver2 === void 0 ? void 0 : _opt$onDragOver2.call(opt, e);
    };
    const onDragLeave = (e) => {
      var _opt$onDragLeave2;
      (_opt$onDragLeave2 = opt.onDragLeave) === null || _opt$onDragLeave2 === void 0 ? void 0 : _opt$onDragLeave2.call(opt, e);
      const doLeave = function() {
        var _opt$onLeave2;
        let event = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : e;
        entered = false;
        (_opt$onLeave2 = opt.onLeave) === null || _opt$onLeave2 === void 0 ? void 0 : _opt$onLeave2.call(opt, event);
        endListeners.stop();
      };
      const justEnter = justEnteredTarget;
      justEnteredTarget = null;
      if (justEnter && isDescendantOf(justEnter, dropZone))
        ;
      else {
        doLeave();
      }
    };
    const onDrop = (e) => {
      var _opt$onDrop2;
      (_opt$onDrop2 = opt.onDrop) === null || _opt$onDrop2 === void 0 ? void 0 : _opt$onDrop2.call(opt, e);
    };
    const onEndBeforeLeave = (e) => {
      var _opt$onEndBeforeLeave;
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") {
          return;
        }
      }
      entered = false;
      endListeners.stop();
      (_opt$onEndBeforeLeave = opt.onEndBeforeLeave) === null || _opt$onEndBeforeLeave === void 0 ? void 0 : _opt$onEndBeforeLeave.call(opt, e);
    };
    const endListeners = extendedListen([[el, "drop", onEndBeforeLeave], [window, "mouseup", onEndBeforeLeave], [window, "touchend", onEndBeforeLeave], [window, "keydown", onEndBeforeLeave]]);
    endListeners.stop();
    const resume = () => {
      on(el, "dragenter", onDragEnter);
      on(el, "dragover", onDragOver);
      on(el, "dragleave", onDragLeave);
      on(el, "drop", onDrop);
    };
    const destroy = () => {
      off(el, "dragenter", onDragEnter);
      off(el, "dragover", onDragOver);
      off(el, "dragleave", onDragLeave);
      off(el, "drop", onDrop);
      endListeners.stop();
    };
    resume();
    return destroy;
  }

  // ../erpnext_taskview/node_modules/@he-tree/vue/dist/v3/index.es.js
  var __defProp2 = Object.defineProperty;
  var __defProps2 = Object.defineProperties;
  var __getOwnPropDescs2 = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols2 = Object.getOwnPropertySymbols;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __propIsEnum2 = Object.prototype.propertyIsEnumerable;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues2 = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp2.call(b, prop))
        __defNormalProp2(a, prop, b[prop]);
    if (__getOwnPropSymbols2)
      for (var prop of __getOwnPropSymbols2(b)) {
        if (__propIsEnum2.call(b, prop))
          __defNormalProp2(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps2 = (a, b) => __defProps2(a, __getOwnPropDescs2(b));
  var _export_sfc2 = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  var justToggleOpen = false;
  var afterToggleOpen = () => {
    justToggleOpen = true;
    setTimeout(() => {
      justToggleOpen = false;
    }, 100);
  };
  var cpt$2 = defineComponent({
    props: ["stat", "rtl", "btt", "indent", "table", "treeLine", "treeLineOffset", "processor"],
    emits: ["open", "close", "check"],
    setup(props, { emit: emit2 }) {
      const indentStyle = computed2(() => {
        return {
          [!props.rtl ? "paddingLeft" : "paddingRight"]: props.indent * (props.stat.level - 1) + "px"
        };
      });
      watch(() => props.stat.checked, (checked) => {
        if (justToggleOpen) {
          return;
        }
        if (props.processor.afterOneCheckChanged(props.stat)) {
          emit2("check", props.stat);
        }
      });
      watch(() => props.stat.open, (open) => {
        if (justToggleOpen) {
          return;
        }
        if (open) {
          emit2("open", props.stat);
        } else {
          emit2("close", props.stat);
        }
        afterToggleOpen();
      });
      const vLines = computed2(() => {
        const lines = [];
        const hasNextVisibleNode = (stat) => {
          var _a;
          if (stat.parent) {
            let i = (_a = stat.parent) == null ? void 0 : _a.children.indexOf(stat);
            do {
              i++;
              let next = stat.parent.children[i];
              if (next) {
                if (!next.hidden) {
                  return true;
                }
              } else {
                break;
              }
            } while (true);
          }
          return false;
        };
        const leftOrRight = props.rtl ? "right" : "left";
        const bottomOrTop = props.btt ? "top" : "bottom";
        let current = props.stat;
        while (current) {
          let left = (current.level - 2) * props.indent + props.treeLineOffset;
          const hasNext = hasNextVisibleNode(current);
          const addLine = () => {
            lines.push({
              style: {
                [leftOrRight]: left + "px",
                [bottomOrTop]: hasNext ? 0 : "50%"
              }
            });
          };
          if (current === props.stat) {
            if (current.level > 1) {
              addLine();
            }
          } else if (hasNext) {
            addLine();
          }
          current = current.parent;
        }
        return lines;
      });
      const hLineStyle = computed2(() => {
        let left = (props.stat.level - 2) * props.indent + props.treeLineOffset;
        const leftOrRight = props.rtl ? "right" : "left";
        return {
          [leftOrRight]: left + "px"
        };
      });
      return { indentStyle, vLines, hLineStyle };
    }
  });
  var _sfc_main$2 = cpt$2;
  var _hoisted_1$2 = { class: "tree-node-inner" };
  var _hoisted_2$2 = {
    key: 1,
    class: "tree-node",
    ref: "el"
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return !_ctx.table ? (openBlock(), createElementBlock("div", {
      key: 0,
      class: normalizeClass(["tree-node", { "tree-node--with-tree-line": _ctx.treeLine }]),
      style: normalizeStyle(_ctx.indentStyle),
      ref: "el"
    }, [
      _ctx.treeLine ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.vLines, (line) => {
          return openBlock(), createElementBlock("div", {
            class: "tree-line tree-vline",
            style: normalizeStyle(line.style)
          }, null, 4);
        }), 256)),
        _ctx.stat.level > 1 ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "tree-line tree-hline",
          style: normalizeStyle(_ctx.hLineStyle)
        }, null, 4)) : createCommentVNode("", true)
      ], 64)) : createCommentVNode("", true),
      createBaseVNode("div", _hoisted_1$2, [
        renderSlot(_ctx.$slots, "default", { indentStyle: _ctx.indentStyle })
      ])
    ], 6)) : (openBlock(), createElementBlock("tr", _hoisted_2$2, [
      renderSlot(_ctx.$slots, "default", { indentStyle: _ctx.indentStyle })
    ], 512));
  }
  var TreeNode = /* @__PURE__ */ _export_sfc2(_sfc_main$2, [["render", _sfc_render$2]]);
  function vueMakeTreeProcessor(data, options = {}) {
    const opt = __spreadProps2(__spreadValues2({}, options), {
      statHandler(input) {
        if (this["_statHandler2"]) {
          input = this["_statHandler2"](input);
        }
        return filter(options.statHandler, reactive(input));
      },
      statsHandler(input) {
        return filter(options.statsHandler, reactive(input));
      },
      statsFlatHandler(input) {
        return filter(options.statsFlatHandler, reactive(input));
      }
    });
    return makeTreeProcessor(data, opt);
  }
  function filter(func, input) {
    return func ? func(input) : input;
  }
  var cpt$1 = defineComponent({
    components: { VirtualList, TreeNode },
    props: {
      value: { required: isVue2, type: Array },
      modelValue: { required: isVue3, type: Array },
      updateBehavior: {
        type: String,
        default: "modify"
      },
      processor: {
        type: Object,
        default: () => vueMakeTreeProcessor([], {
          noInitialization: true
        })
      },
      childrenKey: { type: String, default: "children" },
      textKey: { type: String, default: "text" },
      indent: { type: Number, default: 20 },
      virtualization: { type: Boolean, default: false },
      virtualizationPrerenderCount: { type: Number, default: 20 },
      defaultOpen: { type: Boolean, default: true },
      statHandler: { type: Function },
      rtl: { type: Boolean, default: false },
      btt: { type: Boolean, default: false },
      table: { type: Boolean, default: false },
      watermark: { type: Boolean, default: false },
      nodeKey: {
        type: [String, Function],
        default: "index"
      },
      treeLine: { type: Boolean, default: false },
      treeLineOffset: { type: Number, default: 8 }
    },
    emits: [
      "update:modelValue",
      "click:node",
      "open:node",
      "close:node",
      "check:node",
      "beforeDragStart",
      "before-drag-start",
      "after-drop",
      "change",
      "enter",
      "leave"
    ],
    data() {
      return {
        stats: [],
        statsFlat: [],
        dragNode: null,
        dragOvering: false,
        placeholderData: {},
        placeholderColspan: 1,
        batchUpdateWaiting: false,
        self: this,
        _ignoreValueChangeOnce: false
      };
    },
    computed: {
      valueComputed() {
        return (isVue2 ? this.value : this.modelValue) || [];
      },
      visibleStats() {
        const { statsFlat, isVisible } = this;
        let items = statsFlat;
        if (this.btt) {
          items = items.slice();
          items.reverse();
        }
        return items.filter((stat) => isVisible(stat));
      },
      rootChildren() {
        return this.stats;
      }
    },
    methods: {
      _emitValue(value) {
        this.$emit(isVue2 ? "input" : "update:modelValue", value);
      },
      _updateValue(value) {
        if (this.updateBehavior === "disabled") {
          return false;
        }
        if (value !== this.valueComputed) {
          this._ignoreValueChangeOnce = true;
        }
        this._emitValue(value);
        return true;
      },
      getStat: reactiveFirstArg(processorMethodProxy("getStat")),
      has: reactiveFirstArg(processorMethodProxy("has")),
      updateCheck: processorMethodProxy("updateCheck"),
      getChecked: processorMethodProxy("getChecked"),
      getUnchecked: processorMethodProxy("getUnchecked"),
      openAll: processorMethodProxy("openAll"),
      closeAll: processorMethodProxy("closeAll"),
      openNodeAndParents: processorMethodProxy("openNodeAndParents"),
      isVisible: processorMethodProxy("isVisible"),
      move: processorMethodProxyWithBatchUpdate("move"),
      add: reactiveFirstArg(processorMethodProxyWithBatchUpdate("add")),
      addMulti(dataArr, parent, startIndex) {
        this.batchUpdate(() => {
          let index = startIndex;
          for (const data of dataArr) {
            this.add(data, parent, index);
            if (index != null) {
              index++;
            }
          }
        });
      },
      remove: processorMethodProxy("remove"),
      removeMulti(dataArr) {
        let cloned = [...dataArr];
        this.batchUpdate(() => {
          for (const data of cloned) {
            this.remove(data);
          }
        });
      },
      iterateParent: processorMethodProxy("iterateParent"),
      getSiblings: processorMethodProxy("getSiblings"),
      getData: processorMethodProxy("getData"),
      getRootEl() {
        return this.$refs.vtlist.listElRef;
      },
      batchUpdate(task) {
        const r = this.ignoreUpdate(task);
        if (!this.batchUpdateWaiting) {
          this._updateValue(this.updateBehavior === "new" ? this.getData() : this.valueComputed);
        }
        return r;
      },
      ignoreUpdate(task) {
        const old = this.batchUpdateWaiting;
        this.batchUpdateWaiting = true;
        const r = task();
        this.batchUpdateWaiting = old;
        return r;
      }
    },
    watch: {
      processor: {
        immediate: true,
        handler(processor) {
          if (processor) {
            const getNodeDataChildren = (nodeData) => {
              if (!nodeData) {
                return this.valueComputed;
              } else {
                const { childrenKey } = this;
                if (!nodeData[childrenKey]) {
                  nodeData[childrenKey] = [];
                }
                return nodeData[childrenKey];
              }
            };
            processor["_statHandler2"] = this.statHandler ? (stat) => {
              if (stat.data === this.placeholderData) {
                return stat;
              }
              return this.statHandler(stat);
            } : null;
            processor.afterSetStat = (stat, parent, index) => {
              const { childrenKey, updateBehavior } = this;
              let value = this.valueComputed;
              if (updateBehavior === "new") {
                if (this.batchUpdateWaiting) {
                  return;
                }
                value = this.getData();
              } else if (updateBehavior === "modify") {
                const siblings = getNodeDataChildren(parent == null ? void 0 : parent.data);
                if (siblings.includes(stat.data))
                  ;
                else {
                  siblings.splice(index, 0, stat.data);
                }
              } else
                ;
              if (this.batchUpdateWaiting) {
                return;
              }
              this._updateValue(value);
            };
            processor.afterRemoveStat = (stat) => {
              var _a;
              const { childrenKey, updateBehavior } = this;
              let value = this.valueComputed;
              if (updateBehavior === "new") {
                if (this.batchUpdateWaiting) {
                  return;
                }
                value = this.getData();
              } else if (updateBehavior === "modify") {
                const siblings = getNodeDataChildren((_a = stat.parent) == null ? void 0 : _a.data);
                arrayRemove(siblings, stat.data);
              } else
                ;
              if (this.batchUpdateWaiting) {
                return;
              }
              this._updateValue(value);
            };
          }
          if (!processor.initialized) {
            processor.data = this.valueComputed;
            Object.assign(processor, objectOnly(this, ["childrenKey", "defaultOpen"]));
            processor.init();
            processor.updateCheck();
          }
          this.stats = processor.stats;
          this.statsFlat = processor.statsFlat;
          if (processor.data !== this.valueComputed) {
            this._updateValue(processor.data);
          }
        }
      },
      valueComputed: {
        handler(value) {
          const isDragging = this.dragOvering || this.dragNode;
          if (isDragging || this._ignoreValueChangeOnce) {
            this._ignoreValueChangeOnce = false;
          } else {
            const { processor } = this;
            processor.data = value;
            processor.init();
            this.stats = processor.stats;
            this.statsFlat = processor.statsFlat;
          }
        }
      }
    },
    created() {
    },
    mounted() {
      if (this.watermark === false) {
        window._heTreeWatermarkDisabled = true;
      }
      if (this.watermark && !window._heTreeWatermarkDisabled) {
        if (!window._heTreeWatermark) {
          window._heTreeWatermark = true;
          console.log(`%c[he-tree] Vue tree component:  https://hetree.phphe.com`, "color:#0075ff; font-size:14px;");
        }
      }
    }
  });
  var _sfc_main$12 = cpt$1;
  function processorMethodProxy(name) {
    return function(...args) {
      return this.processor[name](...args);
    };
  }
  function processorMethodProxyWithBatchUpdate(name) {
    return function(...args) {
      return this.batchUpdate(() => {
        return this.processor[name](...args);
      });
    };
  }
  function reactiveFirstArg(func) {
    return function(arg1, ...args) {
      if (arg1) {
        arg1 = reactive(arg1);
      }
      return func.call(this, arg1, ...args);
    };
  }
  var _hoisted_1$1 = {
    key: 0,
    class: "drag-placeholder he-tree-drag-placeholder"
  };
  var _hoisted_2$1 = ["colspan"];
  var _hoisted_3 = { class: "drag-placeholder he-tree-drag-placeholder" };
  function _sfc_render$12(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_TreeNode = resolveComponent("TreeNode");
    const _component_VirtualList = resolveComponent("VirtualList");
    return openBlock(), createBlock(_component_VirtualList, {
      class: normalizeClass(["he-tree", {
        "he-tree--rtl rtl": _ctx.rtl,
        "he-tree--drag-overing drag-overing": _ctx.dragOvering
      }]),
      ref: "vtlist",
      items: _ctx.visibleStats,
      disabled: !_ctx.virtualization,
      table: _ctx.table,
      itemKey: _ctx.nodeKey
    }, {
      prepend: withCtx(() => [
        renderSlot(_ctx.$slots, "prepend", { tree: _ctx.self })
      ]),
      default: withCtx(({ item: stat, index }) => [
        createVNode(_component_TreeNode, {
          "vt-index": index,
          class: normalizeClass([
            stat.class,
            {
              "drag-placeholder-wrapper": stat.data === _ctx.placeholderData,
              "dragging-node": stat === _ctx.dragNode
            }
          ]),
          style: normalizeStyle(stat.style),
          stat,
          rtl: _ctx.rtl,
          btt: _ctx.btt,
          indent: _ctx.indent,
          table: _ctx.table,
          treeLine: _ctx.treeLine,
          treeLineOffset: _ctx.treeLineOffset,
          processor: _ctx.processor,
          onClick: ($event) => _ctx.$emit("click:node", stat),
          onOpen: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("open:node", $event)),
          onClose: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("close:node", $event)),
          onCheck: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("check:node", $event))
        }, {
          default: withCtx(({ indentStyle }) => [
            stat.data === _ctx.placeholderData ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              !_ctx.table ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
                renderSlot(_ctx.$slots, "placeholder", { tree: _ctx.self })
              ])) : (openBlock(), createElementBlock("td", {
                key: 1,
                style: normalizeStyle(indentStyle),
                colspan: _ctx.placeholderColspan
              }, [
                createBaseVNode("div", _hoisted_3, [
                  renderSlot(_ctx.$slots, "placeholder", { tree: _ctx.self })
                ])
              ], 12, _hoisted_2$1))
            ], 64)) : renderSlot(_ctx.$slots, "default", {
              key: 1,
              node: stat.data,
              stat,
              indentStyle,
              tree: _ctx.self
            }, () => [
              createTextVNode(toDisplayString(stat.data[_ctx.textKey]), 1)
            ])
          ]),
          _: 2
        }, 1032, ["vt-index", "class", "style", "stat", "rtl", "btt", "indent", "table", "treeLine", "treeLineOffset", "processor", "onClick"])
      ]),
      append: withCtx(() => [
        renderSlot(_ctx.$slots, "append", { tree: _ctx.self })
      ]),
      _: 3
    }, 8, ["class", "items", "disabled", "table", "itemKey"]);
  }
  var BaseTree = /* @__PURE__ */ _export_sfc2(_sfc_main$12, [["render", _sfc_render$12]]);
  var startTree = null;
  var targetTree = null;
  var startInfo;
  var targetInfo;
  var dragOpenLastNode;
  var startMovePoint;
  var startMouse;
  var dragNode;
  var cpt2 = defineComponent({
    extends: BaseTree,
    props: {
      triggerClass: { type: [String, Array] },
      disableDrag: Boolean,
      disableDrop: Boolean,
      eachDraggable: {
        type: Function
      },
      eachDroppable: {
        type: Function
      },
      rootDroppable: {
        type: [Boolean, Function],
        default: true
      },
      dragOpen: { type: Boolean, default: true },
      dragOpenDelay: { type: Number, default: 0 },
      beforeDragOpen: { type: Function },
      resolveStartMovePoint: {
        type: [String, Function]
      },
      keepPlaceholder: { type: Boolean },
      maxLevel: { type: Number },
      dragCopy: { type: Boolean },
      dragCopyDataHandler: {
        type: Function
      },
      onExternalDragOver: {
        type: Function
      },
      externalDataHandler: {
        type: Function
      },
      ondragstart: {
        type: Function
      }
    },
    data() {
      return {
        treeDraggableInstance: null
      };
    },
    computed: {},
    methods: {
      getNodeByElement(el) {
        const i = el.getAttribute("vt-index");
        return i == null ? null : this.visibleStats[i];
      },
      isDraggable(node) {
        if (this.disableDrag) {
          return false;
        }
        if (node.draggable != null) {
          return node.draggable;
        }
        if (this.eachDraggable) {
          const t = this.eachDraggable(node);
          if (t != null) {
            return t;
          }
        }
        const { parent } = node;
        if (!parent) {
          return true;
        } else {
          return this.isDraggable(parent);
        }
      },
      isDroppable(node) {
        if (this.disableDrop) {
          return false;
        }
        if (!node) {
          return resolveValueOrGettter(this.rootDroppable, [this, startTree]);
        }
        if (node.droppable != null) {
          return node.droppable;
        }
        if (this.eachDroppable) {
          const t = this.eachDroppable(node);
          if (t != null) {
            return t;
          }
        }
        const { parent } = node;
        if (!parent) {
          return true;
        } else {
          return this.isDroppable(parent);
        }
      },
      _eachDroppable() {
        var _a;
        return resolveValueOrGettter((_a = this["_isDragCopy"]) == null ? void 0 : _a.call(this), [this]);
      }
    },
    mounted() {
      const isMoved = (mouse, lastMouse2) => {
        let r = true;
        if (startTree && startTree !== this) {
          r = r && this["_isMoved"];
        }
        if (this.table && !this["_isDragCopy"]) {
          r = r && this["_isDragCopy"];
        }
        return r && (mouse.x !== lastMouse2.x || mouse.y !== lastMouse2.y);
      };
      const movePlaceholder = (parent, index) => {
        targetTree.ignoreUpdate(() => {
          if (!targetTree.has(targetTree.placeholderData)) {
            if (targetTree.table) {
              let colspan = 0;
              const tr = targetTree.getRootEl().querySelector("tr");
              if (tr) {
                for (const {
                  value: childEl
                } of iterateAll(tr.children)) {
                  if (css(childEl, "display") !== "none") {
                    colspan += childEl.colSpan || 1;
                  }
                }
              }
              if (colspan < 1) {
                colspan = 1;
              }
              targetTree.placeholderColspan = colspan;
            }
            targetTree.add(targetTree.placeholderData);
          }
          const placeholder = targetTree.getStat(targetTree.placeholderData);
          targetTree.move(placeholder, parent, index);
        });
      };
      const removePlaceholder = () => {
        const tree = this;
        if (tree.has(tree.placeholderData)) {
          tree.remove(tree.getStat(tree.placeholderData));
          return true;
        }
      };
      const setCursor = (droppable) => {
        if (!droppable) {
          context.dropEffect = "none";
        } else {
          context.dropEffect = (startTree == null ? void 0 : startTree.dragCopy) ? "copy" : "move";
        }
      };
      const setDroppable = (droppable) => {
        const tree = this;
        if (!droppable) {
          if (!tree.keepPlaceholder) {
            removePlaceholder();
            setCursor(false);
          } else if (!tree.has(tree.placeholderData)) {
            setCursor(false);
          }
        } else {
          setCursor(true);
        }
      };
      let lastMouse = { x: 0, y: 0 };
      const rootEl = this.getRootEl();
      let dragElement = null;
      const removePlaceholderWhenEnd = () => {
        if (targetTree == null ? void 0 : targetTree.has(targetTree.placeholderData)) {
          targetTree.ignoreUpdate(() => {
            targetTree.remove(targetTree.getStat(targetTree.placeholderData));
            if (startTree) {
              startTree.dragNode.hidden = false;
              startTree.dragOvering = false;
            }
          });
        }
      };
      this.treeDraggableInstance = extendedDND(rootEl, {
        beforeDragStart: (event) => {
          if (!context.triggerElement) {
            return;
          }
          let triggerClass = this.triggerClass;
          if (!triggerClass || triggerClass.length === 0) {
            triggerClass = "tree-node";
          }
          let triggerClasses = toArrayIfNot(triggerClass);
          let triggerDragElement = findParent(context.triggerElement, (el) => {
            if (hasClassIn(el, triggerClasses)) {
              return true;
            } else if (hasClass(el, "tree-node")) {
              return "break";
            }
          }, { withSelf: true, until: rootEl });
          dragElement = findParent(triggerDragElement, (el) => {
            if (hasClass(el, "tree-node")) {
              return true;
            }
          }, { withSelf: true, until: rootEl });
          if (!dragElement) {
            return;
          }
          dragNode = this.getNodeByElement(dragElement);
          if (!dragNode) {
            throw `Can't find drag node`;
          }
          if (!this.isDraggable(dragNode)) {
            return;
          }
          this.$emit("before-drag-start", dragNode);
          this.$emit("beforeDragStart", dragNode);
          return rootEl;
        },
        onDragStart: (event) => {
          var _a, _b, _c;
          if (!dragElement || !dragNode) {
            return;
          }
          {
            const { x, y } = dragElement.getBoundingClientRect();
            const { clientX, clientY } = event;
            (_a = event.dataTransfer) == null ? void 0 : _a.setDragImage(dragElement, clientX - x, clientY - y);
          }
          const mouse = { x: event.clientX, y: event.clientY };
          startMouse = mouse;
          startTree = this;
          startTree.dragNode = dragNode;
          startMovePoint = (() => {
            if (this.resolveStartMovePoint === "mouse") {
              return { x: event.clientX, y: event.clientY };
            } else if (typeof this.resolveStartMovePoint === "function") {
              return this.resolveStartMovePoint(dragElement);
            } else {
              let point;
              let height = 0;
              if (!this.table) {
                if (!this.rtl) {
                  point = dragElement.children[0].getBoundingClientRect().toJSON();
                  height = point.height;
                } else {
                  const rect = dragElement.children[0].getBoundingClientRect();
                  point = {
                    x: rect.right,
                    y: rect.y
                  };
                  height = rect.height;
                }
              } else {
                let rect = dragElement.getBoundingClientRect();
                point = { x: rect.x, y: rect.y };
                if (this.rtl) {
                  point.x = rect.right;
                }
                height = rect.height;
              }
              if (this.btt) {
                point.y += height;
              }
              return point;
            }
          })();
          this.dragOvering = true;
          const siblings = startTree.getSiblings(startTree.dragNode);
          const indexBeforeDrop = siblings.indexOf(dragNode);
          startInfo = {
            tree: startTree,
            dragNode,
            parent: dragNode.parent,
            siblings,
            indexBeforeDrop
          };
          targetTree = this;
          (_b = event.dataTransfer) == null ? void 0 : _b.setData("text", `he-tree drag start at ${new Date().toISOString()}`);
          if (!startTree._eachDroppable()) {
            setTimeout(() => {
              dragNode.hidden = true;
              movePlaceholder(dragNode.parent, indexBeforeDrop + 1);
            }, 0);
          }
          (_c = this.ondragstart) == null ? void 0 : _c.call(this, event);
        },
        onEnter: (event) => {
          this.$emit("enter", event);
        },
        onLeave: (event) => {
          dragOpenLastNode = null;
          this.dragOvering = false;
          context.preventDefault = false;
          removePlaceholder();
          this.$emit("leave", event);
        },
        onDragOver: applyFinally((event) => {
          if (!startTree) {
            if (!this.onExternalDragOver || this.onExternalDragOver(event) === false) {
              return;
            } else {
              context.preventDefault = true;
            }
          }
          const mouse = { x: event.clientX, y: event.clientY };
          const isMoved2 = isMoved(mouse, lastMouse);
          lastMouse = mouse;
          if (!isMoved2) {
            return;
          }
          this.dragOvering = true;
          targetTree = this;
          const movePoint = startMovePoint ? {
            x: startMovePoint.x + (mouse.x - startMouse.x),
            y: startMovePoint.y + (mouse.y - startMouse.y)
          } : __spreadValues2({}, mouse);
          const { btt, rtl } = targetTree;
          if (targetTree.disableDrop) {
            context.dropEffect = "none";
            return;
          }
          let prevNode;
          let nextNode;
          const nodeList = targetTree.getRootEl().querySelectorAll(`.tree-node`);
          const nodeEls = [];
          nodeList.forEach((el) => {
            if (!hasClassIn(el, [
              "drag-placeholder-wrapper",
              "dragging-node"
            ]) && css(el, "display") !== "none") {
              nodeEls.push(el);
            }
          });
          const t = binarySearch(nodeEls, (node) => getBoundingClientRect(node)[!btt ? "top" : "bottom"] - movePoint.y, { returnNearestIfNoHit: true });
          let prevIndex = null;
          let prevNodeEl;
          let nextNodeEl;
          if (t.hit)
            ;
          else {
            if (t.greater) {
              if (!btt) {
                prevIndex = t.index - 1;
                if (!nodeEls[prevIndex]) {
                  prevIndex++;
                }
              }
            } else {
              if (!btt)
                ;
              else {
                prevIndex = t.index + 1;
                if (!nodeEls[prevIndex]) {
                  prevIndex--;
                }
              }
            }
          }
          if (prevIndex == null) {
            prevIndex = t.index;
          }
          prevNodeEl = nodeEls[prevIndex];
          nextNodeEl = !btt ? nodeEls[prevIndex + 1] : nodeEls[prevIndex - 1];
          prevNode = prevNodeEl && targetTree.getNodeByElement(prevNodeEl);
          nextNode = nextNodeEl && targetTree.getNodeByElement(nextNodeEl);
          const { indent } = targetTree;
          const prevBCR = cacheFunction(() => {
            if (!targetTree.table) {
              return getBoundingClientRect(prevNodeEl.firstElementChild);
            } else {
              let r = getBoundingClientRect(prevNodeEl).toJSON();
              const indentSize = indent * (prevNode.level - 1);
              if (!rtl) {
                r.x += indentSize;
              } else {
                r.width -= indentSize;
                r.right -= indentSize;
              }
              return r;
            }
          }).action;
          const onPrevMiddle = cacheFunction(() => {
            if (!btt) {
              return movePoint.y < prevBCR().y + prevBCR().height / 2;
            } else {
              return movePoint.y > prevBCR().y + prevBCR().height / 2;
            }
          }).action;
          const atTop = cacheFunction(() => {
            if (!btt) {
              return !prevNodeEl || prevIndex === 0 && onPrevMiddle();
            } else {
              return !prevNodeEl || prevIndex === nodeEls.length - 1 && onPrevMiddle();
            }
          }).action;
          const prevX_minusMovePointX = cacheFunction(() => !rtl ? prevBCR().x - movePoint.x : movePoint.x - (prevBCR().x + prevBCR().width)).action;
          const atPrevIndentRight = cacheFunction(() => !rtl ? movePoint.x > prevBCR().x + indent : movePoint.x < prevBCR().x + prevBCR().width - indent).action;
          let targetLevel;
          if (atTop()) {
            targetLevel = 1;
            prevNode = null;
          } else if (!prevNode) {
            return;
          } else if (prevX_minusMovePointX() > 0) {
            targetLevel = prevNode.level - Math.ceil(prevX_minusMovePointX() / indent);
          } else if (atPrevIndentRight()) {
            targetLevel = prevNode.level + 1;
          } else {
            targetLevel = prevNode.level;
          }
          if (nextNode && targetLevel < nextNode.level) {
            targetLevel = nextNode.level;
          }
          const findDroppablePosition = async () => {
            let parent, prevSibling;
            let cancelled = false;
            let _dragOpenLastNode = null;
            const isOpen = async (stat) => {
              if (stat.open) {
                return true;
              } else if (targetTree.dragOpen) {
                if (!targetTree.dragOpenDelay) {
                  stat.open = true;
                  return true;
                } else {
                  _dragOpenLastNode = stat;
                  if (dragOpenLastNode === stat) {
                    cancelled = true;
                  } else {
                    let wait = promisePin();
                    dragOpenLastNode = stat;
                    const localNode = stat;
                    setTimeout(async () => {
                      if (localNode !== dragOpenLastNode) {
                        cancelled = true;
                        wait.resolve(true);
                      } else {
                        if (targetTree.beforeDragOpen) {
                          await targetTree.beforeDragOpen(stat);
                        }
                        if (localNode !== dragOpenLastNode) {
                          cancelled = true;
                          wait.resolve(true);
                        } else {
                          stat.open = true;
                          _dragOpenLastNode = null;
                          wait.resolve(true);
                        }
                      }
                    }, targetTree.dragOpenDelay);
                    return await wait.promise;
                  }
                }
              } else {
                return false;
              }
            };
            const tryPrepend = async () => {
              if (targetTree.isDroppable(prevNode) && await isOpen(prevNode)) {
                if (cancelled) {
                  return;
                }
                parent = prevNode;
                prevSibling = null;
              } else {
                return false;
              }
            };
            const tryAfter = (minLevel = targetLevel) => {
              let t2 = prevNode;
              let t3 = [];
              while (t2 && t2.level >= minLevel) {
                t2 = t2.parent || null;
                t3.unshift(t2);
              }
              let i = 0;
              for (const node of t3) {
                if (targetTree.isDroppable(node)) {
                  parent = node;
                  prevSibling = t3[i + 1] || prevNode;
                  return true;
                }
                i++;
              }
              return false;
            };
            if (!prevNode) {
              if (targetTree.isDroppable(null)) {
                parent = null;
              }
            } else if (targetLevel > prevNode.level) {
              if (await tryPrepend() === false) {
                tryAfter(prevNode.level);
              }
            } else {
              if (tryAfter() === false) {
                await tryPrepend();
              }
            }
            dragOpenLastNode = _dragOpenLastNode;
            const success = Boolean(!cancelled && (parent || parent === null));
            const getIndex = () => prevSibling ? (parent ? parent.children : targetTree.stats).filter((v) => v.data !== targetTree.placeholderData).indexOf(prevSibling) + 1 : 0;
            return {
              cancelled,
              success,
              parent,
              index: success ? getIndex() : -1
            };
          };
          findDroppablePosition().then((dp) => {
            if (dp.cancelled) {
              return;
            }
            if (!dp.success) {
              setDroppable(false);
              return;
            }
            if (targetTree.maxLevel != null && targetTree.maxLevel > 0) {
              let dragNodeWithChildLevel = 1;
              if (startTree) {
                const dragNode2 = startTree.dragNode;
                let childMaxLevel = 0;
                walkTreeData(dragNode2, (node) => {
                  if (node.level > childMaxLevel) {
                    childMaxLevel = node.level;
                  }
                }, {
                  childrenKey: CHILDREN
                });
                dragNodeWithChildLevel = childMaxLevel - dragNode2.level + 1;
              }
              const willLevel = dragNodeWithChildLevel + (dp.parent ? dp.parent.level : 0);
              if (willLevel > targetTree.maxLevel) {
                setDroppable(false);
                return;
              }
            }
            setDroppable(true);
            movePlaceholder(dp.parent, dp.index);
          });
        }, () => {
        }),
        onDrop: (event) => {
          targetTree = this;
          const external = !startTree;
          if (!targetTree) {
            return;
          }
          const dragNode2 = startTree == null ? void 0 : startTree.dragNode;
          let externalData;
          let dragChanged = (() => {
            var _a;
            let changed = true;
            if (!targetTree.has(targetTree.placeholderData)) {
              changed = false;
            } else if (external) {
              externalData = (_a = this.externalDataHandler) == null ? void 0 : _a.call(this, event);
              changed = externalData != null;
            } else if (!startTree.dragCopy) {
              const placeholder = targetTree.getStat(targetTree.placeholderData);
              if (startTree === targetTree && placeholder.parent === dragNode2.parent) {
                if (findTreeData(dragNode2, (node) => node === placeholder), { childrenKey: CHILDREN })
                  ;
                else {
                  const siblings = this.processor.getSiblings(placeholder);
                  const placeholderIndex = siblings.indexOf(placeholder);
                  const prev = siblings[placeholderIndex - 1];
                  const next = siblings[placeholderIndex + 1];
                  if (prev === dragNode2 || next === dragNode2) {
                    changed = false;
                  }
                }
              }
            }
            return changed;
          })();
          if (dragChanged) {
            const placeholder = targetTree.getStat(targetTree.placeholderData);
            const siblings = targetTree.getSiblings(placeholder);
            targetInfo = {
              tree: targetTree,
              dragNode: dragNode2,
              parent: placeholder.parent,
              siblings,
              indexBeforeDrop: siblings.indexOf(placeholder)
            };
          }
          (() => {
            removePlaceholderWhenEnd();
            if (dragChanged) {
              let targetIndex = targetInfo.indexBeforeDrop;
              if (startTree && !startTree.dragCopy && startTree === targetTree && startInfo.parent == targetInfo.parent && startInfo.indexBeforeDrop < targetIndex) {
                targetIndex--;
              }
              if (startTree && startTree !== targetTree && !startTree._eachDroppable()) {
                startTree.batchUpdate(() => {
                  startTree.remove(dragNode2);
                  startTree.updateCheck();
                });
              }
              targetTree.batchUpdate(() => {
                let newDragNode = startTree == null ? void 0 : startTree.dragNode;
                let newData;
                if (externalData) {
                  newData = externalData;
                } else if (startTree._eachDroppable()) {
                  newData = cloneTreeData(startTree.dragNode.data, {
                    childrenKey: startTree.childrenKey
                  });
                  if (startTree.dragCopyDataHandler) {
                    newData = startTree.dragCopyDataHandler(newData);
                  }
                }
                if (newData) {
                  targetTree.add(newData);
                  newDragNode = targetTree.getStat(newData);
                }
                targetTree.move(newDragNode, targetInfo.parent, targetIndex);
                targetTree.updateCheck();
              });
            }
            targetTree.$emit("after-drop");
            if (dragChanged) {
              if (startTree) {
                if (!startTree.dragCopy) {
                  startTree.$emit("change");
                }
              }
              if (targetTree !== startTree) {
                targetTree.$emit("change");
              }
            }
          })();
        },
        onDragEnd: (event) => {
          removePlaceholderWhenEnd();
          if (startTree) {
            startTree.dragNode && (startTree.dragNode.hidden = false);
            startTree.dragNode = null;
            startTree.dragOvering = false;
            startTree = null;
          }
          targetTree = null;
          dragOpenLastNode = null;
          dragNode = null;
        }
      });
    },
    unmounted() {
      var _a;
      (_a = this.treeDraggableInstance) == null ? void 0 : _a.destroy();
    }
  });
  var _sfc_main2 = defineComponent({
    props: {
      open: { type: Boolean }
    }
  });
  var _hoisted_12 = /* @__PURE__ */ createBaseVNode("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24"
  }, [
    /* @__PURE__ */ createBaseVNode("title", null, "chevron-right"),
    /* @__PURE__ */ createBaseVNode("path", { d: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" })
  ], -1);
  var _hoisted_22 = [
    _hoisted_12
  ];
  function _sfc_render2(_ctx, _cache, $props, $setup, $data, $options) {
    return openBlock(), createElementBlock("a", {
      class: normalizeClass(["he-tree__open-icon", { open: _ctx.open }])
    }, _hoisted_22, 2);
  }
  var OpenIcon = /* @__PURE__ */ _export_sfc2(_sfc_main2, [["render", _sfc_render2]]);

  // sfc-script:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/components/Task.vue?type=script
  var Task_default = defineComponent({
    name: "Task",
    props: {
      doc: {
        type: Object,
        required: true,
        default: () => ({})
      }
    },
    setup(props, { emit: emit2 }) {
      const isCompleted = ref(false);
      const timerActive = ref(false);
      const isEditing = ref(false);
      const editedText = ref("");
      const emitInteraction = () => {
        emit2("task-interaction");
      };
      const toggleComplete = () => {
        isCompleted.value = !isCompleted.value;
        console.log(`Task "${props.doc.text}" completed: ${isCompleted.value}`);
      };
      const startTimer = () => {
        timerActive.value = true;
        console.log(`Timer started for task "${props.doc.text}"`);
      };
      const editTask = () => {
        isEditing.value = true;
        editedText.value = props.doc.isBlank ? "" : props.doc.text;
        nextTick(() => {
          const inputElement = document.querySelector(".task-subject-edit");
          if (inputElement) {
            inputElement.focus();
          }
        });
      };
      const saveEdit = () => {
        if (editedText.value.trim() !== "") {
          props.doc.text = editedText.value;
        }
        isEditing.value = false;
      };
      return {
        isCompleted,
        timerActive,
        isEditing,
        editedText,
        toggleComplete,
        startTimer,
        editTask,
        saveEdit,
        emitInteraction
      };
    }
  });

  // sfc-template:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/components/Task.vue?type=template
  var _withScopeId = (n) => (pushScopeId("data-v-75df30b2"), n = n(), popScopeId(), n);
  var _hoisted_13 = { class: "task" };
  var _hoisted_23 = { class: "task-subject-container" };
  var _hoisted_32 = {
    key: 0,
    class: "task-controls"
  };
  var _hoisted_4 = { class: "custom-checkbox task-control" };
  var _hoisted_5 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("span", { class: "checkmark" }, null, -1));
  var _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("button", { class: "btn btn-secondary task-control" }, "Log Time", -1));
  var _hoisted_7 = {
    key: 1,
    class: "task-controls"
  };
  var _hoisted_8 = { class: "custom-checkbox task-control" };
  var _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("span", { class: "checkmark" }, null, -1));
  function render(_ctx, _cache, $props, $setup, $data, $options) {
    return openBlock(), createElementBlock("div", {
      class: "task",
      onClick: _cache[9] || (_cache[9] = (...args) => _ctx.emitInteraction && _ctx.emitInteraction(...args))
    }, [
      createBaseVNode("div", _hoisted_13, [
        createCommentVNode(" Task Subject "),
        createBaseVNode("div", _hoisted_23, [
          !_ctx.isEditing ? (openBlock(), createElementBlock("p", {
            key: 0,
            class: "task-subject",
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.editTask && _ctx.editTask(...args))
          }, toDisplayString(_ctx.doc.text), 1)) : createCommentVNode("v-if", true),
          _ctx.isEditing ? withDirectives((openBlock(), createElementBlock("input", {
            key: 1,
            type: "text",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.editedText = $event),
            onBlur: _cache[2] || (_cache[2] = (...args) => _ctx.saveEdit && _ctx.saveEdit(...args)),
            onKeyup: _cache[3] || (_cache[3] = withKeys((...args) => _ctx.saveEdit && _ctx.saveEdit(...args), ["enter"])),
            class: "task-subject-edit"
          }, null, 544)), [
            [vModelText, _ctx.editedText]
          ]) : createCommentVNode("v-if", true)
        ]),
        createCommentVNode(" only render the controls if the doc is not a project and is not blank "),
        !_ctx.doc.isProject && !_ctx.doc.isBlank ? (openBlock(), createElementBlock("div", _hoisted_32, [
          createCommentVNode(" Spiced-up Checkbox "),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("label", null, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => _ctx.isCompleted = $event),
                onChange: _cache[5] || (_cache[5] = (...args) => _ctx.toggleComplete && _ctx.toggleComplete(...args))
              }, null, 544), [
                [vModelCheckbox, _ctx.isCompleted]
              ]),
              _hoisted_5,
              createTextVNode(" Mark as Complete ")
            ])
          ]),
          createCommentVNode(" Button to start timer "),
          createBaseVNode("button", {
            class: "btn btn-info task-control",
            onClick: _cache[6] || (_cache[6] = (...args) => _ctx.startTimer && _ctx.startTimer(...args))
          }, "Start Timer"),
          createCommentVNode(" Button to log time "),
          _hoisted_6
        ])) : createCommentVNode("v-if", true),
        createCommentVNode(" if it is a project, give it a checkbox to close the project "),
        _ctx.doc.isProject ? (openBlock(), createElementBlock("div", _hoisted_7, [
          createBaseVNode("div", _hoisted_8, [
            createBaseVNode("label", null, [
              withDirectives(createBaseVNode("input", {
                type: "checkbox",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => _ctx.isCompleted = $event),
                onChange: _cache[8] || (_cache[8] = (...args) => _ctx.toggleComplete && _ctx.toggleComplete(...args))
              }, null, 544), [
                [vModelCheckbox, _ctx.isCompleted]
              ]),
              _hoisted_9,
              createTextVNode(" Close Project ")
            ])
          ])
        ])) : createCommentVNode("v-if", true)
      ])
    ]);
  }

  // ../erpnext_taskview/erpnext_taskview/public/js/components/Task.vue
  Task_default.render = render;
  Task_default.__file = "../erpnext_taskview/erpnext_taskview/public/js/components/Task.vue";
  Task_default.__scopeId = "data-v-75df30b2";
  var Task_default2 = Task_default;

  // sfc-script:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/TaskView.vue?type=script
  var TaskView_default = defineComponent({
    name: "TaskView",
    components: {
      Draggable: cpt2,
      OpenIcon,
      Task: Task_default2
    },
    props: {
      docs: {
        type: Array,
        required: true,
        default: () => []
      },
      projects: {
        type: Array,
        required: true,
        default: () => []
      }
    },
    setup(props) {
      const treeData = ref(formatTreeData(props.docs, props.projects));
      const highlightedProject = ref(null);
      const currentTheme = ref(document.documentElement.getAttribute("data-theme-mode") || "light");
      if (currentTheme.value === "automatic") {
        currentTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      onMounted(() => {
        document.documentElement.style.setProperty(
          "--task-hover-bg-color",
          currentTheme.value === "dark" ? "#686868" : "#ededed"
        );
        document.documentElement.style.setProperty(
          "--icon-color",
          currentTheme.value === "dark" ? "#d3d3d3" : "#000000"
        );
      });
      function formatTreeData(docs, projects) {
        function createNode({ text, children = [], isBlank = false, isProject = false, project = null }) {
          return {
            text,
            children,
            isBlank,
            isProject,
            project
          };
        }
        function addBlankTask(tasks, text = "Add task...") {
          tasks.push(createNode({ text, isBlank: true }));
        }
        const taskMap = {};
        docs.forEach((doc2) => {
          taskMap[doc2.name] = createNode({
            text: doc2.subject,
            project: doc2.project
          });
        });
        const treeData2 = projects.map(
          (project) => createNode({
            text: `${project.name}: ${project.project_name}`,
            isProject: true
          })
        );
        docs.forEach((doc2) => {
          const task = taskMap[doc2.name];
          const childNames = doc2.depends_on_tasks ? doc2.depends_on_tasks.split(",").map((depName) => depName.trim()) : [];
          childNames.forEach((childName) => {
            const childTask = taskMap[childName];
            if (childTask) {
              task.children.push(childTask);
            }
          });
          if (task.children.length > 0) {
            addBlankTask(task.children);
          }
        });
        docs.forEach((doc2) => {
          const task = taskMap[doc2.name];
          const isChild = docs.some((parentDoc) => {
            const childNames = parentDoc.depends_on_tasks ? parentDoc.depends_on_tasks.split(",").map((depName) => depName.trim()) : [];
            return childNames.includes(doc2.name);
          });
          if (!isChild) {
            const project = treeData2.find((p2) => p2.text.startsWith(doc2.project));
            if (project) {
              project.children.push(task);
            }
          }
        });
        treeData2.forEach((projectTask) => {
          addBlankTask(projectTask.children);
        });
        addBlankTask(treeData2, "Add project...");
        return treeData2;
      }
      const isHighlightedProject = (node) => {
        return node.isProject && node === highlightedProject.value;
      };
      const toggleProject = (node, stat) => {
        stat.open = !stat.open;
        if (stat.open) {
          highlightedProject.value = node;
        } else {
          updateHighlightedProject();
        }
      };
      const handleTaskInteraction = (node) => {
        if (node.isProject) {
          highlightedProject.value = node;
        } else {
          const parentProject = treeData.value.find(
            (project) => project.children.some((child) => child === node)
          );
          if (parentProject) {
            highlightedProject.value = parentProject;
          }
        }
      };
      const updateHighlightedProject = () => {
        const expandedProjects = treeData.value.filter((node) => node.isProject && node.children.length > 0);
        if (expandedProjects.length > 0) {
          highlightedProject.value = expandedProjects[0];
        } else {
          highlightedProject.value = treeData.value[treeData.value.length - 1];
        }
      };
      onMounted(() => {
        updateHighlightedProject();
      });
      watch(treeData, () => {
        updateHighlightedProject();
      });
      return {
        treeData,
        isHighlightedProject,
        toggleProject,
        handleTaskInteraction
      };
    }
  });

  // sfc-template:/workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/public/js/TaskView.vue?type=template
  var _hoisted_14 = { class: "tree-container" };
  var _hoisted_24 = ["onClick"];
  var _hoisted_33 = /* @__PURE__ */ createBaseVNode("div", { class: "icon-container" }, [
    /* @__PURE__ */ createBaseVNode("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24"
    }, [
      /* @__PURE__ */ createBaseVNode("title", null, "chevron-right"),
      /* @__PURE__ */ createBaseVNode("path", { d: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" })
    ])
  ], -1);
  var _hoisted_42 = [
    _hoisted_33
  ];
  function render2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_Task = resolveComponent("Task");
    const _component_Draggable = resolveComponent("Draggable");
    return openBlock(), createElementBlock("div", _hoisted_14, [
      createVNode(_component_Draggable, {
        class: "mtl-tree",
        modelValue: _ctx.treeData,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.treeData = $event),
        treeLine: ""
      }, {
        default: withCtx(({ node, stat }) => [
          createBaseVNode("div", {
            class: normalizeClass(["outer-task", { "highlighted-project": _ctx.isHighlightedProject(node) }])
          }, [
            createBaseVNode("a", {
              class: normalizeClass(["he-tree__open-icon mtl-mr small-icon", { "open": stat.open }]),
              onClick: ($event) => _ctx.toggleProject(node, stat)
            }, [..._hoisted_42], 10, _hoisted_24),
            createVNode(_component_Task, {
              doc: node,
              class: "mtl-ml",
              onTaskInteraction: ($event) => _ctx.handleTaskInteraction(node)
            }, null, 8, ["doc", "onTaskInteraction"])
          ], 2)
        ]),
        _: 1
      }, 8, ["modelValue"])
    ]);
  }

  // ../erpnext_taskview/erpnext_taskview/public/js/TaskView.vue
  TaskView_default.render = render2;
  TaskView_default.__file = "../erpnext_taskview/erpnext_taskview/public/js/TaskView.vue";
  var TaskView_default2 = TaskView_default;

  // ../erpnext_taskview/erpnext_taskview/public/js/app.bundle.js
  frappe.provide("frappe.views");
  frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
      super.setup_views();
      if (this.doctype === "Task") {
        this.add_view_to_menu(
          "Tasks",
          () => {
            this.set_route("tasks");
          }
        );
      }
    }
  };
  frappe.router.list_views.push("tasks");
  frappe.router.list_views_route["tasks"] = "Tasks";
  frappe.views.TasksView = class TasksView extends frappe.views.ListView {
    setup_defaults() {
      super.setup_defaults();
      this.page_title = __("Task View");
      this.page_name = "task-view";
      this.show_hide_filters = false;
      this.list_view_settings = {
        fields: null
      };
    }
    setup_page() {
      super.setup_page();
      frappe.call("frappe.desk.listview.get_list_settings", {
        doctype: this.doctype
      }).then((doc2) => {
        this.list_view_settings = doc2.message || {};
        if (this.list_view_settings.fields === void 0) {
          this.list_view_settings.fields = null;
        }
        this.page.set_primary_action(__("New Task"), () => {
          frappe.new_doc("Task");
        });
      }).catch((error) => {
        console.error("Failed to get list settings:", error);
      });
    }
    show_skeleton() {
    }
    hide_skeleton() {
    }
    render_header(refresh_header = false) {
      this.$result.find(".list-row-head").remove();
    }
    async render_list() {
      this.$result.empty();
      const projects = await frappe.call({
        method: "erpnext_taskview.erpnext_taskview.get_projects",
        args: {}
      });
      if (this.data.length > 0 && projects.message) {
        const container = document.createElement("div");
        this.$result.append(container);
        createApp({
          render: () => h(TaskView_default2, { docs: this.data, projects: projects.message })
        }).mount(container);
      }
    }
  };
  frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
})();
/*!
 * @he-tree/dnd-utils v0.1.0-alpha.4
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: null
 * Released under the MIT License.
 */
/*!
 * @he-tree/tree-utils v0.1.0-alpha.4
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: null
 * Released under the MIT License.
 */
/*!
 * @he-tree/vue v2.8.2
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: https://hetree.phphe.com/
 * Released under the MIT License.
 */
/*!
 * @virtual-list/vue
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: https://virtual-list.phphe.com
 * Released under the MIT License.
 */
/*!
 * drag-event-service v2.0.0
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: null
 * Released under the MIT License.
 */
/*!
 * helper-js v3.1.5
 * Author: phphe <phphe@outlook.com> (https://github.com/phphe)
 * Homepage: null
 * Released under the MIT License.
 */
/*! #__NO_SIDE_EFFECTS__ */
/**
* @vue/reactivity v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/runtime-core v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/runtime-dom v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/shared v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* vue v3.4.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
//# sourceMappingURL=app.bundle.OEKVQDXR.js.map
