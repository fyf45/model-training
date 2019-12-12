Array.prototype.remove = function (item) {
  let indexOf = this.indexOf(item);
  if (indexOf >= 0) {
    this.splice(indexOf, 1);
  }
  return this;
}


