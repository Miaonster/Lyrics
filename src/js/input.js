exports.getPositionForInput = function(ctrl) {
  var CaretPos = 0;
  if (ctrl.selectionStart || ctrl.selectionStart == '0') {
    CaretPos = ctrl.selectionStart;
  }
  return (CaretPos);
}
//多行文本框
exports.getPositionForTextArea = function(ctrl) {
  var CaretPos = 0;
  if (ctrl.selectionStart || ctrl.selectionStart == '0') {
    CaretPos = ctrl.selectionStart;
  }
  return (CaretPos);
}
exports.setCursorPosition = function(ctrl, pos) {
  if (ctrl.setSelectionRange) {
    ctrl.focus();
    ctrl.setSelectionRange(pos, pos);
  } else if (ctrl.createTextRange) {
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}
exports.insertAtCursorPos = function(ele, text) {
  var pos, val, preVal, sufVal, result;
  val = ele.value;
  pos = this.getPositionForTextArea(ele);

  preVal = val.substr(0, pos);
  sufVal = val.substr(pos);

  ele.value = preVal + text + sufVal;

  pos += text.length;

  this.setCursorPosition(ele, pos);
}
