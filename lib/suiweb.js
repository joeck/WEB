/**
 *  SuiWeb 
 *  Simple User Interface Tool for Web Exercises
 * 
 *  @author   bkrt
 *  @version  0.3.1
 *  @date     28.11.2020
 *
 *  0.3.1 - parseSJDON rewritten 
 *  0.3.0 - style property 
 *  0.2.3 - ES6 modules
 *  0.2.2 - component state and hooks
 *  0.2.1 - parse SJDON rewritten, function components 
 *  0.2.0 - render single SJDON structures to DOM
 * 
 *  Based on ideas and code from 
 *  Rodrigo Pombo: Build your own React
 *  https://pomb.us/build-your-own-react/
 * 
 *  Thanks to Rodrigo Pombo for a great tutorial and for sharing the 
 *  code of the Didact library. Didact is a much more sophisticated
 *  re-implementtation of React's basics than the simple SuiWeb.
 */

/* =====================================================================
 *  SJDON - Conversion
 * =====================================================================
*/

function parseSJDON (sjdon) {
  let [type, ...rest] = sjdon
  let children = rest.filter(item => !isProp(item))
  let props = rest.reduce((curr, next) => {
    if (Array.isArray(next)) {
      // another node: parse and add to props.children
      return addChild(curr, parseSJDON(next))
    } 
    else if (typeof next === 'object') {
      // attributes: add to props
      return {...curr, ...next}
    }
    else {
      // text or similar: add text node to props.children
      return addChild(curr, createTextElement(next))
    }
  }, {children: []})
  return {type, children, props}
}

//  add child to props.children
//
function addChild (props, child) {
  return { ...props,
    children: [...props.children, child]
  }
}

//  create a text element representation
//
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

//  props are objects that aren't arrays
//
function isProp (item) {
  return typeof(item)=='object' && !Array.isArray(item)
}

//  helper function: convert SJDON to createElement calls
//  note: this function is not used SuiWeb, it can help to use 
//  React with SJDON syntax
//
//  to simplify calls add something like this to your components:
//  let s = (data) => reactFromSJDON(data, React.createElement)
// 
function reactFromSJDON (sjdon, createFun) {
  let [type, ...rest] = sjdon
  let children = rest.filter(item => !isProp(item))
  let props = Object.assign({}, ...rest.filter(isProp))
  return createFun(type, props, ...children.map(item => 
    Array.isArray(item) ? reactFromSJDON(item, createFun) : item
  ))
}

//  create an element representation
//  note: this function is not used in SJDON parsing, it is only
//  needed if output from JSX parsing (e.g., Babel) is to be used
// 
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}


/* =====================================================================
 *  Render node tree to DOM
 * =====================================================================
*/

//  global context
let contextStore = createStore();


//  remove children and render new subtree
//
function render(element, container) {
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
  renderInit(element, container, 0);
}


//  render subtree
//  and call effects after rendering
//
function renderInit(element, container, n, childIndex) {
  contextStore("effects", []);
  
  // save focus and cursor position of active element
  let [focusIndex, position] = getFocusInput("input,textarea");
  
  // ** render the element **
  renderElem(element, container, n, childIndex);
  
  // restore focus and cursor position of active element
  setFocusInput("input,textarea", focusIndex, position);
  
  // run effects
  contextStore("effects").forEach(fun => fun());
  contextStore("effects", []);
}


//  render an element
//  - if it is in SJDON form: parse first
//  - render function or host component
//
function renderElem(element, container, n, childIndex) {
  if (Array.isArray(element)) {
    element = parseSJDON(element);
  }
  
  if (element.type instanceof Function) {
    updateFunctionComponent(element, container, n, childIndex);
  } else {
    updateHostComponent(element, container, childIndex);
  }
}


//  function component
//  - run function to get child node
//  - render child node
//
function updateFunctionComponent(element, container, n, childIndex) {
  // save re-render function to context
  contextStore("re-render", () => renderInit(element, container, n, n));
  let props = {...element.props, children: element.children};
  let child = element.type(props);
  renderElem(child, container, n, childIndex);
}


//  host component
//  - create dom node
//  - assign properties
//  - render child nodes
//  - add host to dom
//
function updateHostComponent(element, container, childIndex) {
  
  // create DOM node
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)
  
  // assign the element props
  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      if (name=="style") {
        updateStyleAttribute(dom, element.props.style);
      } else {
        dom[name] = element.props[name];
      }
    })
  
  // render children
  element.props.children.forEach((child, index) => {
    renderElem(child, dom, index);
  });
  
  if (typeof(childIndex) == 'number') {
    // re-render: replace node
    container.replaceChild(dom, container.childNodes[childIndex]);
  } else {
    // add node to container
    container.appendChild(dom);
  }
}


//  update style attribute, value can be:
//  - a CSS string: set to style attribute
//  - an object: merged to style attribute
//  - an array of objects: merged to style attribute
//
function updateStyleAttribute(dom, styles) {
  if (typeof(styles)=="string") {
    dom.style = styles;
  } else if (Array.isArray(styles)) {
    Object.assign(dom.style, ...styles);
  } else if (typeof(styles)=="object") {
    Object.assign(dom.style, styles);
  }
}


/* =====================================================================
 *  Handling state
 * =====================================================================
*/

//  element state
let stateHooks = createStore();


//  state hook
//  - access state via id and key
//  - return state and update function
//
function useState(id, key, init) {
  let idKey = "id:" + id + "-key:" + key;
      
  //  prepare render function 
  let renderFunc = contextStore("re-render");

  //  define function to update state
  function updateValue(updateFun, rerender=true) {
    stateHooks(idKey, updateFun(stateHooks(idKey)));
    if (rerender) renderFunc();
  }

  //  new state: set initial value
  if (!stateHooks(idKey)) {
    stateHooks(idKey, init);
  }
  
  return [stateHooks(idKey), updateValue];
}


//  effect hook
//  add function to effects array
//
function useEffect(fun) {
  contextStore("effects", [...contextStore("effects"), fun]);
}


//  create a key-value-store
//  return accessor function
//
function createStore() {
  let data = {};
  function access(key, ...value) {
    if (value.length === 0) {
      return data[key];
    } else {
      data[key] = value[0];
      return value[0];
    }
  }
  return access;
}


/* =====================================================================
 *  Get and set focus and position in certain elements
 *  Note: this is a quick&dirty solution that probably fails when 
 *  elements are added or removed
 * =====================================================================
*/

//  find index of element that has focus in a list of elements
//  matching a selector and the cursor position in the element
//
function getFocusInput(selector) {
  const active = document.activeElement;
  let focusIndex;
  document.querySelectorAll(selector).forEach((el, index) => {
    if (el == active) {
      focusIndex = index;
    }
  });
  let position = active ? active.selectionStart : undefined;
  return [focusIndex, position];
}

//  set focus to an element in a list of elements matching a 
//  selector and position cursor in the element
//
function setFocusInput(selector, index, position) {
  if (index !== undefined) {
    let elems = document.querySelectorAll(selector);
    let el = elems[index];
    if (el) el.focus();
    if (el && "selectionStart" in el 
        && "selectionEnd" in el 
        && position !== undefined) {
      el.selectionStart = position;
      el.selectionEnd = position;
    }
  }
}


/* =====================================================================
 *  Module export
 * =====================================================================
*/

export { render, createElement, useState, useEffect };


/* =====================================================================
 *  EOF
 * =====================================================================
*/
